// HistoryScreen styles — theme-driven, same pattern as Home
// (createHistoryStyles(theme), used inside the screen).
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createHistoryStyles(theme) {
    return StyleSheet.create({

        safeArea: {
            flex: 1,
            backgroundColor: theme.bg,
        },

        // Hero card — same surface/ink language as Home's heroCard,
        // just without the night art (History doesn't need it).
        hero: {
            backgroundColor: theme.surface,
            padding: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.lg,
            position: 'relative',
            overflow: 'hidden',
        },
        // Diagonal accent bars, now theme-tinted instead of fixed white/violet
        heroBar1: {
            position: 'absolute',
            width: 2, height: 120,
            backgroundColor: theme.border,
            top: -10, right: 60,
            transform: [{ rotate: '20deg' }],
        },
        heroBar2: {
            position: 'absolute',
            width: 2, height: 180,
            backgroundColor: theme.border,
            top: -20, right: 90,
            transform: [{ rotate: '20deg' }],
        },
        heroBar3: {
            position: 'absolute',
            width: 3, height: 220,
            backgroundColor: theme.brandSoft,
            top: -30, right: 120,
            transform: [{ rotate: '20deg' }],
        },
        heroTitle: {
            fontSize: 32,
            fontWeight: '900',
            color: theme.ink,
            letterSpacing: -1.2,
            marginBottom: 4,
            zIndex: 2,
        },
        heroSub: {
            fontSize: FontSize.sm,
            color: theme.inkSoft,
            fontWeight: '500',
            marginBottom: Spacing.lg,
            textTransform: 'capitalize',
            zIndex: 2,
        },

        // Stats row inside hero
        statsRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            zIndex: 2,
        },
        statCell: {
            flex: 1,
            backgroundColor: theme.bg,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: Radius.sm,
            padding: Spacing.sm + 2,
        },
        statCellMid: {
            // middle cell — no special treatment needed
        },
        statVal: {
            fontSize: FontSize.md,
            fontWeight: '900',
            letterSpacing: -0.6,
            marginBottom: 3,
        },
        statLbl: {
            fontSize: FontSize.xs - 1,
            fontWeight: '800',
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.muted,
        },

        // Filters
        filterWrap: {
            paddingVertical: Spacing.md,
            paddingLeft: Spacing.lg,
            backgroundColor: theme.bg,
        },
        filterRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            paddingRight: Spacing.lg,
        },
        chip: {
            paddingVertical: 6,
            paddingHorizontal: Spacing.md,
            borderRadius: Radius.full,
            borderWidth: 1.5,
            borderColor: theme.border,
            backgroundColor: theme.surface,
        },
        chipActive: {
            backgroundColor: theme.ink,
            borderColor: theme.ink,
        },
        chipText: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.muted,
            letterSpacing: 0.3,
        },
        chipTextActive: { color: theme.bg },

        // Month label
        monthLabel: {
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.xs,
            fontSize: FontSize.xs - 1,
            fontWeight: '900',
            color: theme.muted,
            letterSpacing: 2,
            textTransform: 'uppercase',
            backgroundColor: theme.bg,
        },

        // Transaction card
        txnCard: {
            backgroundColor: theme.surface,
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.sm,
            borderRadius: Radius.sm,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.card,
        },
        txnRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        txnRowLast: { borderBottomWidth: 0 },
        txnInfo: { flex: 1 },
        txnName: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.ink,
            marginBottom: 2,
        },
        txnDate: {
            fontSize: FontSize.xs,
            color: theme.muted,
            fontWeight: '500',
        },
        txnRight: { alignItems: 'flex-end', gap: 4 },
        txnAmount: {
            fontSize: FontSize.sm,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        amountPos: { color: theme.moneyIn },
        amountNeg: { color: theme.ink },

        // Empty state
        emptyState: {
            alignItems: 'center',
            paddingVertical: 60,
            backgroundColor: theme.bg,
        },
        emptyText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.muted,
        },
        emptySub: {
            fontSize: FontSize.sm,
            color: theme.muted,
            marginTop: Spacing.xs,
        },
    });
}