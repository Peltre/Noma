// Stylesheet for SavingsScreen
// SavingsScreen.styles.js
import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },

    // Header
    header: {
        backgroundColor: Colors.purple,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    headerLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: Spacing.xs,
    },
    headerAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: -1,
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
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.ink,
    },
    sectionAction: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.purple,
    },

    // Empty cards
    emptyCard: {
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        borderStyle: 'dashed',
        borderRadius: Radius.sm,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    emptyCardText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.muted,
    },
    emptyCardSub: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },

    // Saving acc cards
    accountCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadow.card,
    },
    accountCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    accountCardEmoji: {
        fontSize: 28,
    },
    accountCardName: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.ink,
    },
    accountCardBalance: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        marginTop: 2,
    },
    accountCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    accountActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.purpleLt,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountActionBtnText: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.purple,
        lineHeight: 20,
    },
    accountDeleteText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        paddingHorizontal: Spacing.xs,
    },

    // Goal card
    goalCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadow.card,
    },
    goalCardComplete: {
        borderWidth: 1.5,
        borderColor: Colors.sage,
    },
    goalCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    goalEmoji: {
        fontSize: 28,
    },
    goalInfo: {
        flex: 1,
    },
    goalName: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.ink,
    },
    goalDeadline: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 2,
    },
    goalDeleteBtn: {
        padding: Spacing.xs,
    },
    goalDeleteText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
    },

    // Progress bar
    progressBarBg: {
        height: 8,
        backgroundColor: Colors.warmMid,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.purple,
        borderRadius: 4,
    },
    progressBarFillComplete: {
        backgroundColor: Colors.sage,
    },

    goalAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    goalSaved: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.purple,
    },
    goalPercentage: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
    },
    goalTarget: {
        fontSize: FontSize.sm,
        color: Colors.muted,
    },

    // Monthly suggestion
    suggestionRow: {
        backgroundColor: Colors.purpleLt,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    suggestionText: {
        fontSize: FontSize.xs,
        color: Colors.purple,
        fontWeight: '600',
        textAlign: 'center',
    },

    completeRow: {
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    completeText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.sage,
    },

    // Goal buttons
    goalBtns: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    goalBtnDeposit: {
        flex: 1,
        backgroundColor: Colors.purple,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
        alignItems: 'center',
    },
    goalBtnDepositText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.white,
    },
    goalBtnWithdraw: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        alignItems: 'center',
    },
    goalBtnWithdrawText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },

    // Modals / Sheets
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheetScroll: {
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
    sheet: {
        backgroundColor: Colors.paper,
        borderTopLeftRadius: Radius.lg,
        borderTopRightRadius: Radius.lg,
        padding: Spacing.lg,
        paddingBottom: 40,
        ...Shadow.float,
    },
    sheetTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.ink,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    sheetSubtitle: {
        fontSize: FontSize.md,
        color: Colors.muted,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    sheetLabel: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
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
        borderColor: Colors.warmMid,
    },
    sheetInputLarge: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Emoji picker
    emojiRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    emojiBtn: {
        width: 44,
        height: 44,
        borderRadius: Radius.sm,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
    },
    emojiBtnActive: {
        borderColor: Colors.purple,
        backgroundColor: Colors.purpleLt,
    },
    emojiBtnText: {
        fontSize: 20,
    },

    // Account picker chips
    accountPickerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    accountChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
    },
    accountChipActive: {
        backgroundColor: Colors.purpleLt,
        borderColor: Colors.purple,
    },
    accountChipEmoji: {
        fontSize: 14,
    },
    accountChipText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },
    accountChipTextActive: {
        color: Colors.purple,
    },
    noAccountsText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        textAlign: 'center',
        paddingVertical: Spacing.md,
    },

    // Deadline toggle
    toggleDeadline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.warmMid,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.purple,
        borderColor: Colors.purple,
    },
    checkmark: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
    toggleDeadlineText: {
        fontSize: FontSize.md,
        color: Colors.ink,
        fontWeight: '500',
    },
    dateRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },

    // Sheet buttons
    sheetBtns: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.lg,
    },
    cancelBtn: {
        flex: 1,
        height: 52,
        borderRadius: Radius.sm,
        backgroundColor: Colors.warmMid,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.ink,
    },
    confirmBtn: {
        flex: 2,
        height: 52,
        borderRadius: Radius.sm,
        backgroundColor: Colors.purple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBtnDisabled: {
        backgroundColor: Colors.warmMid,
    },
    confirmBtnText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.white,
    },
});