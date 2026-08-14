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
//   cardPayment  a `type: 'withdrawal'` paying down a credit card
//            (category 'card_payment' — see HomeScreen/HistoryScreen).
//            Used to just reuse `moneyOut`, same as a plain Gasto —
//            but a card payment isn't a new expense, it's paying off
//            one you already made, so it gets its own softer
//            amber/orange-yellow instead of competing for the same
//            accent as Gasto and Mensualidad. Every theme keeps this
//            in its own warm-adjacent family (never a hue the theme
//            doesn't already use elsewhere), just shifted enough from
//            `moneyOut`/`brand` to read as distinct at a glance.
//   msi      a `type: 'withdrawal'` for one MSI installment (category
//            'msi'). Same reasoning as `cardPayment` — was also
//            silently reusing `moneyOut`. Deliberately its own hue
//            from `cardPayment` too (not just a lighter/darker
//            version of it), so Gasto/Mensualidad/Pago de tarjeta
//            read as three distinct colors instead of a repeated one.
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

        // Amber/mustard — a notch more yellow than moneyOut's
        // terracotta orange, and softer (lower saturation) than the
        // "no tan fuerte" ask called for. Lightened and pushed
        // further toward yellow per follow-up feedback.
        cardPayment: '#DDC170',
        cardPaymentSoft: 'rgba(221,193,112,0.16)',
        // Clay/terracotta-brown — a third warm earth tone alongside
        // moneyOut's orange and cardPayment's amber, but deeper and
        // less saturated than both so it doesn't just read as a
        // shade of one of them.
        msi: '#B5754F',
        msiSoft: 'rgba(181,117,79,0.14)',

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

        // moneyOut here is already a muted tan/gold, so cardPayment
        // pushes further into a richer, more saturated amber instead
        // of sitting right next to it. Lightened and pushed further
        // toward yellow per follow-up feedback.
        cardPayment: '#E3C56E',
        cardPaymentSoft: 'rgba(227,197,110,0.18)',
        // A warm brick-rust red — this theme had no red at all yet
        // (teal, gold-tan, blue, gray), so this reads as clearly its
        // own thing instead of a variation on moneyOut or cardPayment.
        msi: '#C97158',
        msiSoft: 'rgba(201,113,88,0.16)',

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

        // Same amber family as arena, shifted for Brasa's darker
        // ember-warm surface — still clearly more yellow than
        // moneyOut's orange. Lightened and pushed further toward
        // yellow per follow-up feedback.
        cardPayment: '#E1C576',
        cardPaymentSoft: 'rgba(225,197,118,0.18)',
        // A deep brick-rose red — embers glow red as well as orange,
        // so this stays in the "warm night" family while landing far
        // enough from moneyOut/cardPayment's orange-amber hues.
        msi: '#A8524A',
        msiSoft: 'rgba(168,82,74,0.16)',

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

    // Same "time of day in the desert" idea the other three follow
    // (day/midnight/warm-night) rather than an unrelated add-on — a
    // desert sunrise is naturally soft, pink/lavender/peach, so
    // "pastel and playful" fits the family instead of breaking it.
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

        // Was #5FBF9E — a teal-leaning green with enough blue in it
        // to read as part of the same "blue/cyan" family this theme
        // was asked to drop entirely, not just savings and cardColors'
        // sky blue. This is a green with (almost) no blue channel in
        // it at all — shows up in the trend indicator, income color,
        // and income amounts, all three read from this one token.
        moneyIn: '#7f4898',
        moneyInSoft: 'rgba(160, 94, 191, 0.14)',
        moneyOut: '#F2789A',
        moneyOutSoft: 'rgba(242,120,154,0.16)',

        // Was a blue-violet (#9B8FD9) — cool, and the one color in
        // this whole theme that wasn't warm/pastel, so it stood out
        // against everything else instead of blending in. Gold reads
        // as "savings" just as naturally (coins) and actually fits
        // the rest of the palette instead of fighting it.
        savings: '#D9A548',
        savingsSoft: 'rgba(217,165,72,0.16)',
        savingsOn: '#FFFFFF',

        alert: '#B89AA0',
        alertSoft: 'rgba(184,154,160,0.10)',
        alertOn: '#FFFFFF',

        // Warm and pastel like the rest of this theme, but pulled far
        // enough from `savings`' gold (#D9A548) to not blend into
        // "Interés", and nowhere near brand/moneyOut's pink.
        // Lightened and pushed further toward yellow (butter instead
        // of peach) per follow-up feedback.
        cardPayment: '#EACB90',
        cardPaymentSoft: 'rgba(234,203,144,0.18)',
        // A more muted, darker terracotta-caramel — same hue
        // neighborhood as cardPayment but visibly deeper/duller, so
        // Mensualidad and Pago de tarjeta don't read as the same peach.
        msi: '#B8785A',
        msiSoft: 'rgba(184,120,90,0.16)',

        cashTone: '#F5D9C8',

        // See arena's cardColors comment for the full reasoning — same
        // idea, tuned playful/pastel: enough hue variety to still tell
        // cards apart, none of them saturated or dark enough to lose
        // the "soft" feeling the rest of this theme has.
        // '#A6C8E8' (sky blue) was here — same reasoning as the old
        // `savings` color above: the one cool/blue note in an
        // otherwise all-warm palette. Coral fills the same "distinct
        // from the other 7" role without breaking the family.
        // '#B8A6E0' and '#C4A6E0' (lavender, lilac) were the last two
        // blue-dominant values anywhere in this theme — options in a
        // picker, not auto-applied UI, but asked to go too. Mauve
        // keeps a little of what lavender was doing (a cooler-feeling
        // option among mostly-hot pinks/corals) without any actual
        // blue in it; sage adds a genuinely new hue the other 7
        // didn't have yet, instead of two pinks-with-different-names.
        cardColors: [
            '#F2A6B4', '#C99AA8', '#9FD9C4', '#F5C99A',
            '#E89078', '#F2E29A', '#E0A6C4', '#A8C088',
        ],

        // Light glass, same family as arena's (bright bg, BlurView's
        // light-glass algorithm) — see arena's glassFill comment for
        // the full reasoning.
        glassFill: 'rgba(255,255,255,0.6)',
        glassBorder: 'rgba(255,255,255,0.6)',
        glassBorderTop: 'rgba(255,255,255,0.9)',
        glassTint: 'light',
        glassIntensity: 45,
    },

    // A genuine departure from the other four (not a desert time-of-
    // day at all) — asked for directly as "cyberpunk, red and black,
    // with everything that implies". Red and black stay the dominant
    // two colors throughout (bg/surface/brand/cardColors are all
    // black-with-red-undertone or red-family), but a couple of
    // semantic tokens that need to stay functionally distinct from
    // pure red (moneyIn vs. moneyOut, so income and expense don't
    // read as the same color) pull a hot magenta and a deep crimson-
    // purple instead of leaving the red/black family entirely for an
    // unrelated hue like cyan — same "still recognizably one palette"
    // reasoning the other four themes follow.
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

        // Neon amber-yellow — reads as a cyberpunk sign color as much
        // as red/magenta do, so it stays inside this theme's own
        // family instead of reaching for an unrelated hue, while
        // landing far enough from brand/moneyOut's red (350°) and
        // moneyIn's magenta (332°) to read as its own signal. Pushed
        // lighter/more yellow per follow-up feedback, kept fully
        // saturated (unlike the other themes' softer version) so it
        // still reads as a neon glow instead of a pastel.
        cardPayment: '#FFB452',
        cardPaymentSoft: 'rgba(255,180,82,0.20)',
        // A duller, darker copper — same orange family as
        // cardPayment but visibly less neon-bright, closer to
        // "burnt metal" than "sign glow", so it doesn't compete with it.
        msi: '#C97A3D',
        msiSoft: 'rgba(201,122,61,0.16)',

        cashTone: '#3A1218',

        // See arena's cardColors comment for the full reasoning — same
        // idea, kept inside the red/black family on purpose (deep
        // crimsons, near-blacks, dark plums) rather than reaching for
        // unrelated hues just for variety.
        cardColors: [
            '#3D0F1A', '#1A1416', '#5C1128', '#2B0F1E',
            '#4A0E1C', '#1F0A12', '#601830', '#0F0F14',
        ],

        // Dark glass, same family as medianoche/brasa's — tuned with a
        // red undertone instead of teal or ember warmth, so the glass
        // itself still reads as part of this palette and not a
        // generic dark-mode gray.
        glassFill: 'rgba(22,16,18,0.45)',
        glassBorder: 'rgba(255,45,85,0.12)',
        glassBorderTop: 'rgba(255,90,120,0.28)',
        glassTint: 'dark',
        glassIntensity: 55,
    },

    // Unlike Neón (red/black, cyan deliberately avoided), synthwave
    // isn't synthwave without hot pink AND electric cyan together —
    // that pairing is the whole identity of the genre, not a color
    // choice to second-guess the way it was for Amanecer. Purple
    // fills the space between them (the classic dusk-gradient third
    // color) instead of reaching outside that three-color family.
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

        // Sunset gold — this theme's dusk gradient always has an
        // amber/orange band between the pink and the horizon, so this
        // fits the genre instead of adding an unrelated hue, and sits
        // clear of brand's pink (327°), moneyIn's cyan (189°) and
        // savings' purple (283°). Pushed lighter/more yellow per
        // follow-up feedback, kept fully saturated to stay a neon
        // sunset glow rather than a pastel.
        cardPayment: '#FFCF66',
        cardPaymentSoft: 'rgba(255,207,102,0.20)',
        // Sunset red-orange — the band of the gradient just below the
        // gold, closer to the horizon's red — same "atardecer" family
        // as cardPayment, different enough hue to stay its own signal.
        msi: '#FF6B4A',
        msiSoft: 'rgba(255,107,74,0.16)',

        cashTone: '#3D1D52',

        // See arena's cardColors comment for the full reasoning — same
        // idea, this time drawing from the genre's actual signature
        // palette (hot pink, electric cyan, violet) instead of
        // avoiding any part of it.
        cardColors: [
            '#FF2E97', '#00E5FF', '#B026FF', '#FF6B9D',
            '#7B2FF7', '#FF3EC9', '#00B8D9', '#C724B1',
        ],

        // Dark glass with a pink undertone instead of teal (medianoche)
        // or red (neon) — same family of tokens, tuned to this theme's
        // own dominant hue.
        glassFill: 'rgba(45,20,69,0.45)',
        glassBorder: 'rgba(255,62,201,0.14)',
        glassBorderTop: 'rgba(0,229,255,0.24)',
        glassTint: 'dark',
        glassIntensity: 55,
    },
};

export const THEME_NAMES = Object.keys(Themes);
export const DEFAULT_THEME = 'medianoche';