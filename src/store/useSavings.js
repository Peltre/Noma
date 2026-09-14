// Hook for savings buckets ("apartados") & objectives (goals).
//
// ── The model ──
// An apartado is a label on top of part of a REAL account's balance
// (débito/efectivo) — it never moves money anywhere. The account
// keeps showing its full real balance; the apartado just remembers
// "how much of this is spoken for."
//
//   Cuenta real (débito/efectivo) → Apartado (linkedAccountId) → Objetivo
//
// Nothing here ever touches `accounts` balances — only a real
// transaction (useFinanceStore's addTransaction) does that.
//
// ── Déficit ──
// An apartado's earmarked number is never silently corrected if the
// linked account's real balance drops below it — a live "risk" is
// computed on top instead (getAccountDeficit / getSavingsAccountRisk
// / getGoalRisk). When one account backs several apartados and comes
// up short, the shortfall splits proportionally across them.
import { useState, useEffect } from 'react';
import { theme } from '../constants/themes';
import { saveData, loadData, removeData } from './storage';
import { round2 } from '../utils/formatCurrency';
import { parseISO, addDays } from 'date-fns';

const KEYS = {
    savingsAccounts: 'savingsAccounts',
    savingsGoals: 'savingsGoals',
};


// La paleta vive en el tema (themes.js → savingsColors) para que
// cambie junto con el resto de los colores. Se re-exporta aquí porque
// SavingsScreen y Onboarding ya la importan de este módulo.
// Con respaldo por si el tema en uso aún no trae savingsColors: un
// `undefined` aquí tiraba AddApartadoSheet al hacer SAVINGS_COLORS[0].
export const SAVINGS_COLORS = theme.savingsColors || [
    '#78ABEB', '#6FB3A6', '#9C93CF', '#C9A06A', '#7FA48C', '#B889A6', '#C98B7B', '#8CA3B8',
];

// Paleta anterior, previa al tema Medianoche: saturada y fuera de
// clave. Sólo sirve para migrar apartados guardados con esos colores
// al tono nuevo de la misma familia (morado→violeta, naranja→arena…),
// para que cada apartado siga reconociéndose. Borrar cuando ya nadie
// tenga datos de esa época.
const LEGACY_SAVINGS_COLORS = {
    '#6B5B9E': '#9C93CF', // purple  → violeta
    '#3D5A4C': '#7FA48C', // sage    → salvia
    '#C9822A': '#C9A06A', // amber   → arena
    '#B94040': '#C98B7B', // red     → terracota
    '#4A7FA5': '#78ABEB', // blue    → azul
    '#5A9E6B': '#6FB3A6', // green   → teal
    '#A0522D': '#C98B7B', // brown   → terracota
    '#7B7B7B': '#8CA3B8', // gray    → pizarra
    '#C45FAB': '#B889A6', // pink    → malva
    '#2C7BB5': '#78ABEB', // ocean   → azul
};
function migrateColor(color) {
    if (!color) return SAVINGS_COLORS[0];
    return LEGACY_SAVINGS_COLORS[color.toUpperCase()] || color;
}

// Only débito/efectivo hold real, spendable money that can be earmarked.
const LINKABLE_TYPES = ['debit', 'cash'];

export function useSavings(accounts = []) {
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);

    useEffect(() => {
        const load = async () => {
            const accs = await loadData(KEYS.savingsAccounts);
            const goals = await loadData(KEYS.savingsGoals);
            // Migración de colores de la paleta vieja; se guarda de una
            // vez para que sólo pase la primera vez.
            let migrated = accs || [];
            if (migrated.some(a => migrateColor(a.color) !== a.color)) {
                migrated = migrated.map(a => ({ ...a, color: migrateColor(a.color) }));
                await saveData(KEYS.savingsAccounts, migrated);
            }
            // Migración al modelo "vive en un lugar": los objetivos que aún
            // traen `contributions` se colocan en el apartado de su fuente
            // principal, y ese apartado recupera en earmarkedAmount todo lo
            // que el objetivo tiene (antes aportar se lo restaba). Un
            // objetivo sin fuentes queda sin lugar hasta que se le elija.
            let goalsNext = goals || [];
            if (goalsNext.some((g) => Array.isArray(g.contributions))) {
                const saById = new Map(migrated.map((a) => [a.id, a]));
                const extraBySA = {};
                goalsNext = goalsNext.map((g) => {
                    if (!Array.isArray(g.contributions)) return g;
                    const bySource = {};
                    g.contributions.forEach((c) => {
                        const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
                        if (!key) return;
                        bySource[key] = round2((bySource[key] || 0) + (c.type === 'deposit' ? 1 : -1) * c.amount);
                    });
                    const main = Object.entries(bySource).filter(([id, amt]) => amt > 0 && saById.has(id)).sort((x, y) => y[1] - x[1])[0];
                    const sa = main ? saById.get(main[0]) : null;
                    if (sa && g.savedAmount > 0) extraBySA[sa.id] = round2((extraBySA[sa.id] || 0) + g.savedAmount);
                    // eslint-disable-next-line no-unused-vars -- se descarta a propósito
                    const { contributions, ...rest } = g;
                    return {
                        ...rest,
                        accountId: sa ? sa.linkedAccountId : null,
                        savingsAccountId: sa ? sa.id : null,
                        color: rest.color || sa?.color || null,
                    };
                });
                if (Object.keys(extraBySA).length) {
                    migrated = migrated.map((a) => extraBySA[a.id] ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + extraBySA[a.id]) } : a);
                    await saveData(KEYS.savingsAccounts, migrated);
                }
                await saveData(KEYS.savingsGoals, goalsNext);
            }
            setSavingsAccounts(migrated);
            setSavingsGoals(goalsNext);
        };
        load();
    }, []);

    // ── Déficit / risk ──

    // Total earmarked across every apartado linked to this account,
    // vs. what the account actually has. `balanceOverride` lets a
    // caller check "what WOULD the deficit be at this balance" before
    // a render happens.
    // ── Modelo ──
    // Tarjeta (account) → tiene TODO el dinero de ese banco.
    //   Apartado (savingsAccount) → una PARTE con nombre de ese saldo
    //     (cajita Nu, apartado BBVA). earmarkedAmount es el total del
    //     apartado, incluido lo que sus objetivos ya reclaman.
    //   Objetivo (goal) → vive en un lugar: { accountId, savingsAccountId | null }.
    //     Su savedAmount es parte del saldo de ese lugar.
    // "Sin destino" de un lugar = lo que hay ahí menos lo que sus
    // objetivos reclaman. No hay aportaciones ni fuentes: el objetivo
    // simplemente está en un lugar.

    const goalsIn = (accountId, savingsAccountId = null) =>
        savingsGoals.filter((g) => g.accountId === accountId && (g.savingsAccountId || null) === savingsAccountId);
    const sumSaved = (goals) => round2(goals.reduce((s, g) => s + g.savedAmount, 0));

    // Cuánto de una tarjeta está reclamado (apartados + objetivos que
    // viven directo en ella) y cuánto falta si el saldo no alcanza.
    const getAccountDeficit = (accountId, balanceOverride) => {
        const linked = savingsAccounts.filter((a) => a.linkedAccountId === accountId);
        const totalEarmarked = round2(
            linked.reduce((s, a) => s + a.earmarkedAmount, 0) + sumSaved(goalsIn(accountId, null)),
        );
        const account = accounts.find((a) => a.id === accountId);
        const balance = balanceOverride !== undefined ? balanceOverride : (account?.balance ?? 0);
        const deficit = round2(Math.max(0, totalEarmarked - balance));
        return { totalEarmarked, balance, deficit };
    };

    // Sin destino en una tarjeta: saldo − apartados − objetivos directos.
    const getFreeRoom = (accountId) => {
        const account = accounts.find((a) => a.id === accountId);
        if (!account) return 0;
        const { totalEarmarked } = getAccountDeficit(accountId);
        return round2(Math.max(0, account.balance - totalEarmarked));
    };

    // Sin destino en un apartado: su total − lo que sus objetivos reclaman.
    const getApartadoFree = (savingsAccountId) => {
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa) return 0;
        return round2(Math.max(0, sa.earmarkedAmount - sumSaved(goalsIn(sa.linkedAccountId, sa.id))));
    };

    // Sin destino en un lugar, sea tarjeta o apartado.
    const getPlaceFree = ({ accountId, savingsAccountId }) =>
        savingsAccountId ? getApartadoFree(savingsAccountId) : getFreeRoom(accountId);

    // Parte del déficit de la tarjeta que le toca a un apartado,
    // proporcional a lo que reclama.
    const getSavingsAccountRisk = (savingsAccountId) => {
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa) return { atRisk: 0, safeAmount: 0 };
        const { totalEarmarked, deficit } = getAccountDeficit(sa.linkedAccountId);
        if (deficit <= 0 || totalEarmarked <= 0) return { atRisk: 0, safeAmount: sa.earmarkedAmount };
        const atRisk = round2(deficit * (sa.earmarkedAmount / totalEarmarked));
        return { atRisk, safeAmount: round2(sa.earmarkedAmount - atRisk) };
    };

    // Parte del déficit que le toca a un objetivo, según el lugar donde vive.
    const getGoalRisk = (goal) => {
        if (!goal.accountId || goal.savedAmount <= 0) return 0;
        const { totalEarmarked, deficit } = getAccountDeficit(goal.accountId);
        if (deficit <= 0 || totalEarmarked <= 0) return 0;
        return round2(goal.savedAmount * (deficit / totalEarmarked));
    };

    // ── Apartados ──

    // `interest` is optional per-apartado opt-in: { enabled, rate,
    // cap, rateAboveCap }. Left out or `enabled: false` behaves as before.
    const addSavingsAccount = async ({
        name,
        color,
        linkedAccountId,
        initialAmount = 0,
        interest = null,
    }) => {
        if (!name || !name.trim()) {
            return { error: 'Ponle un nombre al apartado.' };
        }
        const account = accounts.find((a) => a.id === linkedAccountId);
        if (!account) {
            return { error: 'Elige una cuenta para ligar este apartado.' };
        }
        if (!LINKABLE_TYPES.includes(account.type)) {
            return { error: 'Solo puedes ligar un apartado a una cuenta de débito o efectivo.' };
        }
        if (interest?.enabled && (!interest.rate || interest.rate <= 0)) {
            return { error: 'Ponle una tasa de interés anual mayor a cero.' };
        }
        const free = getFreeRoom(linkedAccountId);
        const assigned = round2(Math.min(Math.max(initialAmount, 0), free));
        const newAcc = {
            id: Date.now().toString(),
            name: name.trim(),
            color: color || SAVINGS_COLORS[0],
            linkedAccountId,
            earmarkedAmount: assigned,
            createdAt: new Date().toISOString(),
            interest: interest?.enabled
                ? {
                    enabled: true,
                    rate: round2(interest.rate),
                    cap: interest.cap > 0 ? round2(interest.cap) : null,
                    rateAboveCap:
                        interest.cap > 0 && interest.rateAboveCap > 0
                            ? round2(interest.rateAboveCap)
                            : null,
                }
                : { enabled: false, rate: 0, cap: null, rateAboveCap: null },
            lastInterestAccrualAt: new Date().toISOString(),
            totalInterestEarned: 0,
        };
        const updated = [...savingsAccounts, newAcc];
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { newAcc, ok: true, capped: assigned < initialAmount };
    };

    const deleteSavingsAccount = async (accountId) => {
        const acc = savingsAccounts.find((a) => a.id === accountId);
        if (acc?.earmarkedAmount > 0) {
            return { error: 'Este apartado tiene dinero asignado. Quítaselo antes de eliminarlo.' };
        }
        if (acc && goalsIn(acc.linkedAccountId, acc.id).length > 0) {
            return { error: 'Hay objetivos que viven en este apartado. Muévelos antes de eliminarlo.' };
        }
        const updated = savingsAccounts.filter((a) => a.id !== accountId);
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Earmark more of the linked account's balance. Nothing moves —
    // just capped by how much of that account is still free.
    const addToSavingsAccount = async ({ savingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa) {
            return { error: 'No se encontró el apartado.' };
        }
        const free = getFreeRoom(sa.linkedAccountId);
        if (amount > free) {
            return { error: `Solo tienes ${free.toFixed(2)} libres en esa cuenta.` };
        }
        const updated = savingsAccounts.map((a) =>
            a.id === savingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + amount) } : a,
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Un-earmark part of an apartado, hasta lo que no reclame ningún
    // objetivo que viva en él.
    const removeFromSavingsAccount = async ({ savingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa || sa.earmarkedAmount < amount) {
            return { error: 'Este apartado no tiene asignado ese monto.' };
        }
        const free = getApartadoFree(savingsAccountId);
        if (amount > free) {
            return { error: `Solo hay ${free.toFixed(2)} sin destino en este apartado; el resto es de sus objetivos.` };
        }
        const updated = savingsAccounts.map((a) =>
            a.id === savingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount - amount) } : a,
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // ── Interest ──
    // Optional, per-apartado, opt-in: an annual rate on what's
    // earmarked, plus an optional lower rate above a cap. Compounds
    // daily. This file only computes the numbers — FinanceContext.js's
    // accrual effect books the matching real income transaction (via
    // financeStore.addTransaction) and then calls creditInterestBatch
    // below to grow the earmark by the same real amount.

    // Pure: one apartado's accrued interest over `days` days. No
    // storage writes — used by both the accrual effect and
    // getEstimatedMonthlyInterest's UI preview.
    const computeAccruedInterest = (sa, days) => {
        if (!sa?.interest?.enabled || days <= 0) return 0;
        const { rate, cap, rateAboveCap } = sa.interest;
        const principal = sa.earmarkedAmount;
        if (principal <= 0 || !rate || rate <= 0) return 0;

        const dailyRate = rate / 100 / 365;
        const belowCapAmount = cap != null ? Math.min(principal, cap) : principal;
        let accrued = belowCapAmount * (Math.pow(1 + dailyRate, days) - 1);

        // The slice above the cap earns the reduced rate (0 if left blank).
        if (cap != null && principal > cap) {
            const aboveCapAmount = principal - cap;
            const dailyRateAbove = (rateAboveCap || 0) / 100 / 365;
            accrued += aboveCapAmount * (Math.pow(1 + dailyRateAbove, days) - 1);
        }
        return round2(accrued);
    };

    // Rough "about how much per month" preview — flat 30 days, not a promise.
    const getEstimatedMonthlyInterest = (savingsAccountId) => {
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        return computeAccruedInterest(sa, 30);
    };

    // (Re-)enabling resets lastInterestAccrualAt to now, so the next
    // accrual doesn't backdate to a period where interest was off.
    // Editing rate/cap while already enabled does NOT reset the clock.
    // Editar un apartado: nombre, color e interés en una sola llamada.
    // `name` y `color` son opcionales; si no vienen, se conservan.
    const updateSavingsAccount = async (savingsAccountId, { enabled, rate, cap, rateAboveCap, name, color }) => {
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa) return { error: 'No se encontró el apartado.' };
        if (name !== undefined && !String(name).trim()) {
            return { error: 'Ponle un nombre al apartado.' };
        }
        if (enabled && (!rate || rate <= 0)) {
            return { error: 'Ponle una tasa de interés anual mayor a cero.' };
        }
        const wasEnabled = !!sa.interest?.enabled;
        const updated = savingsAccounts.map((a) => {
            if (a.id !== savingsAccountId) return a;
            return {
                ...a,
                name: name !== undefined ? String(name).trim() : a.name,
                color: color || a.color,
                interest: enabled
                    ? {
                        enabled: true,
                        rate: round2(rate),
                        cap: cap > 0 ? round2(cap) : null,
                        rateAboveCap: cap > 0 && rateAboveCap > 0 ? round2(rateAboveCap) : null,
                    }
                    : { ...a.interest, enabled: false },
                lastInterestAccrualAt:
                    enabled && !wasEnabled ? new Date().toISOString() : a.lastInterestAccrualAt,
            };
        });
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Books interest for several apartados in one write — a loop of
    // per-apartado calls would each build off the same pre-effect
    // closure and lose everything but the last. `amount` can be 0 (a
    // tiny stretch rounds to $0); the clock still advances by
    // daysElapsed so it isn't recomputed forever.
    const creditInterestBatch = async (credits) => {
        // credits: [{ savingsAccountId, amount, daysElapsed }]
        if (!credits.length) return;
        const byId = new Map(credits.map((c) => [c.savingsAccountId, c]));
        const updated = savingsAccounts.map((a) => {
            const credit = byId.get(a.id);
            if (!credit) return a;
            const prevAccrual = a.lastInterestAccrualAt
                ? parseISO(a.lastInterestAccrualAt)
                : parseISO(a.createdAt);
            return {
                ...a,
                earmarkedAmount:
                    credit.amount > 0 ? round2(a.earmarkedAmount + credit.amount) : a.earmarkedAmount,
                totalInterestEarned:
                    credit.amount > 0
                        ? round2((a.totalInterestEarned || 0) + credit.amount)
                        : a.totalInterestEarned,
                lastInterestAccrualAt: addDays(prevAccrual, credit.daysElapsed).toISOString(),
            };
        });
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
    };

    // ── Goals ──
    // Un objetivo vive en un lugar (tarjeta, y opcionalmente un apartado
    // de ella). Ahorrar toma del "sin destino" de ese lugar; sacar lo
    // devuelve. El dinero nunca cambia de tarjeta por estas acciones.
    const addSavingsGoal = async ({ name, targetAmount, deadline = null, accountId, savingsAccountId = null, color = null, initialAmount = 0 }) => {
        if (!accountId) return { error: 'Elige dónde vive este dinero.' };
        if (!accounts.some((a) => a.id === accountId)) return { error: 'La cuenta elegida ya no existe.' };
        if (savingsAccountId) {
            const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
            if (!sa || sa.linkedAccountId !== accountId) return { error: 'Ese apartado no es de esa cuenta.' };
        }
        // El arranque tampoco puede pasar de la meta.
        const start = round2(Math.min(Math.max(0, initialAmount || 0), round2(targetAmount)));
        if (start > 0) {
            const free = getPlaceFree({ accountId, savingsAccountId });
            if (start > free) return { error: `Solo hay ${free.toFixed(2)} sin destino ahí.` };
        }
        const newGoal = {
            id: Date.now().toString(),
            name,
            targetAmount: round2(targetAmount),
            savedAmount: start,
            deadline,
            accountId,
            savingsAccountId: savingsAccountId || null,
            color,
            createdAt: new Date().toISOString(),
        };
        const updated = [...savingsGoals, newGoal];
        setSavingsGoals(updated);
        await saveData(KEYS.savingsGoals, updated);
        return newGoal;
    };

    const updateSavingsGoal = async (goalId, patch) => {
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) return { error: 'No se encontró el objetivo.' };
        const next = { ...goal, ...patch };
        if (patch.targetAmount != null) next.targetAmount = round2(patch.targetAmount);
        const updated = savingsGoals.map((g) => (g.id === goalId ? next : g));
        setSavingsGoals(updated);
        await saveData(KEYS.savingsGoals, updated);
        return { ok: true };
    };

    // Eliminar libera el dinero: se queda donde estaba, sólo sin destino.
    // `returnFunds: false` es para "marcar como comprado", donde el dinero
    // ya salió de verdad vía gasto y el lugar ya bajó su saldo.
    const deleteSavingsGoal = async (goalId, { returnFunds = true } = {}) => {
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) return { error: 'No se encontró el objetivo.' };
        if (!returnFunds && goal.savingsAccountId && goal.savedAmount > 0) {
            // El gasto ya restó al saldo de la tarjeta; el apartado tiene
            // que encoger lo mismo para seguir siendo parte de ella.
            const updatedSA = savingsAccounts.map((a) =>
                a.id === goal.savingsAccountId
                    ? { ...a, earmarkedAmount: round2(Math.max(0, a.earmarkedAmount - goal.savedAmount)) }
                    : a,
            );
            setSavingsAccounts(updatedSA);
            await saveData(KEYS.savingsAccounts, updatedSA);
        }
        const updatedGoals = savingsGoals.filter((g) => g.id !== goalId);
        setSavingsGoals(updatedGoals);
        await saveData(KEYS.savingsGoals, updatedGoals);
        return { ok: true, releasedAmount: returnFunds ? goal.savedAmount : 0 };
    };

    // Ahorrar: toma del sin destino del lugar donde vive el objetivo.
    const saveToGoal = async ({ goalId, amount }) => {
        if (!amount || amount <= 0) return { error: 'El monto debe ser mayor a cero.' };
        amount = round2(amount);
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) return { error: 'No se encontró el objetivo.' };
        if (!goal.accountId) return { error: 'Este objetivo aún no tiene lugar. Elige dónde vive.' };
        // Nunca por encima del 100 %: un objetivo lleno no acepta más.
        const room = round2(Math.max(0, goal.targetAmount - goal.savedAmount));
        if (room <= 0) return { error: 'Este objetivo ya está completo.' };
        if (amount > room) return { error: `Solo faltan ${room.toFixed(2)} para completarlo.` };
        const free = getPlaceFree(goal);
        if (amount > free) return { error: `Solo hay ${free.toFixed(2)} sin destino ahí.` };
        const updated = savingsGoals.map((g) =>
            g.id === goalId ? { ...g, savedAmount: round2(g.savedAmount + amount) } : g,
        );
        setSavingsGoals(updated);
        await saveData(KEYS.savingsGoals, updated);
        return { ok: true };
    };

    // Sacar: el dinero vuelve a estar sin destino en el mismo lugar.
    const takeFromGoal = async ({ goalId, amount }) => {
        if (!amount || amount <= 0) return { error: 'El monto debe ser mayor a cero.' };
        amount = round2(amount);
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) return { error: 'No se encontró el objetivo.' };
        if (amount > goal.savedAmount) return { error: 'El objetivo no tiene tanto ahorrado.' };
        const updated = savingsGoals.map((g) =>
            g.id === goalId ? { ...g, savedAmount: round2(g.savedAmount - amount) } : g,
        );
        setSavingsGoals(updated);
        await saveData(KEYS.savingsGoals, updated);
        return { ok: true };
    };

    // Mover de lugar dentro de la MISMA tarjeta (tarjeta ↔ apartado, o
    // entre apartados de la tarjeta). El saldo de la tarjeta no cambia;
    // si entra o sale de un apartado, ese apartado crece o encoge.
    // Cambiar de tarjeta es un traspaso real y va por Nuevo movimiento.
    const moveGoal = async ({ goalId, accountId, savingsAccountId = null }) => {
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) return { error: 'No se encontró el objetivo.' };
        const toSA = savingsAccountId ? savingsAccounts.find((a) => a.id === savingsAccountId) : null;
        if (savingsAccountId && (!toSA || toSA.linkedAccountId !== accountId)) {
            return { error: 'Ese apartado no es de esa cuenta.' };
        }
        if (goal.accountId && goal.accountId !== accountId && goal.savedAmount > 0) {
            return { error: 'Para cambiar de tarjeta, primero haz un traspaso del dinero en Nuevo movimiento.' };
        }
        // Al entrar a un apartado desde el sin destino de la tarjeta, debe caber.
        if (savingsAccountId && !goal.savingsAccountId && goal.savedAmount > 0) {
            const free = getFreeRoom(accountId) + goal.savedAmount; // su propio dinero cuenta como libre
            if (goal.savedAmount > free) return { error: 'No hay suficiente sin destino en esa cuenta.' };
        }
        let updatedSA = savingsAccounts;
        if (goal.savedAmount > 0 && goal.savingsAccountId !== (savingsAccountId || null)) {
            updatedSA = savingsAccounts.map((a) => {
                if (a.id === goal.savingsAccountId) return { ...a, earmarkedAmount: round2(Math.max(0, a.earmarkedAmount - goal.savedAmount)) };
                if (a.id === savingsAccountId) return { ...a, earmarkedAmount: round2(a.earmarkedAmount + goal.savedAmount) };
                return a;
            });
            setSavingsAccounts(updatedSA);
            await saveData(KEYS.savingsAccounts, updatedSA);
        }
        const updated = savingsGoals.map((g) =>
            g.id === goalId ? { ...g, accountId, savingsAccountId: savingsAccountId || null } : g,
        );
        setSavingsGoals(updated);
        await saveData(KEYS.savingsGoals, updated);
        return { ok: true };
    };

    const resetSavings = async () => {
        await removeData(KEYS.savingsAccounts);
        await removeData(KEYS.savingsGoals);
        setSavingsAccounts([]);
        setSavingsGoals([]);
    };

    // Currency switch (Settings → Moneda): rescales every real amount
    // by `rate`. interest.rate/rateAboveCap are percentages, never
    // converted; interest.cap IS a real amount, so it converts too.
    const convertAllAmounts = async (rate) => {
        const updatedSavingsAccounts = savingsAccounts.map((a) => ({
            ...a,
            earmarkedAmount: round2(a.earmarkedAmount * rate),
            totalInterestEarned: round2((a.totalInterestEarned || 0) * rate),
            interest: a.interest
                ? { ...a.interest, cap: a.interest.cap != null ? round2(a.interest.cap * rate) : null }
                : a.interest,
        }));
        const updatedGoals = savingsGoals.map((g) => ({
            ...g,
            targetAmount: round2(g.targetAmount * rate),
            savedAmount: round2(g.savedAmount * rate),
        }));
        setSavingsAccounts(updatedSavingsAccounts);
        setSavingsGoals(updatedGoals);
        await saveData(KEYS.savingsAccounts, updatedSavingsAccounts);
        await saveData(KEYS.savingsGoals, updatedGoals);
    };

    const getMonthlySuggestion = (goal) => {
        if (!goal.deadline) return null;
        const remaining = goal.targetAmount - goal.savedAmount;
        if (remaining <= 0) return null;
        const now = new Date();
        const deadline = new Date(goal.deadline);
        const monthsDiff =
            (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
        if (monthsDiff <= 0) return null;
        return Math.ceil(remaining / monthsDiff);
    };

    return {
        savingsAccounts,
        savingsGoals,
        // Apartados
        addSavingsAccount,
        deleteSavingsAccount,
        addToSavingsAccount,
        removeFromSavingsAccount,
        // Interest
        computeAccruedInterest,
        getEstimatedMonthlyInterest,
        updateSavingsAccount,
        creditInterestBatch,
        // Goals
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        saveToGoal,
        takeFromGoal,
        moveGoal,
        getMonthlySuggestion,
        // Sin destino / riesgo
        getAccountDeficit,
        getFreeRoom,
        getApartadoFree,
        getPlaceFree,
        getSavingsAccountRisk,
        getGoalRisk,
        resetSavings,
        convertAllAmounts,
    };
}