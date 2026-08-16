// ScheduledFundsScreen styles — theme-driven. Cards are neutral
// (theme.surface, no moneyIn/moneyOut tint) since nothing has moved
// yet — matching Home's PendingFundCard. Delete still uses moneyOut,
// a clear negative action.
//
// View-only now — create/edit for income funds lives on
// AddScheduledFundScreen. What's left: the list, and the MSI edit
// modal (too different from an income fund's form to share it).
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createScheduledFundsStyles(theme) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: 'transparent',
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
        // GlassCard supplies background/border now; fundCardPending
        // (applied alongside, for a fund that hasn't happened yet)
        // still layers its dashed borderStyle on top same as before.
        fundCard: {
            borderRadius: Radius.md,
            padding: Spacing.md,
            ...Shadow.card,
        },
        // Same "pending, nothing's moved yet" signal PendingFundCard
        // uses on Home — dashed instead of solid, no color change.
        fundCardPending: {
            borderStyle: 'dashed',
        },
        fundTop: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            marginBottom: Spacing.sm,
        },
        // Neutral icon box — same treatment Home's PendingFundCard
        // gives its type icon (muted on theme.border), not a colored
        // accent tied to income vs. MSI.
        fundIconBox: {
            width: 32, height: 32,
            borderRadius: Radius.sm,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            backgroundColor: theme.border,
        },
        fundName: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            flex: 1,
        },
        // Neutral, not moneyIn/moneyOut — matches PendingFundCard: an
        // amount here hasn't actually moved yet, so it shouldn't read
        // like a settled transaction.
        fundAmount: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
        },
        fundMeta: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            alignItems: 'center',
        },
        fundMetaBadge: {
            backgroundColor: theme.border,
            borderRadius: Radius.full,
            paddingVertical: 2,
            paddingHorizontal: Spacing.sm,
        },
        fundMetaBadgeText: {
            fontSize: FontSize.xs,
            color: theme.muted,
            fontWeight: '600',
        },
        fundMetaText: {
            fontSize: FontSize.xs,
            color: theme.muted,
        },
        // Same weight-not-color urgency cue as PendingFundCard's
        // subtitleOverdue — only the "Venció · ..." line gets it.
        fundMetaTextOverdue: {
            color: theme.ink,
            fontWeight: '700',
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