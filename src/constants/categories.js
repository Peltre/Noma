// Catalog of categories available for each movement
// The user will be able to register new categories on "Other"
// Will be used to show expenses & income segmented

// src/constants/categories.js
// Catálogo de categorías disponibles por tipo de movimiento.
// Las separamos por tipo para mostrar solo las relevantes
// según lo que el usuario esté registrando.
export const CATEGORIES = {
    expense: [
        { id: 'food', label: 'Comida', emoji: '🍔' },
        { id: 'transport', label: 'Transporte', emoji: '🚗' },
        { id: 'supermarket', label: 'Súper', emoji: '🏪' },
        { id: 'health', label: 'Salud', emoji: '🏥' },
        { id: 'entertainment', label: 'Ocio', emoji: '🎬' },
        { id: 'clothing', label: 'Ropa', emoji: '👕' },
        { id: 'home', label: 'Hogar', emoji: '🏠' },
        { id: 'services', label: 'Servicios', emoji: '⚡' },
        { id: 'education', label: 'Educación', emoji: '📚' },
        { id: 'other', label: 'Otro', emoji: '📦' },
    ],
    income: [
        { id: 'salary', label: 'Quincena', emoji: '💰' },
        { id: 'transfer', label: 'Transferencia', emoji: '🏦' },
        { id: 'freelance', label: 'Freelance', emoji: '💻' },
        { id: 'gift', label: 'Regalo', emoji: '🎁' },
        { id: 'other', label: 'Otro', emoji: '📦' },
    ],
    withdrawal: [
        { id: 'atm', label: 'Cajero', emoji: '🏧' },
        { id: 'transfer', label: 'Transferencia', emoji: '📲' },
        { id: 'other', label: 'Otro', emoji: '📦' },
    ],
};