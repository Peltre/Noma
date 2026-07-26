// HomeScreen styles, v3. Now depend on the active theme (Arena,
// Medianoche, Brasa) instead of fixed colors. Used as
// createHomeStyles(theme) inside the screen.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius } from '../constants';

export default function createHomeStyles(theme) {
    return StyleSheet.create({

        safeArea: {
            flex: 1,
            backgroundColor: theme.bg,
        },
        scroll: {
            flex: 1,
            backgroundColor: theme.bg,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.bg,
        },

        // Header and balance share one card so the night art has a
        // single full box to live in (no clipping), with a tone slightly
        // lighter than the page bg to separate the hero from the rest.
        heroCard: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
            borderRadius: Radius.lg,
            backgroundColor: theme.surface,
            overflow: 'hidden',
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.lg,
        },
        heroHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
        },
        kebabBtn: {
            paddingLeft: Spacing.sm,
            paddingVertical: Spacing.xs,
            justifyContent: 'center', alignItems: 'center', gap: 3,
        },
        kebabDot: {
            width: 3.5, height: 3.5, borderRadius: 2,
            backgroundColor: theme.ink, opacity: 0.85,
        },
        greeting: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.muted,
            marginBottom: 3,
        },
        userName: {
            fontSize: FontSize.xl,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -0.4,
        },
        avatar: {
            width: 38, height: 38,
            borderRadius: 19,
            backgroundColor: theme.brand,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarText: {
            color: theme.brandOn,
            fontWeight: '800',
            fontSize: FontSize.md,
        },

        // Balance
        heroBalance: {
            marginTop: Spacing.lg,
            zIndex: 1,
        },
        balanceLabel: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: theme.muted,
            marginBottom: Spacing.xs,
        },
        balanceAmount: {
            fontSize: FontSize.hero,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -1.5,
        },
        balanceRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: Spacing.sm,
        },
        trendPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: Spacing.sm + 2,
            paddingVertical: 5,
            borderRadius: Radius.full,
        },
        trendPillText: {
            fontSize: FontSize.xs,
            fontWeight: '700',
        },

        // Allocation bar (replaces the old pills)
        alloc: {
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.md,
        },
        allocBar: {
            height: 10,
            borderRadius: Radius.sm / 2,
            overflow: 'hidden',
            flexDirection: 'row',
            backgroundColor: theme.border,
        },
        allocLegend: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: Spacing.sm,
        },
        allocItem: { flex: 1 },
        allocLabelRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        allocDot: {
            width: 7, height: 7,
            borderRadius: 4,
        },
        allocLabel: {
            fontSize: FontSize.xs - 1,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: theme.muted,
        },
        allocValue: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
            marginTop: 3,
        },
        allocManageLink: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.brand,
            marginTop: Spacing.sm,
            textAlign: 'center',
        },

        // Action buttons
        // Sections
        section: {
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.sm,
        },
        sectionTitle: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.muted,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
        },
        sectionLink: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.brand,
        },

        // Credit card
        creditCard: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            marginBottom: Spacing.sm,
            borderWidth: 1,
            borderColor: theme.border,
        },
        creditCardTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: Spacing.sm,
        },
        creditCardName: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
        },
        creditCardDebt: {
            fontSize: FontSize.sm,
            fontWeight: '800',
            color: theme.moneyOut,
            letterSpacing: -0.3,
        },
        creditCardLimit: {
            fontSize: FontSize.xs,
            color: theme.muted,
            textAlign: 'right',
            marginTop: 1,
        },
        progressTrack: {
            height: 4,
            backgroundColor: theme.border,
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: Spacing.xs,
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.moneyIn,
            borderRadius: 2,
        },
        creditCardMeta: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        metaText: {
            fontSize: FontSize.xs,
            color: theme.muted,
            fontWeight: '500',
        },

        // Recent transactions
        txnCard: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
        },
        txnRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        txnRowLast: {
            borderBottomWidth: 0,
        },

        txnIconWrap: {
            width: 36, height: 36,
            borderRadius: Radius.sm,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
        },

        txnInfo: { flex: 1 },
        txnName: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.ink,
        },
        txnSub: {
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: 1,
        },
        txnRight: {
            alignItems: 'flex-end',
            gap: 3,
        },
        txnAmount: {
            fontSize: FontSize.sm,
            fontWeight: '800',
            letterSpacing: -0.4,
        },
        txnDate: {
            fontSize: FontSize.xs - 1,
            color: theme.muted,
            fontWeight: '500',
        },
        amountPos: { color: theme.moneyIn },
        amountExpense: { color: theme.moneyOut },
        amountNeg: { color: theme.ink },

        // Empty state
        emptyState: {
            alignItems: 'center',
            paddingVertical: Spacing.xl,
        },
        emptyText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.muted,
        },
        emptySubText: {
            fontSize: FontSize.sm,
            color: theme.muted,
            marginTop: Spacing.xs,
        },

        bottomPadding: { height: Spacing.xl + Spacing.lg },

        // MSI pay sheet (modal) — same visual language as the
        // pay-card sheet in CardsScreen, prefixed "msi" so these
        // don't collide with the actionRow's own btnPrimary above.
        msiModalBg: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        msiSheet: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.lg,
            paddingBottom: 44,
        },
        msiSheetHandle: {
            width: 36, height: 4,
            backgroundColor: theme.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: Spacing.lg,
        },
        msiSheetTitle: {
            fontSize: FontSize.xl, fontWeight: '800',
            color: theme.ink, letterSpacing: -0.3,
            marginBottom: 2, textAlign: 'center',
        },
        msiSheetSubtitle: {
            fontSize: FontSize.sm, color: theme.muted,
            marginBottom: Spacing.lg, textAlign: 'center',
        },
        msiSheetLabel: {
            fontSize: FontSize.xs, fontWeight: '800',
            color: theme.muted, textTransform: 'uppercase',
            letterSpacing: 1, marginTop: Spacing.md, marginBottom: Spacing.xs,
        },
        msiChipRow: {
            flexDirection: 'row', flexWrap: 'wrap',
            gap: Spacing.sm, marginTop: Spacing.xs,
        },
        msiChip: {
            paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
            borderRadius: Radius.full, backgroundColor: theme.bg,
            borderWidth: 1.5, borderColor: theme.border,
        },
        msiChipActive: {
            backgroundColor: theme.moneyOutSoft,
            borderColor: theme.moneyOut,
        },
        msiChipText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.muted },
        msiChipTextActive: { color: theme.moneyOut },
        msiSheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
        msiBtnCancel: {
            flex: 1, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
        },
        msiBtnCancelText: { fontSize: FontSize.md, fontWeight: '600', color: theme.ink },
        msiBtnPrimary: {
            flex: 2, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.moneyOut,
            justifyContent: 'center', alignItems: 'center',
        },
        msiBtnDisabled: { backgroundColor: theme.border },
        msiBtnPrimaryText: { fontSize: FontSize.md, fontWeight: '700', color: theme.brandOn },
    });
}