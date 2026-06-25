// Global context that shares the same storage instance with all screens
import { createContext, useContext } from "react";
import { useFinanceStore } from "./useFinanceStore";
import { useSettings } from "./useSettings";

const FinanceContext = createContext(null);

// provider that wraps around the app & exposes data to screens
export function FinanceProvider({ children }) {
    const financeStore = useFinanceStore();
    const settingsStore = useSettings();

    return (
        <FinanceContext.Provider value={{ ...financeStore, ...settingsStore}}>
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