// Stylesheet for HomeScreen

import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    scroll: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.paper,
    },

    // Header
    header: {
        backgroundColor: Colors.ink,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    greeting: {
        fontSize: FontSize.lg,
        color: 'rgba(255,255,255,0.5)',
    },
    userName: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.white,
        marginTop: 2,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.sage,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.md,
    },
    balanceLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: Spacing.xs,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: -1,
    },

    // Account handling
    accountsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.lg,
        paddingBottom: 0,
    },
    accountPill: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        padding: Spacing.md,
        ...Shadow.card,
    },
    accountIcon: {
        fontSize: 20,
        marginBottom: Spacing.xs,
    },
    accountLabel: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: '600',
        marginBottom: 2,
    },
    accountAmount: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
    },

    // Buttons
    actionRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.lg,
        paddingBottom: 0,
    },
    btnPrimary: {
        flex: 1,
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: FontSize.sm,
    },
    btnOutline: {
        flex: 1,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
    },
    btnOutlineText: {
        color: Colors.ink,
        fontWeight: '500',
        fontSize: FontSize.sm,
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
        fontWeight: '600',
        color: Colors.ink,
    },
    sectionLink: {
        fontSize: FontSize.sm,
        color: Colors.muted,
    },

    // Credit Cards
    creditCardRow: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadow.card,
    },
    creditCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    credCardName: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.ink,
    },
    creditCardDebt: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: Colors.red,
    },
    progressBat: {
        height: 4,
        backgroundColor: Colors.warmMid,
        borderRadius: 2,
        overflow: 'hidden',
    },
    creditCardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.xs,
    },
    metaText: {
        fontSize: FontSize.xs,
        color: Colors.muted,
    },

    // Recent transactions
    txnItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.warmMid,
    },
    txnIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txnIconIncome: { backgroundColor: Colors.sageLt },
    txnIconExpense: { backgroundColor: Colors.redLt },
    txnIconWithdrawal: { backgroundColor: Colors.amberLt },
    txnIconEmoji: { fontSize: 16 },
    txnInfo: { flex: 1 },
    txnName: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        color: Colors.ink,
    },
    txnSub: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 1,
    },
    txnAmount: {
        fontSize: FontSize.sm,
        fontWeight: '700',
    },
    amountPos: { color: Colors.sage },
    amountNeg: { color: Colors.red },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        collor: Colors.muted,
    },
    emptySubText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },

    bottomPadding: { height: Spacing.xl },
});

