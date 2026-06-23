// Convert from different currencies, app will feature currency conversion
// We do all the handling here to avoid re-calculating on all screens

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
};

// aux function to show w/o decimals for smaller spaces, dont know if will use
export const formatCurrencyShort = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}