// Hook to handle savings accounts & objectives
//
// The "Ahorros" account (type: 'savings' in the main accounts store)
// is the single source of truth for how much money you actually have
// saved. It only changes through a normal transaction (an Ingreso or
// Retiro with Ahorros as the account) — same as any other account.
//
// Named savings accounts here (Cajita Nu, etc.) do NOT hold separate
// money. They're labels that break the Ahorros total down into
// buckets, purely for organization. Moving money into/out of a named
// bucket never touches cash/debit/the Ahorros account itself — it's
// capped by however much of Ahorros is still "unallocated" (not
// already sitting in a named bucket), so it's impossible to make a
// named bucket's total exceed the real Ahorros balance.

import { useState, useEffect } from "react";
import { saveData, loadData, removeData } from "./storage";

const KEYS = {
    savingsAccounts: 'savingsAccounts',
    savingsGoals: 'savingsGoals',
};

// palette for savings account color dots
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

export function useSavings(accounts = []) {
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);

    // The real total — comes from the general accounts store, moved
    // only by actual transactions (Ingreso/Retiro with Ahorros as
    // the account).
    const mainSavingsBalance = accounts.find(a => a.type === 'savings')?.balance ?? 0;

    useEffect(() => {
        const load = async () => {
            const accs = await loadData(KEYS.savingsAccounts);
            const goals = await loadData(KEYS.savingsGoals);
            setSavingsAccounts(accs || []);
            setSavingsGoals(goals || []);
        };
        load();
    }, []);

    // Sum of all named savings accounts — how much of the total is
    // already broken down into a labeled bucket.
    // Goal savedAmount is included too: contributing to a goal moves
    // money OUT of a named account's balance and INTO the goal, but
    // it's still just as "broken down" as it was before — just
    // recategorized from account to goal, not returned to
    // unallocated. Leaving goals out of this sum was the bug: it made
    // the breakdown total (and "sin asignar") drop every time someone
    // funded a goal, as if that money had become unaccounted for.
    const savingsBreakdownTotal =
        savingsAccounts.reduce((sum, a) => sum + a.balance, 0) +
        savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
    // Whatever's left in Ahorros that isn't in a named bucket yet.
    const unallocatedSavings = Math.max(0, mainSavingsBalance - savingsBreakdownTotal);

    // Savings accounts (breakdown buckets)

    // Creates a bucket and, optionally, immediately assigns it part of
    // the unallocated total (capped — can't hand out more than exists).
    const addSavingsAccount = async ({ name, color, initialBalance = 0 }) => {
        const assigned = Math.min(Math.max(initialBalance, 0), unallocatedSavings);
        const newAcc = {
            id: Date.now().toString(),
            name,
            color: color || '#6B5B9E',
            balance: assigned,
            createdAt: new Date().toISOString(),
        };
        const updated = [...savingsAccounts, newAcc];
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { newAcc, ok: true, capped: assigned < initialBalance };
    };

    const deleteSavingsAccount = async (accountId) => {
        const acc = savingsAccounts.find(a => a.id === accountId);
        if (acc?.balance > 0) {
            return { error: 'Esta cuenta tiene saldo asignado. Quítaselo antes de eliminarla.' };
        }
        const updated = savingsAccounts.filter(a => a.id !== accountId);
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Assign part of the unallocated Ahorros total into a named
    // bucket. Purely a relabel — Ahorros itself doesn't change.
    const depositToSavingsAccount = async ({ toSavingsAccountId, amount }) => {
        if (amount > unallocatedSavings) {
            return { error: `Solo tienes ${unallocatedSavings.toFixed(2)} sin asignar en Ahorros.` };
        }
        const updated = savingsAccounts.map(a =>
            a.id === toSavingsAccountId
                ? { ...a, balance: a.balance + amount }
                : a
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Free up money from a named bucket back to "unallocated" —
    // still inside Ahorros, just no longer labeled. To actually take
    // money out of savings entirely, use a Retiro transaction with
    // Ahorros as the account instead.
    const withdrawFromSavingsAccount = async ({ fromSavingsAccountId, amount }) => {
        const acc = savingsAccounts.find(a => a.id === fromSavingsAccountId);
        if (!acc || acc.balance < amount) {
            return { error: 'Esta cuenta no tiene asignado ese monto.' };
        }
        const updated = savingsAccounts.map(a =>
            a.id === fromSavingsAccountId
                ? { ...a, balance: a.balance - amount }
                : a
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Goals
    const addSavingsGoal = async ({ name, targetAmount, emoji, deadline = null }) => {
        const newGoal = {
            id: Date.now().toString(),
            name,
            emoji: emoji || '🎯',
            targetAmount,
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

    const deleteSavingsGoal = async (goalId) => {
        const goal = savingsGoals.find(g => g.id === goalId);
        const updated = savingsGoals.filter(g => g.id !== goalId);
        setSavingsGoals(updated);
        await saveData(KEYS.savingsGoals, updated);
        return { releasedAmount: goal?.savedAmount || 0 };
    };

    // Move money from a named savings acc → earmark it in a goal
    const contributeToGoal = async ({ goalId, fromSavingsAccountId, amount }) => {
        const acc = savingsAccounts.find(a => a.id === fromSavingsAccountId);
        if (!acc || acc.balance < amount) {
            return { error: 'Saldo insuficiente en la cuenta de ahorro.' };
        }
        const updatedAccs = savingsAccounts.map(a =>
            a.id === fromSavingsAccountId
                ? { ...a, balance: a.balance - amount }
                : a
        );
        setSavingsAccounts(updatedAccs);
        await saveData(KEYS.savingsAccounts, updatedAccs);

        const contribution = {
            id: Date.now().toString(),
            fromSavingsAccountId,
            amount,
            date: new Date().toISOString(),
            type: 'deposit',
        };
        const updatedGoals = savingsGoals.map(g =>
            g.id === goalId
                ? {
                    ...g,
                    savedAmount: g.savedAmount + amount,
                    contributions: [contribution, ...g.contributions],
                }
                : g
        );
        setSavingsGoals(updatedGoals);
        await saveData(KEYS.savingsGoals, updatedGoals);
        return { ok: true };
    };

    // Return earmarked goal funds back to a named savings acc
    const withdrawFromGoal = async ({ goalId, toSavingsAccountId, amount }) => {
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal || goal.savedAmount < amount) {
            return { error: 'El objetivo no tiene suficientes fondos.' };
        }
        const updatedAccs = savingsAccounts.map(a =>
            a.id === toSavingsAccountId
                ? { ...a, balance: a.balance + amount }
                : a
        );
        setSavingsAccounts(updatedAccs);
        await saveData(KEYS.savingsAccounts, updatedAccs);

        const contribution = {
            id: Date.now().toString(),
            toSavingsAccountId,
            amount,
            date: new Date().toISOString(),
            type: 'withdrawal',
        };
        const updatedGoals = savingsGoals.map(g =>
            g.id === goalId
                ? {
                    ...g,
                    savedAmount: g.savedAmount - amount,
                    contributions: [contribution, ...g.contributions],
                }
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
        mainSavingsBalance,
        savingsBreakdownTotal,
        unallocatedSavings,
        // Accounts
        addSavingsAccount,
        deleteSavingsAccount,
        depositToSavingsAccount,
        withdrawFromSavingsAccount,
        // Goals
        addSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        withdrawFromGoal,
        getMonthlySuggestion,
        resetSavings,
    };
}