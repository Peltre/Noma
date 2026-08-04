// Hook to handle savings buckets ("apartados") & objectives (goals).
//
// PHASE 1 of the savings redesign — this file only. SavingsScreen.jsx
// still expects the old API at this point and WILL be broken/crash
// until it's rewritten in Phase 2 — that's expected, not a bug here.
//
// ── The model ──
// There is no separate "Ahorros" pot anymore. An apartado is a label
// on top of part of a REAL account's balance (débito or efectivo) —
// it never moves money anywhere. That account keeps showing its full
// real balance always; the apartado just remembers "how much of
// this is spoken for."
//
//   Cuenta real (débito/efectivo) → Apartado (linkedAccountId) → Objetivo
//
// Every layer is just a number reserved on top of the layer below it.
// Nothing here ever touches `accounts` balances — only a real
// transaction (useFinanceStore's addTransaction) does that.
//
// ── Déficit ──
// Because the linked account's real balance can drop below what's
// earmarked in it (you spent from that card), an apartado's number
// is never silently corrected — it stays exactly what you set it to,
// and a live "risk" amount is computed on top instead (see
// getAccountDeficit / getSavingsAccountRisk / getGoalRisk below).
// When one account backs several apartados and comes up short, the
// shortfall is split across them proportional to how much each one
// claims — an apartado with 70% of the account's earmark absorbs 70%
// of that account's deficit.
import { useState, useEffect } from "react";
import { saveData, loadData, removeData } from "./storage";
import { round2 } from "../utils/formatCurrency";
import { parseISO, addDays } from "date-fns";

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

// Only débito/efectivo hold real, spendable money that can be earmarked
// this way — crédito is debt, not a balance to reserve part of.
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

    // How much every apartado linked to this account claims in total,
    // vs. how much the account actually has. `balanceOverride` lets a
    // caller ask "what WOULD the deficit be at this balance" — used to
    // check a transaction before/after without waiting for a render.
    const getAccountDeficit = (accountId, balanceOverride) => {
        const linked = savingsAccounts.filter(a => a.linkedAccountId === accountId);
        const totalEarmarked = round2(linked.reduce((s, a) => s + a.earmarkedAmount, 0));
        const account = accounts.find(a => a.id === accountId);
        const balance = balanceOverride !== undefined ? balanceOverride : (account?.balance ?? 0);
        const deficit = round2(Math.max(0, totalEarmarked - balance));
        return { totalEarmarked, balance, deficit };
    };

    // Free room left in an account to create or grow an apartado —
    // never negative, even if the account is already short.
    const getFreeRoom = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;
        const { totalEarmarked } = getAccountDeficit(accountId);
        return round2(Math.max(0, account.balance - totalEarmarked));
    };

    // One apartado's own slice of its account's deficit — proportional
    // to how much of that account's total earmark this one claims.
    const getSavingsAccountRisk = (savingsAccountId) => {
        const sa = savingsAccounts.find(a => a.id === savingsAccountId);
        if (!sa) return { atRisk: 0, safeAmount: 0 };
        const { totalEarmarked, deficit } = getAccountDeficit(sa.linkedAccountId);
        if (deficit <= 0 || totalEarmarked <= 0) {
            return { atRisk: 0, safeAmount: sa.earmarkedAmount };
        }
        const atRisk = round2(deficit * (sa.earmarkedAmount / totalEarmarked));
        return { atRisk, safeAmount: round2(sa.earmarkedAmount - atRisk) };
    };

    // A goal's at-risk amount: trace what it currently holds back to
    // whichever apartados fed it (net of any withdrawals sent back
    // out), then apply each of those apartados' own risk ratio.
    //
    // Approximation, not exact accounting: if a goal was funded from
    // apartado A and later partly withdrawn back to a DIFFERENT
    // apartado B, this treats A's and B's flows independently rather
    // than tracking which specific peso came from where — pooled
    // money doesn't really have a "which one" once it's mixed, so
    // this is the same simplification any budgeting app makes here.
    const getGoalRisk = (goal) => {
        const bySource = {};
        goal.contributions.forEach(c => {
            const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
            if (!key) return;
            const sign = c.type === 'deposit' ? 1 : -1;
            bySource[key] = round2((bySource[key] || 0) + sign * c.amount);
        });
        let atRisk = 0;
        Object.entries(bySource).forEach(([savingsAccountId, netAmount]) => {
            if (netAmount <= 0) return;
            const sa = savingsAccounts.find(a => a.id === savingsAccountId);
            if (!sa) return; // that apartado no longer exists — can't trace risk for it
            const { totalEarmarked, deficit } = getAccountDeficit(sa.linkedAccountId);
            if (deficit <= 0 || totalEarmarked <= 0) return;
            atRisk += netAmount * (deficit / totalEarmarked);
        });
        return round2(atRisk);
    };

    // ── Apartados ──

    // Creates an apartado linked to a real débito/efectivo account,
    // and — optionally — immediately earmarks part of that account's
    // currently-free balance (capped, same "can't hand out more than
    // exists" rule as everywhere else in this app).
    //
    // `interest` is entirely optional (per-apartado, opt-in — see the
    // "── Interest ──" section below for how it actually accrues):
    // { enabled, rate, cap, rateAboveCap }. Left out or `enabled:
    // false` and this apartado just behaves exactly as it always has.
    const addSavingsAccount = async ({ name, color, linkedAccountId, initialAmount = 0, interest = null }) => {
        if (!name || !name.trim()) {
            return { error: 'Ponle un nombre al apartado.' };
        }
        const account = accounts.find(a => a.id === linkedAccountId);
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
                    rateAboveCap: (interest.cap > 0 && interest.rateAboveCap > 0) ? round2(interest.rateAboveCap) : null,
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
        const acc = savingsAccounts.find(a => a.id === accountId);
        if (acc?.earmarkedAmount > 0) {
            return { error: 'Este apartado tiene dinero asignado. Quítaselo antes de eliminarlo.' };
        }
        const updated = savingsAccounts.filter(a => a.id !== accountId);
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Earmark more of the linked account's balance into this apartado.
    // Nothing moves — this is the whole "no fake pot" point — so it's
    // just capped by how much of that specific account is still free.
    const addToSavingsAccount = async ({ savingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const sa = savingsAccounts.find(a => a.id === savingsAccountId);
        if (!sa) {
            return { error: 'No se encontró el apartado.' };
        }
        const free = getFreeRoom(sa.linkedAccountId);
        if (amount > free) {
            return { error: `Solo tienes ${free.toFixed(2)} libres en esa cuenta.` };
        }
        const updated = savingsAccounts.map(a =>
            a.id === savingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + amount) } : a
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Un-earmark part of an apartado — frees up room in its linked
    // account for something else. Always allowed down to 0; there's
    // no "unallocated pot" to return it to because it was never
    // anywhere else to begin with.
    const removeFromSavingsAccount = async ({ savingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const sa = savingsAccounts.find(a => a.id === savingsAccountId);
        if (!sa || sa.earmarkedAmount < amount) {
            return { error: 'Este apartado no tiene asignado ese monto.' };
        }
        const updated = savingsAccounts.map(a =>
            a.id === savingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount - amount) } : a
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // ── Interest ──
    // Optional, per-apartado, entirely opt-in — mirrors how a real
    // Mexican savings account works (Nu, etc.): an annual rate on
    // whatever's earmarked here, and — optionally — a second, lower
    // rate for whatever sits above a cap (e.g. 13% up to $25,000,
    // less above that). Interest compounds daily.
    //
    // This file only computes and books the numbers. The actual
    // crediting is driven by FinanceContext.js's accrual effect,
    // which owns the one thing this file deliberately doesn't have
    // access to: financeStore.addTransaction. That matters because
    // interest has to become REAL money in the linked account (a
    // real 'income' transaction, visible in Historial) — not just a
    // bigger number inside this apartado — since an apartado is only
    // ever a claim on top of a real balance, never its own pot (see
    // the file header). creditInterestBatch below runs right after that
    // real transaction lands, and only grows the earmark by the same
    // amount that already, for real, grew the account.

    // Pure: one apartado's accrued interest over `days` whole days,
    // given its current earmarkedAmount and interest config. No
    // storage writes — used both by the accrual effect (to know how
    // much to actually credit) and by getEstimatedMonthlyInterest
    // (for a rough preview in the UI).
    const computeAccruedInterest = (sa, days) => {
        if (!sa?.interest?.enabled || days <= 0) return 0;
        const { rate, cap, rateAboveCap } = sa.interest;
        const principal = sa.earmarkedAmount;
        if (principal <= 0 || !rate || rate <= 0) return 0;

        const dailyRate = (rate / 100) / 365;
        const belowCapAmount = cap != null ? Math.min(principal, cap) : principal;
        let accrued = belowCapAmount * (Math.pow(1 + dailyRate, days) - 1);

        // The slice above the cap earns the reduced rate — 0 if the
        // person set a cap but left the reduced rate blank, same as
        // most real accounts default to when you don't ask them for
        // a second tier.
        if (cap != null && principal > cap) {
            const aboveCapAmount = principal - cap;
            const dailyRateAbove = ((rateAboveCap || 0) / 100) / 365;
            accrued += aboveCapAmount * (Math.pow(1 + dailyRateAbove, days) - 1);
        }
        return round2(accrued);
    };

    // Rough "about how much per month" preview for the apartado card —
    // deliberately just computeAccruedInterest over a flat 30 days
    // rather than trying to predict deposits/withdrawals that haven't
    // happened yet. Good enough for "should I turn this on", not
    // meant to be a promise.
    const getEstimatedMonthlyInterest = (savingsAccountId) => {
        const sa = savingsAccounts.find(a => a.id === savingsAccountId);
        return computeAccruedInterest(sa, 30);
    };

    // Turns interest on/off (or edits rate/cap) for an apartado that
    // already exists — same shape as addSavingsAccount's `interest`
    // param, editable any time, exactly because the person asked for
    // this to be "completamente opcional, y depende del usuario".
    //
    // (Re-)enabling resets lastInterestAccrualAt to right now. Without
    // that, turning it on today would let the next accrual assume
    // interest had already been running since createdAt (or whenever
    // it was last touched) and credit a lump sum backdated to a
    // period where it was actually off. Editing the rate/cap while
    // ALREADY enabled does NOT reset the clock — that would let
    // someone reset their own accrual window on demand for no reason.
    const updateSavingsAccountInterest = async (savingsAccountId, { enabled, rate, cap, rateAboveCap }) => {
        const sa = savingsAccounts.find(a => a.id === savingsAccountId);
        if (!sa) return { error: 'No se encontró el apartado.' };
        if (enabled && (!rate || rate <= 0)) {
            return { error: 'Ponle una tasa de interés anual mayor a cero.' };
        }
        const wasEnabled = !!sa.interest?.enabled;
        const updated = savingsAccounts.map(a => {
            if (a.id !== savingsAccountId) return a;
            return {
                ...a,
                interest: enabled
                    ? {
                        enabled: true,
                        rate: round2(rate),
                        cap: cap > 0 ? round2(cap) : null,
                        rateAboveCap: (cap > 0 && rateAboveCap > 0) ? round2(rateAboveCap) : null,
                    }
                    : { ...a.interest, enabled: false },
                lastInterestAccrualAt: (enabled && !wasEnabled) ? new Date().toISOString() : a.lastInterestAccrualAt,
            };
        });
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Books interest for potentially SEVERAL apartados in one atomic
    // update — called once by FinanceContext's accrual effect after
    // it's recorded the matching real income transaction(s) on each
    // linked account (see that file's creditInterestBatch call on
    // financeStore). This has to be a single batched write rather
    // than a loop calling a per-apartado version: each call in a
    // loop would build its update off the SAME pre-effect
    // `savingsAccounts` closure (a setState call doesn't change what
    // an already-created closure sees), so a second apartado credited
    // in the same run would silently overwrite the first one's
    // change instead of adding to it.
    //
    // `amount` can be 0 (e.g. a tiny rate/principal rounds to $0 for
    // this stretch) — the clock still advances by `daysElapsed` so
    // the same already-elapsed span isn't recomputed forever with
    // nothing to show for it.
    const creditInterestBatch = async (credits) => {
        // credits: [{ savingsAccountId, amount, daysElapsed }]
        if (!credits.length) return;
        const byId = new Map(credits.map(c => [c.savingsAccountId, c]));
        const updated = savingsAccounts.map(a => {
            const credit = byId.get(a.id);
            if (!credit) return a;
            const prevAccrual = a.lastInterestAccrualAt ? parseISO(a.lastInterestAccrualAt) : parseISO(a.createdAt);
            return {
                ...a,
                earmarkedAmount: credit.amount > 0 ? round2(a.earmarkedAmount + credit.amount) : a.earmarkedAmount,
                totalInterestEarned: credit.amount > 0 ? round2((a.totalInterestEarned || 0) + credit.amount) : a.totalInterestEarned,
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

    // Deleting a goal returns whatever it holds back to wherever it
    // came from — net per apartado, since a goal can be fed from
    // several and partly withdrawn from others along the way. This is
    // the one place that money would otherwise just vanish: unlike
    // the old fake-pot model, an apartado's earmarkedAmount is real
    // stored state now, not something a derived "unallocated" total
    // could quietly absorb.
    //
    // `returnFunds: false` is for the "marcar como comprado" flow
    // (SavingsScreen's handleRedeemGoal) — there, the money already
    // left for real through actual expense transactions against the
    // linked accounts, so crediting it back here would double it.
    const deleteSavingsGoal = async (goalId, { returnFunds = true } = {}) => {
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal) {
            return { error: 'No se encontró el objetivo.' };
        }

        if (returnFunds) {
            const bySource = {};
            goal.contributions.forEach(c => {
                const key = c.type === 'deposit' ? c.fromSavingsAccountId : c.toSavingsAccountId;
                if (!key) return;
                const sign = c.type === 'deposit' ? 1 : -1;
                bySource[key] = round2((bySource[key] || 0) + sign * c.amount);
            });

            let updatedSavingsAccounts = savingsAccounts;
            Object.entries(bySource).forEach(([savingsAccountId, netAmount]) => {
                if (netAmount <= 0) return; // an apartado that was deleted mid-way, or net-negative, gets nothing back
                updatedSavingsAccounts = updatedSavingsAccounts.map(a =>
                    a.id === savingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + netAmount) } : a
                );
            });
            setSavingsAccounts(updatedSavingsAccounts);
            await saveData(KEYS.savingsAccounts, updatedSavingsAccounts);
        }

        const updatedGoals = savingsGoals.filter(g => g.id !== goalId);
        setSavingsGoals(updatedGoals);
        await saveData(KEYS.savingsGoals, updatedGoals);
        return { ok: true, releasedAmount: returnFunds ? goal.savedAmount : 0 };
    };

    // Move money from an apartado → earmark it in a goal instead.
    // Same relabeling-without-moving-real-money principle, one layer
    // deeper: this reduces the apartado's earmark by exactly what the
    // goal gains, so the account's total claimed amount never changes.
    const contributeToGoal = async ({ goalId, fromSavingsAccountId, amount }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        amount = round2(amount);
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal) {
            return { error: 'No se encontró el objetivo.' };
        }
        // Same reasoning as before: capping here means savedAmount can
        // never legitimately pass targetAmount, so "Marcar como
        // comprado" (which only ever spends targetAmount) can't leave
        // an unexplained leftover behind when the goal is cleared out.
        const remaining = round2(goal.targetAmount - goal.savedAmount);
        if (remaining <= 0) {
            return { error: 'Este objetivo ya está completo.' };
        }
        if (amount > remaining) {
            return { error: `Con eso te pasarías del objetivo — solo faltan ${remaining.toFixed(2)}.` };
        }
        const sa = savingsAccounts.find(a => a.id === fromSavingsAccountId);
        if (!sa || sa.earmarkedAmount < amount) {
            return { error: 'Ese apartado no tiene asignado ese monto.' };
        }

        const updatedSavingsAccounts = savingsAccounts.map(a =>
            a.id === fromSavingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount - amount) } : a
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
        const updatedGoals = savingsGoals.map(g =>
            g.id === goalId
                ? { ...g, savedAmount: round2(g.savedAmount + amount), contributions: [contribution, ...g.contributions] }
                : g
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
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal || goal.savedAmount < amount) {
            return { error: 'El objetivo no tiene suficientes fondos.' };
        }
        const sa = savingsAccounts.find(a => a.id === toSavingsAccountId);
        if (!sa) {
            return { error: 'No se encontró el apartado destino.' };
        }

        const updatedSavingsAccounts = savingsAccounts.map(a =>
            a.id === toSavingsAccountId ? { ...a, earmarkedAmount: round2(a.earmarkedAmount + amount) } : a
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
        const updatedGoals = savingsGoals.map(g =>
            g.id === goalId
                ? { ...g, savedAmount: round2(g.savedAmount - amount), contributions: [contribution, ...g.contributions] }
                : g
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
    // by `rate` — earmarkedAmount, totalInterestEarned, goal amounts,
    // and each goal contribution. `interest.rate`/`rateAboveCap` are
    // percentages, NEVER converted; `interest.cap` IS a real amount
    // threshold, so it converts along with everything else.
    const convertAllAmounts = async (rate) => {
        const updatedSavingsAccounts = savingsAccounts.map(a => ({
            ...a,
            earmarkedAmount: round2(a.earmarkedAmount * rate),
            totalInterestEarned: round2((a.totalInterestEarned || 0) * rate),
            interest: a.interest
                ? { ...a.interest, cap: a.interest.cap != null ? round2(a.interest.cap * rate) : null }
                : a.interest,
        }));
        const updatedGoals = savingsGoals.map(g => ({
            ...g,
            targetAmount: round2(g.targetAmount * rate),
            savedAmount: round2(g.savedAmount * rate),
            contributions: g.contributions.map(c => ({ ...c, amount: round2(c.amount * rate) })),
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
            (deadline.getFullYear() - now.getFullYear()) * 12 +
            (deadline.getMonth() - now.getMonth());
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
        updateSavingsAccountInterest,
        creditInterestBatch,
        // Goals
        addSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        withdrawFromGoal,
        getMonthlySuggestion,
        // Déficit / risk
        getAccountDeficit,
        getFreeRoom,
        getSavingsAccountRisk,
        getGoalRisk,
        resetSavings,
        convertAllAmounts,
    };
}