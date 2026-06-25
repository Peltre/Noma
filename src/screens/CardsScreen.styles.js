// Stylesheet for card screen

// src/screens/CardsScreen.styles.js
import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.ink,
    },
    addBtn: {
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    addBtnText: {
        color: Colors.white,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    cardContainer: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    creditCard: {
        borderRadius: 20,
        padding: Spacing.lg,
        minHeight: 170,
        justifyContent: 'space-between',
        ...Shadow.float,
    },
    cardBgGreen: {
        backgroundColor: Colors.sage,
    },
    cardBgDark: {
        backgroundColor: Colors.ink,
    },
    cardBgAmber: {
        backgroundColor: Colors.amber,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardBank: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.5,
    },
    cardTypeEmoji: {
        fontSize: 24,
    },
    cardDebtLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    cardDebtAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: -0.5,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginTop: Spacing.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 2,
    },
    cardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.xs,
    },
    cardMetaText: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.5)',
    },
    detailCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadow.card,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.warmMid,
    },
    detailRowLast: {
        borderBottomWidth: 0,
    },
    detailKey: {
        fontSize: FontSize.sm,
        color: Colors.muted,
    },
    detailVal: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.ink,
    },
    detailValAlert: {
        color: Colors.amber,
    },
    payBtn: {
        backgroundColor: Colors.sageLt,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    payBtnText: {
        color: Colors.sage,
        fontWeight: '700',
        fontSize: FontSize.sm,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: Spacing.md,
    },
    emptyEmoji: { fontSize: 48 },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.muted,
    },
    emptySubtext: {
        fontSize: FontSize.sm,
        color: Colors.muted,
    },
    emptyBtn: {
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.sm,
    },
    emptyBtnText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: FontSize.sm,
    },
});