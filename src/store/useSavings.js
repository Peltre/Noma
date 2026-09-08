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
import { saveData, loadData, removeData } from './storage';
import { round2 } from '../utils/formatCurrency';
import { parseISO, addDays } from 'date-fns';

const KEYS = {
    savingsAccounts: 'savingsAccounts',
    savingsGoals: 'savingsGoals',
};

// palette for apartado color dots
export const SAVINGS_COLORS = [
    '#6B5B9E', // purple (default)
    '#3D5A4C', // sage
    '#C9822A', // amber
    '#B94040', // red
    '#4A7FA5', // blue
    '#5A9E6B', // green
    '#A0522D', // brown
    '#7B7B7B', // gray
    '#C45FAB', // pink
    '#2C7BB5', // ocean
];

// Only débito/efectivo hold real, spendable money that can be earmarked.
const LINKABLE_TYPES = ['debit', 'cash'];

export function useSavings(accounts = []) {
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);

    useEffect(() => {
        const load = async () => {
            const accs = await loadData(KEYS.savingsAccounts);
            const goals = await loadData(KEYS.savingsGoals);
            setSavingsAccounts(accs || []);
            setSavingsGoals(goals || []);
        };
        load();
    }, []);

    // ── Déficit / risk ──

    // Total earmarked across every apartado linked to this account,
    // vs. what the account actually has. `balanceOverride` lets a
    // caller check "what WOULD the deficit be at this balance" before
    // a render happens.
    const getAccountDeficit = (accountId, balanceOverride) => {
        const linked = savingsAccounts.filter((a) => a.linkedAccountId === accountId);
        const totalEarmarked = round2(linked.reduce((s, a) => s + a.earmarkedAmount, 0));
        const account = accounts.find((a) => a.id === accountId);
        const balance = balanceOverride !== undefined ? balanceOverride : (account?.balance ?? 0);
        const deficit = round2(Math.max(0, totalEarmarked - balance));
        return { totalEarmarked, balance, deficit };
    };

    // Free room left in an account for a new/bigger apartado — never negative.
    const getFreeRoom = (accountId) => {
        const account = accounts.find((a) => a.id === accountId);
        if (!account) return 0;
        const { totalEarmarked } = getAccountDeficit(accountId);
        return round2(Math.max(0, account.balance - totalEarmarked));
    };

    // One apartado's own slice of its account's deficit, proportional
    // to how much of the account's total earmark it claims.
    const getSavingsAccountRisk = (savingsAccountId) => {
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa) return { atRisk: 0, safeAmount: 0 };
        const { totalEarmarked, deficit } = getAccountDeficit(sa.linkedAccountId);
        if (deficit <= 0 || totalEarmarked <= 0) {
            return { atRisk: 0, safeAmount: sa.earmarkedAmount };
        }
        const atRisk = round2(deficit * (sa.earmarkedAmount / totalEarmarked));
        return { atRisk, safeAmount: round2(sa.earmarkedAmount - atRisk) };
    };

    // A goal's at-risk amount: trace what it holds back to whichever
    // apartados fed it (net of withdrawals), then apply each
    // apartado's own risk ratio. An approximation — pooled money
    // doesn't track which specific peso came from where.
    const getGoalRisk = (goal) => {
        const bySource = {};
        goal.contributions.forEach((c) => {
            const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
            if (!key) return;
            const sign = c.type === 'deposit' ? 1 : -1;
            bySource[key] = round2((bySource[key] || 0) + sign * c.amount);
        });
        let atRisk = 0;
        Object.entries(bySource).forEach(([savingsAccountId, netAmount]) => {
            if (netAmount <= 0) return;
            const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
            if (!sa) return; // apartado no longer exists — can't trace risk for it
            const { totalEarmarked, deficit } = getAccountDeficit(sa.linkedAccountId);
            if (deficit <= 0 || totalEarmarked <= 0) return;
            atRisk += netAmount * (deficit / totalEarmarked);
        });
        return round2(atRisk);
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

    // Un-earmark part of an apartado. Always allowed down to 0 — there's
    // no separate pot to return it to.
    const removeFromSavingsAccount = async ({ savingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa || sa.earmarkedAmount < amount) {
            return { error: 'Este apartado no tiene asignado ese monto.' };
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
    const updateSavingsAccountInterest = async (savingsAccountId, { enabled, rate, cap, rateAboveCap }) => {
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa) return { error: 'No se encontró el apartado.' };
        if (enabled && (!rate || rate <= 0)) {
            return { error: 'Ponle una tasa de interés anual mayor a cero.' };
        }
        const wasEnabled = !!sa.interest?.enabled;
        const updated = savingsAccounts.map((a) => {
            if (a.id !== savingsAccountId) return a;
            return {
                ...a,
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
    const addSavingsGoal = async ({ name, targetAmount, deadline = null }) => {
        const newGoal = {
            id: Date.now().toString(),
            name,
            targetAmount: round2(targetAmount),
            savedAmount: 0,
            deadline,
            createdAt: new Date().toISOString(),
            contributions: [],
        };
        const updated = [...savingsGoals, newGoal];
        setSavingsGoals(updated);
        await saveData(KEYS.savingsGoals, updated);
        return newGoal;
    };

    // Returns whatever the goal holds back to wherever it came from,
    // net per apartado. `returnFunds: false` is for "marcar como
    // comprado" (SavingsScreen), where the money already left for
    // real through expense transactions — crediting it back here
    // would double it.
    const deleteSavingsGoal = async (goalId, { returnFunds = true } = {}) => {
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) {
            return { error: 'No se encontró el objetivo.' };
        }

        if (returnFunds) {
            const bySource = {};
            goal.contributions.forEach((c) => {
                const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
                if (!key) return;
                const sign = c.type === 'deposit' ? 1 : -1;
                bySource[key] = round2((bySource[key] || 0) + sign * c.amount);
            });

            let updatedSavingsAccounts = savingsAccounts;
            Object.entries(bySource).forEach(([savingsAccountId, netAmount]) => {
                if (netAmount <= 0) return; // apartado deleted mid-way, or net-negative — gets nothing back
                updatedSavingsAccounts = updatedSavingsAccounts.map((a) =>
                    a.id === savingsAccountId
                        ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + netAmount) }
                        : a,
                );
            });
            setSavingsAccounts(updatedSavingsAccounts);
            await saveData(KEYS.savingsAccounts, updatedSavingsAccounts);
        }

        const updatedGoals = savingsGoals.filter((g) => g.id !== goalId);
        setSavingsGoals(updatedGoals);
        await saveData(KEYS.savingsGoals, updatedGoals);
        return { ok: true, releasedAmount: returnFunds ? goal.savedAmount : 0 };
    };

    // Move money from an apartado into a goal — reduces the
    // apartado's earmark by exactly what the goal gains.
    const contributeToGoal = async ({ goalId, fromSavingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) {
            return { error: 'No se encontró el objetivo.' };
        }
        // Capped so savedAmount can never pass targetAmount — otherwise
        // "Marcar como comprado" could leave an unexplained leftover.
        const remaining = round2(goal.targetAmount - goal.savedAmount);
        if (remaining <= 0) {
            return { error: 'Este objetivo ya está completo.' };
        }
        if (amount > remaining) {
            return { error: `Con eso te pasarías del objetivo — solo faltan ${remaining.toFixed(2)}.` };
        }
        const sa = savingsAccounts.find((a) => a.id === fromSavingsAccountId);
        if (!sa || sa.earmarkedAmount < amount) {
            return { error: 'Ese apartado no tiene asignado ese monto.' };
        }

        const updatedSavingsAccounts = savingsAccounts.map((a) =>
            a.id === fromSavingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount - amount) } : a,
        );
        setSavingsAccounts(updatedSavingsAccounts);
        await saveData(KEYS.savingsAccounts, updatedSavingsAccounts);

        const contribution = {
            id: Date.now().toString(),
            fromSavingsAccountId,
            amount,
            date: new Date().toISOString(),
            type: 'deposit',
        };
        const updatedGoals = savingsGoals.map((g) =>
            g.id === goalId
                ? {
                    ...g,
                    savedAmount: round2(g.savedAmount + amount),
                    contributions: [contribution, ...g.contributions],
                }
                : g,
        );
        setSavingsGoals(updatedGoals);
        await saveData(KEYS.savingsGoals, updatedGoals);
        return { ok: true };
    };

    // Return earmarked goal funds back to a chosen apartado.
    const withdrawFromGoal = async ({ goalId, toSavingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal || goal.savedAmount < amount) {
            return { error: 'El objetivo no tiene suficientes fondos.' };
        }
        const sa = savingsAccounts.find((a) => a.id === toSavingsAccountId);
        if (!sa) {
            return { error: 'No se encontró el apartado destino.' };
        }

        const updatedSavingsAccounts = savingsAccounts.map((a) =>
            a.id === toSavingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + amount) } : a,
        );
        setSavingsAccounts(updatedSavingsAccounts);
        await saveData(KEYS.savingsAccounts, updatedSavingsAccounts);

        const contribution = {
            id: Date.now().toString(),
            toSavingsAccountId,
            amount,
            date: new Date().toISOString(),
            type: 'withdrawal',
        };
        const updatedGoals = savingsGoals.map((g) =>
            g.id === goalId
                ? {
                    ...g,
                    savedAmount: round2(g.savedAmount - amount),
                    contributions: [contribution, ...g.contributions],
                }
                : g,
        );
        setSavingsGoals(updatedGoals);
        await saveData(KEYS.savingsGoals, updatedGoals);
        return { ok: true };
    };

    // Wipe all savings data (called from Settings global reset)
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
            contributions: g.contributions.map((c) => ({ ...c, amount: round2(c.amount * rate) })),
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

    // Cuánto de cada apartado está comprometido a un objetivo, y de qué
    // apartados sale cada objetivo. Las dos direcciones del mismo dato.
    //
    // Existe porque `contributeToGoal` le RESTA el monto al
    // `earmarkedAmount` del apartado: sin esto, un apartado que respalda
    // un objetivo se muestra con menos dinero del que realmente tiene
    // detrás. El dinero nunca se movió de la cuenta ligada —solo cambió
    // de destino—, y `getGoalRisk` ya trabaja bajo ese supuesto cuando
    // rastrea el déficit hasta la cuenta real.
    //
    // Ojo con el tipo: `withdrawFromGoal` guarda 'withdrawal', no
    // 'withdraw'. Comparar solo contra 'deposit' —como aquí— evita que
    // un retiro deje de restar y los totales salgan inflados.
    const getGoalCommitments = () => {
        const byAccount = {}; // savingsAccountId -> [{ goalId, amount }]
        const byGoal = {};    // goalId -> [{ savingsAccountId, amount }]

        savingsGoals.forEach((goal) => {
            const bySource = {};
            goal.contributions.forEach((c) => {
                const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
                if (!key) return;
                const sign = c.type === 'deposit' ? 1 : -1;
                bySource[key] = round2((bySource[key] || 0) + sign * c.amount);
            });
            Object.entries(bySource).forEach(([savingsAccountId, amount]) => {
                if (amount <= 0) return;
                if (!byAccount[savingsAccountId]) byAccount[savingsAccountId] = [];
                if (!byGoal[goal.id]) byGoal[goal.id] = [];
                byAccount[savingsAccountId].push({ goalId: goal.id, amount });
                byGoal[goal.id].push({ savingsAccountId, amount });
            });
        });

        return { byAccount, byGoal };
    };

    // Lo que un apartado respalda de verdad: lo que tiene libre más lo
    // que ya prometió a objetivos.
    const getAccountBacking = (savingsAccountId, commitments) => {
        const sa = savingsAccounts.find((a) => a.id === savingsAccountId);
        if (!sa) return { free: 0, committed: 0, total: 0 };
        const { byAccount } = commitments || getGoalCommitments();
        const committed = round2((byAccount[savingsAccountId] || []).reduce((s, c) => s + c.amount, 0));
        return { free: sa.earmarkedAmount, committed, total: round2(sa.earmarkedAmount + committed) };
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
        updateSavingsAccountInterest,
        creditInterestBatch,
        // Goals
        addSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        withdrawFromGoal,
        getMonthlySuggestion,
        getGoalCommitments,
        getAccountBacking,
        // Déficit / risk
        getAccountDeficit,
        getFreeRoom,
        getSavingsAccountRisk,
        getGoalRisk,
        resetSavings,
        convertAllAmounts,
    };
}