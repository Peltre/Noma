// Core financial state: accounts, transactions, credit cards.
// One hook, so every screen reading it re-renders on any change.

import { useState, useEffect } from 'react';
import { saveData, loadData, removeData } from './storage';
import { round2 } from '../utils/formatCurrency';

const KEYS = {
    accounts: 'accounts',
    transactions: 'transactions',
    creditCards: 'creditCards',
};

// Efectivo is the one account every user starts with. Debit accounts
// and credit cards are entirely user-created (onboarding or "+
// Agregar cuenta").
const initialAccounts = [
    { id: '1', type: 'cash', name: 'Efectivo', balance: 0 },
];

export function useFinanceStore() {
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [creditCards, setCreditCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // `currentAccounts` lets a caller chain two updates in the same
    // tick (e.g. a transfer's two legs) without one clobbering the
    // other — see addTransaction's transfer branch.
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

    // Scoped to 'debit' — cash is the only other account type and
    // it's created once, up front. `initialBalance` is only meant for
    // onboarding ("here's what I already have"); everywhere else a
    // balance should come from a real transaction.
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

    // Varias cuentas de débito en una sola escritura (onboarding). Un
    // loop de addAccount perdería todas menos la última: cada llamada
    // lee `accounts` del mismo closure. Ids únicos por índice porque
    // Date.now() puede repetirse entre llamadas seguidas.
    // `base` permite encadenar sobre un estado ya modificado en la misma
    // pasada (ver setupInitialAccounts): dos escrituras seguidas desde el
    // mismo closure se pisarían entre sí.
    const addAccountsBatch = async (list, base = accounts) => {
        if (!list.length) return { accounts: [], errors: [] };
        const errors = [];
        const newAccounts = [];
        let updatedAccounts = base;
        list.forEach(({ name, type, color, pattern, initialBalance = 0 }) => {
            if (!name || !name.trim()) {
                errors.push({ name, error: 'Ponle un nombre a la cuenta.' });
                return;
            }
            if (type !== 'debit') {
                errors.push({ name, error: 'Por ahora solo se pueden agregar cuentas de débito.' });
                return;
            }
            const newAccount = {
                id: `${Date.now()}_${newAccounts.length}`,
                type,
                name: name.trim(),
                color: color || null,
                pattern: pattern || null,
                balance: Math.max(0, round2(initialBalance)),
            };
            updatedAccounts = [...updatedAccounts, newAccount];
            newAccounts.push(newAccount);
        });
        setAccounts(updatedAccounts);
        await saveData(KEYS.accounts, updatedAccounts);
        return { accounts: newAccounts, errors };
    };

    // Balance never changes here — that only happens through a real transaction.
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

    // Only deletable at $0 — otherwise the balance would just vanish.
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
        // A negative amount would flip every "can't go negative" check
        // below into an addition, fabricating money instead of spending it.
        if (!transaction.amount || transaction.amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        transaction = { ...transaction, amount: round2(transaction.amount) };

        if (transaction.type === 'transfer') {
            if (!transaction.toAccountId) {
                return { error: 'Selecciona una cuenta destino.' };
            }
            if (transaction.toAccountId === transaction.accountId) {
                return { error: 'La cuenta destino debe ser diferente a la de origen.' };
            }
        }

        // Ningún movimiento puede quedar "en el aire". Antes, un accountId
        // null o de una cuenta ya borrada se guardaba igual: el movimiento
        // aparecía en Historial pero updateAccountBalance no encontraba a
        // quién sumarle y ningún saldo cambiaba — dinero fantasma. La
        // pantalla valida antes, pero esta es la regla que manda: se
        // rechaza aquí sin importar quién llame.
        const paysWithCredit = transaction.type === 'expense' && !!transaction.creditCardId;
        if (paysWithCredit) {
            if (!creditCards.some(c => c.id === transaction.creditCardId)) {
                return { error: 'Selecciona una tarjeta de crédito válida.' };
            }
        } else {
            if (!transaction.accountId) {
                return { error: 'Selecciona la cuenta del movimiento.' };
            }
            if (!accounts.some(a => a.id === transaction.accountId)) {
                return { error: 'La cuenta seleccionada ya no existe. Elige otra.' };
            }
        }
        if (transaction.type === 'transfer' && !accounts.some(a => a.id === transaction.toAccountId)) {
            return { error: 'La cuenta destino ya no existe. Elige otra.' };
        }

        // No expense/withdrawal/transfer can push an account below zero.
        if (
            (transaction.type === 'expense' || transaction.type === 'withdrawal' || transaction.type === 'transfer')
            && transaction.accountId
        ) {
            const account = accounts.find(a => a.id === transaction.accountId);
            if (account && account.balance - transaction.amount < 0) {
                return { error: `${account.name} solo tiene ${account.balance.toFixed(2)} disponibles.` };
            }
        }

        // Same idea for credit — a purchase can't push debt past the limit.
        // Covers MSI purchases too, since those also go through expense + creditCardId.
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

        if (transaction.type === 'income') {
            await updateAccountBalance(transaction.accountId, transaction.amount);
        } else if (transaction.type === 'expense' || transaction.type === 'withdrawal') {
            await updateAccountBalance(transaction.accountId, -transaction.amount);
        } else if (transaction.type === 'transfer') {
            // Chained on purpose: both legs touch `accounts` in the same
            // tick, and the closure won't see the first update yet.
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

        // Reversing a transaction can itself create a negative balance
        // (e.g. deleting an old income after already spending it) —
        // same "never below zero" rule as making a new one.
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

        if (txn.type === 'transfer') {
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
            await updateCreditCardDebt(txn.creditCardId, -txn.amount);
        } else if (txn.type === 'withdrawal' && txn.linkedCardId) {
            // Reverses a card payment/MSI installment: debt goes back up
            // by what it had paid down (see linkedCardId in CardsScreen/HomeScreen).
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

        if (changes.amount !== undefined && changes.amount !== txn.amount) {
            if (changes.amount <= 0) {
                return { error: 'El monto debe ser mayor a cero.' };
            }
            changes = { ...changes, amount: round2(changes.amount) };
            const delta = changes.amount - txn.amount;

            if (txn.type === 'transfer') {
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
                if (balanceDelta < 0) {
                    const account = accounts.find(a => a.id === txn.accountId);
                    if (account && account.balance + balanceDelta < 0) {
                        return { error: `${account.name} solo tiene ${account.balance.toFixed(2)} disponibles.` };
                    }
                }
                await updateAccountBalance(txn.accountId, balanceDelta);
            }
            if (txn.type === 'expense' && txn.creditCardId) {
                if (delta > 0) {
                    const card = creditCards.find(c => c.id === txn.creditCardId);
                    if (card && card.limit > 0 && card.currentDebt + delta > card.limit) {
                        const available = Math.max(0, card.limit - card.currentDebt);
                        return { error: `${card.name} solo tiene ${available.toFixed(2)} de crédito disponible.` };
                    }
                }
                await updateCreditCardDebt(txn.creditCardId, delta);
            } else if (txn.type === 'withdrawal' && txn.linkedCardId) {
                // A bigger payment pays more debt down (-delta); a smaller
                // one restores some of it (delta negative → -delta positive).
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

    // currentDebt never changes here — only a real transaction moves it.
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

    // Only deletable at $0 debt.
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

    // Clamped to >= 0 — a reversal or downward edit can subtract here,
    // and negative debt isn't a state this app models.
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

    // Combines what a card payment needs — withdrawal transaction,
    // account debit, debt reduction — into one call instead of a
    // screen chaining addTransaction + payCreditCard itself. Also
    // validates the amount against currentDebt, which payCreditCard
    // alone doesn't do (it just silently clamps an overpayment to $0).
    const payCardWithTransaction = async ({ accountId, amount, reason, category, linkedCardId }) => {
        if (!amount || amount <= 0) {
            return { error: 'El monto debe ser mayor a cero.' };
        }
        const roundedAmount = round2(amount);
        const card = creditCards.find(c => c.id === linkedCardId);
        if (card && roundedAmount > card.currentDebt) {
            return { error: `${card.name} solo debe ${card.currentDebt.toFixed(2)}.` };
        }

        const result = await addTransaction({
            type: 'withdrawal',
            amount: roundedAmount,
            reason,
            category,
            accountId,
            creditCardId: null,
            linkedCardId,
        });
        if (result?.error) return result;

        await payCreditCard(linkedCardId, roundedAmount);
        return result;
    };

    // Onboarding: saldo de efectivo + tarjetas de débito en UNA escritura.
    // Antes eran setInitialBalances y luego addAccountsBatch, y la
    // segunda pisaba a la primera (ambas leen `accounts` del mismo
    // closure): el efectivo se quedaba en $0 si también había tarjeta.
    const setupInitialAccounts = async ({ cashBalance = 0, debitCards = [] }) => {
        const withCash = accounts.map(acc =>
            acc.id === '1' ? { ...acc, balance: Math.max(0, round2(cashBalance)) } : acc,
        );
        return addAccountsBatch(debitCards, withCash);
    };


    // Batch version for crediting interest on several apartados at
    // once (called by FinanceContext's accrual effect) — same
    // "looping would lose everything but the last" reasoning as the
    // other batch functions above.
    const creditInterestBatch = async (credits) => {
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

    // Currency switch (Settings → Moneda): rescales every stored amount by `rate`.
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
        // Actions. Los mutadores de bajo nivel (updateAccountBalance,
        // updateCreditCardDebt, payCreditCard, addAccountsBatch) NO se
        // exponen: toda entrada/salida de dinero pasa por una transacción
        // y sus validaciones.
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        payCardWithTransaction,
        addAccount,
        updateAccountDetails,
        deleteAccount,
        resetAll,
        setupInitialAccounts,
        convertAllAmounts,
        creditInterestBatch,
    };
}