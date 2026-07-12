// Global context that shares the same storage instance with all screens
import { createContext, useContext } from "react";
import { useFinanceStore } from "./useFinanceStore";
import { useSettings } from "./useSettings";
import { useScheduledFunds } from "./useScheduleFunds";
import { useSavings } from "./useSavings";
import { round2 } from "../utils/formatCurrency";

const FinanceContext = createContext(null);

// provider that wraps around the app & exposes data to screens
export function FinanceProvider({ children }) {
    const financeStore = useFinanceStore();
    const settingsStore = useSettings();
    const scheduledFundsStore = useScheduledFunds();
    // useSavings only needs the accounts list now, to know each
    // account's real balance — apartados link straight to it instead
    // of a separate Ahorros pot (see useSavings.js).
    const savingsStore = useSavings(financeStore.accounts);

    // financeStore and settingsStore each expose their own isLoading —
    // spreading both below would let whichever comes last silently win,
    // so the app isn't really "ready" until BOTH are done loading.
    const isLoading = financeStore.isLoading || settingsStore.isLoading;

    // Wraps financeStore's addTransaction so every screen (they all
    // go through useFinance(), never useFinanceStore directly) gets a
    // `savingsWarning` on the result for free when a transaction eats
    // into money an apartado had earmarked in that account — without
    // useFinanceStore needing to import or know apartados exist at
    // all. Compares the account's deficit right before vs. right
    // after THIS transaction, so it only fires for the transaction
    // that actually caused/worsened it, not a pre-existing one the
    // person hasn't dealt with yet.
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

    return (
        <FinanceContext.Provider value={{
            ...financeStore,
            ...settingsStore,
            ...scheduledFundsStore,
            ...savingsStore,
            addTransaction,
            isLoading,
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

// personalized hook to read context from any screen
export function useFinance() {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance debe usarse dentro de FinanceProvider');
    return context;
}