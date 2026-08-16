// Global context that shares the same storage instance with all screens
import { createContext, useContext, useEffect, useRef } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { useFinanceStore } from "./useFinanceStore";
import { useSettings } from "./useSettings";
import { useScheduledFunds } from "./useScheduleFunds";
import { useSavings } from "./useSavings";
import { useTags } from "./useTags";
import { round2 } from "../utils/formatCurrency";
import { fetchExchangeRate } from "../utils/exchangeRate";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
    const financeStore = useFinanceStore();
    const settingsStore = useSettings();
    const scheduledFundsStore = useScheduledFunds();
    // Apartados link straight to a real account's balance now, so
    // useSavings only needs the accounts list, not its own pot.
    const savingsStore = useSavings(financeStore.accounts);
    const tagsStore = useTags();

    // Not "ready" until every store is done loading, tags included
    // (TransactionScreen renders the tag picker right away).
    const isLoading = financeStore.isLoading || settingsStore.isLoading || tagsStore.tagsLoading;

    // Wraps financeStore.addTransaction to add a `savingsWarning` when
    // a transaction eats into money an apartado had earmarked in that
    // account — compares the account's deficit right before vs. right
    // after, so it only fires for this transaction, not a pre-existing one.
    const addTransaction = async (txn) => {
        const isOutflow = txn.type === 'expense' || txn.type === 'withdrawal' || txn.type === 'transfer';
        const account = isOutflow && txn.accountId
            ? financeStore.accounts.find(a => a.id === txn.accountId)
            : null;
        const deficitBefore = account ? savingsStore.getAccountDeficit(account.id).deficit : 0;

        const result = await financeStore.addTransaction(txn);
        if (result?.error || !account) return result;

        const newBalance = round2(account.balance - result.amount);
        const deficitAfter = savingsStore.getAccountDeficit(account.id, newBalance).deficit;
        if (deficitAfter > deficitBefore) {
            return {
                ...result,
                savingsWarning: {
                    accountName: account.name,
                    newlyAtRisk: round2(deficitAfter - deficitBefore),
                },
            };
        }
        return result;
    };

    // Same idea as addTransaction above, but for a batch touching
    // several accounts at once (e.g. SavingsScreen redeeming a goal
    // funded from multiple apartados) — returns `savingsWarnings`
    // (plural), one per newly-at-risk account. Reads "after" straight
    // from the batch's own returned accounts array, not
    // financeStore.accounts, which won't reflect the change until
    // the next render.
    const addTransactionsBatch = async (list) => {
        const uniqueAccountIds = [...new Set(list.map(t => t.accountId).filter(Boolean))];
        const deficitsBefore = {};
        uniqueAccountIds.forEach(id => {
            deficitsBefore[id] = savingsStore.getAccountDeficit(id).deficit;
        });

        const result = await financeStore.addTransactionsBatch(list);
        if (result.error) return result;

        const savingsWarnings = [];
        uniqueAccountIds.forEach(id => {
            const account = result.accounts.find(a => a.id === id);
            if (!account) return;
            const deficitAfter = savingsStore.getAccountDeficit(id, account.balance).deficit;
            if (deficitAfter > deficitsBefore[id]) {
                savingsWarnings.push({
                    accountName: account.name,
                    newlyAtRisk: round2(deficitAfter - deficitsBefore[id]),
                });
            }
        });

        return { ...result, savingsWarnings };
    };

    // Same wrapping as addTransaction — a card payment is a single-account withdrawal.
    const payCardWithTransaction = async (payload) => {
        const account = payload.accountId
            ? financeStore.accounts.find(a => a.id === payload.accountId)
            : null;
        const deficitBefore = account ? savingsStore.getAccountDeficit(account.id).deficit : 0;

        const result = await financeStore.payCardWithTransaction(payload);
        if (result?.error || !account) return result;

        const newBalance = round2(account.balance - result.amount);
        const deficitAfter = savingsStore.getAccountDeficit(account.id, newBalance).deficit;
        if (deficitAfter > deficitBefore) {
            return {
                ...result,
                savingsWarning: {
                    accountName: account.name,
                    newlyAtRisk: round2(deficitAfter - deficitBefore),
                },
            };
        }
        return result;
    };

    // financeStore.deleteAccount only checks the account's own balance
    // — it doesn't know apartados exist. Without this, a $0 débito
    // account with a linked apartado could be deleted, orphaning that
    // apartado for good.
    const deleteAccount = async (accountId) => {
        const linkedApartados = savingsStore.savingsAccounts.filter(sa => sa.linkedAccountId === accountId);
        if (linkedApartados.length > 0) {
            return { error: 'Esta cuenta tiene apartados de ahorro ligados. Elimínalos (o quítales el dinero asignado) antes de eliminar la cuenta.' };
        }
        return financeStore.deleteAccount(accountId);
    };

    // Runs once per app open: credits real interest for every
    // apartado with it enabled, once at least a day has passed.
    // hasAccruedRef (not just [isLoading]) is the real once-only
    // guard, since React 19 runs effects twice in dev. Every credit
    // is collected first and applied via ONE creditInterestBatch call
    // per store — looping would have each call build off the same
    // pre-effect closure and lose everything but the last.
    const hasAccruedRef = useRef(false);
    useEffect(() => {
        if (isLoading || hasAccruedRef.current) return;
        hasAccruedRef.current = true;

        const accrueAllInterest = async () => {
            const accountCredits = [];  // → financeStore.creditInterestBatch
            const savingsCredits = [];  // → savingsStore.creditInterestBatch

            savingsStore.savingsAccounts.forEach(sa => {
                if (!sa.interest?.enabled) return;
                // Defensive: an orphaned apartado has no real account to credit.
                if (!financeStore.accounts.some(acc => acc.id === sa.linkedAccountId)) return;
                const last = sa.lastInterestAccrualAt ? parseISO(sa.lastInterestAccrualAt) : parseISO(sa.createdAt);
                const days = differenceInDays(new Date(), last);
                if (days < 1) return;

                const accrued = savingsStore.computeAccruedInterest(sa, days);
                savingsCredits.push({ savingsAccountId: sa.id, amount: accrued, daysElapsed: days });
                if (accrued > 0) {
                    accountCredits.push({
                        accountId: sa.linkedAccountId,
                        amount: accrued,
                        reason: `Interés — ${sa.name}`,
                    });
                }
            });

            if (accountCredits.length > 0) {
                await financeStore.creditInterestBatch(accountCredits);
            }
            if (savingsCredits.length > 0) {
                await savingsStore.creditInterestBatch(savingsCredits);
            }
        };

        accrueAllInterest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    // Settings → Moneda: converts every stored amount across every
    // store, then flips settings.currency. Requires internet — an
    // offline attempt returns { error } and touches nothing.
    const changeCurrency = async (newCurrency) => {
        const current = settingsStore.settings.currency;
        if (newCurrency === current) return { ok: true, rate: 1 };

        const { rate, error } = await fetchExchangeRate(current, newCurrency);
        if (error) return { error };

        await financeStore.convertAllAmounts(rate);
        await savingsStore.convertAllAmounts(rate);
        await scheduledFundsStore.convertAllAmounts(rate);
        await settingsStore.updateSettings({ currency: newCurrency });

        return { ok: true, rate };
    };

    return (
        <FinanceContext.Provider value={{
            ...financeStore,
            ...settingsStore,
            ...scheduledFundsStore,
            ...savingsStore,
            ...tagsStore,
            addTransaction,
            addTransactionsBatch,
            payCardWithTransaction,
            deleteAccount,
            changeCurrency,
            isLoading,
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance debe usarse dentro de FinanceProvider');
    return context;
}