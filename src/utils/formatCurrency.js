// Currency formatting/rounding — centralized so every screen behaves the same.

// Rounds to 2 decimals — every money value passes through this before
// saving. Floats drift with repeated arithmetic (0.1+0.2 =
// 0.30000000000000004) and division (MSI's totalAmount/months) can
// too. `+ Number.EPSILON` rounds edge cases like 1.005 the way a person expects.
export const round2 = (amount) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
};

// Deliberately doesn't read settings.currency or use Intl's `style:
// 'currency'`: every currency this app supports uses "$" (see
// CURRENCIES in constants/index.js), and Intl renders some as "USD
// 1,234.50" with no $ at all — a different shape per currency, when
// switching currencies here should only change the NUMBER, not the
// look. Built by hand from a plain 'decimal' format instead. Where
// the currency itself needs to show (HomeScreen's "MXN"/"USD" tag),
// that's a separate label next to this.
const formatDecimal = (amount, fractionDigits) => {
    const value = Number(amount) || 0;
    const sign = value < 0 ? '−' : '';
    const formatted = new Intl.NumberFormat('es-MX', {
        style: 'decimal',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(Math.abs(value));
    return `${sign}$${formatted}`;
};

export const formatCurrency = (amount) => formatDecimal(amount, 2);

// No-decimals version for tighter spaces (e.g. transaction list rows).
export const formatCurrencyShort = (amount) => formatDecimal(amount, 0);