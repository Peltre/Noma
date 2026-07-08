// Convert from different currencies, app will feature currency conversion
// We do all the handling here to avoid re-calculating on all screens

// Rounds to 2 decimal places — the one place every money value in the
// store passes through before being saved. Plain JS floats drift with
// repeated arithmetic (0.1 + 0.2 = 0.30000000000000004), and division
// (MSI's totalAmount / months) can produce long tails too. DecimalInput
// already stops the user from ever *typing* a 3rd decimal, but this is
// the belt-and-suspenders version for anything computed rather than
// typed. The `+ Number.EPSILON` nudges cases like 1.005 (which floats
// can't represent exactly) to round the way a person would expect.
export const round2 = (amount) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
};

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