// custom react hook that groups states related to each other in one place
// This way all screens get updated when a value shifts.

import { useState, useEffect } from 'react';
import { saveData, loadData } from './storage';

// storage keys
const KEYS = {
    accounts: 'accounts',
    transactions: 'transactions',
    creditCards: 'creditCards',
};

// Initial state (new user)
const initialAccounts = [
    { id: '1', type: 'cash', name: 'Efectivo', balance: 0 },
    { id: '2', type: 'debit', name: 'Savings', balance: 0 },
    { id: '3', type: 'savings', name: 'Ahorros', balance: 0 },
];

export function useFinanceStore(){
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [creditCards, setCreditCards] = useState([]);

    // load data on startup
    useEffect(() => {
        const savedAccounts = loadData(KEYS.accounts);
        const savedTransactions = loadData(KEYS.transactions);
        const savedCreditCards = loadData(KEYS.creditCards);

        setAccounts(savedAccounts || initialAccounts);
        setTransactions(savedTransactions || []);
        setCreditCards(savedCreditCards || []);
    }, []);

    // Account management
    const updateAccountBalance = (accountId, amount) => {
        const updated = accounts.map(acc =>
            acc.id === accountId
                ? { ...acc, balance: acc.balance + amount }
                : acc
        );
        setAccounts(updated)
        saveData(KEYS.accounts, updated);
    };

    // Transaction handling 
    const addTransaction = (transaction) => {
        const newTransaction = {
            id: Date.now().toString(),
            date: new Date.toISOString(),
            ...transaction,
        };

        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        saveData(KEYS.transactions, updated);

        // Update acc balance
        if (transaction.type === 'income') {
            updateAccountBalance(transaction.accountId, transaction.amount);
        } else if (transaction.type === 'expense' && transaction.creditCardId) {
            updateCreditCardDebt(transaction.creditCardId, transaction.amount);
        }

        return newTransaction;
    };

    // Credit Card handling
    const addCreditCard = (card) => {
        const newCard = {
            id: Date.now().toString(),
            currentDebt: 0,
            ...card,
        };
        const updated = [...creditCards, newCard];
        setCreditCards(updated);
        saveData(KEYS.creditCards, updated);
    };

    const updateCreditCardDebt = (cardId, amount) => {
        const updated = creditCards.map(card =>
            card.id === cardId
                ? { ...card, currentDebt: card.currentDebt + amount }
                : card
        );
        setCreditCards(updated)
        saveData(KEYS.creditCards, updated);
    };

    const payCreditCard = (cardId, amount) => {
        const updated = creditCards.map(card =>
            card.id === cardId
                ? { ...card, currentDebt: Math.max(0, card.currentDebt - amount) }
                : card
        );
        setCreditCards(updated)
        saveData(KEYS.creditCards, updated);
    };

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
        // Actions
        addTransaction,
        addCreditCard,
        updateCreditCardDebt,
        payCreditCard,
        updateAccountBalance,
    };
}