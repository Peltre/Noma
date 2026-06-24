// Stylesheet for History Screen

// src/screens/HistoryScreen.styles.js
import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    header: {
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.ink,
        marginBottom: Spacing.md,
    },
    filterRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    filterChip: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.warmMid,
        backgroundColor: Colors.white,
    },
    filterChipActive: {
        backgroundColor: Colors.ink,
        borderColor: Colors.ink,
    },
    filterChipText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },
    filterChipTextActive: {
        color: Colors.white,
    },
    statsBar: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadow.card,
    },
    statCell: {
        flex: 1,
        padding: Spacing.md,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: Colors.warmMid,
    },
    statCellLast: {
        borderRightWidth: 0,
    },
    statValue: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.ink,
    },
    statValueNeg: {
        color: Colors.red,
    },
    statValuePos: {
        color: Colors.sage,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    monthLabel: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    txnCard: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.lg,
        borderRadius: Radius.md,
        overflow: 'hidden',
        marginBottom: Spacing.md,
        ...Shadow.card,
    },
    txnItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.warmMid,
    },
    txnItemLast: {
        borderBottomWidth: 0,
    },
    txnIcon: {
        width: 38,
        height: 38,
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
        fontWeight: '600',
        color: Colors.ink,
    },
    txnSub: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 1,
    },
    txnRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    txnAmount: {
        fontSize: FontSize.sm,
        fontWeight: '700',
    },
    amountPos: { color: Colors.sage },
    amountNeg: { color: Colors.red  },
    badge: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        overflow: 'hidden',
        textTransform: 'uppercase',
    },
    badgeGasto: { backgroundColor: Colors.redLt,   color: Colors.red   },
    badgeRetiro: { backgroundColor: Colors.amberLt, color: Colors.amber },
    badgeIngreso: { backgroundColor: Colors.sageLt,  color: Colors.sage  },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.muted,
    },
    emptySubtext: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },
    bottomPadding: { height: Spacing.xl },
});