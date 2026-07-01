// CardsScreen styles — theme-driven, same pattern as Home/History.
// The visual card itself (visualCard*) intentionally keeps its own
// dark palette (CARD_COLORS in the screen) regardless of app theme —
// it's meant to look like a physical card, not a themed surface.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createCardsStyles(theme) {
    return StyleSheet.create({

        safeArea: { flex: 1, backgroundColor: theme.bg },

        // Header
        header: {
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
        },
        title: { fontSize: FontSize.xxl, fontWeight: '900', color: theme.ink, letterSpacing: -1 },
        addBtn: {
            paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
            borderRadius: Radius.full,
            backgroundColor: theme.ink,
        },
        addBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: theme.bg },

        // Empty state
        emptyState: {
            alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl,
        },
        emptyIconWrap: {
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
            marginBottom: Spacing.md,
        },
        emptyTitle: {
            fontSize: FontSize.lg, fontWeight: '800',
            color: theme.ink, marginBottom: Spacing.xs,
        },
        emptySub: {
            fontSize: FontSize.sm, color: theme.muted,
            textAlign: 'center', lineHeight: 20,
            marginBottom: Spacing.lg,
        },
        emptyBtn: {
            backgroundColor: theme.ink, borderRadius: Radius.sm,
            paddingVertical: 12, paddingHorizontal: Spacing.lg,
        },
        emptyBtnText: { color: theme.bg, fontWeight: '700', fontSize: FontSize.sm },

        // Card list
        list: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
        cardWrap: {},

        // Visual card (dark, like a real credit card — fixed palette,
        // not theme-dependent; see note at top of file)
        visualCard: {
            borderRadius: Radius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.sm,
            overflow: 'hidden',
            position: 'relative',
        },
        visualCardOrb: {
            position: 'absolute', width: 200, height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(255,255,255,0.04)',
            top: -60, right: -60,
        },
        visualCardTop: {
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: Spacing.xl,
            zIndex: 2,
        },
        visualCardName: {
            fontSize: FontSize.lg, fontWeight: '800',
            color: '#FFFFFF', letterSpacing: -0.3, flex: 1,
        },
        chipWrap: {
            width: 30, height: 22, borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.18)',
            justifyContent: 'center', alignItems: 'center',
        },
        chipInner: {
            width: 18, height: 13, borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
        },
        visualCardBottom: {
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'flex-end', zIndex: 2, marginBottom: Spacing.md,
        },
        debtLbl: {
            fontSize: FontSize.xs, color: 'rgba(255,255,255,0.45)',
            fontWeight: '600', letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 2,
        },
        debtAmt: {
            fontSize: FontSize.xxl, fontWeight: '900',
            color: '#FFFFFF', letterSpacing: -1,
        },
        limitBlock: { alignItems: 'flex-end' },
        limitLbl: {
            fontSize: FontSize.xs, color: 'rgba(255,255,255,0.4)',
            fontWeight: '600', textTransform: 'uppercase',
            letterSpacing: 1, marginBottom: 2,
        },
        limitAmt: {
            fontSize: FontSize.lg, fontWeight: '700',
            color: 'rgba(255,255,255,0.7)',
        },
        progressTrack: {
            height: 3, borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.15)',
            overflow: 'hidden', marginBottom: 6, zIndex: 2,
        },
        progressFill: {
            height: '100%', backgroundColor: theme.moneyOut,
            borderRadius: 2,
        },
        pctText: {
            fontSize: FontSize.xs, color: 'rgba(255,255,255,0.35)',
            fontWeight: '600', zIndex: 2,
        },

        // Detail rows card
        detailCard: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            overflow: 'hidden',
            marginBottom: Spacing.sm,
            borderWidth: 1, borderColor: theme.border,
            ...Shadow.card,
        },
        detailRow: {
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', padding: Spacing.md,
            borderBottomWidth: 1, borderBottomColor: theme.border,
        },
        detailKey: { fontSize: FontSize.sm, color: theme.muted, fontWeight: '500' },
        detailVal: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '700' },

        // Pay button
        payBtn: {
            backgroundColor: theme.ink,
            borderRadius: Radius.sm,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: Spacing.sm,
        },
        payBtnDone: { backgroundColor: theme.border },
        payBtnText: { color: theme.bg, fontWeight: '700', fontSize: FontSize.sm },
    });
}