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
    const addSavingsAccount = async ({ name, color, linkedAccountId, initialAmount = 0 }) => {
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
        const free = getFreeRoom(linkedAccountId);
        const assigned = round2(Math.min(Math.max(initialAmount, 0), free));
        const newAcc = {
            id: Date.now().toString(),
            name: name.trim(),
            color: color || SAVINGS_COLORS[0],
            linkedAccountId,
            earmarkedAmount: assigned,
            createdAt: new Date().toISOString(),
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
    };
}