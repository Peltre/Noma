// Category catalog, no emojis, labels only
// Color is derived from the transaction type in the UI

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
        { id: 'other', label: 'Otro' },
    ],
    income: [
        { id: 'salary', label: 'Quincena' },
        { id: 'transfer', label: 'Transferencia' },
        { id: 'freelance', label: 'Freelance' },
        { id: 'gift', label: 'Regalo' },
        { id: 'other', label: 'Otro' },
    ],
    withdrawal: [
        { id: 'atm', label: 'Cajero' },
        { id: 'transfer', label: 'Transferencia' },
        { id: 'other', label: 'Otro' },
    ],
};