// CardsScreen styles — theme-driven, same pattern as Home/History.
// The card face itself (color, pattern, badge) lives in
// CardFace.jsx's own StyleSheet, and the stacking/animation
// mechanics live in FocusStack.jsx — everything here is screen
// chrome: header, deck headers, empty states, sheets, popover.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createCardsStyles(theme) {
    return StyleSheet.create({

        safeArea: { flex: 1, backgroundColor: 'transparent' },

        // Header
        header: {
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
        },
        title: { fontSize: FontSize.xxl, fontWeight: '900', color: theme.ink, letterSpacing: -1 },
        addBtn: {
            width: 40, height: 40,
            borderRadius: Radius.full,
            backgroundColor: theme.brand,
            justifyContent: 'center', alignItems: 'center',
        },

        // Empty state (no cards at all)
        emptyState: {
            alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl,
        },
        emptyIconWrap: {
            width: 64, height: 64, borderRadius: Radius.md,
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

        // Empty state for a single type (one deck has zero cards while
        // the other doesn't) — a slim dashed prompt instead of a
        // header for zero cards.
        emptyTypeRow: {
            marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
            paddingVertical: 18, borderRadius: Radius.sm,
            borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed',
            alignItems: 'center',
        },
        emptyTypeText: { fontSize: FontSize.sm, fontWeight: '700', color: theme.muted },

        // Deck section (Débito / Crédito) header
        deckSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
        deckHead: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingVertical: 10,
        },
        deckHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
        deckDot: { width: 9, height: 9, borderRadius: 5 },
        deckTitle: { fontSize: FontSize.md, fontWeight: '800', color: theme.ink },
        deckCount: {
            fontSize: FontSize.xs, fontWeight: '700', color: theme.muted,
            backgroundColor: theme.border, paddingHorizontal: 7, paddingVertical: 2,
            borderRadius: Radius.full,
        },
        deckHeadRight: { flexDirection: 'row', alignItems: 'center', gap: 9 },
        deckTotal: { fontSize: FontSize.sm, fontWeight: '800', color: theme.ink },
        chevCollapsed: { transform: [{ rotate: '-90deg' }] },
        deckStackWrap: { paddingBottom: Spacing.sm },

        // Long-press quick-actions popover
        popoverBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
        popover: {
            position: 'absolute',
            flexDirection: 'row', gap: Spacing.xs,
            backgroundColor: theme.surface, borderRadius: Radius.md,
            borderWidth: 1, borderColor: theme.border,
            padding: Spacing.xs,
            ...Shadow.float,
        },
        popoverBtn: { alignItems: 'center', width: 56, paddingVertical: 6, borderRadius: Radius.sm },
        popoverIconWrap: {
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center', marginBottom: 4,
        },
        popoverLabel: { fontSize: FontSize.xs, fontWeight: '700', color: theme.ink },

        // Type picker (Débito / Crédito), shown before AddCardScreen
        typePickRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
        typePickBtn: {
            flex: 1, borderRadius: Radius.md, borderWidth: 1.5,
            paddingVertical: 22, alignItems: 'center',
        },
        typePickText: { fontSize: FontSize.md, fontWeight: '800', color: theme.ink },

        // Detail rows card (shown inside the detail sheet)
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

        // Pay button (inside detail sheet, credit only)
        payBtn: {
            backgroundColor: theme.ink,
            borderRadius: Radius.sm,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: Spacing.sm,
        },
        payBtnText: { color: theme.bg, fontWeight: '700', fontSize: FontSize.sm },

        // Sheets (pay / detail / type-picker) — shared shell
        modalBg: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        sheet: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.lg,
            paddingBottom: 44,
        },
        sheetHandle: {
            width: 36, height: 4,
            backgroundColor: theme.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: Spacing.lg,
        },
        sheetTitle: {
            fontSize: FontSize.xl, fontWeight: '800',
            color: theme.ink, letterSpacing: -0.3,
            marginBottom: 2, textAlign: 'center',
        },
        sheetSubtitle: {
            fontSize: FontSize.sm, color: theme.muted,
            marginBottom: Spacing.lg, textAlign: 'center',
        },
        sheetLabel: {
            fontSize: FontSize.xs, fontWeight: '800',
            color: theme.muted, textTransform: 'uppercase',
            letterSpacing: 1, marginTop: Spacing.md, marginBottom: Spacing.xs,
        },
        sheetInput: {
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            fontSize: FontSize.md, color: theme.ink,
            borderWidth: 1, borderColor: theme.border,
        },
        sheetInputLarge: {
            fontSize: FontSize.xxl, fontWeight: '800',
            textAlign: 'center', letterSpacing: -1,
        },
        chipRow: {
            flexDirection: 'row', flexWrap: 'wrap',
            gap: Spacing.sm, marginTop: Spacing.xs,
        },
        chip: {
            paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
            borderRadius: Radius.full, backgroundColor: theme.bg,
            borderWidth: 1.5, borderColor: theme.border,
        },
        chipActive: {
            backgroundColor: theme.moneyOutSoft,
            borderColor: theme.moneyOut,
        },
        chipText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.muted },
        chipTextActive: { color: theme.moneyOut },
        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
        btnCancel: {
            flex: 1, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
        },
        btnCancelText: { fontSize: FontSize.md, fontWeight: '600', color: theme.ink },
        btnPrimary: {
            flex: 2, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.moneyOut,
            justifyContent: 'center', alignItems: 'center',
        },
        // Delete action in the detail sheet — same shape as btnPrimary
        // but its own name since its color is conditional (moneyOut
        // when deletable, border/muted when blocked) and the "Editar"
        // action shares this row too.
        btnDelete: {
            flex: 2, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.moneyOut,
            justifyContent: 'center', alignItems: 'center',
        },
        btnDisabled: { backgroundColor: theme.border },
        btnPrimaryText: { fontSize: FontSize.md, fontWeight: '700', color: theme.brandOn },
    });
}