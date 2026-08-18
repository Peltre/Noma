// Noma theme — Medianoche is the app's only theme now (the previous
// Arena/Brasa/Amanecer/Neón/Synthwave options were removed to focus
// on a single, well-tuned palette instead of maintaining six).
//
// Fixed meaning per token — this is what keeps `theme.xxx`
// self-documenting at every call site, and every screen that shows a
// transaction-related indicator (icons, progress bars, badges,
// allocation bars) must pull from these same tokens instead of
// hardcoding a color, so the meaning stays consistent app-wide:
//   moneyIn/moneyOut   income / expense (icons, allocation bar)
//   brand / brandOn    primary CTA, avatar, active tab / text on top of it
//   transfer/transferOn  a traspaso between own accounts / text on top —
//                       darker, more saturated teal than moneyIn: still
//                       "your money", not an outflow, but must read as
//                       distinct from Ingreso at a glance.
//   savings / savingsOn  savings account + Interés (interest is
//                       app-generated income, but reuses savings' blue
//                       for consistency with SavingsScreen and the
//                       allocation bar, not moneyIn) / text on top
//   alert / alertOn    scheduled-but-not-done-yet badges / text on top
//   cardPayment        a card payment (category 'card_payment') and its
//                       progress/debt bar on CardsScreen — its own
//                       amber so Gasto/Mensualidad/Pago de tarjeta don't
//                       all read as one color.
//   msi                one MSI installment (category 'msi') and its
//                       progress bar — same reasoning as cardPayment.
// An expense amount in text always uses `ink`, never moneyOut — a
// single expense shouldn't read as an alert.

export const theme = {
    label: 'Medianoche',
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

    // Darker, more saturated teal than moneyIn — same family (still
    // the user's own money), but never reads as identical to Ingreso.
    transfer: '#3A968A',
    transferSoft: 'rgba(58,150,138,0.18)',
    transferOn: '#FFFFFF',

    savings: '#5B9EF0',
    savingsSoft: 'rgba(91,158,240,0.18)',
    savingsOn: '#FFFFFF',

    alert: '#9AA3B0',
    alertSoft: 'rgba(154,163,176,0.10)',
    alertOn: '#11151D',

    // Lighter, more saturated amber than moneyOut's muted tan-gold.
    cardPayment: '#E8C27E',
    cardPaymentSoft: 'rgba(232,194,126,0.18)',
    cardPaymentOn: '#11151D',
    // Darker, more saturated amber-brown than moneyOut.
    msi: '#A66A3F',
    msiSoft: 'rgba(166,106,63,0.18)',
    msiOn: '#FFFFFF',

    cashTone: '#4A4C52',

    // Cool teal/navy night palette, cycled in AddCardScreen.jsx.
    cardColors: [
        '#1F4E4A', '#2C3E5C', '#4A3F6B', '#2D5F6E',
        '#3D4A5C', '#5C4A6B', '#2C5C4A', '#4A5C6B',
    ],

    // Liquid glass tokens for GlassCard.jsx/tab bar, letting the
    // AppBackground gradient bleed through. glassTint feeds
    // BlurView's tint prop directly; glassBorderTop is brighter
    // than glassBorder so the panel reads as glass, not just low opacity.
    glassFill: 'rgba(27,31,40,0.4)',
    glassBorder: 'rgba(255,255,255,0.09)',
    glassBorderTop: 'rgba(255,255,255,0.22)',
    glassTint: 'dark',
    glassIntensity: 55,
};