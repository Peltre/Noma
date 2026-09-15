// Fachada única para las pantallas: `useFinance()` junta los cinco
// stores y las acciones compuestas (las que tocan más de un store).
//
// FinanceProvider además corre lo que debe pasar una vez al abrir la
// app (abono de intereses). Las pantallas no saben cuántos stores hay:
// piden lo que necesitan de aquí.
import { createContext, useContext, useEffect, useRef } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { useMoneyStore, selectTotalBalance } from './moneyStore';
import { useSavingsStore, computeAccruedInterest } from './savingsStore';
import { useFundsStore, getFundStatus, selectPendingFunds } from './fundsStore';
import { useTagsStore } from './tagsStore';
import { useSettingsStore } from './settingsStore';
import { fetchExchangeRate } from '../utils/exchangeRate';

const FinanceContext = createContext(null);

// ── Acciones compuestas ──

// Después de cualquier cosa que baje un saldo, lo apartado de esa
// tarjeta tiene que seguir cabiendo en ella. `reconcileAccount` recorta
// lo que sobre (primero lo libre, luego los objetivos a prorrata) y
// devuelve qué se tocó, para avisarlo.
//
// Las cuentas a revisar salen del movimiento: la de origen, y en un
// traspaso también la destino (borrar o encoger un traspaso baja el
// saldo del otro lado).
async function withReconcile(accountIds, run) {
    const result = await run();
    if (result?.error) return result;

    const { reconcileAccount } = useSavingsStore.getState();
    const { accounts } = useMoneyStore.getState();
    const adjustments = [];
    for (const id of new Set(accountIds.filter(Boolean))) {
        const trimmed = reconcileAccount(id);
        if (trimmed) {
            adjustments.push({ ...trimmed, accountName: accounts.find((a) => a.id === id)?.name ?? '' });
        }
    }
    return adjustments.length ? { ...result, savingsAdjusted: adjustments } : result;
}

const addTransaction = (txn) =>
    withReconcile([txn.accountId, txn.toAccountId], () => useMoneyStore.getState().addTransaction(txn));

const updateTransaction = (txnId, changes) => {
    const txn = useMoneyStore.getState().transactions.find((t) => t.id === txnId);
    return withReconcile([txn?.accountId, txn?.toAccountId], () => useMoneyStore.getState().updateTransaction(txnId, changes));
};

const deleteTransaction = (txnId) => {
    const txn = useMoneyStore.getState().transactions.find((t) => t.id === txnId);
    return withReconcile([txn?.accountId, txn?.toAccountId], () => useMoneyStore.getState().deleteTransaction(txnId));
};

const payCardWithTransaction = (payload) =>
    withReconcile([payload.accountId], () => useMoneyStore.getState().payCardWithTransaction(payload));

// Borrar una tarjeta débito exige que no le cuelgue nada: apartados,
// objetivos directos. Los fondos programados que apuntaban a ella
// quedan sin destino explícito.
async function deleteAccount(accountId) {
    const { savingsAccounts, savingsGoals } = useSavingsStore.getState();
    if (savingsAccounts.some((sa) => sa.linkedAccountId === accountId)) {
        return { error: 'Esta cuenta tiene apartados de ahorro ligados. Elimínalos (o quítales el dinero asignado) antes de eliminar la cuenta.' };
    }
    if (savingsGoals.some((g) => g.accountId === accountId && !g.savingsAccountId)) {
        return { error: 'Hay objetivos que viven en esta cuenta. Muévelos a otro lugar antes de borrarla.' };
    }
    const result = await useMoneyStore.getState().deleteAccount(accountId);
    if (result?.error) return result;
    await useFundsStore.getState().detachAccount(accountId);
    return result;
}

// Ajustes → Moneda: reescala todo y cambia la moneda. Sin internet
// devuelve { error } y no toca nada.
async function changeCurrency(newCurrency) {
    const current = useSettingsStore.getState().settings.currency;
    if (newCurrency === current) return { ok: true, rate: 1 };
    const { rate, error } = await fetchExchangeRate(current, newCurrency);
    if (error) return { error };
    await useMoneyStore.getState().convertAllAmounts(rate);
    await useSavingsStore.getState().convertAllAmounts(rate);
    await useFundsStore.getState().convertAllAmounts(rate);
    await useSettingsStore.getState().updateSettings({ currency: newCurrency });
    return { ok: true, rate };
}

// Ajustes → Borrar todo: la persona vuelve a ser un usuario nuevo.
async function resetEverything() {
    await useMoneyStore.resetPersisted();
    await useSavingsStore.resetPersisted();
    await useFundsStore.resetPersisted();
    await useTagsStore.resetPersisted();
    await useSettingsStore.resetPersisted();
}

// Una vez por apertura: abona el interés de cada apartado que lo tenga
// activo, si pasó al menos un día. Primero el ingreso real en la
// cuenta (moneyStore), luego el apartado crece lo mismo (savingsStore).
async function accrueInterest() {
    const { savingsAccounts } = useSavingsStore.getState();
    const { accounts } = useMoneyStore.getState();
    const accountCredits = [];
    const savingsCredits = [];
    savingsAccounts.forEach((sa) => {
        if (!sa.interest?.enabled) return;
        if (!accounts.some((a) => a.id === sa.linkedAccountId)) return; // apartado huérfano
        const last = parseISO(sa.lastInterestAccrualAt || sa.createdAt);
        const days = differenceInDays(new Date(), last);
        if (days < 1) return;
        const accrued = computeAccruedInterest(sa, days);
        savingsCredits.push({ savingsAccountId: sa.id, amount: accrued, daysElapsed: days });
        if (accrued > 0) accountCredits.push({ accountId: sa.linkedAccountId, amount: accrued, reason: `Interés — ${sa.name}` });
    });
    if (accountCredits.length) await useMoneyStore.getState().creditInterest(accountCredits);
    if (savingsCredits.length) await useSavingsStore.getState().creditInterest(savingsCredits);
}

export function FinanceProvider({ children }) {
    const hydrated =
        useMoneyStore((s) => s.hydrated) && useSavingsStore((s) => s.hydrated) && useFundsStore((s) => s.hydrated)
        && useTagsStore((s) => s.hydrated) && useSettingsStore((s) => s.hydrated);

    // hasAccruedRef, no sólo [hydrated]: React 19 corre efectos dos veces en dev.
    const hasAccruedRef = useRef(false);
    useEffect(() => {
        if (!hydrated || hasAccruedRef.current) return;
        hasAccruedRef.current = true;
        accrueInterest();
    }, [hydrated]);

    return <FinanceContext.Provider value={{ hydrated }}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
    const ctx = useContext(FinanceContext);
    if (!ctx) throw new Error('useFinance debe usarse dentro de FinanceProvider');

    const money = useMoneyStore();
    const savings = useSavingsStore();
    const funds = useFundsStore();
    const tags = useTagsStore();
    const settingsStore = useSettingsStore();

    return {
        isLoading: !ctx.hydrated,

        // Dinero
        accounts: money.accounts,
        transactions: money.transactions,
        creditCards: money.creditCards,
        totalBalance: selectTotalBalance(money),
        addTransaction,
        updateTransaction,
        deleteTransaction,
        payCardWithTransaction,
        addAccount: money.addAccount,
        updateAccountDetails: money.updateAccountDetails,
        deleteAccount,
        setupInitialAccounts: money.setupInitialAccounts,
        addCreditCard: money.addCreditCard,
        updateCreditCard: money.updateCreditCard,
        deleteCreditCard: money.deleteCreditCard,

        // Ahorros
        savingsAccounts: savings.savingsAccounts,
        savingsGoals: savings.savingsGoals,
        addSavingsAccount: savings.addSavingsAccount,
        deleteSavingsAccount: savings.deleteSavingsAccount,
        updateSavingsAccount: savings.updateSavingsAccount,
        addToSavingsAccount: savings.addToSavingsAccount,
        removeFromSavingsAccount: savings.removeFromSavingsAccount,
        addSavingsGoal: savings.addSavingsGoal,
        updateSavingsGoal: savings.updateSavingsGoal,
        deleteSavingsGoal: savings.deleteSavingsGoal,
        saveToGoal: savings.saveToGoal,
        takeFromGoal: savings.takeFromGoal,
        moveGoal: savings.moveGoal,
        getFreeRoom: savings.getFreeRoom,
        getApartadoFree: savings.getApartadoFree,
        getPlaceFree: savings.getPlaceFree,
        getMonthlySuggestion: savings.getMonthlySuggestion,

        // Fondos programados y MSI
        scheduledFunds: funds.scheduledFunds,
        pendingFunds: selectPendingFunds(funds),
        getFundStatus,
        addScheduledFund: funds.addScheduledFund,
        updateScheduledFund: funds.updateScheduledFund,
        removeScheduledFund: funds.removeScheduledFund,
        confirmFund: funds.confirmFund,
        addMSI: funds.addMSI,
        confirmMSI: funds.confirmMSI,

        // Etiquetas
        tags: tags.tags,
        addTag: tags.addTag,

        // Ajustes
        settings: settingsStore.settings,
        updateSettings: settingsStore.updateSettings,
        changeCurrency,
        resetEverything,
    };
}