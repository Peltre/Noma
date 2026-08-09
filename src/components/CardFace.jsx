// Reusable visual "card" — used for the grid tile in Tarjetas, the
// live preview while creating/editing one, and the header of its
// detail sheet. One component, one set of rules, instead of three
// near-copies drifting apart over time.
//
// Deliberately a fixed dark-on-color palette regardless of app theme
// (same reasoning CardsScreen.styles.js already had): it's meant to
// look like a physical card, not a themed surface. (The color ITSELF
// now comes from the active theme's own palette — see
// AddCardScreen.jsx / constants/themes.js's `cardColors` — but once
// picked, the card renders the same dark-on-color way no matter what
// theme is active later.)
import { useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from 'react-native-svg';
import { FontSize, Spacing, Radius } from '../constants';
import { IconLock } from './Icons';

// Shared with FocusStack.jsx so the stack's slot math always matches
// whatever height the "large" card face actually renders at.
export const CARD_LARGE_HEIGHT = 190;

// Cut down to just two options after the previous set (stars/dunes/
// skyline — small hand-composed scenes echoing the app's own sky/
// horizon motifs) showed a real mismatch between what got verified
// here and what actually rendered on-device, and it couldn't get
// tracked down without a screenshot that didn't come through. Rather
// than keep guessing at a rendering discrepancy neither side could
// see, this cuts back to the two simplest, lowest-risk options: no
// pattern at all, and a plain gradient wash (which never used the
// scene-composition path those three did — see PatternOverlay below,
// it's just a Rect filled with a gradient, sized directly off the
// card's own real width/height, nothing else going on that could
// drift from what actually renders).
export const CARD_PATTERNS = [
    { id: 'none', label: 'Liso' },
    { id: 'gradient', label: 'Degradado' },
];

// width/height are required, explicit pixel numbers — not "100%".
// Same reason as NightSkyArt.jsx: react-native-svg doesn't reliably
// stretch a percentage-sized Svg to match an auto-size flex parent on
// native, so the pattern rendered smaller than the card and left part
// of it uncovered. The card measures itself with onLayout and passes
// its real size down instead.
//
// pointerEvents="none" lives on a plain View wrapper around the Svg,
// not as a standalone prop on <Svg> itself — GlassCard.jsx hit a real
// bug from that exact pattern (react-native-svg's root <Svg> not
// reliably forwarding the prop), which silently swallowed taps on a
// TouchableOpacity underneath instead of passing them through. Cards
// here are tappable (to open their detail sheet), so this gets the
// same safer treatment even though it hadn't been reported broken
// here specifically.
function PatternOverlay({ pattern, width, height }) {
    if (!pattern || pattern !== 'gradient') return null;

    // A plain diagonal light-to-dark wash over whatever color the
    // card already is, sized directly off the card's own real
    // width/height — no viewBox/preserveAspectRatio scaling involved,
    // unlike the scene-composition approach this replaced.
    return (
        <View style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="cardWash" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.12} />
                        <Stop offset="100%" stopColor="#000000" stopOpacity={0.22} />
                    </LinearGradient>
                </Defs>
                <Rect width={width} height={height} fill="url(#cardWash)" />
            </Svg>
        </View>
    );
}

// EMV chip — gold gradient rect with the classic contact-pad divider
// lines. One reusable size (scaled by `compact`), absolutely
// positioned below the name/badge row rather than a third flex child
// — the card's existing layout is `top` and `bottom` pinned to their
// own edges via justifyContent:'space-between', and a chip belongs
// pinned to a fixed spot under the header instead of sharing in that
// space distribution.
function Chip({ compact }) {
    const w = compact ? 26 : 32;
    const h = compact ? 19 : 24;
    return (
        <View style={[styles.chipWrap, compact ? styles.chipWrapCompact : styles.chipWrapLarge]}>
            <Svg width={w} height={h}>
                <Defs>
                    <LinearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor="#F0DEA8" />
                        <Stop offset="100%" stopColor="#C9A961" />
                    </LinearGradient>
                </Defs>
                <Rect width={w} height={h} rx={4} fill="url(#chipGrad)" />
                <Line x1={0} y1={h * 0.42} x2={w} y2={h * 0.42} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
                <Line x1={0} y1={h * 0.7} x2={w} y2={h * 0.7} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
                <Line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
            </Svg>
        </View>
    );
}

// Type badge — the visual cue that makes débito vs. crédito
// distinguishable at a glance in a mixed grid, not just by content.
// Débito: outlined, transparent — blends into the card. Crédito:
// filled white — reads as "this one costs you money", a small nod to
// the same "moneyOut gets the strong treatment" rule used everywhere
// else, without actually borrowing the theme's moneyOut color onto a
// non-themed card face.
function TypeBadge({ type, compact }) {
    const isCredit = type === 'credit';
    const label = isCredit ? 'CRÉDITO' : 'DÉBITO';
    return (
        <View style={[styles.badge, isCredit ? styles.badgeCredit : styles.badgeDebit, compact && styles.badgeCompact]}>
            <Text style={[
                styles.badgeText,
                isCredit ? styles.badgeTextCredit : styles.badgeTextDebit,
                compact && styles.badgeTextCompact,
            ]}>
                {label}
            </Text>
        </View>
    );
}

// variant: 'grid' (compact tile), 'preview' (live preview while
// creating/editing), 'detail' (header of the detail sheet — same
// size as preview, just semantically separate).
export default function CardFace({
    name,
    type = 'debit',
    color,
    pattern,
    valueLabel,
    valueText,
    progressPct,
    variant = 'grid',
    placeholder,
    // Animated.Value (0–1), optional. Lets a parent (FocusStack) drive
    // the amount's visibility explicitly instead of relying on one
    // card being physically covered by another — see FocusStack.jsx
    // for why that distinction matters. Every other caller omits this
    // and gets the old always-visible behavior for free.
    amountOpacity,
    // Number (px), optional. Nudges the name/badge row up (negative)
    // or down (positive) without touching the card's own padding —
    // FocusStack uses this to sit the name closer to the top edge on
    // a peeking (non-focused) card, where there's only ~44px of the
    // card actually visible. Omit it and you get the normal position.
    headerOffsetY,
    // String, optional (e.g. "$400" or "$400 ·2"). Shows a small pill
    // in the card's bottom-right corner — the one spot its layout
    // leaves empty (name+badge own the top row, value+progress sit at
    // the bottom-LEFT) — with a lock icon in front of it. Used on
    // débito/efectivo cards that have at least one apartado linked to
    // them, so "part of this balance is already spoken for" is
    // visible without opening the card's detail sheet. Omit it and
    // nothing renders — every other caller is unaffected.
    savingsBadge,
}) {
    const isCompact = variant === 'grid';
    const bg = color || '#1A1A2E';
    const [size, setSize] = useState({ width: 0, height: 0 });
    const BottomWrapper = amountOpacity ? Animated.View : View;

    return (
        <View
            style={[
                styles.card,
                isCompact ? styles.cardCompact : styles.cardLarge,
                { backgroundColor: bg },
            ]}
            onLayout={e => setSize({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height,
            })}
        >
            {size.width > 0 && size.height > 0 && (
                <PatternOverlay pattern={pattern} width={size.width} height={size.height} />
            )}

            <View style={[styles.top, headerOffsetY !== undefined && { marginTop: headerOffsetY }]}>
                <Text
                    style={[styles.name, isCompact && styles.nameCompact]}
                    numberOfLines={1}
                >
                    {name || placeholder || 'Nombre'}
                </Text>
                <TypeBadge type={type} compact={isCompact} />
            </View>

            <Chip compact={isCompact} />

            {valueLabel !== undefined && (
                <BottomWrapper style={[styles.bottom, amountOpacity ? { opacity: amountOpacity } : null]}>
                    <Text style={[styles.valueLabel, isCompact && styles.valueLabelCompact]}>
                        {valueLabel}
                    </Text>
                    <Text style={[styles.valueText, isCompact && styles.valueTextCompact]} numberOfLines={1}>
                        {valueText}
                    </Text>
                    {progressPct !== undefined && (
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                        </View>
                    )}
                </BottomWrapper>
            )}

            {savingsBadge && (
                <View style={styles.savingsBadge}>
                    <IconLock color="#FFFFFF" size={9} />
                    <Text style={styles.savingsBadgeText} numberOfLines={1}>{savingsBadge}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'space-between',
    },
    savingsBadge: {
        position: 'absolute',
        right: Spacing.md, bottom: Spacing.md,
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: Radius.full,
        maxWidth: '48%',
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    savingsBadgeText: {
        fontSize: FontSize.xs, fontWeight: '700', color: '#FFFFFF',
    },
    cardCompact: {
        padding: Spacing.md,
        height: 132,
    },
    cardLarge: {
        padding: Spacing.lg,
        height: CARD_LARGE_HEIGHT,
    },
    // Positioned to land just under the name/badge row in each
    // variant — tuned against that row's actual text size (padding +
    // one line of nameCompact/name), not a guess independent of it.
    chipWrap: { position: 'absolute', zIndex: 2 },
    chipWrapCompact: { left: Spacing.md, top: 50 },
    chipWrapLarge: { left: Spacing.lg, top: 68 },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
        gap: Spacing.xs,
    },
    name: {
        fontSize: FontSize.xl, fontWeight: '800',
        color: '#FFFFFF', letterSpacing: -0.3, flex: 1,
    },
    nameCompact: {
        fontSize: FontSize.md, fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 6, paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    badgeCompact: { paddingHorizontal: 5, paddingVertical: 2 },
    badgeDebit: {
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderColor: 'rgba(255,255,255,0.35)',
    },
    badgeCredit: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderColor: 'rgba(255,255,255,0.92)',
    },
    badgeText: {
        fontSize: FontSize.xs, fontWeight: '800',
        letterSpacing: 0.6,
    },
    badgeTextDebit: { color: '#FFFFFF' },
    badgeTextCredit: { color: '#1A1A2E' },
    // Deliberately a hair under FontSize.xs — the grid/compact card
    // is small enough that the scale's own smallest step still reads
    // as slightly too big for a decorative corner badge. Everywhere
    // else in the app, FontSize.xs is the floor.
    badgeTextCompact: { fontSize: 8 },
    bottom: { zIndex: 2 },
    valueLabel: {
        fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)',
        fontWeight: '600', letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 2,
    },
    // Same deliberate exception as badgeTextCompact above.
    valueLabelCompact: { fontSize: 9 },
    valueText: {
        fontSize: FontSize.xl, fontWeight: '800',
        color: '#FFFFFF', letterSpacing: -0.5,
    },
    valueTextCompact: { fontSize: FontSize.md },
    progressTrack: {
        height: 3, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.18)',
        overflow: 'hidden', marginTop: 6,
    },
    progressFill: {
        height: '100%', backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
});