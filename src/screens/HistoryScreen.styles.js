// HistoryScreen styles — theme-driven, same pattern as Home
// (createHistoryStyles(theme), used inside the screen).
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createHistoryStyles(theme) {
    return StyleSheet.create({

        safeArea: {
            flex: 1,
            backgroundColor: 'transparent',
        },

        // Plain header — same language as Tarjetas' title row, no
        // card wrapper, no decoration. Subtitle sits right under it.
        header: {
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.md,
        },
        title: {
            fontSize: FontSize.xxl,
            fontWeight: '900',
            color: theme.ink,
            letterSpacing: -1,
        },
        subtitle: {
            fontSize: FontSize.sm,
            color: theme.muted,
            fontWeight: '500',
            marginTop: 2,
            textTransform: 'capitalize',
        },

        // Stats card — a plain GlassCard, same content grammar as
        // Home's txnCard: no borders/boxing per cell, just three
        // columns separated by thin dividers.
        statsCard: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
            borderRadius: Radius.sm,
        },
        statsRow: {
            flexDirection: 'row',
            paddingVertical: Spacing.md,
        },
        statCell: {
            flex: 1,
            alignItems: 'center',
        },
        statDivider: {
            width: 1,
            backgroundColor: theme.border,
            marginVertical: 2,
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

        // Filters — two dropdowns (SelectField) side by side, not a
        // scrolling pill row anymore
        filterWrap: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            backgroundColor: theme.bg,
        },
        filterRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
        },

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
        // GlassCard supplies background/border now.
        txnCard: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.sm,
            borderRadius: Radius.sm,
            ...Shadow.card,
        },
        txnRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingVertical: Spacing.sm + 2,
            paddingHorizontal: Spacing.md,
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
        // Subtitle line in the list row — "Cuenta · Etiqueta". Same
        // look as txnDate (which now lives on the right, next to the
        // amount), just a second style so each keeps its own name for
        // what it actually shows.
        txnMeta: {
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