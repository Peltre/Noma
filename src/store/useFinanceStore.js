// custom react hook that groups states related to each other in one place
// This way all screens get updated when a value shifts.

import { useState, useEffect } from 'react';
import { saveData, loadData, removeData } from './storage';
import { round2 } from '../utils/formatCurrency';

// storage keys
const KEYS = {
    accounts: 'accounts',
    transactions: 'transactions',
    creditCards: 'creditCards',
};

// Initial state (new user)
// No default debit account anymore — debit accounts are entirely
// user-created (onboarding, or the "+ Agregar cuenta" flow in Home),
// same pattern as credit cards starting at zero. Efectivo stays as
// the one singular, always-present account: useSavings.js's apartados
// now link directly to a real débito/efectivo account instead of a
// separate "Ahorros" pot, so that fake account no longer exists here.
//
// NOTE for local test data: anyone with an existing saved `accounts`
// array from before this change will still have the old `type:
// 'savings'` row (it's undeletable through the UI — see deleteAccount
// below) sitting around with nothing pointing at it anymore. Settings
// → reset clears it, same as any other fresh-start case.
const initialAccounts = [
    { id: '1', type: 'cash', name: 'Efectivo', balance: 0 },
];

export function useFinanceStore() {
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [creditCards, setCreditCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // load data on startup
    useEffect(() => {
        const loadAll = async () => {
            const savedAccounts = await loadData(KEYS.accounts);
            const savedTransactions = await loadData(KEYS.transactions);
            const savedCreditCards = await loadData(KEYS.creditCards);

            setAccounts(savedAccounts || initialAccounts);
            setTransactions(savedTransactions || []);
            setCreditCards(savedCreditCards || []);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    // Account management
    const updateAccountBalance = async (accountId, amount, currentAccounts) => {
        const base = currentAccounts || accounts;
        const updated = base.map(acc =>
            acc.id === accountId
                ? { ...acc, balance: round2(acc.balance + amount) }
                : acc
        );
        setAccounts(updated)
        await saveData(KEYS.accounts, updated);
        return updated;
    };

    // Create a new account. Scoped to 'debit' for now — cash and
    // savings are the two singular accounts other parts of the app
    // assume exist exactly once (see initialAccounts above), so this
    // rejects anything else rather than silently allowing a second
    // one to sneak in through some future screen.
    //
    // `initialBalance` defaults to 0 and should almost always stay
    // that way: a brand new debit account is a real bank account with
    // no history in this app yet, so — same principle as everywhere
    // else this conversation — there's no legitimate way to hand it a
    // starting balance without a real transaction funding it. The one
    // deliberate exception is onboarding, which is explicitly the
    // "here's what I already have" declaration moment for every
    // account, debit included.
    const addAccount = async ({ name, type, color, pattern, initialBalance = 0 }) => {
        if (!name || !name.trim()) {
            return { error: 'Ponle un nombre a la cuenta.' };
        }
        if (type !== 'debit') {
            return { error: 'Por ahora solo se pueden agregar cuentas de débito.' };
        }
        const newAccount = {
            id: Date.now().toString(),
            type,
            name: name.trim(),
            color: color || null,
            pattern: pattern || null,
            balance: Math.max(0, round2(initialBalance)),
        };
        const updated = [...accounts, newAccount];
        setAccounts(updated);
        await saveData(KEYS.accounts, updated);
        return newAccount;
    };

    // Rename / recolor / re-pattern an existing debit account. Balance
    // is never touched here — that only ever moves through a real
    // transaction.
    const updateAccountDetails = async ({ accountId, name, color, pattern }) => {
        const acc = accounts.find(a => a.id === accountId);
        if (!acc) {
            return { error: 'No se encontró la cuenta.' };
        }
        if (acc.type !== 'debit') {
            return { error: 'Esta cuenta no se puede editar.' };
        }
        if (!name || !name.trim()) {
            return { error: 'Ponle un nombre a la cuenta.' };
        }
        const updated = accounts.map(a =>
            a.id === accountId
                ? { ...a, name: name.trim(), color: color ?? a.color, pattern: pattern ?? a.pattern }
                : a
        );
        setAccounts(updated);
        await saveData(KEYS.accounts, updated);
        return { ok: true };
    };

    // Same rule as deleting a named savings account: only when it's
    // sitting at exactly zero, so deleting one can never make money
    // disappear along with it.
    const deleteAccount = async (accountId) => {
        const acc = accounts.find(a => a.id === accountId);
        if (!acc) {
            return { error: 'No se encontró la cuenta.' };
        }
        if (acc.type !== 'debit') {
            return { error: 'Esta cuenta no se puede eliminar.' };
        }
        if (acc.balance !== 0) {
            return { error: 'Esta cuenta tiene saldo. Muévelo a otra cuenta antes de eliminarla.' };
        }
        const updated = accounts.filter(a => a.id !== accountId);
        setAccounts(updated);
        await saveData(KEYS.accounts, updated);
        return { ok: true };
    };

    // Transaction handling 
    const addTransaction = async (transaction) => {
        // Every transaction needs a real, positive amount. Without this,
        // a negative amount would flip every subtraction below into an
        // addition and sail straight past the "can't go negative" guards
        // that follow — e.g. an `expense` of -100 turns
        // `balance - (-100)` into `balance + 100`, quietly fabricating
        // money instead of spending it. The UI already blocks this, but
        // the store shouldn't have to trust that blindly.
        if (!transaction.amount || transaction.amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        // Round once, here, and use this rounded copy for everything
        // below (including what gets saved) — same reason as
        // updateAccountBalance: floats can carry more than 2 decimals
        // in from arithmetic even when the UI itself only ever lets
        // someone type 2.
        transaction = { ...transaction, amount: round2(transaction.amount) };

        // A transfer moves money between two of the user's OWN accounts.
        // It needs a real, different destination before anything else —
        // otherwise it's indistinguishable from a plain withdrawal.
        if (transaction.type === 'transfer') {
            if (!transaction.toAccountId) {
                return { error: 'Selecciona una cuenta destino.' };
            }
            if (transaction.toAccountId === transaction.accountId) {
                return { error: 'La cuenta destino debe ser diferente a la de origen.' };
            }
        }

        // An expense, withdrawal or transfer can't take an account below
        // zero — that's not "spending/moving money you have", that's
        // creating debt a plain account was never meant to hold.
        if (
            (transaction.type === 'expense' || transaction.type === 'withdrawal' || transaction.type === 'transfer')
            && transaction.accountId
        ) {
            const account = accounts.find(a => a.id === transaction.accountId);
            if (account && account.balance - transaction.amount < 0) {
                return { error: `${account.name} solo tiene ${account.balance.toFixed(2)} disponibles.` };
            }
        }

        // Same idea for credit: a purchase can't push a card's debt past
        // its limit. This also covers MSI purchases — those create their
        // full-amount debt through this same `expense` + creditCardId
        // path, so this one check protects both.
        if (transaction.type === 'expense' && transaction.creditCardId) {
            const card = creditCards.find(c => c.id === transaction.creditCardId);
            if (card && card.limit > 0 && card.currentDebt + transaction.amount > card.limit) {
                const available = Math.max(0, card.limit - card.currentDebt);
                return { error: `${card.name} solo tiene ${available.toFixed(2)} de crédito disponible.` };
            }
        }

        const newTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...transaction,
        };

        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        await saveData(KEYS.transactions, updated);

        // Update acc balance
        if (transaction.type === 'income') {
            await updateAccountBalance(transaction.accountId, transaction.amount);
        } else if (transaction.type === 'expense' || transaction.type === 'withdrawal') {
            await updateAccountBalance(transaction.accountId, -transaction.amount);
        } else if (transaction.type === 'transfer') {
            // Move the money for real: out of the source, into the
            // destination. Total balance across all accounts never
            // changes — unlike an expense/withdrawal, this can't make
            // money vanish. The second call MUST be chained off the
            // first call's return value (not the `accounts` state
            // variable) — both updates touch the same accounts array
            // in the same tick, and `accounts` in this closure won't
            // reflect the first update yet, so chaining is what stops
            // the second write from clobbering the first.
            const afterSource = await updateAccountBalance(transaction.accountId, -transaction.amount);
            await updateAccountBalance(transaction.toAccountId, transaction.amount, afterSource);
        }

        if (transaction.type === 'expense' && transaction.creditCardId) {
            await updateCreditCardDebt(transaction.creditCardId, transaction.amount);
        }

        return newTransaction;
    };

    const deleteTransaction = async (txnId) => {
        const txn = transactions.find(t => t.id === txnId);
        if (!txn) return;

        // Reversing a transaction can itself create a negative balance —
        // e.g. deleting an old Ingreso after already spending part of
        // that money on something else, or deleting a Traspaso after
        // already spending what it sent to the destination account.
        // Same "never below zero" rule that applies to making a new
        // movement applies to undoing one. (Reversing an
        // expense/withdrawal/transfer-source always ADDS money back,
        // which is always safe — only these two directions subtract.)
        if (txn.type === 'income' && txn.accountId) {
            const account = accounts.find(a => a.id === txn.accountId);
            if (account && account.balance - txn.amount < 0) {
                return { error: `No se puede eliminar: ya usaste parte de este ingreso. ${account.name} quedaría en negativo.` };
            }
        }
        if (txn.type === 'transfer' && txn.toAccountId) {
            const destAcc = accounts.find(a => a.id === txn.toAccountId);
            if (destAcc && destAcc.balance - txn.amount < 0) {
                return { error: `No se puede eliminar: ya usaste parte del dinero recibido. ${destAcc.name} quedaría en negativo.` };
            }
        }

        // reverse balance effect
        if (txn.type === 'transfer') {
            // Reverse both legs: give the source its money back, take
            // it back out of the destination — same chaining rule as
            // in addTransaction (second call must build on the first
            // call's result, not the stale `accounts` closure).
            const afterSource = await updateAccountBalance(txn.accountId, txn.amount);
            if (txn.toAccountId) {
                await updateAccountBalance(txn.toAccountId, -txn.amount, afterSource);
            }
        } else if (txn.accountId) {
            if (txn.type === 'income') {
                await updateAccountBalance(txn.accountId, -txn.amount);
            } else if (txn.type === 'expense' || txn.type === 'withdrawal') {
                await updateAccountBalance(txn.accountId, txn.amount);
            }
        }
        if (txn.type === 'expense' && txn.creditCardId) {
            // Reverse a purchase: debt goes back down by what it went up.
            await updateCreditCardDebt(txn.creditCardId, -txn.amount);
        } else if (txn.type === 'withdrawal' && txn.linkedCardId) {
            // Reverse a card payment / MSI installment (see linkedCardId's
            // comment in CardsScreen.jsx / HomeScreen.jsx): debt goes back
            // UP by what this payment had paid down. Without this, deleting
            // one of these gave the money back to the account while
            // silently leaving the card's debt wiped out — free debt
            // forgiveness.
            await updateCreditCardDebt(txn.linkedCardId, txn.amount);
        }
        const updated = transactions.filter(t => t.id !== txnId);
        setTransactions(updated);
        await saveData(KEYS.transactions, updated);
    };

    // Edit a transaction's reason and/or amount (category stays the same)
    const updateTransaction = async (txnId, changes) => {
        const txn = transactions.find(t => t.id === txnId);
        if (!txn) return;

        // If amount changed, adjust balances by the delta
        if (changes.amount !== undefined && changes.amount !== txn.amount) {
            if (changes.amount <= 0) {
                return { error: 'El monto debe ser mayor a cero.' };
            }
            // Same reasoning as addTransaction: round once, use the
            // rounded value both for the delta math below and for
            // what actually gets saved.
            changes = { ...changes, amount: round2(changes.amount) };
            const delta = changes.amount - txn.amount;

            if (txn.type === 'transfer') {
                // Editing a transfer's amount moves the delta on BOTH
                // ends: the source loses more (or less), the
                // destination gains more (or less) — same rule as
                // everywhere else, neither side can be pushed below
                // zero.
                const sourceAcc = accounts.find(a => a.id === txn.accountId);
                if (sourceAcc && sourceAcc.balance - delta < 0) {
                    return { error: `${sourceAcc.name} solo tiene ${sourceAcc.balance.toFixed(2)} disponibles.` };
                }
                const destAcc = accounts.find(a => a.id === txn.toAccountId);
                if (destAcc && destAcc.balance + delta < 0) {
                    return { error: `${destAcc.name} solo tiene ${destAcc.balance.toFixed(2)} disponibles.` };
                }
                const afterSource = await updateAccountBalance(txn.accountId, -delta);
                await updateAccountBalance(txn.toAccountId, delta, afterSource);
            } else if (txn.accountId) {
                const balanceDelta = txn.type === 'income' ? delta : -delta;
                // Same rule as a new transaction: an expense/withdrawal
                // edit can't push the account below zero.
                if (balanceDelta < 0) {
                    const account = accounts.find(a => a.id === txn.accountId);
                    if (account && account.balance + balanceDelta < 0) {
                        return { error: `${account.name} solo tiene ${account.balance.toFixed(2)} disponibles.` };
                    }
                }
                await updateAccountBalance(txn.accountId, balanceDelta);
            }
            if (txn.type === 'expense' && txn.creditCardId) {
                // Only a larger amount can push the card over its limit —
                // a smaller one only pays debt down, always safe.
                if (delta > 0) {
                    const card = creditCards.find(c => c.id === txn.creditCardId);
                    if (card && card.limit > 0 && card.currentDebt + delta > card.limit) {
                        const available = Math.max(0, card.limit - card.currentDebt);
                        return { error: `${card.name} solo tiene ${available.toFixed(2)} de crédito disponible.` };
                    }
                }
                await updateCreditCardDebt(txn.creditCardId, delta);
            } else if (txn.type === 'withdrawal' && txn.linkedCardId) {
                // A card payment / MSI installment moves debt the OPPOSITE
                // direction of a purchase: a bigger payment pays MORE debt
                // down (-delta), a smaller one restores some of what was
                // already paid (delta is negative, so -delta is positive).
                // No limit check needed — the most this can push debt back
                // up to is what it already was right before this payment,
                // which was already within the limit back then.
                await updateCreditCardDebt(txn.linkedCardId, -delta);
            }
        }

        const updated = transactions.map(t =>
            t.id === txnId ? { ...t, ...changes } : t
        );
        setTransactions(updated);
        await saveData(KEYS.transactions, updated);
    };

    // Credit Card handling
    const addCreditCard = async (card) => {
        if (!card.name || !card.name.trim()) {
            return { error: 'Ponle un nombre a la tarjeta.' };
        }
        if (!card.limit || card.limit <= 0) {
            return { error: 'El límite debe ser mayor a cero.' };
        }
        const newCard = {
            id: Date.now().toString(),
            currentDebt: 0,
            ...card,
            name: card.name.trim(),
            limit: round2(card.limit),
            color: card.color || null,
            pattern: card.pattern || null,
        };
        const updated = [...creditCards, newCard];
        setCreditCards(updated);
        await saveData(KEYS.creditCards, updated);
        return newCard;
    };

    // Rename / recolor / re-limit an existing card. currentDebt is
    // never touched here — that only ever moves through a real
    // transaction (a purchase, a payment, or an MSI installment).
    const updateCreditCard = async (cardId, changes) => {
        const card = creditCards.find(c => c.id === cardId);
        if (!card) {
            return { error: 'No se encontró la tarjeta.' };
        }
        if (changes.name !== undefined && !changes.name.trim()) {
            return { error: 'Ponle un nombre a la tarjeta.' };
        }
        if (changes.limit !== undefined && changes.limit <= 0) {
            return { error: 'El límite debe ser mayor a cero.' };
        }
        const updated = creditCards.map(c =>
            c.id === cardId
                ? {
                    ...c,
                    ...changes,
                    name: changes.name !== undefined ? changes.name.trim() : c.name,
                    limit: changes.limit !== undefined ? round2(changes.limit) : c.limit,
                }
                : c
        );
        setCreditCards(updated);
        await saveData(KEYS.creditCards, updated);
        return { ok: true };
    };

    // Same rule as everywhere else in the app: only when there's no
    // debt left, so deleting a card can never make owed money
    // disappear along with it.
    const deleteCreditCard = async (cardId) => {
        const card = creditCards.find(c => c.id === cardId);
        if (!card) {
            return { error: 'No se encontró la tarjeta.' };
        }
        if (card.currentDebt !== 0) {
            return { error: 'Esta tarjeta tiene deuda pendiente. Págala antes de eliminarla.' };
        }
        const updated = creditCards.filter(c => c.id !== cardId);
        setCreditCards(updated);
        await saveData(KEYS.creditCards, updated);
        return { ok: true };
    };

    // Clamped to >= 0 for the same reason payCreditCard already was:
    // a reversal (deleteTransaction) or a downward edit
    // (updateTransaction) subtracts here, and debt going negative
    // would just mean "the card owes the user money", which isn't a
    // real state this app models.
    const updateCreditCardDebt = async (cardId, amount) => {
        const updated = creditCards.map(card =>
            card.id === cardId
                ? { ...card, currentDebt: Math.max(0, round2(card.currentDebt + amount)) }
                : card
        );
        setCreditCards(updated)
        await saveData(KEYS.creditCards, updated);
    };

    const payCreditCard = async (cardId, amount) => {
        const updated = creditCards.map(card =>
            card.id === cardId
                ? { ...card, currentDebt: Math.max(0, round2(card.currentDebt - amount)) }
                : card
        );
        setCreditCards(updated)
        await saveData(KEYS.creditCards, updated);
    };

    // Sets initial balances for new users during onboarding
    // **Does NOT create transactions, just sets the starting point
    // Clamped to >= 0 here too — the rest of the app has never
    // allowed a negative account balance since the "no account can be
    // on negative numbers" guard was added to addTransaction, but
    // onboarding's free-text amount fields never got the same
    // protection, so a typo like "-500" would start someone's very
    // first balance in the red with no warning.
    const setInitialBalances = async (balances) => {
        const updated = accounts.map(acc => {
            const found = balances.find(b => b.accountId === acc.id);
            return found ? { ...acc, balance: Math.max(0, round2(found.balance)) } : acc;
        });
        setAccounts(updated);
        await saveData(KEYS.accounts, updated);
    }

    // Records interest for potentially SEVERAL apartados as real
    // income transactions in one atomic update — called by
    // FinanceContext's accrual effect. This can't be a loop of
    // individual addTransaction calls: each call in a loop would
    // compute its new balance off the SAME pre-effect `accounts`
    // closure (a setState call doesn't change what an
    // already-created closure sees — see the "chaining" comment on
    // addTransaction's transfer handling above for the same class of
    // issue), so a second credit landing on an account already
    // touched earlier in the same run would silently overwrite it
    // instead of adding to it. Batching applies every credit to one
    // freshly-derived accounts array before a single setAccounts.
    const creditInterestBatch = async (credits) => {
        // credits: [{ accountId, amount, reason }] — every amount is
        // assumed > 0 (the caller already filters out $0 accruals),
        // this never subtracts.
        if (!credits.length) return [];
        let updatedAccounts = accounts;
        const newTransactions = credits.map((credit, i) => {
            updatedAccounts = updatedAccounts.map(acc =>
                acc.id === credit.accountId
                    ? { ...acc, balance: round2(acc.balance + credit.amount) }
                    : acc
            );
            return {
                id: `${Date.now()}_int_${i}`,
                date: new Date().toISOString(),
                type: 'income',
                amount: round2(credit.amount),
                accountId: credit.accountId,
                category: 'interest',
                reason: credit.reason,
            };
        });
        const updatedTransactions = [...newTransactions, ...transactions];
        setAccounts(updatedAccounts);
        setTransactions(updatedTransactions);
        await saveData(KEYS.accounts, updatedAccounts);
        await saveData(KEYS.transactions, updatedTransactions);
        return newTransactions;
    };

    // Currency switch (Settings → Moneda): rescales every stored money
    // value by `rate` (already resolved from the live exchange rate —
    // see utils/exchangeRate.js) and re-saves. Every field here is a
    // real amount, never a rate/percentage, so every one of them gets
    // multiplied — unlike useSavings.js's version of this, which has
    // to leave interest rate fields alone.
    const convertAllAmounts = async (rate) => {
        const updatedAccounts = accounts.map(acc => ({ ...acc, balance: round2(acc.balance * rate) }));
        const updatedTransactions = transactions.map(t => ({ ...t, amount: round2(t.amount * rate) }));
        const updatedCreditCards = creditCards.map(c => ({
            ...c,
            limit: round2(c.limit * rate),
            currentDebt: round2(c.currentDebt * rate),
        }));
        setAccounts(updatedAccounts);
        setTransactions(updatedTransactions);
        setCreditCards(updatedCreditCards);
        await saveData(KEYS.accounts, updatedAccounts);
        await saveData(KEYS.transactions, updatedTransactions);
        await saveData(KEYS.creditCards, updatedCreditCards);
    };

    const resetAll = async () => {
        await removeData(KEYS.accounts);
        await removeData(KEYS.transactions);
        await removeData(KEYS.creditCards);
        setAccounts(initialAccounts);
        setTransactions([]);
        setCreditCards([]);
    }

    // General Computed Values 
    const totalBalance = round2(accounts.reduce((sum, acc) => sum + acc.balance, 0));
    const totalDebt = round2(creditCards.reduce((sum, card) => sum + card.currentDebt, 0));

    return {
        // State
        accounts,
        transactions,
        creditCards,
        totalBalance,
        totalDebt,
        isLoading,
        // Actions
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        updateCreditCardDebt,
        payCreditCard,
        updateAccountBalance,
        addAccount,
        updateAccountDetails,
        deleteAccount,
        resetAll,
        setInitialBalances,
        convertAllAmounts,
        creditInterestBatch,
    };
}