// Ahorros: apartados y objetivos.
//
// ── Modelo ──
// Tarjeta (account) → tiene TODO el dinero de ese banco.
//   Apartado (savingsAccount) → una PARTE con nombre de ese saldo
//     (cajita Nu, apartado BBVA). earmarkedAmount es el total del
//     apartado, incluido lo que sus objetivos ya reclaman.
//   Objetivo (goal) → vive en un lugar: { accountId, savingsAccountId | null }.
//     Su savedAmount es parte del saldo de ese lugar.
// "Sin destino" de un lugar = lo que hay ahí menos lo que sus objetivos
// reclaman. Nada aquí toca saldos de cuentas: eso sólo lo hace una
// transacción (moneyStore).
//
// ── Riesgo ──
// Si el saldo real de una tarjeta baja de lo que sus apartados y
// objetivos reclaman, no se corrige nada en silencio: se calcula un
// déficit y se reparte proporcionalmente (getSavingsAccountRisk,
// getGoalRisk).
import { parseISO, addDays } from 'date-fns';
import { createPersistedStore } from './createPersistedStore';
import { useMoneyStore } from './moneyStore';
import { theme } from '../constants/themes';
import { round2 } from '../utils/formatCurrency';

// Paleta de apartados/objetivos. Vive en el tema; con respaldo por si
// el tema en uso aún no la trae.
export const SAVINGS_COLORS = theme.savingsColors || [
    '#78ABEB', '#6FB3A6', '#9C93CF', '#C9A06A', '#7FA48C', '#B889A6', '#C98B7B', '#8CA3B8',
];

// Sólo débito/efectivo guardan dinero real que se pueda apartar.
export const LINKABLE_TYPES = ['debit', 'cash'];

const err = (error) => ({ error });
const accounts = () => useMoneyStore.getState().accounts;

// ── Migraciones (corren una vez al cargar) ──

// Paleta anterior al tema Medianoche → tono nuevo de la misma familia.
// Borrar cuando ya nadie tenga datos de esa época.
const LEGACY_SAVINGS_COLORS = {
    '#6B5B9E': '#9C93CF', '#3D5A4C': '#7FA48C', '#C9822A': '#C9A06A', '#B94040': '#C98B7B',
    '#4A7FA5': '#78ABEB', '#5A9E6B': '#6FB3A6', '#A0522D': '#C98B7B', '#7B7B7B': '#8CA3B8',
    '#C45FAB': '#B889A6', '#2C7BB5': '#78ABEB',
};
const migrateColor = (color) => (color ? LEGACY_SAVINGS_COLORS[color.toUpperCase()] || color : SAVINGS_COLORS[0]);

function migrate(loaded) {
    let savingsAccounts = loaded.savingsAccounts;
    let savingsGoals = loaded.savingsGoals;

    if (savingsAccounts.some((a) => migrateColor(a.color) !== a.color)) {
        savingsAccounts = savingsAccounts.map((a) => ({ ...a, color: migrateColor(a.color) }));
    }

    // Modelo viejo → "vive en un lugar": cada objetivo con `contributions`
    // se coloca en el apartado de su fuente principal, y ese apartado
    // recupera en earmarkedAmount lo que el objetivo tiene (antes aportar
    // se lo restaba). Sin fuentes queda sin lugar hasta que se le elija.
    if (savingsGoals.some((g) => Array.isArray(g.contributions))) {
        const saById = new Map(savingsAccounts.map((a) => [a.id, a]));
        const extraBySA = {};
        savingsGoals = savingsGoals.map((g) => {
            if (!Array.isArray(g.contributions)) return g;
            const bySource = {};
            g.contributions.forEach((c) => {
                const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
                if (key) bySource[key] = round2((bySource[key] || 0) + (c.type === 'deposit' ? 1 : -1) * c.amount);
            });
            const main = Object.entries(bySource).filter(([id, amt]) => amt > 0 && saById.has(id)).sort((x, y) => y[1] - x[1])[0];
            const sa = main ? saById.get(main[0]) : null;
            if (sa && g.savedAmount > 0) extraBySA[sa.id] = round2((extraBySA[sa.id] || 0) + g.savedAmount);
            const rest = { ...g };
            delete rest.contributions;
            return { ...rest, accountId: sa ? sa.linkedAccountId : null, savingsAccountId: sa ? sa.id : null, color: rest.color || sa?.color || null };
        });
        if (Object.keys(extraBySA).length) {
            savingsAccounts = savingsAccounts.map((a) => (extraBySA[a.id] ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + extraBySA[a.id]) } : a));
        }
    }
    return { ...loaded, savingsAccounts, savingsGoals };
}

// ── Interés (puro) ──
// Tasa anual sobre lo apartado, con tope opcional y tasa menor arriba
// del tope. Compone diario. Aquí sólo se calcula; FinanceContext lo
// abona como ingreso real y luego llama creditInterest para que el
// apartado crezca lo mismo.
export function computeAccruedInterest(sa, days) {
    if (!sa?.interest?.enabled || days <= 0) return 0;
    const { rate, cap, rateAboveCap } = sa.interest;
    const principal = sa.earmarkedAmount;
    if (principal <= 0 || !rate || rate <= 0) return 0;
    const daily = rate / 100 / 365;
    const belowCap = cap != null ? Math.min(principal, cap) : principal;
    let accrued = belowCap * (Math.pow(1 + daily, days) - 1);
    if (cap != null && principal > cap) {
        const dailyAbove = (rateAboveCap || 0) / 100 / 365;
        accrued += (principal - cap) * (Math.pow(1 + dailyAbove, days) - 1);
    }
    return round2(accrued);
}

const normalizeInterest = ({ enabled, rate, cap, rateAboveCap }) =>
    enabled
        ? { enabled: true, rate: round2(rate), cap: cap > 0 ? round2(cap) : null, rateAboveCap: cap > 0 && rateAboveCap > 0 ? round2(rateAboveCap) : null }
        : { enabled: false, rate: 0, cap: null, rateAboveCap: null };

export const useSavingsStore = createPersistedStore({
    slices: { savingsAccounts: 'savingsAccounts', savingsGoals: 'savingsGoals' },
    defaults: { savingsAccounts: [], savingsGoals: [] },
    migrate,

    actions: (set, get) => {
        // ── Lecturas ──
        const goalsIn = (accountId, savingsAccountId = null) =>
            get().savingsGoals.filter((g) => g.accountId === accountId && (g.savingsAccountId || null) === savingsAccountId);
        const sumSaved = (goals) => round2(goals.reduce((s, g) => s + g.savedAmount, 0));

        // Cuánto reclama una tarjeta (apartados + objetivos directos) y
        // cuánto falta si el saldo no alcanza. `balanceOverride` permite
        // preguntar "¿cómo quedaría con este saldo?" antes de aplicar.
        const getAccountDeficit = (accountId, balanceOverride) => {
            const linked = get().savingsAccounts.filter((a) => a.linkedAccountId === accountId);
            const totalEarmarked = round2(linked.reduce((s, a) => s + a.earmarkedAmount, 0) + sumSaved(goalsIn(accountId, null)));
            const account = accounts().find((a) => a.id === accountId);
            const balance = balanceOverride !== undefined ? balanceOverride : (account?.balance ?? 0);
            return { totalEarmarked, balance, deficit: round2(Math.max(0, totalEarmarked - balance)) };
        };
        const getFreeRoom = (accountId) => {
            const account = accounts().find((a) => a.id === accountId);
            if (!account) return 0;
            return round2(Math.max(0, account.balance - getAccountDeficit(accountId).totalEarmarked));
        };
        const getApartadoFree = (savingsAccountId) => {
            const sa = get().savingsAccounts.find((a) => a.id === savingsAccountId);
            if (!sa) return 0;
            return round2(Math.max(0, sa.earmarkedAmount - sumSaved(goalsIn(sa.linkedAccountId, sa.id))));
        };
        const getPlaceFree = ({ accountId, savingsAccountId }) =>
            savingsAccountId ? getApartadoFree(savingsAccountId) : getFreeRoom(accountId);

        const findSA = (id) => get().savingsAccounts.find((a) => a.id === id);
        const findGoal = (id) => get().savingsGoals.find((g) => g.id === id);
        const patchSA = (id, fn) => set((s) => ({ savingsAccounts: s.savingsAccounts.map((a) => (a.id === id ? fn(a) : a)) }));
        const patchGoal = (id, fn) => set((s) => ({ savingsGoals: s.savingsGoals.map((g) => (g.id === id ? fn(g) : g)) }));

        return {
            getAccountDeficit,
            getFreeRoom,
            getApartadoFree,
            getPlaceFree,

            // Parte del déficit de la tarjeta que le toca a un apartado.
            getSavingsAccountRisk: (savingsAccountId) => {
                const sa = findSA(savingsAccountId);
                if (!sa) return { atRisk: 0, safeAmount: 0 };
                const { totalEarmarked, deficit } = getAccountDeficit(sa.linkedAccountId);
                if (deficit <= 0 || totalEarmarked <= 0) return { atRisk: 0, safeAmount: sa.earmarkedAmount };
                const atRisk = round2(deficit * (sa.earmarkedAmount / totalEarmarked));
                return { atRisk, safeAmount: round2(sa.earmarkedAmount - atRisk) };
            },
            // Parte del déficit que le toca a un objetivo, según donde vive.
            getGoalRisk: (goal) => {
                if (!goal.accountId || goal.savedAmount <= 0) return 0;
                const { totalEarmarked, deficit } = getAccountDeficit(goal.accountId);
                if (deficit <= 0 || totalEarmarked <= 0) return 0;
                return round2(goal.savedAmount * (deficit / totalEarmarked));
            },
            getEstimatedMonthlyInterest: (savingsAccountId) => computeAccruedInterest(findSA(savingsAccountId), 30),
            getMonthlySuggestion: (goal) => {
                if (!goal.deadline) return null;
                const remaining = goal.targetAmount - goal.savedAmount;
                if (remaining <= 0) return null;
                const now = new Date();
                const deadline = new Date(goal.deadline);
                const months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
                return months <= 0 ? null : Math.ceil(remaining / months);
            },

            // ── Apartados ──
            addSavingsAccount: async ({ name, color, linkedAccountId, initialAmount = 0, interest = null }) => {
                if (!name || !name.trim()) return err('Ponle un nombre al apartado.');
                const account = accounts().find((a) => a.id === linkedAccountId);
                if (!account) return err('Elige una cuenta para ligar este apartado.');
                if (!LINKABLE_TYPES.includes(account.type)) return err('Solo puedes ligar un apartado a una cuenta de débito o efectivo.');
                if (interest?.enabled && (!interest.rate || interest.rate <= 0)) return err('Ponle una tasa de interés anual mayor a cero.');
                const free = getFreeRoom(linkedAccountId);
                const assigned = round2(Math.min(Math.max(initialAmount, 0), free));
                const newAcc = {
                    id: Date.now().toString(),
                    name: name.trim(),
                    color: color || SAVINGS_COLORS[0],
                    linkedAccountId,
                    earmarkedAmount: assigned,
                    createdAt: new Date().toISOString(),
                    interest: normalizeInterest(interest || {}),
                    lastInterestAccrualAt: new Date().toISOString(),
                    totalInterestEarned: 0,
                };
                set((s) => ({ savingsAccounts: [...s.savingsAccounts, newAcc] }));
                return { newAcc, ok: true, capped: assigned < initialAmount };
            },

            deleteSavingsAccount: async (savingsAccountId) => {
                const sa = findSA(savingsAccountId);
                if (sa?.earmarkedAmount > 0) return err('Este apartado tiene dinero asignado. Quítaselo antes de eliminarlo.');
                if (sa && goalsIn(sa.linkedAccountId, sa.id).length > 0) return err('Hay objetivos que viven en este apartado. Muévelos antes de eliminarlo.');
                set((s) => ({ savingsAccounts: s.savingsAccounts.filter((a) => a.id !== savingsAccountId) }));
                return { ok: true };
            },

            // Apartar más del saldo de la tarjeta (sin mover dinero), hasta lo libre.
            addToSavingsAccount: async ({ savingsAccountId, amount }) => {
                if (!amount || amount <= 0) return err('El monto debe ser mayor a cero.');
                amount = round2(amount);
                const sa = findSA(savingsAccountId);
                if (!sa) return err('No se encontró el apartado.');
                const free = getFreeRoom(sa.linkedAccountId);
                if (amount > free) return err(`Solo tienes ${free.toFixed(2)} libres en esa cuenta.`);
                patchSA(savingsAccountId, (a) => ({ ...a, earmarkedAmount: round2(a.earmarkedAmount + amount) }));
                return { ok: true };
            },

            // Quitar, hasta lo que ningún objetivo del apartado reclame.
            removeFromSavingsAccount: async ({ savingsAccountId, amount }) => {
                if (!amount || amount <= 0) return err('El monto debe ser mayor a cero.');
                amount = round2(amount);
                const sa = findSA(savingsAccountId);
                if (!sa || sa.earmarkedAmount < amount) return err('Este apartado no tiene asignado ese monto.');
                const free = getApartadoFree(savingsAccountId);
                if (amount > free) return err(`Solo hay ${free.toFixed(2)} sin destino en este apartado; el resto es de sus objetivos.`);
                patchSA(savingsAccountId, (a) => ({ ...a, earmarkedAmount: round2(a.earmarkedAmount - amount) }));
                return { ok: true };
            },

            // Nombre, color e interés en una sola llamada; lo que no venga
            // se conserva. (Re)activar el interés reinicia su reloj para no
            // abonar un periodo en que estaba apagado.
            updateSavingsAccount: async (savingsAccountId, { enabled, rate, cap, rateAboveCap, name, color }) => {
                const sa = findSA(savingsAccountId);
                if (!sa) return err('No se encontró el apartado.');
                if (name !== undefined && !String(name).trim()) return err('Ponle un nombre al apartado.');
                if (enabled && (!rate || rate <= 0)) return err('Ponle una tasa de interés anual mayor a cero.');
                const wasEnabled = !!sa.interest?.enabled;
                patchSA(savingsAccountId, (a) => ({
                    ...a,
                    name: name !== undefined ? String(name).trim() : a.name,
                    color: color || a.color,
                    interest: enabled ? normalizeInterest({ enabled, rate, cap, rateAboveCap }) : { ...a.interest, enabled: false },
                    lastInterestAccrualAt: enabled && !wasEnabled ? new Date().toISOString() : a.lastInterestAccrualAt,
                }));
                return { ok: true };
            },

            // Abona el interés ya calculado a cada apartado y adelanta su
            // reloj. `amount` puede ser 0 (un tramo corto redondea a $0);
            // el reloj avanza igual para no recalcularlo eternamente.
            creditInterest: async (credits) => {
                if (!credits.length) return;
                const byId = new Map(credits.map((c) => [c.savingsAccountId, c]));
                set((s) => ({
                    savingsAccounts: s.savingsAccounts.map((a) => {
                        const credit = byId.get(a.id);
                        if (!credit) return a;
                        const prev = parseISO(a.lastInterestAccrualAt || a.createdAt);
                        return {
                            ...a,
                            earmarkedAmount: credit.amount > 0 ? round2(a.earmarkedAmount + credit.amount) : a.earmarkedAmount,
                            totalInterestEarned: credit.amount > 0 ? round2((a.totalInterestEarned || 0) + credit.amount) : a.totalInterestEarned,
                            lastInterestAccrualAt: addDays(prev, credit.daysElapsed).toISOString(),
                        };
                    }),
                }));
            },

            // ── Objetivos ──
            addSavingsGoal: async ({ name, targetAmount, deadline = null, accountId, savingsAccountId = null, color = null, initialAmount = 0 }) => {
                if (!accountId) return err('Elige dónde vive este dinero.');
                if (!accounts().some((a) => a.id === accountId)) return err('La cuenta elegida ya no existe.');
                if (savingsAccountId) {
                    const sa = findSA(savingsAccountId);
                    if (!sa || sa.linkedAccountId !== accountId) return err('Ese apartado no es de esa cuenta.');
                }
                // El arranque no puede pasar de la meta ni de lo libre.
                const start = round2(Math.min(Math.max(0, initialAmount || 0), round2(targetAmount)));
                if (start > 0) {
                    const free = getPlaceFree({ accountId, savingsAccountId });
                    if (start > free) return err(`Solo hay ${free.toFixed(2)} sin destino ahí.`);
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
                set((s) => ({ savingsGoals: [...s.savingsGoals, newGoal] }));
                return newGoal;
            },

            updateSavingsGoal: async (goalId, patch) => {
                if (!findGoal(goalId)) return err('No se encontró el objetivo.');
                patchGoal(goalId, (g) => ({ ...g, ...patch, targetAmount: patch.targetAmount != null ? round2(patch.targetAmount) : g.targetAmount }));
                return { ok: true };
            },

            // Eliminar deja el dinero donde estaba, sin destino. `returnFunds:
            // false` es "marcar como comprado": el gasto ya salió y el apartado
            // debe encoger lo mismo para seguir siendo parte de la tarjeta.
            deleteSavingsGoal: async (goalId, { returnFunds = true } = {}) => {
                const goal = findGoal(goalId);
                if (!goal) return err('No se encontró el objetivo.');
                set((s) => ({
                    savingsAccounts: !returnFunds && goal.savingsAccountId && goal.savedAmount > 0
                        ? s.savingsAccounts.map((a) => (a.id === goal.savingsAccountId ? { ...a, earmarkedAmount: round2(Math.max(0, a.earmarkedAmount - goal.savedAmount)) } : a))
                        : s.savingsAccounts,
                    savingsGoals: s.savingsGoals.filter((g) => g.id !== goalId),
                }));
                return { ok: true, releasedAmount: returnFunds ? goal.savedAmount : 0 };
            },

            // Ahorrar: toma del sin destino del lugar; nunca pasa del 100 %.
            saveToGoal: async ({ goalId, amount }) => {
                if (!amount || amount <= 0) return err('El monto debe ser mayor a cero.');
                amount = round2(amount);
                const goal = findGoal(goalId);
                if (!goal) return err('No se encontró el objetivo.');
                if (!goal.accountId) return err('Este objetivo aún no tiene lugar. Elige dónde vive.');
                const room = round2(Math.max(0, goal.targetAmount - goal.savedAmount));
                if (room <= 0) return err('Este objetivo ya está completo.');
                if (amount > room) return err(`Solo faltan ${room.toFixed(2)} para completarlo.`);
                const free = getPlaceFree(goal);
                if (amount > free) return err(`Solo hay ${free.toFixed(2)} sin destino ahí.`);
                patchGoal(goalId, (g) => ({ ...g, savedAmount: round2(g.savedAmount + amount) }));
                return { ok: true };
            },

            // Sacar: vuelve a estar sin destino en el mismo lugar.
            takeFromGoal: async ({ goalId, amount }) => {
                if (!amount || amount <= 0) return err('El monto debe ser mayor a cero.');
                amount = round2(amount);
                const goal = findGoal(goalId);
                if (!goal) return err('No se encontró el objetivo.');
                if (amount > goal.savedAmount) return err('El objetivo no tiene tanto ahorrado.');
                patchGoal(goalId, (g) => ({ ...g, savedAmount: round2(g.savedAmount - amount) }));
                return { ok: true };
            },

            // Mover dentro de la MISMA tarjeta (tarjeta ↔ apartado, o entre
            // apartados). Cambiar de tarjeta es un traspaso real.
            moveGoal: async ({ goalId, accountId, savingsAccountId = null }) => {
                const goal = findGoal(goalId);
                if (!goal) return err('No se encontró el objetivo.');
                const toSA = savingsAccountId ? findSA(savingsAccountId) : null;
                if (savingsAccountId && (!toSA || toSA.linkedAccountId !== accountId)) return err('Ese apartado no es de esa cuenta.');
                if (goal.accountId && goal.accountId !== accountId && goal.savedAmount > 0) {
                    return err('Para cambiar de tarjeta, primero haz un traspaso del dinero en Nuevo movimiento.');
                }
                if (savingsAccountId && !goal.savingsAccountId && goal.savedAmount > 0) {
                    const free = getFreeRoom(accountId) + goal.savedAmount; // su propio dinero cuenta como libre
                    if (goal.savedAmount > free) return err('No hay suficiente sin destino en esa cuenta.');
                }
                const moves = goal.savedAmount > 0 && goal.savingsAccountId !== (savingsAccountId || null);
                set((s) => ({
                    savingsAccounts: moves
                        ? s.savingsAccounts.map((a) => {
                            if (a.id === goal.savingsAccountId) return { ...a, earmarkedAmount: round2(Math.max(0, a.earmarkedAmount - goal.savedAmount)) };
                            if (a.id === savingsAccountId) return { ...a, earmarkedAmount: round2(a.earmarkedAmount + goal.savedAmount) };
                            return a;
                        })
                        : s.savingsAccounts,
                    savingsGoals: s.savingsGoals.map((g) => (g.id === goalId ? { ...g, accountId, savingsAccountId: savingsAccountId || null } : g)),
                }));
                return { ok: true };
            },

            // Cambio de moneda. Las tasas son porcentajes y no se tocan; el
            // tope sí es un monto.
            convertAllAmounts: async (rate) => {
                set((s) => ({
                    savingsAccounts: s.savingsAccounts.map((a) => ({
                        ...a,
                        earmarkedAmount: round2(a.earmarkedAmount * rate),
                        totalInterestEarned: round2((a.totalInterestEarned || 0) * rate),
                        interest: a.interest ? { ...a.interest, cap: a.interest.cap != null ? round2(a.interest.cap * rate) : null } : a.interest,
                    })),
                    savingsGoals: s.savingsGoals.map((g) => ({ ...g, targetAmount: round2(g.targetAmount * rate), savedAmount: round2(g.savedAmount * rate) })),
                }));
            },
        };
    },
});