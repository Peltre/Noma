// Noma theme registry (v2).
// Every theme exposes the same semantic tokens, so any screen that
// reads `theme.xxx` instead of `Colors.xxx` works with all three
// without extra changes.
//
// Fixed meaning across themes (does not change with the palette):
//   moneyIn  income / debit account in the allocation bar
//   moneyOut expense (icon) / credit card debt / this month's spend
//            in the allocation bar
//   brand    dominant brand color: primary CTA, avatar, active tab
//   brandOn  text/icon color for anything sitting on a `brand`-
//            colored surface — chosen per theme so it stays readable
//   savings  savings account in the allocation bar — a blue that
//            hasn't been used anywhere else in the palette, so it
//            reads as distinct and a little more lively than a
//            plain neutral, without competing with brand.
//   savingsOn  same idea as brandOn, for a `savings`-colored surface
//            (e.g. the "Marcar como comprado" button)
//   alert    "this is scheduled/pending, nothing has moved yet, you
//            need to act" — used sparingly now (a small warning badge
//            + dashed border on PendingFundCard), not as a card-wide
//            fill. A cool, muted gray on purpose, close to `muted`
//            but with a colder undertone — distinct enough to notice,
//            nowhere near loud enough to compete with this palette's
//            calm, desert-toned accents.
//   alertOn  same idea as brandOn/savingsOn, for an `alert`-colored
//            surface
// An expense amount in text always uses `ink` (neutral), never
// moneyOut. A single expense should not read as an alert.

export const Themes = {
    arena: {
        label: 'Arena',
        description: 'Cálido y terroso, de día',
        statusBarStyle: 'dark', // value for expo-status-bar <StatusBar style="..." />

        bg: '#F6F1E7',
        surface: '#FFFFFF',
        border: '#E6DCC8',

        ink: '#3A2E22',
        inkSoft: 'rgba(58,46,34,0.4)',
        muted: '#8F8268',

        brand: '#C17C3A',
        brandSoft: 'rgba(193,124,58,0.14)',
        brandOn: '#FFFFFF',

        moneyIn: '#4F7C7A',
        moneyInSoft: 'rgba(79,124,122,0.12)',
        moneyOut: '#C17C3A',
        moneyOutSoft: 'rgba(193,124,58,0.14)',

        savings: '#3E7CB8',
        savingsSoft: 'rgba(62,124,184,0.14)',
        // Preserves the app's current look (this button's text has
        // always been white) — now backed by a real per-theme token
        // instead of a bare '#FFFFFF' with no guarantee it'll still
        // read correctly if a future theme's `savings` isn't this
        // dark. Same role brandOn already plays for `brand`.
        savingsOn: '#FFFFFF',

        // Cool slate-gray, a hair colder than `muted` — reads as
        // "quietly different", not colored, on this warm cream bg.
        alert: '#7E8580',
        alertSoft: 'rgba(126,133,128,0.08)',
        alertOn: '#FFFFFF',

        cashTone: '#D9C7A3',

        // Card colors — same idea as the app's other palettes
        // (SAVINGS_COLORS in useSavings.js), but themed instead of
        // fixed: a card someone colors while on Arena should feel
        // like it belongs to a warm daylight desert, not an arbitrary
        // color wheel. Picked/cycled from in AddCardScreen.jsx.
        cardColors: [
            '#B8935E', '#8B7355', '#A0785A', '#6B7A5E',
            '#9E8468', '#B57A5E', '#7A6B4E', '#8B6B4E',
        ],

        // Liquid glass — used by GlassCard.jsx and the tab bar now that
        // AppBackground paints a gradient behind every screen instead
        // of each card carrying its own flat `surface` fill: every
        // GlassCard surface needs to let some of that gradient bleed
        // through rather than blocking it. (Home's hero is the one
        // card that's NOT glass — see HeroArt.jsx — so these tokens
        // don't apply there.) `glassTint` feeds BlurView's own `tint`
        // prop directly ('light' picks BlurView's light-glass
        // algorithm, not just a color choice, so it has to match
        // whether the background behind it actually reads as bright or dark).
        // `glassBorderTop` is deliberately brighter than `glassBorder`
        // — that's the one detail that makes a translucent panel read
        // as "glass catching light from above" instead of just "low
        // opacity card".
        glassFill: 'rgba(255,255,255,0.55)',
        glassBorder: 'rgba(255,255,255,0.6)',
        glassBorderTop: 'rgba(255,255,255,0.9)',
        glassTint: 'light',
        glassIntensity: 45,
    },

    medianoche: {
        label: 'Medianoche',
        description: 'El mismo desierto, de noche',
        statusBarStyle: 'light',

        bg: '#11151D',
        surface: '#1B1F28',
        border: 'rgba(255,255,255,0.08)',

        ink: '#ECEEE7',
        inkSoft: 'rgba(236,238,231,0.4)',
        muted: '#8E9099',

        brand: '#5FC9BD',
        brandSoft: 'rgba(95,201,189,0.16)',
        brandOn: '#11151D',

        moneyIn: '#5FC9BD',
        moneyInSoft: 'rgba(95,201,189,0.14)',
        moneyOut: '#CC9A5C',
        moneyOutSoft: 'rgba(204,154,92,0.16)',

        savings: '#5B9EF0',
        savingsSoft: 'rgba(91,158,240,0.18)',
        savingsOn: '#FFFFFF',

        // Cool blue-gray, close to `muted` but colder — reads as
        // quietly distinct against the dark bg, not as a new accent.
        alert: '#9AA3B0',
        alertSoft: 'rgba(154,163,176,0.10)',
        alertOn: '#11151D',

        cashTone: '#4A4C52',

        // See arena's cardColors comment for the full reasoning —
        // same idea, tuned for Medianoche's cool teal/navy night.
        cardColors: [
            '#1F4E4A', '#2C3E5C', '#4A3F6B', '#2D5F6E',
            '#3D4A5C', '#5C4A6B', '#2C5C4A', '#4A5C6B',
        ],

        // See arena's glassFill comment for the full reasoning — same
        // tokens, tuned for a dark surface + cool teal moonlight
        // instead of a bright daytime sky.
        glassFill: 'rgba(27,31,40,0.4)',
        glassBorder: 'rgba(255,255,255,0.09)',
        glassBorderTop: 'rgba(255,255,255,0.22)',
        glassTint: 'dark',
        glassIntensity: 55,
    },

    brasa: {
        label: 'Brasa',
        description: 'Desierto nocturno, versión cálida',
        statusBarStyle: 'light',

        bg: '#1E160F',
        surface: '#2A1F17',
        border: 'rgba(255,255,255,0.07)',

        ink: '#F2E6D6',
        inkSoft: 'rgba(242,230,214,0.4)',
        muted: '#9C8E78',

        brand: '#D9763E',
        brandSoft: 'rgba(217,118,62,0.18)',
        brandOn: '#1E160F',

        moneyIn: '#6F8A77',
        moneyInSoft: 'rgba(111,138,119,0.16)',
        moneyOut: '#D9763E',
        moneyOutSoft: 'rgba(217,118,62,0.16)',

        savings: '#5A93C4',
        savingsSoft: 'rgba(90,147,196,0.18)',
        savingsOn: '#FFFFFF',

        // Same reasoning as medianoche's: a cool, muted gray instead
        // of adding a second warm hue to an already-warm palette.
        alert: '#9BA0A6',
        alertSoft: 'rgba(155,160,166,0.10)',
        alertOn: '#1E160F',

        cashTone: '#4A3C2C',

        // See arena's cardColors comment for the full reasoning —
        // same idea, tuned for Brasa's warm ember night.
        cardColors: [
            '#8B4A2E', '#A66B2E', '#6B3A2C', '#8B5E2E',
            '#5C3A2C', '#9E5A3D', '#7A4A2C', '#6B4A3A',
        ],

        // Same reasoning as arena/medianoche — warmed to match Brasa's
        // ember glow instead of teal moonlight or daylight.
        glassFill: 'rgba(42,31,23,0.42)',
        glassBorder: 'rgba(255,255,255,0.08)',
        glassBorderTop: 'rgba(255,224,196,0.2)',
        glassTint: 'dark',
        glassIntensity: 55,
    },
};

export const THEME_NAMES = Object.keys(Themes);
export const DEFAULT_THEME = 'medianoche';