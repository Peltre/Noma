// ScheduledFundsScreen styles — theme-driven. Scheduled funds are
// money coming in, so they use moneyIn as their accent (same fixed
// meaning as everywhere else in the app), delete uses moneyOut.
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
            borderRadius: 10,
            backgroundColor: theme.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            fontSize: FontSize.xl,
            fontWeight: '700',
            color: theme.ink,
        },
        listContainer: {
            padding: Spacing.lg,
            gap: Spacing.md,
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
        deleteBtn: {
            marginTop: Spacing.sm,
            alignItems: 'flex-end',
        },
        deleteBtnText: {
            fontSize: FontSize.xs,
            color: theme.moneyOut,
            fontWeight: '600',
        },
        divider: {
            height: 1,
            backgroundColor: theme.border,
            marginHorizontal: Spacing.lg,
            marginVertical: Spacing.lg,
        },
        formSection: {
            padding: Spacing.lg,
            gap: Spacing.md,
        },
        formTitle: {
            fontSize: FontSize.lg,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: Spacing.sm,
        },
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
        frequencyRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
        },
        frequencyBtn: {
            flex: 1,
            padding: Spacing.sm,
            borderRadius: Radius.sm,
            borderWidth: 1.5,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            alignItems: 'center',
        },
        frequencyBtnActive: {
            backgroundColor: theme.moneyInSoft,
            borderColor: theme.moneyIn,
        },
        frequencyBtnText: {
            fontSize: FontSize.xs,
            fontWeight: '600',
            color: theme.muted,
        },
        frequencyBtnTextActive: {
            color: theme.moneyIn,
        },
        accountList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
        },
        accountOption: {
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            borderRadius: Radius.sm,
            borderWidth: 1.5,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            ...Shadow.card,
        },
        accountOptionSelected: {
            backgroundColor: theme.ink,
            borderColor: theme.ink,
        },
        accountOptionText: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.ink,
        },
        confirmBtn: {
            backgroundColor: theme.ink,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            alignItems: 'center',
            marginTop: Spacing.sm,
        },
        confirmBtnText: {
            color: theme.bg,
            fontSize: FontSize.md,
            fontWeight: '700',
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
        bottomPadding: { height: Spacing.xl },
    });
}