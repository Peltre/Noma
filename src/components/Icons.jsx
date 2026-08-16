// Unified icon set for the whole app — one SVG library
// (react-native-svg) replacing the old mix of hand-rolled SVGs,
// Unicode-as-text, and emoji, so every icon shares stroke weight,
// viewBox, and line caps ("gruesecito" on purpose: SW below is
// thicker than the ~1.6 the old hand-rolled icons used).
//
// Every icon takes `color` (required) and `size` (optional). Nav-bar
// icons also take `focused` (solid fill) and, where they draw a light
// "cutout" on top of that fill, `bgColor` (so the cutout reads
// correctly against whatever surface it sits on).
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const SW = 2;

const vb = (size) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' });

// ── Tab bar ─────────────────────────────────────────────────────
export function IconHome({ color, bgColor, size = 21, focused }) {
    const d = 'M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z';
    return (
        <Svg {...vb(size)}>
            {focused
                ? <Path d={d} fill={color} />
                : <Path d={d} stroke={color} strokeWidth={SW} strokeLinejoin="round" />}
        </Svg>
    );
}

export function IconHistory({ color, bgColor, size = 21, focused }) {
    return (
        <Svg {...vb(size)}>
            {focused ? (
                <>
                    <Rect x="3" y="3" width="18" height="18" rx="4" fill={color} />
                    <Path d="M7.5 9h9M7.5 12.5h9M7.5 16h6" stroke={bgColor} strokeWidth={SW} strokeLinecap="round" />
                </>
            ) : (
                <>
                    <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth={SW} />
                    <Path d="M7.5 9h9M7.5 12.5h9M7.5 16h6" stroke={color} strokeWidth={SW} strokeLinecap="round" />
                </>
            )}
        </Svg>
    );
}

export function IconSavings({ color, size = 21, focused }) {
    return (
        <Svg {...vb(size)}>
            {focused
                ? <Circle cx="12" cy="12" r="5.5" fill={color} />
                : <Path d="M6.5 12a5.5 5.5 0 1011 0 5.5 5.5 0 00-11 0z" stroke={color} strokeWidth={SW} />}
            <Path d="M6.5 12C6.5 7.5 3.7 4 1 4" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M12 4V2" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M17.5 20.5L19 22" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

export function IconCards({ color, bgColor, size = 21, focused }) {
    return (
        <Svg {...vb(size)}>
            {focused ? (
                <>
                    <Rect x="1" y="5" width="22" height="15" rx="3" fill={color} />
                    <Rect x="1" y="8.5" width="22" height="2.6" fill={bgColor} />
                    <Path d="M5 15h3.5" stroke={bgColor} strokeWidth={SW} strokeLinecap="round" />
                </>
            ) : (
                <>
                    <Rect x="1" y="5" width="22" height="15" rx="2.5" stroke={color} strokeWidth={SW} />
                    <Path d="M1 9.5h22" stroke={color} strokeWidth={SW} />
                    <Path d="M5 15h3.5" stroke={color} strokeWidth={SW} strokeLinecap="round" />
                </>
            )}
        </Svg>
    );
}

export function IconSettings({ color, size = 19 }) {
    return (
        <Svg {...vb(size)}>
            <Circle cx="12" cy="12" r="3.4" stroke={color} strokeWidth={SW} />
            <Path
                d="M12 2.5v2.6M12 18.9v2.6M4.6 12H2M22 12h-2.6M6 6l1.8 1.8M16.2 16.2L18 18M18 6l-1.8 1.8M7.8 16.2L6 18"
                stroke={color} strokeWidth={SW} strokeLinecap="round"
            />
        </Svg>
    );
}

export function IconPlus({ color, size = 22 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M12 4.5v15M4.5 12h15" stroke={color} strokeWidth={SW + 0.4} strokeLinecap="round" />
        </Svg>
    );
}

export function IconMinus({ color, size = 22 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M4.5 12h15" stroke={color} strokeWidth={SW + 0.4} strokeLinecap="round" />
        </Svg>
    );
}

// ── Chrome / structural ─────────────────────────────────────────
export function IconChevronLeft({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconChevronDown({ color, size = 15 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M5 9l7 7 7-7" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconChevronRight({ color, size = 15 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconCheck({ color, size = 13 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M5 13l4.5 4.5L19 7" stroke={color} strokeWidth={SW + 0.4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconClose({ color, size = 15 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

// ── Actions ──────────────────────────────────────────────────────
export function IconPencil({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path
                d="M14.5 4.5l5 5L8 21H3v-5L14.5 4.5z"
                stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"
            />
            <Path d="M12.5 6.5l5 5" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

export function IconTrash({ color, size = 17 }) {
    return (
        <Svg {...vb(size)}>
            <Path
                d="M4.5 6.5h15M9 6.5V4.3a1 1 0 011-1h4a1 1 0 011 1v2.2M6.7 6.5l.9 13.3a1.7 1.7 0 001.7 1.6h5.4a1.7 1.7 0 001.7-1.6l.9-13.3"
                stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
            />
            <Path d="M10.2 10.5v6.5M13.8 10.5v6.5" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

export function IconCash({ color, size = 20 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth={SW} />
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={SW} />
            <Path d="M5.5 9v.01M18.5 15v.01" stroke={color} strokeWidth={SW + 0.4} strokeLinecap="round" />
        </Svg>
    );
}

// ── Transaction types ────────────────────────────────────────────
export function IconArrowDown({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M12 4.5v14" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M6.5 13l5.5 5.5L17.5 13" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconArrowUp({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M12 19.5v-14" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M6.5 11l5.5-5.5L17.5 11" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconArrowRight({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M4.5 12h14" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M13 6.5l5.5 5.5-5.5 5.5" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconSwap({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M3.5 8h14" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M13.5 4l4 4-4 4" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M20.5 16h-14" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M10.5 12l-4 4 4 4" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

// Recurring "mensualidad" (an MSI installment) — a repeat/refresh
// loop reads as "this happens again", the one thing that separates
// it from a one-off card payment or expense.
export function IconRepeat({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M4 12a8 8 0 0113.66-5.66L20 8" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M20 4v4h-4" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M20 12a8 8 0 01-13.66 5.66L4 16" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M4 20v-4h4" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

// ── Status / info ─────────────────────────────────────────────────
export function IconWarningTriangle({ color, size = 15 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M12 4l9 15.5H3L12 4z" stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />
            <Path d="M12 10.5v4" stroke={color} strokeWidth={SW + 0.2} strokeLinecap="round" />
            <Circle cx="12" cy="17.3" r="1" fill={color} stroke="none" />
        </Svg>
    );
}

export function IconLock({ color, size = 12 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke={color} strokeWidth={SW} />
            <Path d="M8 10.5V7.5a4 4 0 018 0v3" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

export function IconCalendar({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth={SW} />
            <Path d="M3 9.5h18" stroke={color} strokeWidth={SW} />
            <Path d="M8 3v4M16 3v4" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

// Calendar + clock — "Programado" (a scheduled/recurring MSI
// payment), distinct from DatePickerField's plain calendar ("pick a
// date"). Calendar body+tabs are centered at (12,12); clock is a
// corner badge on top.
export function IconCalendarClock({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="5" y="7" width="14" height="12" rx="2" stroke={color} strokeWidth={SW} />
            <Path d="M5 10.5h14" stroke={color} strokeWidth={SW} />
            <Path d="M9 5v4M15 5v4" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Circle cx="19" cy="19" r="3.8" stroke={color} strokeWidth={SW} fill="none" />
            <Path d="M19 16.8v2.2l1.5,0.9" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

// Banknote + plus — "Ingreso". The "+" badge is painted in `bgColor`
// (the icon's container background) rather than cut out transparent,
// so it always reads clean regardless of what's underneath — same
// trick PendingFundCard's badges use. `bgColor` must be OPAQUE
// (theme.surface, not a low-alpha tint like visual.bg) or it barely shows.
export function IconBanknotePlus({ color, bgColor = '#FFFFFF', size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth={SW} />
            <Circle cx="12" cy="12" r="2.8" stroke={color} strokeWidth={SW} />
            <Circle cx="20.5" cy="18.5" r="4.7" fill={color} stroke={bgColor} strokeWidth={1.4} />
            <Path d="M20.5 15.2v6.6M17.2 18.5h6.6" stroke={bgColor} strokeWidth={1.3} strokeLinecap="round" />
        </Svg>
    );
}

// Receipt — "Gasto". A torn-edge slip reads more specifically as
// "money spent on something" than a bare arrow did.
export function IconReceipt({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path
                d="M5 3h14v14.5l-1.75,3 -1.75,-3 -1.75,3 -1.75,-3 -1.75,3 -1.75,-3 -1.75,3 -1.75,-3V3z"
                stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"
            />
            <Path d="M8 7.5h8M8 11h8M8 14h5" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

// ── Onboarding / Settings ─────────────────────────────────────────
export function IconUser({ color, size = 17 }) {
    return (
        <Svg {...vb(size)}>
            <Circle cx="12" cy="8.5" r="3.6" stroke={color} strokeWidth={SW} />
            <Path d="M4.8 20c1-4.4 4.1-6.7 7.2-6.7s6.2 2.3 7.2 6.7" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconCurrency({ color, size = 17 }) {
    return (
        <Svg {...vb(size)}>
            <Circle cx="12" cy="12" r="8.2" stroke={color} strokeWidth={SW} />
            <Path
                d="M12 7v10M9 9.2c0-1.2 1.3-2.1 3-2.1s3 .9 3 1.9-1.3 1.5-3 1.8-3 .7-3 1.9 1.3 2 3 2 3-.8 3-2"
                stroke={color} strokeWidth={SW - 0.4} strokeLinecap="round" strokeLinejoin="round"
            />
        </Svg>
    );
}

export function IconCard({ color, size = 20 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="1.5" y="5" width="21" height="15" rx="2.2" stroke={color} strokeWidth={SW} />
            <Path d="M1.5 9.8h21" stroke={color} strokeWidth={SW} />
            <Path d="M5.5 15h4" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

// One piece, not "IconPlus next to IconCard" — a single shape lines
// up the badge against the card exactly. `bgColor` punches a clean
// hole so the card's stripe doesn't cut through the badge.
export function IconCardAdd({ color, bgColor, size = 20 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="1" y="7" width="18" height="13" rx="2.4" stroke={color} strokeWidth={SW} />
            <Path d="M1 11.3h18" stroke={color} strokeWidth={SW} />
            <Path d="M4.5 16.2h4" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Circle cx="18" cy="7" r="5.4" fill={bgColor} />
            <Circle cx="18" cy="7" r="5.4" stroke={color} strokeWidth={SW} fill="none" />
            <Path d="M18 4.5v5M15.5 7h5" stroke={color} strokeWidth={SW + 0.3} strokeLinecap="round" />
        </Svg>
    );
}

export function IconDocument({ color, size = 20 }) {
    return (
        <Svg {...vb(size)}>
            <Rect x="4" y="3" width="16" height="18" rx="2.4" stroke={color} strokeWidth={SW} />
            <Path d="M7.5 8.5h9M7.5 12.5h9M7.5 16h5.5" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

// Distinct from IconCurrency on purpose (a wallet, not a coin) — used
// for "your total balance" in the onboarding tour, a different idea
// from the currency field in Settings even though both are money-ish.
export function IconWallet({ color, size = 20 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M3 7.5a2 2 0 012-2h12.5a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2V7.5z" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
            <Path d="M3 9.3h16.5" stroke={color} strokeWidth={SW} />
            <Path d="M14.5 12.2a1.9 1.9 0 100 3.8h5v-3.8h-5z" fill={color} stroke="none" />
        </Svg>
    );
}

export function IconSparkle({ color, size = 20 }) {
    return (
        <Svg {...vb(size)}>
            <Path
                d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
                stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"
            />
        </Svg>
    );
}

// ── Trend (Home's balance indicator) ───────────────────────────────
// Diagonal on purpose — distinct from IconArrowUp/Down above, which
// already mean expense/income elsewhere in the app.
export function IconPercent({ color, size = 16 }) {
    return (
        <Svg {...vb(size)}>
            <Circle cx="6.5" cy="6.5" r="3" stroke={color} strokeWidth={SW} />
            <Circle cx="17.5" cy="17.5" r="3" stroke={color} strokeWidth={SW} />
            <Path d="M18 6L6 18" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

export function IconTrendUp({ color, size = 14 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M5 16L16 5" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M8 5h8v8" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconTrendDown({ color, size = 14 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M5 5l11 11" stroke={color} strokeWidth={SW} strokeLinecap="round" />
            <Path d="M16 8v8H8" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

// ── Tags (constants/tagIcons.js) ───────────────────────────────────
// One glyph per default tag, plus IconTagOther as the generic
// fallback/"other" choice — same set doubles as the icon palette
// offered when a person creates their own tag.
export function IconTagFood({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M6 2.5v8a2 2 0 002 2 2 2 0 002-2v-8M8 12.5V21.5" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16.5 2.5c-1.4 0-2.5 1.8-2.5 4.5s1.1 4.5 2.5 4.5M16.5 2.5v19" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export function IconTagTransport({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M4 16V10.5a2 2 0 011.4-1.9l1.4-.4 1.6-3.2A2 2 0 0110.2 4h3.6a2 2 0 011.8 1L17.2 8.2l1.4.4A2 2 0 0120 10.5V16" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M4 16h16M4 16v2.5a1 1 0 001 1h1.5a1 1 0 001-1V16M15.5 16v2.5a1 1 0 001 1H18a1 1 0 001-1V16" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="8" cy="13" r="1" fill={color} stroke="none" />
            <Circle cx="16" cy="13" r="1" fill={color} stroke="none" />
        </Svg>
    );
}

export function IconTagCart({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M3 4h2l2.2 11.2a1.8 1.8 0 001.8 1.4h7.6a1.8 1.8 0 001.8-1.5L20 8H6" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="10" cy="20" r="1.3" fill={color} stroke="none" />
            <Circle cx="17" cy="20" r="1.3" fill={color} stroke="none" />
        </Svg>
    );
}

export function IconTagHealth({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={SW} />
            <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

export function IconTagEntertainment({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M3 8.5l2-4.5h14l2 4.5v10a1.3 1.3 0 01-1.3 1.3H4.3A1.3 1.3 0 013 18.5v-10z" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
            <Path d="M3 8.5h18M8.5 4v4.5M15.5 4v4.5" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
        </Svg>
    );
}

export function IconTagClothing({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path
                d="M8.5 3.5L4 6.5l1.8 3 2.2-1.3V20a1 1 0 001 1h6a1 1 0 001-1V8.2l2.2 1.3 1.8-3-4.5-3a3 3 0 01-6 0z"
                stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"
            />
        </Svg>
    );
}

export function IconTagHome({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M4 11l8-7.5L20 11" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M6 9.5V20a1 1 0 001 1h10a1 1 0 001-1V9.5" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
            <Path d="M10 21v-6h4v6" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
        </Svg>
    );
}

export function IconTagServices({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path
                d="M14.5 3.5a4.5 4.5 0 00-5.9 5.9L3 15v3.5a2.5 2.5 0 002.5 2.5H9v-3h3v-3l4.6-4.6a4.5 4.5 0 005.9-5.9L18 9 15 6l3.5-3.5z"
                stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"
            />
        </Svg>
    );
}

export function IconTagEducation({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path d="M2 8l10-4.5L22 8l-10 4.5L2 8z" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
            <Path d="M6.5 10.2V15c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.8" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
            <Path d="M22 8v6.5" stroke={color} strokeWidth={SW} strokeLinecap="round" />
        </Svg>
    );
}

export function IconTagOther({ color, size = 18 }) {
    return (
        <Svg {...vb(size)}>
            <Path
                d="M11.5 3H5a2 2 0 00-2 2v6.5a2 2 0 00.6 1.4l9 9a2 2 0 002.8 0l6.5-6.5a2 2 0 000-2.8l-9-9A2 2 0 0011.5 3z"
                stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"
            />
            <Circle cx="8" cy="8" r="1.4" fill={color} stroke="none" />
        </Svg>
    );
}