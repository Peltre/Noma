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

// provider that wraps around the app & exposes data to screens
export function FinanceProvider({ children }) {
    const financeStore = useFinanceStore();
    const settingsStore = useSettings();
    const scheduledFundsStore = useScheduledFunds();
    // useSavings only needs the accounts list now, to know each
    // account's real balance — apartados link straight to it instead
    // of a separate Ahorros pot (see useSavings.js).
    const savingsStore = useSavings(financeStore.accounts);
    const tagsStore = useTags();

    // financeStore and settingsStore each expose their own isLoading —
    // spreading both below would let whichever comes last silently win,
    // so the app isn't really "ready" until ALL of them are done
    // loading (tagsStore included, since TransactionScreen renders
    // the tag picker from it right away).
    const isLoading = financeStore.isLoading || settingsStore.isLoading || tagsStore.tagsLoading;

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

    // Wraps financeStore.addTransactionsBatch the same way addTransaction
    // above wraps financeStore.addTransaction — adds a savings warning
    // per account that ended up more at-risk because of this batch.
    // Unlike addTransaction's wrapper (always exactly one account),
    // this can touch several at once — e.g. SavingsScreen's
    // handleRedeemGoal spending from every apartado that funded a
    // goal in a single call — so this returns a `savingsWarnings`
    // array (one entry per newly-at-risk account) instead of a single
    // `savingsWarning`.
    // "After" is read straight from the batch's own returned
    // `accounts` array, not from financeStore.accounts — that state
    // variable won't reflect this batch's changes until the next
    // render, and re-reading it here would just reintroduce the same
    // stale-closure problem addTransactionsBatch exists to avoid.
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

    // Wraps financeStore.payCardWithTransaction the same way
    // addTransaction above wraps financeStore.addTransaction — a
    // card payment is still a single-account withdrawal under the
    // hood, so this follows addTransaction's shape exactly (one
    // `savingsWarning`, not the plural `savingsWarnings` the batch
    // wrapper above uses for multi-account operations).
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

    // financeStore.deleteAccount only ever checks the account's OWN
    // balance — it has no idea apartados exist, same reason
    // addTransaction needs wrapping above. Without this, a débito
    // account sitting at $0 (which is exactly when deletion is
    // otherwise allowed) could still have an apartado linked to it
    // claiming a real earmarked amount — already showing as "at
    // risk" in Ahorros — and deleting the account would silently
    // orphan that apartado for good (its linkedAccountId would point
    // at nothing, and any interest it earns would have nowhere real
    // to land). Blocking the deletion here, before it ever reaches
    // financeStore, is cheaper than trying to detect/repair an
    // orphaned apartado after the fact.
    const deleteAccount = async (accountId) => {
        const linkedApartados = savingsStore.savingsAccounts.filter(sa => sa.linkedAccountId === accountId);
        if (linkedApartados.length > 0) {
            return { error: 'Esta cuenta tiene apartados de ahorro ligados. Elimínalos (o quítales el dinero asignado) antes de eliminar la cuenta.' };
        }
        return financeStore.deleteAccount(accountId);
    };

    // Runs once per app open, right after everything's finished
    // loading: credits real interest for every apartado that has it
    // enabled and has had at least one full day pass since its last
    // check. `hasAccruedRef` (not just the `[isLoading]` dep array)
    // is the actual once-only guard — isLoading only ever flips
    // true→false once in a normal session, but React 19 renders
    // effects twice in dev, and this must never book the same days
    // twice.
    //
    // Every credit for this run is collected first and applied
    // through ONE creditInterestBatch call per store at the end,
    // rather than one addTransaction/creditInterest call per
    // apartado in a loop — seemingly equivalent, but it isn't: two
    // calls to the same store setter within this same effect
    // execution both build off the SAME pre-effect state closure
    // (calling a setter doesn't change what an already-created
    // closure sees), so the second apartado credited in a loop would
    // silently overwrite the first one's change instead of adding to
    // it. See the batch functions themselves for the full reasoning.
    const hasAccruedRef = useRef(false);
    useEffect(() => {
        if (isLoading || hasAccruedRef.current) return;
        hasAccruedRef.current = true;

        const accrueAllInterest = async () => {
            const accountCredits = [];  // → financeStore.creditInterestBatch
            const savingsCredits = [];  // → savingsStore.creditInterestBatch

            savingsStore.savingsAccounts.forEach(sa => {
                if (!sa.interest?.enabled) return;
                // Defensive: a pre-existing orphaned apartado (linked
                // account deleted before the guard above existed, or
                // any other data inconsistency) should never accrue
                // interest into a void — there'd be no real account
                // left for creditInterestBatch to actually deposit
                // into.
                if (!financeStore.accounts.some(acc => acc.id === sa.linkedAccountId)) return;
                const last = sa.lastInterestAccrualAt ? parseISO(sa.lastInterestAccrualAt) : parseISO(sa.createdAt);
                const days = differenceInDays(new Date(), last);
                if (days < 1) return; // nothing to do until at least a full day has passed

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
    // store using a live exchange rate, then flips settings.currency.
    // Requires internet (see utils/exchangeRate.js) — an offline
    // attempt returns { error } with a message already safe to show
    // directly, and nothing is touched (the rate fetch is the very
    // first thing this does, before any conversion runs).
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

// personalized hook to read context from any screen
export function useFinance() {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance debe usarse dentro de FinanceProvider');
    return context;
}