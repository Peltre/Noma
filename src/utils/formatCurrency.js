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

// formatCurrency/formatCurrencyShort deliberately do NOT read
// settings.currency and never switch to Intl's `style: 'currency'`
// with a `currency` code. Two reasons:
//
//   1. Every currency Settings lets someone pick (see
//      constants/index.js's CURRENCIES) uses the "$" glyph, so the
//      display should stay pixel-identical no matter which one is
//      active — that's the whole point of SettingsScreen's currency
//      switcher: the NUMBER changes (a real conversion happened),
//      not the look of the app.
//   2. Intl disagrees: under the 'es-MX' locale,
//      `style:'currency', currency:'USD'` renders as "USD 1,234.50"
//      (no $ at all), not "$1,234.50" — a different shape per
//      currency, which is exactly what switching currencies should
//      NOT do here. Building the string by hand from a plain
//      'decimal' format sidesteps that entirely.
//
// Where the currency actually needs to be visible (HomeScreen's
// small "MXN"/"USD" tag), that's rendered as its own separate label
// right next to these — see HomeScreen.jsx.
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

// aux function to show w/o decimals for smaller spaces, dont know if will use
export const formatCurrencyShort = (amount) => formatDecimal(amount, 0);