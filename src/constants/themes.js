// Noma theme registry. Every theme exposes the same semantic tokens,
// so any screen reading `theme.xxx` works with all of them.
//
// Fixed meaning across themes:
//   moneyIn/moneyOut   income / expense (icons, allocation bar)
//   brand / brandOn    primary CTA, avatar, active tab / text on top of it
//   savings / savingsOn  savings account in the allocation bar / text on top
//   alert / alertOn    scheduled-but-not-done-yet badges / text on top
//   cardPayment        a card payment (category 'card_payment') — used to
//                       reuse moneyOut like a plain Gasto; now its own
//                       softer amber so Gasto/Mensualidad/Pago de tarjeta
//                       don't all read as one color.
//   msi                one MSI installment (category 'msi') — same reasoning
//                       as cardPayment, its own distinct hue.
// An expense amount in text always uses `ink`, never moneyOut — a
// single expense shouldn't read as an alert.

export const Themes = {
    arena: {
        label: 'Arena',
        description: 'Cálido y terroso, de día',
        statusBarStyle: 'dark',

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
        savingsOn: '#FFFFFF',

        // Cool slate-gray, colder than `muted` — reads as quietly
        // different without competing with the warm palette.
        alert: '#7E8580',
        alertSoft: 'rgba(126,133,128,0.08)',
        alertOn: '#FFFFFF',

        // Amber/mustard — more yellow than moneyOut's terracotta.
        cardPayment: '#DDC170',
        cardPaymentSoft: 'rgba(221,193,112,0.16)',
        // Clay/terracotta-brown — a third, deeper warm earth tone.
        msi: '#B5754F',
        msiSoft: 'rgba(181,117,79,0.14)',

        cashTone: '#D9C7A3',

        // Card colors, themed instead of fixed (picked/cycled in
        // AddCardScreen.jsx) — warm daylight desert palette.
        cardColors: [
            '#B8935E', '#8B7355', '#A0785A', '#6B7A5E',
            '#9E8468', '#B57A5E', '#7A6B4E', '#8B6B4E',
        ],

        // Liquid glass tokens for GlassCard.jsx/tab bar, letting the
        // AppBackground gradient bleed through. glassTint feeds
        // BlurView's tint prop directly; glassBorderTop is brighter
        // than glassBorder so the panel reads as glass, not just low opacity.
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

        alert: '#9AA3B0',
        alertSoft: 'rgba(154,163,176,0.10)',
        alertOn: '#11151D',

        // Richer, more saturated amber than moneyOut's muted tan-gold.
        cardPayment: '#E3C56E',
        cardPaymentSoft: 'rgba(227,197,110,0.18)',
        // Brick-rust red — this theme had no red yet, reads as its own thing.
        msi: '#C97158',
        msiSoft: 'rgba(201,113,88,0.16)',

        cashTone: '#4A4C52',

        // Same idea as arena's cardColors — cool teal/navy night palette.
        cardColors: [
            '#1F4E4A', '#2C3E5C', '#4A3F6B', '#2D5F6E',
            '#3D4A5C', '#5C4A6B', '#2C5C4A', '#4A5C6B',
        ],

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

        alert: '#9BA0A6',
        alertSoft: 'rgba(155,160,166,0.10)',
        alertOn: '#1E160F',

        // Same amber family as arena, tuned for Brasa's darker ember surface.
        cardPayment: '#E1C576',
        cardPaymentSoft: 'rgba(225,197,118,0.18)',
        // Brick-rose red, in the "warm night" family without overlapping moneyOut.
        msi: '#A8524A',
        msiSoft: 'rgba(168,82,74,0.16)',

        cashTone: '#4A3C2C',

        cardColors: [
            '#8B4A2E', '#A66B2E', '#6B3A2C', '#8B5E2E',
            '#5C3A2C', '#9E5A3D', '#7A4A2C', '#6B4A3A',
        ],

        glassFill: 'rgba(42,31,23,0.42)',
        glassBorder: 'rgba(255,255,255,0.08)',
        glassBorderTop: 'rgba(255,224,196,0.2)',
        glassTint: 'dark',
        glassIntensity: 55,
    },

    // Same "time of day in the desert" family as arena/medianoche/brasa
    // — a sunrise is naturally pastel/pink/lavender, so this fits.
    amanecer: {
        label: 'Amanecer',
        description: 'Pastel y juguetón, al amanecer',
        statusBarStyle: 'dark',

        bg: '#FDF0EC',
        surface: '#FFFFFF',
        border: '#F6DDD6',

        ink: '#412934',
        inkSoft: 'rgba(92,58,74,0.4)',
        muted: '#7d5d67',

        brand: '#F2789A',
        brandSoft: 'rgba(242,120,154,0.14)',
        brandOn: '#FFFFFF',

        moneyIn: '#7f4898',
        moneyInSoft: 'rgba(160, 94, 191, 0.14)',
        moneyOut: '#F2789A',
        moneyOutSoft: 'rgba(242,120,154,0.16)',

        savings: '#D9A548',
        savingsSoft: 'rgba(217,165,72,0.16)',
        savingsOn: '#FFFFFF',

        alert: '#B89AA0',
        alertSoft: 'rgba(184,154,160,0.10)',
        alertOn: '#FFFFFF',

        // Warm pastel, pulled clear of savings' gold and brand's pink.
        cardPayment: '#EACB90',
        cardPaymentSoft: 'rgba(234,203,144,0.18)',
        // Deeper, more muted terracotta-caramel — distinct from cardPayment's peach.
        msi: '#B8785A',
        msiSoft: 'rgba(184,120,90,0.16)',

        cashTone: '#F5D9C8',

        // Playful/pastel — no blue in this palette, replaced with
        // coral, sage, and mauve to keep enough variety without
        // breaking the all-warm family.
        cardColors: [
            '#F2A6B4', '#C99AA8', '#9FD9C4', '#F5C99A',
            '#E89078', '#F2E29A', '#E0A6C4', '#A8C088',
        ],

        glassFill: 'rgba(255,255,255,0.6)',
        glassBorder: 'rgba(255,255,255,0.6)',
        glassBorderTop: 'rgba(255,255,255,0.9)',
        glassTint: 'light',
        glassIntensity: 45,
    },

    // A genuine departure — cyberpunk red/black. moneyIn/savings pull
    // magenta and crimson-purple instead of leaving the red/black
    // family for an unrelated hue like cyan.
    neon: {
        label: 'Neón',
        description: 'Cyberpunk, rojo sobre negro',
        statusBarStyle: 'light',

        bg: '#0A0708',
        surface: '#161012',
        border: 'rgba(255,45,85,0.16)',

        ink: '#F5EDEE',
        inkSoft: 'rgba(245,237,238,0.4)',
        muted: '#8A6F74',

        brand: '#FF1744',
        brandSoft: 'rgba(255,23,68,0.18)',
        brandOn: '#FFFFFF',

        moneyIn: '#FF3D8F',
        moneyInSoft: 'rgba(255,61,143,0.16)',
        moneyOut: '#FF1744',
        moneyOutSoft: 'rgba(255,23,68,0.18)',

        savings: '#A6296B',
        savingsSoft: 'rgba(166,41,107,0.20)',
        savingsOn: '#FFFFFF',

        alert: '#B0525E',
        alertSoft: 'rgba(176,82,94,0.14)',
        alertOn: '#FFFFFF',

        // Neon amber — a cyberpunk sign color, kept fully saturated
        // (unlike other themes' softer version) to still read as a glow.
        cardPayment: '#FFB452',
        cardPaymentSoft: 'rgba(255,180,82,0.20)',
        // Duller, darker copper — "burnt metal" instead of "sign glow".
        msi: '#C97A3D',
        msiSoft: 'rgba(201,122,61,0.16)',

        cashTone: '#3A1218',

        // Kept inside the red/black family — deep crimsons, near-blacks, plums.
        cardColors: [
            '#3D0F1A', '#1A1416', '#5C1128', '#2B0F1E',
            '#4A0E1C', '#1F0A12', '#601830', '#0F0F14',
        ],

        glassFill: 'rgba(22,16,18,0.45)',
        glassBorder: 'rgba(255,45,85,0.12)',
        glassBorderTop: 'rgba(255,90,120,0.28)',
        glassTint: 'dark',
        glassIntensity: 55,
    },

    // Synthwave needs hot pink AND cyan together — that pairing is
    // the genre's whole identity. Purple fills the dusk gradient's third color.
    synthwave: {
        label: 'Synthwave',
        description: 'Atardecer retro, rosa y cian',
        statusBarStyle: 'light',

        bg: '#1A0B2E',
        surface: '#2D1445',
        border: 'rgba(255,62,201,0.18)',

        ink: '#F5E8FF',
        inkSoft: 'rgba(245,232,255,0.4)',
        muted: '#9A82B5',

        brand: '#FF2E97',
        brandSoft: 'rgba(255,46,151,0.18)',
        brandOn: '#FFFFFF',

        moneyIn: '#00E5FF',
        moneyInSoft: 'rgba(0,229,255,0.16)',
        moneyOut: '#FF2E97',
        moneyOutSoft: 'rgba(255,46,151,0.18)',

        savings: '#B026FF',
        savingsSoft: 'rgba(176,38,255,0.18)',
        savingsOn: '#FFFFFF',

        alert: '#C9A0D9',
        alertSoft: 'rgba(201,160,217,0.14)',
        alertOn: '#1A0B2E',

        // Sunset gold — the amber band every synthwave dusk gradient has.
        cardPayment: '#FFCF66',
        cardPaymentSoft: 'rgba(255,207,102,0.20)',
        // Sunset red-orange, the band below the gold, near the horizon.
        msi: '#FF6B4A',
        msiSoft: 'rgba(255,107,74,0.16)',

        cashTone: '#3D1D52',

        // The genre's signature palette: hot pink, electric cyan, violet.
        cardColors: [
            '#FF2E97', '#00E5FF', '#B026FF', '#FF6B9D',
            '#7B2FF7', '#FF3EC9', '#00B8D9', '#C724B1',
        ],

        glassFill: 'rgba(45,20,69,0.45)',
        glassBorder: 'rgba(255,62,201,0.14)',
        glassBorderTop: 'rgba(0,229,255,0.24)',
        glassTint: 'dark',
        glassIntensity: 55,
    },
};

export const THEME_NAMES = Object.keys(Themes);
export const DEFAULT_THEME = 'medianoche';