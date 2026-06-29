// SavingsScreen.styles.js
import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },

    // Hero
    hero: {
        backgroundColor: Colors.ink,
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
        borderColor: 'rgba(107,84,196,0.18)',
        backgroundColor: 'transparent',
        bottom: -80, right: -60,
    },
    // Small solid dot top-left — counterpoint
    heroDot: {
        position: 'absolute',
        width: 10, height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(13,139,133,0.35)',
        top: 20, left: 0,
    },
    heroLabel: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: Spacing.xs,
        zIndex: 2,
    },
    heroAmount: {
        fontSize: 44,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: -2,
        zIndex: 2,
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
        color: Colors.ink,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    sectionAction: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.violet,
    },

    // Empty state
    emptyCard: {
        borderWidth: 1.5,
        borderColor: Colors.mid,
        borderStyle: 'dashed',
        borderRadius: Radius.sm,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    emptyCardText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },
    emptyCardSub: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },

    // Accounts group
    accountsGroup: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Shadow.card,
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.mid,
    },
    accountRowLast: { borderBottomWidth: 0 },
    accountInfo: { flex: 1 },
    accountName: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
        marginBottom: 2,
    },
    accountBalance: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        fontWeight: '500',
    },
    accountActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    actionBtn: {
        width: 30, height: 30,
        borderRadius: 9,
        backgroundColor: Colors.violetLt,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.violet,
        lineHeight: 18,
    },
    deleteText: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        paddingHorizontal: Spacing.xs,
    },

    // Goal card
    goalCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Shadow.card,
    },
    goalCardComplete: {
        borderColor: Colors.teal,
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
        color: Colors.ink,
        marginBottom: 2,
    },
    goalDeadline: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        textTransform: 'capitalize',
    },
    goalDeleteText: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        paddingLeft: Spacing.sm,
    },

    // Progress bar
    progressBg: {
        height: 5,
        backgroundColor: Colors.mid,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.violet,
        borderRadius: 3,
    },
    progressFillComplete: { backgroundColor: Colors.teal },

    goalAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    goalSaved: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: Colors.violet,
        letterSpacing: -0.3,
    },
    goalPct: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
    },
    goalTarget: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        fontWeight: '500',
    },

    suggestionRow: {
        backgroundColor: Colors.violetLt,
        borderRadius: Radius.sm - 2,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    suggestionText: {
        fontSize: FontSize.xs,
        color: Colors.violet,
        fontWeight: '600',
        textAlign: 'center',
    },
    completeRow: { alignItems: 'center', marginBottom: Spacing.sm },
    completeText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.teal,
        letterSpacing: 0.3,
    },

    goalBtns: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    goalBtnDeposit: {
        flex: 1,
        backgroundColor: Colors.violet,
        borderRadius: Radius.sm - 2,
        paddingVertical: 10,
        alignItems: 'center',
    },
    goalBtnDepositText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.white,
    },
    goalBtnWithdraw: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        borderRadius: Radius.sm - 2,
        borderWidth: 1.5,
        borderColor: Colors.mid,
        alignItems: 'center',
    },
    goalBtnWithdrawText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },

    // Bottom sheet
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.paper,
        borderTopLeftRadius: Radius.lg,
        borderTopRightRadius: Radius.lg,
        padding: Spacing.lg,
        paddingBottom: 44,
        ...Shadow.float,
        maxHeight: '90%',
    },
    sheetHandle: {
        width: 36, height: 4,
        backgroundColor: Colors.mid,
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
        color: Colors.ink,
        letterSpacing: -0.3,
        marginBottom: Spacing.xs,
    },
    sheetSubtitle: {
        fontSize: FontSize.md,
        color: Colors.muted,
        marginBottom: Spacing.lg,
        fontWeight: '500',
    },
    sheetLabel: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    sheetInput: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.ink,
        borderWidth: 1,
        borderColor: Colors.mid,
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
        borderColor: Colors.ink,
    },

    // Account preview (in AddAccountModal)
    accountPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.mid,
    },
    accountPreviewName: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.ink,
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
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.mid,
    },
    chipActive: {
        backgroundColor: Colors.violetLt,
        borderColor: Colors.violet,
    },
    chipDot: { width: 8, height: 8, borderRadius: 4 },
    chipText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },
    chipTextActive: { color: Colors.violet },
    emptyChipText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
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
        borderWidth: 2, borderColor: Colors.mid,
        backgroundColor: Colors.white,
        justifyContent: 'center', alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.violet,
        borderColor: Colors.violet,
    },
    checkmark: { color: Colors.white, fontSize: 13, fontWeight: '700' },
    toggleText: { fontSize: FontSize.md, color: Colors.ink, fontWeight: '500' },
    dateRow: { flexDirection: 'row', gap: Spacing.sm },

    // Sheet buttons
    sheetBtns: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.lg,
    },
    btnCancel: {
        flex: 1, height: 52, borderRadius: Radius.sm,
        backgroundColor: Colors.mid,
        justifyContent: 'center', alignItems: 'center',
    },
    btnCancelText: {
        fontSize: FontSize.md, fontWeight: '600', color: Colors.ink,
    },
    btnPrimary: {
        flex: 2, height: 52, borderRadius: Radius.sm,
        backgroundColor: Colors.violet,
        justifyContent: 'center', alignItems: 'center',
    },
    btnDisabled: { backgroundColor: Colors.mid },
    btnPrimaryText: {
        fontSize: FontSize.md, fontWeight: '700', color: Colors.white,
    },
});