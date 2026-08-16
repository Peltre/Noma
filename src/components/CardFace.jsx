// Reusable visual "card" — used for the grid tile in Tarjetas, the
// live preview while creating/editing one, and its detail sheet
// header. One component instead of three near-copies drifting apart.
//
// Fixed dark-on-color palette regardless of app theme — meant to look
// like a physical card, not a themed surface. (The color itself comes
// from the active theme's cardColors — see AddCardScreen.jsx — but
// once picked, always renders dark-on-color.)
import { useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from 'react-native-svg';
import { FontSize, Spacing, Radius } from '../constants';
import { IconLock } from './Icons';

// Shared with FocusStack.jsx so the stack's slot math matches the
// "large" card face's real rendered height.
export const CARD_LARGE_HEIGHT = 190;

// Only two options — a previous set of hand-composed scenes (stars/
// dunes/skyline) had a rendering mismatch that couldn't be tracked
// down, so this keeps the two lowest-risk options: none, and a plain
// gradient wash (sized directly off the card's real width/height).
export const CARD_PATTERNS = [
    { id: 'none', label: 'Liso' },
    { id: 'gradient', label: 'Degradado' },
];

// width/height are required, explicit pixels — react-native-svg
// doesn't reliably stretch a percentage-sized Svg on native, so the
// card measures itself with onLayout and passes its real size down.
// pointerEvents="none" on a wrapper View, not on <Svg> directly —
// react-native-svg's root doesn't reliably forward that prop, which
// can swallow taps meant for the TouchableOpacity underneath.
function PatternOverlay({ pattern, width, height }) {
    if (!pattern || pattern !== 'gradient') return null;

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

// EMV chip — gold gradient rect with contact-pad divider lines,
// absolutely positioned under the name/badge row (the layout's top
// and bottom are pinned to their own edges via space-between, so the
// chip needs a fixed spot rather than sharing that distribution).
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

// Débito vs. crédito at a glance in a mixed grid. Débito: outlined,
// transparent. Crédito: filled white — reads as "this one costs you
// money" without borrowing the theme's moneyOut color onto a
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

// variant: 'grid' (compact tile), 'preview' (live create/edit),
// 'detail' (detail sheet header — same size as preview).
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
    // Animated.Value (0–1), optional — lets FocusStack drive the
    // amount's visibility explicitly instead of relying on physical
    // overlap. Omit for the normal always-visible behavior.
    amountOpacity,
    // Number (px), optional — nudges the name/badge row up/down
    // without touching padding. FocusStack uses this on a peeking
    // (non-focused) card, where only ~44px is visible.
    headerOffsetY,
    // String, optional (e.g. "$400" or "$400 ·2") — a small locked
    // pill in the bottom-right corner, the one empty spot in this
    // layout. Shown on débito/efectivo cards with an apartado linked,
    // so "part of this is already spoken for" is visible without
    // opening the detail sheet.
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
    // Tuned to land just under the name/badge row in each variant.
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
    // A hair under FontSize.xs — the app's usual floor — since this
    // corner badge on the compact card reads too big otherwise.
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