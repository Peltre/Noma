// Where the magic happens

export * from './theme';
export * from './categories';
export * from './tagIcons';

// Shared label maps used across multiple screens
export const ACCOUNT_LABELS = {
    cash: 'Efectivo',
    debit: 'Débito',
    savings: 'Ahorros',
};

export const FREQUENCY_LABELS = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
};

// Currencies the Settings screen lets someone switch to. Both use
// "$" as their symbol on purpose — see formatCurrency.js — so adding
// a currency here should stay limited to ones that don't need a
// different glyph, or formatCurrency needs a second look first.
export const CURRENCIES = [
    { code: 'MXN', label: 'Peso mexicano' },
    { code: 'USD', label: 'Dólar estadounidense' },
];