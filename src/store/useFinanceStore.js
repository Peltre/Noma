// custom react hook that groups states related to each other in one place
// This way all screens get updated when a value shifts.

import { useState, useEffect } from 'react';
import { saveData, loadData, removeData } from './storage';

// storage keys
const KEYS = {
    accounts: 'accounts',
    transactions: 'transactions',
    creditCards: 'creditCards',
};

// Initial state (new user)
const initialAccounts = [
    { id: '1', type: 'cash', name: 'Efectivo', balance: 0 },
    { id: '2', type: 'debit', name: 'Debito', balance: 0 },
    { id: '3', type: 'savings', name: 'Ahorros', balance: 0 },
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
                ? { ...acc, balance: acc.balance + amount }
                : acc
        );
        setAccounts(updated)
        await saveData(KEYS.accounts, updated);
        return updated;
    };

    // Transaction handling 
    const addTransaction = async (transaction) => {
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
        }

        if (transaction.type === 'expense' && transaction.creditCardId) {
            await updateCreditCardDebt(transaction.creditCardId, transaction.amount);
        }

        return newTransaction;
    };

    // Credit Card handling
    const addCreditCard = async (card) => {
        const newCard = {
            id: Date.now().toString(),
            currentDebt: 0,
            ...card,
        };
        const updated = [...creditCards, newCard];
        setCreditCards(updated);
        await saveData(KEYS.creditCards, updated);
    };

    const updateCreditCardDebt = async (cardId, amount) => {
        const updated = creditCards.map(card =>
            card.id === cardId
                ? { ...card, currentDebt: card.currentDebt + amount }
                : card
        );
        setCreditCards(updated)
        await saveData(KEYS.creditCards, updated);
    };

    const payCreditCard = async (cardId, amount) => {
        const updated = creditCards.map(card =>
            card.id === cardId
                ? { ...card, currentDebt: Math.max(0, card.currentDebt - amount) }
                : card
        );
        setCreditCards(updated)
        await saveData(KEYS.creditCards, updated);
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
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalDebt = creditCards.reduce((sum, card) => sum + card.currentDebt, 0);

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
        addCreditCard,
        updateCreditCardDebt,
        payCreditCard,
        updateAccountBalance,
        resetAll,
    };
}