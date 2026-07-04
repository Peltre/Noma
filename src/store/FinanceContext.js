// Global context that shares the same storage instance with all screens
import { createContext, useContext } from "react";
import { useFinanceStore } from "./useFinanceStore";
import { useSettings } from "./useSettings";
import { useScheduledFunds } from "./useScheduleFunds";
import { useSavings } from "./useSavings";

const FinanceContext = createContext(null);

// provider that wraps around the app & exposes data to screens
export function FinanceProvider({ children }) {
    const financeStore = useFinanceStore();
    const settingsStore = useSettings();
    const scheduledFundsStore = useScheduledFunds();
    // useSavings only needs the accounts list now, to know the real
    // Ahorros total it's breaking down — it no longer moves money
    // between general accounts (see useSavings.js).
    const savingsStore = useSavings(financeStore.accounts);

    // financeStore and settingsStore each expose their own isLoading —
    // spreading both below would let whichever comes last silently win,
    // so the app isn't really "ready" until BOTH are done loading.
    const isLoading = financeStore.isLoading || settingsStore.isLoading;

    return (
        <FinanceContext.Provider value={{
            ...financeStore,
            ...settingsStore,
            ...scheduledFundsStore,
            ...savingsStore,
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