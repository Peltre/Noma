// SavingsScreen.styles.js — theme-driven. Savings/goals keep using
// theme.brand as their accent (this is the old design's "violet =
// savings, MSI, main accent" role — brand is the token reserved for
// exactly that kind of primary, non money-in/out accent). Completed
// goals reuse moneyIn as a positive/done signal. The savings account
// dot colors (SAVINGS_COLORS in useSavings.js) stay fixed — they're
// user-chosen labels, not theme surfaces.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createSavingsStyles(theme) {
    return StyleSheet.create({

        safeArea: {
            flex: 1,
            backgroundColor: theme.bg,
        },

        // Hero
        hero: {
            backgroundColor: theme.surface,
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.lg + Spacing.sm,
            position: 'relative',
            overflow: 'hidden',
        },
        // Large arc peeking from bottom-right — like a coin
        heroArc: {
            position: 'absolute',
            width: 200, height: 200,
            borderRadius: 100,
            borderWidth: 28,
            borderColor: theme.brandSoft,
            backgroundColor: 'transparent',
            bottom: -80, right: -60,
        },
        // Small solid dot top-left — counterpoint
        heroDot: {
            position: 'absolute',
            width: 10, height: 10,
            borderRadius: 5,
            backgroundColor: theme.moneyInSoft,
            top: 20, left: 0,
        },
        heroLabel: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: theme.muted,
            marginBottom: Spacing.xs,
            zIndex: 2,
        },
        heroAmount: {
            fontSize: 44,
            fontWeight: '900',
            color: theme.ink,
            letterSpacing: -2,
            zIndex: 2,
        },
        breakdownRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            marginTop: Spacing.sm,
            zIndex: 2,
        },
        breakdownText: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.muted,
        },
        breakdownSub: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.savings,
        },
        breakdownRisk: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.moneyOut,
            lineHeight: 16,
        },
        inputHint: {
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: 4,
            fontWeight: '500',
        },

        // Sections
        section: {
            padding: Spacing.lg,
            paddingBottom: 0,
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
            color: theme.ink,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
        },
        sectionAction: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.brand,
        },

        // Empty state
        emptyCard: {
            borderWidth: 1.5,
            borderColor: theme.border,
            borderStyle: 'dashed',
            borderRadius: Radius.sm,
            padding: Spacing.lg,
            alignItems: 'center',
            marginBottom: Spacing.sm,
        },
        emptyCardText: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.muted,
        },
        emptyCardSub: {
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: Spacing.xs,
        },

        // Accounts group
        accountsGroup: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            overflow: 'hidden',
            marginBottom: Spacing.sm,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.card,
        },
        accountRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        accountRowLast: { borderBottomWidth: 0 },
        accountInfo: { flex: 1 },
        accountName: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: 2,
        },
        accountLinked: {
            fontSize: 10.5,
            color: theme.muted,
            fontWeight: '600',
            marginBottom: 2,
        },
        accountBalance: {
            fontSize: FontSize.xs,
            color: theme.muted,
            fontWeight: '500',
        },
        accountRisk: {
            fontSize: 10.5,
            color: theme.moneyOut,
            fontWeight: '700',
            marginTop: 2,
        },
        accountActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.xs,
        },
        actionBtn: {
            width: 30, height: 30,
            borderRadius: 9,
            backgroundColor: theme.brandSoft,
            justifyContent: 'center',
            alignItems: 'center',
        },
        actionBtnText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.brand,
            lineHeight: 18,
        },
        deleteText: {
            fontSize: FontSize.xs,
            color: theme.muted,
            paddingHorizontal: Spacing.xs,
        },

        // Goal card
        goalCard: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            marginBottom: Spacing.sm,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.card,
        },
        goalCardComplete: {
            borderColor: theme.moneyIn,
            borderWidth: 1.5,
        },
        goalHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: Spacing.md,
        },
        goalInfo: { flex: 1 },
        goalName: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: 2,
        },
        goalDeadline: {
            fontSize: FontSize.xs,
            color: theme.muted,
            textTransform: 'capitalize',
        },
        goalDeleteText: {
            fontSize: FontSize.xs,
            color: theme.muted,
            paddingLeft: Spacing.sm,
        },

        // Progress bar
        progressBg: {
            height: 5,
            backgroundColor: theme.border,
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: Spacing.xs,
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.brand,
            borderRadius: 3,
        },
        progressFillComplete: { backgroundColor: theme.moneyIn },

        goalAmounts: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.sm,
        },
        goalSaved: {
            fontSize: FontSize.sm,
            fontWeight: '800',
            color: theme.brand,
            letterSpacing: -0.3,
        },
        goalPct: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
        },
        goalTarget: {
            fontSize: FontSize.sm,
            color: theme.muted,
            fontWeight: '500',
        },

        suggestionRow: {
            backgroundColor: theme.brandSoft,
            borderRadius: Radius.sm - 2,
            padding: Spacing.sm,
            marginBottom: Spacing.sm,
        },
        suggestionText: {
            fontSize: FontSize.xs,
            color: theme.brand,
            fontWeight: '600',
            textAlign: 'center',
        },
        riskRow: {
            backgroundColor: theme.moneyOutSoft,
            borderRadius: Radius.sm - 2,
            padding: Spacing.sm,
            marginBottom: Spacing.sm,
        },
        riskText: {
            fontSize: FontSize.xs,
            color: theme.moneyOut,
            fontWeight: '600',
            textAlign: 'center',
        },
        completeRow: { alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
        completeText: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.moneyIn,
            letterSpacing: 0.3,
        },
        goalBtnRedeem: {
            backgroundColor: theme.savings,
            borderRadius: Radius.sm - 2,
            paddingVertical: 10,
            paddingHorizontal: Spacing.lg,
        },
        goalBtnRedeemText: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: '#FFFFFF',
        },

        goalBtns: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginTop: Spacing.xs,
        },
        goalBtnDeposit: {
            flex: 1,
            backgroundColor: theme.brand,
            borderRadius: Radius.sm - 2,
            paddingVertical: 10,
            alignItems: 'center',
        },
        goalBtnDepositText: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.brandOn,
        },
        goalBtnWithdraw: {
            paddingHorizontal: Spacing.md,
            paddingVertical: 10,
            borderRadius: Radius.sm - 2,
            borderWidth: 1.5,
            borderColor: theme.border,
            alignItems: 'center',
        },
        goalBtnWithdrawText: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.muted,
        },

        // Bottom sheet
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
            ...Shadow.float,
            maxHeight: '90%',
        },
        sheetHandle: {
            width: 36, height: 4,
            backgroundColor: theme.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: Spacing.lg,
        },
        sheetTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            marginBottom: Spacing.xs,
        },
        sheetTitle: {
            fontSize: FontSize.xl,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -0.3,
            marginBottom: Spacing.xs,
        },
        sheetSubtitle: {
            fontSize: FontSize.md,
            color: theme.muted,
            marginBottom: Spacing.lg,
            fontWeight: '500',
        },
        sheetLabel: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginTop: Spacing.md,
            marginBottom: Spacing.xs,
        },
        // Small tappable hint under an amount field (e.g. "Faltan X")
        sheetHint: {
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: -Spacing.xs,
            marginBottom: Spacing.xs,
            textDecorationLine: 'underline',
        },
        sheetHintSmall: {
            fontSize: 10.5,
            color: theme.muted,
            fontWeight: '500',
            lineHeight: 14,
            marginTop: Spacing.xs,
            marginBottom: Spacing.xs,
        },
        sheetInput: {
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            fontSize: FontSize.md,
            color: theme.ink,
            borderWidth: 1,
            borderColor: theme.border,
        },
        sheetInputLarge: {
            fontSize: 28,
            fontWeight: '800',
            textAlign: 'center',
            letterSpacing: -1,
        },

        // Color picker
        colorRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            marginTop: Spacing.xs,
        },
        colorDot: {
            width: 34, height: 34,
            borderRadius: 17,
        },
        colorDotActive: {
            borderWidth: 3,
            borderColor: theme.ink,
        },

        // Account preview (in AddAccountModal)
        accountPreview: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            marginBottom: Spacing.xs,
            borderWidth: 1,
            borderColor: theme.border,
        },
        accountPreviewName: {
            fontSize: FontSize.md,
            fontWeight: '600',
            color: theme.ink,
            flex: 1,
        },

        // Chips (account picker)
        chipRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            marginTop: Spacing.xs,
        },
        chip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.xs,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: Radius.full,
            backgroundColor: theme.bg,
            borderWidth: 1.5,
            borderColor: theme.border,
        },
        chipActive: {
            backgroundColor: theme.brandSoft,
            borderColor: theme.brand,
        },
        chipDot: { width: 8, height: 8, borderRadius: 4 },
        chipText: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.muted,
        },
        chipTextActive: { color: theme.brand },
        emptyChipText: {
            fontSize: FontSize.sm,
            color: theme.muted,
            textAlign: 'center',
            paddingVertical: Spacing.md,
        },

        // Deadline toggle
        toggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            marginTop: Spacing.md,
            marginBottom: Spacing.xs,
        },
        checkbox: {
            width: 22, height: 22, borderRadius: 6,
            borderWidth: 2, borderColor: theme.border,
            backgroundColor: theme.bg,
            justifyContent: 'center', alignItems: 'center',
        },
        checkboxActive: {
            backgroundColor: theme.brand,
            borderColor: theme.brand,
        },
        checkmark: { color: theme.brandOn, fontSize: 13, fontWeight: '700' },
        toggleText: { fontSize: FontSize.md, color: theme.ink, fontWeight: '500' },
        dateRow: { flexDirection: 'row', gap: Spacing.sm },

        // Sheet buttons
        sheetBtns: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginTop: Spacing.lg,
        },
        btnCancel: {
            flex: 1, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
        },
        btnCancelText: {
            fontSize: FontSize.md, fontWeight: '600', color: theme.ink,
        },
        btnPrimary: {
            flex: 2, height: 52, borderRadius: Radius.sm,
            backgroundColor: theme.brand,
            justifyContent: 'center', alignItems: 'center',
        },
        btnDisabled: { backgroundColor: theme.border },
        btnPrimaryText: {
            fontSize: FontSize.md, fontWeight: '700', color: theme.brandOn,
        },
    });
}