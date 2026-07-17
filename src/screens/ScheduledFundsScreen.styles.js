// ScheduledFundsScreen styles — theme-driven. Scheduled funds are
// money coming in, so they use moneyIn as their accent (same fixed
// meaning as everywhere else in the app), delete uses moneyOut.
//
// This screen is view-only now (create/edit for income funds lives
// on AddScheduledFundScreen instead), so the form-field styles that
// used to live here moved there with it. What's left: the list
// itself, and the small MSI edit modal (its fields are too different
// from an income fund's to reuse that other screen's form).
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createScheduledFundsStyles(theme) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.bg,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: Spacing.lg,
            paddingBottom: Spacing.md,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
        },
        backBtn: {
            width: 36,
            height: 36,
            borderRadius: Radius.sm,
            backgroundColor: theme.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            fontSize: FontSize.xl,
            fontWeight: '700',
            color: theme.ink,
        },
        // Same circular treatment as Tarjetas' own "+" — solid brand
        // fill, single icon, no label.
        addBtn: {
            width: 36,
            height: 36,
            borderRadius: Radius.full,
            backgroundColor: theme.brand,
            justifyContent: 'center',
            alignItems: 'center',
        },
        // Same chip pattern HistoryScreen already uses for its own
        // filters — one visual language for "filter a list" everywhere.
        filterWrap: {
            paddingBottom: Spacing.md,
            paddingLeft: Spacing.lg,
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

        listContainer: {
            padding: Spacing.lg,
            gap: Spacing.md,
        },
        sectionLabel: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: theme.muted,
            marginBottom: Spacing.xs,
        },
        fundCard: {
            backgroundColor: theme.surface,
            borderRadius: Radius.md,
            padding: Spacing.md,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.card,
        },
        fundTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: Spacing.sm,
        },
        fundNameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flexShrink: 1,
        },
        fundName: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
        },
        fundAmount: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.moneyIn,
        },
        fundMeta: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            alignItems: 'center',
        },
        fundMetaBadge: {
            backgroundColor: theme.moneyInSoft,
            borderRadius: Radius.full,
            paddingVertical: 2,
            paddingHorizontal: Spacing.sm,
        },
        fundMetaBadgeText: {
            fontSize: FontSize.xs,
            color: theme.moneyIn,
            fontWeight: '600',
        },
        fundMetaText: {
            fontSize: FontSize.xs,
            color: theme.muted,
        },
        fundActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: Spacing.lg,
            marginTop: Spacing.sm,
        },
        editBtnRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        editBtnText: {
            fontSize: FontSize.xs,
            color: theme.ink,
            fontWeight: '600',
        },
        deleteBtnText: {
            fontSize: FontSize.xs,
            color: theme.moneyOut,
            fontWeight: '600',
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 60,
            gap: Spacing.md,
        },
        emptyText: {
            fontSize: FontSize.md,
            fontWeight: '600',
            color: theme.muted,
        },
        emptySubtext: {
            fontSize: FontSize.sm,
            color: theme.muted,
            textAlign: 'center',
            paddingHorizontal: Spacing.lg,
        },
        emptyBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.brand,
            borderRadius: Radius.full,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            marginTop: Spacing.xs,
        },
        emptyBtnText: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.brandOn,
        },
        bottomPadding: { height: Spacing.xl },

        // Shared by the MSI edit modal below (an income fund's own
        // fields live entirely on AddScheduledFundScreen now).
        fieldGroup: { gap: Spacing.xs },
        fieldLabel: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        input: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            fontSize: FontSize.md,
            color: theme.ink,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.card,
        },

        // MSI edit modal — deliberately small (name + date only, see
        // updateScheduledFund's comment for why the rest is locked)
        modalBackdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: Spacing.lg,
        },
        modalSheet: {
            backgroundColor: theme.surface,
            borderRadius: Radius.lg,
            padding: Spacing.lg,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.float,
        },
        modalTitle: {
            fontSize: FontSize.lg,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: Spacing.md,
        },
        modalActions: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginTop: Spacing.sm,
        },
        modalCancelBtn: {
            flex: 1,
            padding: Spacing.md,
            borderRadius: Radius.sm,
            alignItems: 'center',
            backgroundColor: theme.border,
        },
        modalCancelText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
        },
        modalSaveBtn: {
            flex: 1,
            padding: Spacing.md,
            borderRadius: Radius.sm,
            alignItems: 'center',
            backgroundColor: theme.ink,
        },
        modalSaveText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.bg,
        },
    });
}