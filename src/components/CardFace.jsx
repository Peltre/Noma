// Reusable visual "card" — used for the grid tile in Tarjetas, the
// live preview while creating/editing one, and the header of its
// detail sheet. One component, one set of rules, instead of three
// near-copies drifting apart over time.
//
// Deliberately a fixed dark-on-color palette regardless of app theme
// (same reasoning CardsScreen.styles.js already had): it's meant to
// look like a physical card, not a themed surface.
import { useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Circle, Rect } from 'react-native-svg';
import { FontSize, Spacing, Radius } from '../constants';
import { IconLock } from './Icons';

// Shared with FocusStack.jsx so the stack's slot math always matches
// whatever height the "large" card face actually renders at.
export const CARD_LARGE_HEIGHT = 190;

// Small set of subtle repeating textures a card can carry on top of
// its color — same minimalist, hand-drawn SVG language as the rest of
// the app's icon set (no photos, no gradients pretending to be a real
// card). Low-opacity white so it reads as texture, not print.
export const CARD_PATTERNS = [
    { id: 'none', label: 'Liso' },
    { id: 'diagonal', label: 'Diagonal' },
    { id: 'dots', label: 'Puntos' },
    { id: 'waves', label: 'Ondas' },
    { id: 'grid', label: 'Cuadros' },
];

const TINT = 'rgba(255,255,255,0.12)';

// width/height are required, explicit pixel numbers — not "100%".
// Same reason as NightSkyArt.jsx: react-native-svg doesn't reliably
// stretch a percentage-sized Svg to match an auto-size flex parent on
// native, so the pattern rendered smaller than the card and left part
// of it uncovered. The card measures itself with onLayout and passes
// its real size down instead.
function PatternOverlay({ pattern, width, height }) {
    if (!pattern || pattern === 'none') return null;
    return (
        <Svg
            style={{ position: 'absolute', top: 0, left: 0 }}
            width={width}
            height={height}
            pointerEvents="none"
        >
            <Defs>
                <Pattern
                    id="cardTexture"
                    patternUnits="userSpaceOnUse"
                    width={pattern === 'dots' ? 14 : 20}
                    height={pattern === 'dots' ? 14 : 20}
                >
                    {pattern === 'diagonal' && (
                        <Path d="M-5,5 l10,-10 M0,20 l20,-20 M15,25 l10,-10" stroke={TINT} strokeWidth={2} />
                    )}
                    {pattern === 'dots' && (
                        <Circle cx={7} cy={7} r={1.5} fill={TINT} />
                    )}
                    {pattern === 'waves' && (
                        <Path d="M0,10 Q5,3 10,10 T20,10" stroke={TINT} strokeWidth={1.6} fill="none" />
                    )}
                    {pattern === 'grid' && (
                        <Path d="M20,0 L0,0 0,20" stroke={TINT} strokeWidth={1.2} fill="none" />
                    )}
                </Pattern>
            </Defs>
            <Rect width={width} height={height} fill="url(#cardTexture)" />
        </Svg>
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
            <View style={styles.orb} />

            <View style={[styles.top, headerOffsetY !== undefined && { marginTop: headerOffsetY }]}>
                <Text
                    style={[styles.name, isCompact && styles.nameCompact]}
                    numberOfLines={1}
                >
                    {name || placeholder || 'Nombre'}
                </Text>
                <TypeBadge type={type} compact={isCompact} />
            </View>

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
        fontSize: 10, fontWeight: '700', color: '#FFFFFF',
    },
    cardCompact: {
        padding: Spacing.md,
        height: 132,
    },
    cardLarge: {
        padding: Spacing.lg,
        height: CARD_LARGE_HEIGHT,
    },
    orb: {
        position: 'absolute', width: 160, height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -50, right: -50,
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
        gap: Spacing.xs,
    },
    name: {
        fontSize: FontSize.lg, fontWeight: '800',
        color: '#FFFFFF', letterSpacing: -0.3, flex: 1,
    },
    nameCompact: {
        fontSize: FontSize.sm, fontWeight: '700',
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
        fontSize: 9, fontWeight: '800',
        letterSpacing: 0.6,
    },
    badgeTextDebit: { color: '#FFFFFF' },
    badgeTextCredit: { color: '#1A1A2E' },
    badgeTextCompact: { fontSize: 8 },
    bottom: { zIndex: 2 },
    valueLabel: {
        fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)',
        fontWeight: '600', letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 2,
    },
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