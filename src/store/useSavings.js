// Hook to handle savings accounts & objectives
// The savings "total" lives in the main accounts store (type: 'savings').
// This hook manages the breakdown: which named accounts hold that money,
// and which goals have funds earmarked inside those accounts.

import { useState, useEffect } from "react";
import { saveData, loadData } from "./storage";

const KEYS = {
    savingsAccounts: 'savingsAccounts',
    savingsGoals: 'savingsGoals',
};

export const SAVINGS_EMOJIS = ['🏦', '🟣', '💜', '🔵', '🟢', '⭐', '🐷', '🫙', '💰', '📦'];

export function useSavings(updateAccountBalance) {
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [savingsLoading, setSavingsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const accs = await loadData(KEYS.savingsAccounts);
            const goals = await loadData(KEYS.savingsGoals);
            setSavingsAccounts(accs || []);
            setSavingsGoals(goals || []);
            setSavingsLoading(false);
        };
        load();
    }, []);

    // ── Savings accounts ──────────────────────────────────────────

    const addSavingsAccount = async ({ name, emoji, initialBalance = 0 }) => {
        const newAcc = {
            id: Date.now().toString(),
            name,
            emoji: emoji || '🏦',
            balance: initialBalance,
            createdAt: new Date().toISOString(),
        };
        const updated = [...savingsAccounts, newAcc];
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return newAcc;
    };

    const deleteSavingsAccount = async (accountId) => {
        const acc = savingsAccounts.find(a => a.id === accountId);
        if (acc?.balance > 0) {
            return { error: 'Esta cuenta tiene saldo. Retíralo antes de eliminarla.' };
        }
        const updated = savingsAccounts.filter(a => a.id !== accountId);
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        return { ok: true };
    };

    // Move money from a general acc (cash/debit) → named savings acc
    // Also updates the main 'savings' account balance so Home stays in sync
    const depositToSavingsAccount = async ({ fromAccountId, toSavingsAccountId, amount }) => {
        // Subtract from origin (cash or debit)
        await updateAccountBalance(fromAccountId, -amount);
        // Add to the named savings acc breakdown
        const updated = savingsAccounts.map(a =>
            a.id === toSavingsAccountId
                ? { ...a, balance: a.balance + amount }
                : a
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
    };

    // Withdraw from a named savings acc → general acc
    const withdrawFromSavingsAccount = async ({ fromSavingsAccountId, toAccountId, amount }) => {
        const acc = savingsAccounts.find(a => a.id === fromSavingsAccountId);
        if (!acc || acc.balance < amount) {
            return { error: 'Saldo insuficiente en la cuenta de ahorro.' };
        }
        const updated = savingsAccounts.map(a =>
            a.id === fromSavingsAccountId
                ? { ...a, balance: a.balance - amount }
                : a
        );
        setSavingsAccounts(updated);
        await saveData(KEYS.savingsAccounts, updated);
        await updateAccountBalance(toAccountId, amount);
        return { ok: true };
    };

    // ── Goals ─────────────────────────────────────────────────────

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

    // ── Computed ──────────────────────────────────────────────────

    // Sum of all named savings accounts — used as the breakdown total
    const savingsBreakdownTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);

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
        savingsLoading,
        savingsBreakdownTotal,
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
    };
}