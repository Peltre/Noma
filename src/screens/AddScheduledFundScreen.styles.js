// AddScheduledFundScreen styles — theme-driven, same conventions as
// AddCardScreen (header/backBtn/title/confirmBtn/deleteBtn) plus the
// form-field styles that used to live inline on ScheduledFundsScreen.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createAddScheduledFundStyles(theme) {
    return StyleSheet.create({

        safeArea: { flex: 1, backgroundColor: theme.bg },

        header: {
            flexDirection: 'row', alignItems: 'center',
            gap: Spacing.md,
            paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
        },
        backBtn: {
            width: 36, height: 36, borderRadius: Radius.sm,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
        },
        title: { fontSize: FontSize.xl, fontWeight: '800', color: theme.ink, letterSpacing: -0.3 },

        form: { paddingHorizontal: Spacing.lg, gap: Spacing.xs },

        fieldLabel: {
            fontSize: FontSize.xs, fontWeight: '800',
            color: theme.muted, textTransform: 'uppercase',
            letterSpacing: 1, marginBottom: Spacing.xs,
            marginTop: Spacing.md,
        },
        input: {
            backgroundColor: theme.surface,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            fontSize: FontSize.md, color: theme.ink,
            letterSpacing: 0.3,
            lineHeight: FontSize.md * 1.3,
            borderWidth: 1, borderColor: theme.border,
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
            marginTop: Spacing.lg,
            backgroundColor: theme.ink,
            borderRadius: Radius.sm,
            paddingVertical: 16,
            alignItems: 'center',
        },
        confirmBtnDisabled: { opacity: 0.6 },
        confirmBtnText: {
            color: theme.bg, fontSize: FontSize.md, fontWeight: '700',
        },

        // Delete (edit mode only) — unlike a card or account, a
        // scheduled fund is just a future reminder, nothing it's
        // "linked to" that could make deleting unsafe, so there's no
        // disabled state to explain here the way AddCardScreen has.
        deleteBtn: {
            marginTop: Spacing.sm,
            alignItems: 'center',
            padding: Spacing.md,
        },
        deleteBtnText: {
            fontSize: FontSize.sm, fontWeight: '600',
            color: theme.moneyOut,
        },
    });
}