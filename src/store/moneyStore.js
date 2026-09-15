// Dinero: cuentas, movimientos y tarjetas de crédito.
//
// Toda entrada o salida de dinero pasa por una transacción y sus
// validaciones (nunca saldo negativo, nunca deuda sobre el límite).
// Los mutadores de bajo nivel (bumpBalance, bumpDebt) son privados a
// este archivo.
import { createPersistedStore } from './createPersistedStore';
import { round2 } from '../utils/formatCurrency';

// Efectivo es la única cuenta con la que arranca todo usuario. Las
// débito y las de crédito las crea la persona (onboarding o Tarjetas).
const initialAccounts = [{ id: '1', type: 'cash', name: 'Efectivo', balance: 0 }];

const err = (error) => ({ error });
const newId = (suffix = '') => `${Date.now()}${suffix}`;

export const useMoneyStore = createPersistedStore({
    slices: { accounts: 'accounts', transactions: 'transactions', creditCards: 'creditCards' },
    defaults: { accounts: initialAccounts, transactions: [], creditCards: [] },

    actions: (set, get) => {
        // ── Privados ──
        const bumpBalance = (accounts, accountId, delta) =>
            accounts.map((a) => (a.id === accountId ? { ...a, balance: round2(a.balance + delta) } : a));
        // La deuda nunca baja de cero: una reversa o una edición a la baja
        // pueden restar más de lo que hay.
        const bumpDebt = (cards, cardId, delta) =>
            cards.map((c) => (c.id === cardId ? { ...c, currentDebt: Math.max(0, round2(c.currentDebt + delta)) } : c));

        const makeAccount = ({ name, type, color, pattern, initialBalance = 0 }, i = 0) => {
            if (!name || !name.trim()) return err('Ponle un nombre a la cuenta.');
            if (type !== 'debit') return err('Por ahora solo se pueden agregar cuentas de débito.');
            return {
                id: newId(i ? `_${i}` : ''),
                type,
                name: name.trim(),
                color: color || null,
                pattern: pattern || null,
                balance: Math.max(0, round2(initialBalance)),
            };
        };

        return {
            // ── Cuentas ──
            // `initialBalance` es sólo para el onboarding ("esto es lo que ya
            // tengo"); en cualquier otro caso el saldo viene de una transacción.
            addAccount: async (input) => {
                const account = makeAccount(input);
                if (account.error) return account;
                set((s) => ({ accounts: [...s.accounts, account] }));
                return account;
            },

            // Onboarding: saldo de efectivo + tarjetas de débito de una vez.
            setupInitialAccounts: async ({ cashBalance = 0, debitCards = [] }) => {
                const errors = [];
                const created = [];
                debitCards.forEach((input, i) => {
                    const account = makeAccount(input, i);
                    if (account.error) errors.push({ name: input.name, error: account.error });
                    else created.push(account);
                });
                set((s) => ({
                    accounts: [
                        ...s.accounts.map((a) => (a.id === '1' ? { ...a, balance: Math.max(0, round2(cashBalance)) } : a)),
                        ...created,
                    ],
                }));
                return { accounts: created, errors };
            },

            // El saldo nunca cambia aquí: sólo con una transacción.
            updateAccountDetails: async ({ accountId, name, color, pattern }) => {
                const acc = get().accounts.find((a) => a.id === accountId);
                if (!acc) return err('No se encontró la cuenta.');
                if (acc.type !== 'debit') return err('Esta cuenta no se puede editar.');
                if (!name || !name.trim()) return err('Ponle un nombre a la cuenta.');
                set((s) => ({
                    accounts: s.accounts.map((a) =>
                        a.id === accountId ? { ...a, name: name.trim(), color: color ?? a.color, pattern: pattern ?? a.pattern } : a,
                    ),
                }));
                return { ok: true };
            },

            // Sólo se borra en $0: si no, el saldo desaparecería.
            deleteAccount: async (accountId) => {
                const acc = get().accounts.find((a) => a.id === accountId);
                if (!acc) return err('No se encontró la cuenta.');
                if (acc.type !== 'debit') return err('Esta cuenta no se puede eliminar.');
                if (acc.balance !== 0) return err('Esta cuenta tiene saldo. Muévelo a otra cuenta antes de eliminarla.');
                set((s) => ({ accounts: s.accounts.filter((a) => a.id !== accountId) }));
                return { ok: true };
            },

            // ── Transacciones ──
            addTransaction: async (input) => {
                const { accounts, creditCards } = get();
                // Un monto negativo voltearía cada validación de "no negativo".
                if (!input.amount || input.amount <= 0) return err('El monto debe ser mayor a cero.');
                const txn = { ...input, amount: round2(input.amount) };

                if (txn.type === 'transfer') {
                    if (!txn.toAccountId) return err('Selecciona una cuenta destino.');
                    if (txn.toAccountId === txn.accountId) return err('La cuenta destino debe ser diferente a la de origen.');
                }

                // Ningún movimiento queda "en el aire": necesita una cuenta que
                // exista o (sólo gastos) una tarjeta de crédito que exista.
                const paysWithCredit = txn.type === 'expense' && !!txn.creditCardId;
                if (paysWithCredit) {
                    if (!creditCards.some((c) => c.id === txn.creditCardId)) return err('Selecciona una tarjeta de crédito válida.');
                } else {
                    if (!txn.accountId) return err('Selecciona la cuenta del movimiento.');
                    if (!accounts.some((a) => a.id === txn.accountId)) return err('La cuenta seleccionada ya no existe. Elige otra.');
                }
                if (txn.type === 'transfer' && !accounts.some((a) => a.id === txn.toAccountId)) {
                    return err('La cuenta destino ya no existe. Elige otra.');
                }

                // Ningún gasto/retiro/traspaso deja una cuenta en negativo.
                const isOutflow = txn.type === 'expense' || txn.type === 'withdrawal' || txn.type === 'transfer';
                if (isOutflow && txn.accountId) {
                    const account = accounts.find((a) => a.id === txn.accountId);
                    if (account && account.balance - txn.amount < 0) {
                        return err(`${account.name} solo tiene ${account.balance.toFixed(2)} disponibles.`);
                    }
                }
                // Ninguna compra pasa la deuda del límite (incluye MSI).
                if (paysWithCredit) {
                    const card = creditCards.find((c) => c.id === txn.creditCardId);
                    if (card && card.limit > 0 && card.currentDebt + txn.amount > card.limit) {
                        const available = Math.max(0, card.limit - card.currentDebt);
                        return err(`${card.name} solo tiene ${available.toFixed(2)} de crédito disponible.`);
                    }
                }

                const newTransaction = { id: newId(), date: new Date().toISOString(), ...txn };

                set((s) => {
                    let nextAccounts = s.accounts;
                    if (txn.type === 'income') nextAccounts = bumpBalance(nextAccounts, txn.accountId, txn.amount);
                    else if (txn.type === 'withdrawal') nextAccounts = bumpBalance(nextAccounts, txn.accountId, -txn.amount);
                    // Un gasto con crédito no toca cuentas: sube la deuda.
                    else if (txn.type === 'expense' && !paysWithCredit) nextAccounts = bumpBalance(nextAccounts, txn.accountId, -txn.amount);
                    else if (txn.type === 'transfer') {
                        nextAccounts = bumpBalance(nextAccounts, txn.accountId, -txn.amount);
                        nextAccounts = bumpBalance(nextAccounts, txn.toAccountId, txn.amount);
                    }
                    const nextCards = paysWithCredit ? bumpDebt(s.creditCards, txn.creditCardId, txn.amount) : s.creditCards;
                    return { transactions: [newTransaction, ...s.transactions], accounts: nextAccounts, creditCards: nextCards };
                });
                return newTransaction;
            },

            deleteTransaction: async (txnId) => {
                const { transactions, accounts } = get();
                const txn = transactions.find((t) => t.id === txnId);
                if (!txn) return;

                // Revertir también puede dejar una cuenta en negativo (borrar
                // un ingreso ya gastado).
                if (txn.type === 'income' && txn.accountId) {
                    const account = accounts.find((a) => a.id === txn.accountId);
                    if (account && account.balance - txn.amount < 0) {
                        return err(`No se puede eliminar: ya usaste parte de este ingreso. ${account.name} quedaría en negativo.`);
                    }
                }
                if (txn.type === 'transfer' && txn.toAccountId) {
                    const dest = accounts.find((a) => a.id === txn.toAccountId);
                    if (dest && dest.balance - txn.amount < 0) {
                        return err(`No se puede eliminar: ya usaste parte del dinero recibido. ${dest.name} quedaría en negativo.`);
                    }
                }

                set((s) => {
                    let nextAccounts = s.accounts;
                    let nextCards = s.creditCards;
                    if (txn.type === 'transfer') {
                        nextAccounts = bumpBalance(nextAccounts, txn.accountId, txn.amount);
                        if (txn.toAccountId) nextAccounts = bumpBalance(nextAccounts, txn.toAccountId, -txn.amount);
                    } else if (txn.accountId) {
                        if (txn.type === 'income') nextAccounts = bumpBalance(nextAccounts, txn.accountId, -txn.amount);
                        else if (txn.type === 'expense' && !txn.creditCardId) nextAccounts = bumpBalance(nextAccounts, txn.accountId, txn.amount);
                        else if (txn.type === 'withdrawal') nextAccounts = bumpBalance(nextAccounts, txn.accountId, txn.amount);
                    }
                    if (txn.type === 'expense' && txn.creditCardId) nextCards = bumpDebt(nextCards, txn.creditCardId, -txn.amount);
                    // Revertir un pago de tarjeta / mensualidad: la deuda vuelve a subir.
                    else if (txn.type === 'withdrawal' && txn.linkedCardId) nextCards = bumpDebt(nextCards, txn.linkedCardId, txn.amount);
                    return { transactions: s.transactions.filter((t) => t.id !== txnId), accounts: nextAccounts, creditCards: nextCards };
                });
                return { ok: true };
            },

            // Editar razón y/o monto (la categoría no cambia).
            updateTransaction: async (txnId, changes) => {
                const { transactions, accounts, creditCards } = get();
                const txn = transactions.find((t) => t.id === txnId);
                if (!txn) return;

                let delta = 0;
                if (changes.amount !== undefined && changes.amount !== txn.amount) {
                    if (changes.amount <= 0) return err('El monto debe ser mayor a cero.');
                    changes = { ...changes, amount: round2(changes.amount) };
                    delta = round2(changes.amount - txn.amount);

                    if (txn.type === 'transfer') {
                        const source = accounts.find((a) => a.id === txn.accountId);
                        if (source && source.balance - delta < 0) return err(`${source.name} solo tiene ${source.balance.toFixed(2)} disponibles.`);
                        const dest = accounts.find((a) => a.id === txn.toAccountId);
                        if (dest && dest.balance + delta < 0) return err(`${dest.name} solo tiene ${dest.balance.toFixed(2)} disponibles.`);
                    } else if (txn.accountId && !(txn.type === 'expense' && txn.creditCardId)) {
                        const balanceDelta = txn.type === 'income' ? delta : -delta;
                        if (balanceDelta < 0) {
                            const account = accounts.find((a) => a.id === txn.accountId);
                            if (account && account.balance + balanceDelta < 0) return err(`${account.name} solo tiene ${account.balance.toFixed(2)} disponibles.`);
                        }
                    }
                    if (txn.type === 'expense' && txn.creditCardId && delta > 0) {
                        const card = creditCards.find((c) => c.id === txn.creditCardId);
                        if (card && card.limit > 0 && card.currentDebt + delta > card.limit) {
                            const available = Math.max(0, card.limit - card.currentDebt);
                            return err(`${card.name} solo tiene ${available.toFixed(2)} de crédito disponible.`);
                        }
                    }
                }

                set((s) => {
                    let nextAccounts = s.accounts;
                    let nextCards = s.creditCards;
                    if (delta !== 0) {
                        if (txn.type === 'transfer') {
                            nextAccounts = bumpBalance(nextAccounts, txn.accountId, -delta);
                            nextAccounts = bumpBalance(nextAccounts, txn.toAccountId, delta);
                        } else if (txn.type === 'expense' && txn.creditCardId) {
                            nextCards = bumpDebt(nextCards, txn.creditCardId, delta);
                        } else if (txn.accountId) {
                            nextAccounts = bumpBalance(nextAccounts, txn.accountId, txn.type === 'income' ? delta : -delta);
                            // Un pago de tarjeta más grande baja más deuda; uno más chico, la regresa.
                            if (txn.type === 'withdrawal' && txn.linkedCardId) nextCards = bumpDebt(nextCards, txn.linkedCardId, -delta);
                        }
                    }
                    return {
                        transactions: s.transactions.map((t) => (t.id === txnId ? { ...t, ...changes } : t)),
                        accounts: nextAccounts,
                        creditCards: nextCards,
                    };
                });
                return { ok: true };
            },

            // ── Tarjetas de crédito ──
            addCreditCard: async (card) => {
                if (!card.name || !card.name.trim()) return err('Ponle un nombre a la tarjeta.');
                if (!card.limit || card.limit <= 0) return err('El límite debe ser mayor a cero.');
                const newCard = {
                    id: newId(),
                    currentDebt: 0,
                    ...card,
                    name: card.name.trim(),
                    limit: round2(card.limit),
                    color: card.color || null,
                    pattern: card.pattern || null,
                };
                set((s) => ({ creditCards: [...s.creditCards, newCard] }));
                return newCard;
            },

            // currentDebt no cambia aquí: sólo con una transacción.
            updateCreditCard: async (cardId, changes) => {
                const card = get().creditCards.find((c) => c.id === cardId);
                if (!card) return err('No se encontró la tarjeta.');
                if (changes.name !== undefined && !changes.name.trim()) return err('Ponle un nombre a la tarjeta.');
                if (changes.limit !== undefined && changes.limit <= 0) return err('El límite debe ser mayor a cero.');
                set((s) => ({
                    creditCards: s.creditCards.map((c) =>
                        c.id === cardId
                            ? {
                                ...c,
                                ...changes,
                                name: changes.name !== undefined ? changes.name.trim() : c.name,
                                limit: changes.limit !== undefined ? round2(changes.limit) : c.limit,
                            }
                            : c,
                    ),
                }));
                return { ok: true };
            },

            // Sólo se borra sin deuda.
            deleteCreditCard: async (cardId) => {
                const card = get().creditCards.find((c) => c.id === cardId);
                if (!card) return err('No se encontró la tarjeta.');
                if (card.currentDebt !== 0) return err('Esta tarjeta tiene deuda pendiente. Págala antes de eliminarla.');
                set((s) => ({ creditCards: s.creditCards.filter((c) => c.id !== cardId) }));
                return { ok: true };
            },

            // Pago de tarjeta: retiro de la cuenta + baja de deuda, validado
            // contra la deuda actual (no se puede pagar de más).
            payCardWithTransaction: async ({ accountId, amount, reason, category, linkedCardId }) => {
                if (!amount || amount <= 0) return err('El monto debe ser mayor a cero.');
                const rounded = round2(amount);
                const card = get().creditCards.find((c) => c.id === linkedCardId);
                if (card && rounded > card.currentDebt) return err(`${card.name} solo debe ${card.currentDebt.toFixed(2)}.`);

                const result = await get().addTransaction({
                    type: 'withdrawal', amount: rounded, reason, category, accountId, creditCardId: null, linkedCardId,
                });
                if (result?.error) return result;
                set((s) => ({ creditCards: bumpDebt(s.creditCards, linkedCardId, -rounded) }));
                return result;
            },

            // ── Interés de apartados (lo llama FinanceContext al abrir la app) ──
            // Cada crédito es un ingreso real en la cuenta ligada al apartado.
            creditInterest: async (credits) => {
                if (!credits.length) return [];
                const stamp = Date.now();
                const newTransactions = credits.map((credit, i) => ({
                    id: `${stamp}_int_${i}`,
                    date: new Date().toISOString(),
                    type: 'income',
                    amount: round2(credit.amount),
                    accountId: credit.accountId,
                    category: 'interest',
                    reason: credit.reason,
                }));
                set((s) => ({
                    accounts: credits.reduce((accs, c) => bumpBalance(accs, c.accountId, c.amount), s.accounts),
                    transactions: [...newTransactions, ...s.transactions],
                }));
                return newTransactions;
            },

            // Cambio de moneda: reescala todo por `rate`.
            convertAllAmounts: async (rate) => {
                set((s) => ({
                    accounts: s.accounts.map((a) => ({ ...a, balance: round2(a.balance * rate) })),
                    transactions: s.transactions.map((t) => ({ ...t, amount: round2(t.amount * rate) })),
                    creditCards: s.creditCards.map((c) => ({ ...c, limit: round2(c.limit * rate), currentDebt: round2(c.currentDebt * rate) })),
                }));
            },
        };
    },
});

// Derivados (no se guardan): úsalos como selectores.
export const selectTotalBalance = (s) => round2(s.accounts.reduce((sum, a) => sum + a.balance, 0));