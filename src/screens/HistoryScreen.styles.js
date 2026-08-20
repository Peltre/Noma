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
        // card wrapper, no decoration.
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

        // Stats card — a plain GlassCard, same content grammar as
        // Home's txnCard: no borders/boxing per cell, just three
        // columns separated by thin dividers.
        statsCard: {
            marginHorizontal: Spacing.lg,
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

        // Filters — two dropdowns side by side, sitting at the top of
        // the screen now. Transparent, same as the rest of the screen
        // — AppBackground shows through.
        filterWrap: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
        },
        filterRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
        },

        // PeriodField — same field box SelectField renders (Tipo uses
        // that one directly), but with room on either side for the
        // fused step arrows instead of a single trailing chevron.
        periodField: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.xs,
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            borderWidth: 1.5,
            borderColor: theme.border,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.sm,
        },
        periodCenter: {
            flex: 1,
            alignItems: 'center',
        },
        periodLabel: {
            fontSize: FontSize.xs - 2,
            fontWeight: '800',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 1,
        },
        periodValue: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
            textTransform: 'capitalize',
        },
        // PeriodField's own granularity-picker sheet — same visual
        // pattern as SelectField's modal (handle, title, option rows).
        periodBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
        periodSheet: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.lg,
            paddingBottom: Spacing.xl,
        },
        periodSheetHandle: {
            width: 36, height: 4,
            borderRadius: 2,
            backgroundColor: theme.border,
            alignSelf: 'center',
            marginBottom: Spacing.md,
        },
        periodSheetTitle: {
            fontSize: FontSize.lg,
            fontWeight: '800',
            color: theme.ink,
            marginBottom: Spacing.sm,
            textAlign: 'center',
        },
        periodOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        periodOptionText: {
            fontSize: FontSize.md,
            color: theme.ink,
            fontWeight: '600',
        },

        // Month label — now a row, count sits on the right of it.
        monthLabelRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.xs,
        },
        monthLabel: {
            fontSize: FontSize.xs - 1,
            fontWeight: '900',
            color: theme.muted,
            letterSpacing: 2,
            textTransform: 'uppercase',
        },
        monthCount: {
            fontSize: FontSize.xs - 1,
            fontWeight: '600',
            color: theme.muted,
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

        // Empty state — transparent on purpose, so AppBackground's
        // starfield shows through instead of a flat panel. The text
        // shadow is what keeps it readable against the stars instead
        // of the background color doing that job.
        emptyState: {
            alignItems: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.muted,
            textShadowColor: 'rgba(0,0,0,0.6)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
        },
        emptySub: {
            fontSize: FontSize.sm,
            color: theme.muted,
            marginTop: Spacing.xs,
            textShadowColor: 'rgba(0,0,0,0.6)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 6,
        },
    });
}