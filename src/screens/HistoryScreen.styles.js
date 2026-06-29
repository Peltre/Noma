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
    amountNeg: { color: Colors.red },
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
    badgeGasto: { backgroundColor: Colors.redLt, color: Colors.red },
    badgeRetiro: { backgroundColor: Colors.amberLt, color: Colors.amber },
    badgeIngreso: { backgroundColor: Colors.sageLt, color: Colors.sage },
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

    // ── Transaction detail sheet ─────────────────────────────────
    sheetBg: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        backgroundColor: Colors.paper,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        paddingBottom: 40,
        alignItems: 'center',
    },
    sheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.warmMid,
        marginBottom: Spacing.lg,
    },
    sheetIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sheetIcon: { fontSize: 26 },
    sheetType: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    sheetAmount: {
        fontSize: 36,
        fontWeight: '700',
        color: Colors.ink,
        letterSpacing: -1,
        marginBottom: Spacing.xs,
    },
    sheetReason: {
        fontSize: FontSize.md,
        color: Colors.muted,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },

    // Detail rows
    detailRows: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.warmMid,
    },
    detailKey: {
        fontSize: FontSize.sm,
        color: Colors.muted,
        fontWeight: '500',
    },
    detailVal: {
        fontSize: FontSize.sm,
        color: Colors.ink,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: Spacing.md,
    },

    // Edit inputs
    sheetFieldLabel: {
        alignSelf: 'flex-start',
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    sheetInput: {
        width: '100%',
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
        marginBottom: Spacing.md,
    },

    // Sheet buttons
    sheetBtnRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
        marginTop: Spacing.sm,
    },
    sheetBtnPrimary: {
        flex: 2,
        height: 50,
        borderRadius: Radius.sm,
        backgroundColor: Colors.ink,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetBtnPrimaryText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.white,
    },
    sheetBtnSecondary: {
        flex: 1,
        height: 50,
        borderRadius: Radius.sm,
        backgroundColor: Colors.warmMid,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetBtnSecondaryText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.ink,
    },
    sheetBtnDanger: {
        flex: 1,
        height: 50,
        borderRadius: Radius.sm,
        backgroundColor: Colors.redLt,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetBtnDangerText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.red,
    },
});