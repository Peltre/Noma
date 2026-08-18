// Category catalog — labels only, color comes from transaction type in the UI.
//
// Note: there used to be a 'transfer' category for manually faking a
// transfer with two separate movements. Removed now that `transfer`
// is its own real type that moves money on both ends atomically —
// the old category would leave two ways to do the same thing, one of
// which silently loses money if the second half is forgotten.
//
// 'withdrawal' only lists card_payment/msi — those are the only two
// ways a `type: 'withdrawal'` transaction is ever created (both
// automatic, from CardsScreen/Home's pay flows). A plain "Retiro" (no
// category, e.g. cajero) isn't offered anywhere in the app on
// purpose — see TransactionScreen.jsx's getTypes() for why.

export const CATEGORIES = {
    expense: [
        { id: 'food', label: 'Comida' },
        { id: 'transport', label: 'Transporte' },
        { id: 'supermarket', label: 'Súper' },
        { id: 'health', label: 'Salud' },
        { id: 'entertainment', label: 'Ocio' },
        { id: 'clothing', label: 'Ropa' },
        { id: 'home', label: 'Hogar' },
        { id: 'services', label: 'Servicios' },
        { id: 'education', label: 'Educación' },
        { id: 'goal', label: 'Objetivo cumplido' },
        { id: 'other', label: 'Otro' },
    ],
    income: [
        { id: 'salary', label: 'Quincena' },
        { id: 'freelance', label: 'Freelance' },
        { id: 'gift', label: 'Regalo' },
        // App-generated only (useSavings.js's interest accrual) — never
        // a picker option, kept here just so History/Home show "Interés"
        // instead of the raw id.
        { id: 'interest', label: 'Interés' },
        { id: 'other', label: 'Otro' },
    ],
    withdrawal: [
        { id: 'card_payment', label: 'Pago de tarjeta' },
        // Monthly MSI installments — kept separate from card_payment
        // (a one-off/full payment) so they're easy to spot on their own.
        { id: 'msi', label: 'Mensualidad' },
    ],
};

// Looks up a category's display label by type + id, with the raw id
// as a fallback for anything not in the catalog above.
export function getCategoryLabel(type, categoryId) {
    const match = CATEGORIES[type]?.find(c => c.id === categoryId);
    return match?.label ?? categoryId;
}