// Category catalog, no emojis, labels only
// Color is derived from the transaction type in the UI
//
// Note: there used to be a 'transfer' category on both `income` and
// `withdrawal`, meant for the user to manually fake a transfer
// between their own accounts with two separate movements. Removed
// now that `transfer` is its own real transaction type (see
// TransactionScreen + useFinanceStore) that moves the money on both
// ends atomically — keeping the old category around would leave two
// ways to do the same thing, one of which silently loses money if
// the user forgets the second half.

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
        // App-generated only (see useSavings.js's interest accrual) —
        // same "internal tag, never a picker option" status as msi/
        // card_payment/goal below. Kept in this catalog purely so
        // History/Home show "Interés" instead of the raw id.
        { id: 'interest', label: 'Interés' },
        { id: 'other', label: 'Otro' },
    ],
    withdrawal: [
        { id: 'atm', label: 'Cajero' },
        { id: 'card_payment', label: 'Pago de tarjeta' },
        // Monthly MSI installment payments — kept separate from
        // card_payment (a one-off/full payment to a card) and from
        // whatever category the original purchase had, so these are
        // easy to spot on their own in History instead of blending
        // into "Servicios" or any other bucket.
        { id: 'msi', label: 'Mensualidad' },
        { id: 'other', label: 'Otro' },
    ],
};

// Look up a category's display label by transaction type + id.
// HomeScreen's "Recientes" list and History's transaction detail
// sheet both used to render the raw stored id (e.g. "card_payment",
// "msi") instead of its human label — this is the single place that
// does that mapping, with the raw id as a safe fallback for any
// category that isn't in the catalog above.
export function getCategoryLabel(type, categoryId) {
    const match = CATEGORIES[type]?.find(c => c.id === categoryId);
    return match?.label ?? categoryId;
}