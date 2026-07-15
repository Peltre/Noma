// AddCardScreen styles — theme-driven, same pattern as CardsScreen.
// The card preview itself lives in CardFace.jsx now; this file is
// just the screen chrome (header, form, pickers) around it.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius } from '../constants';

export default function createAddCardStyles(theme) {
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

        previewWrap: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.lg,
        },

        // Form
        form: { paddingHorizontal: Spacing.lg },

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
        },
        inputHint: {
            fontSize: FontSize.xs, color: theme.muted,
            marginTop: 4, fontWeight: '500',
        },

        row: { flexDirection: 'row', gap: Spacing.md },

        // Type selector (Débito / Crédito)
        typeRow: { flexDirection: 'row', gap: Spacing.sm },
        typeBtn: {
            flex: 1, paddingVertical: Spacing.sm + 2,
            borderRadius: Radius.sm,
            backgroundColor: theme.surface,
            borderWidth: 1.5, borderColor: theme.border,
            alignItems: 'center',
        },
        typeBtnActive: {
            backgroundColor: theme.ink,
            borderColor: theme.ink,
        },
        typeBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: theme.muted },
        typeBtnTextActive: { color: theme.bg },

        // Color picker — same dot-grid pattern used for Ahorros
        // sub-accounts and debit accounts.
        colorRow: {
            flexDirection: 'row', flexWrap: 'wrap',
            gap: Spacing.sm, marginTop: Spacing.xs,
        },
        colorDot: {
            width: 32, height: 32, borderRadius: 16,
            borderWidth: 2, borderColor: 'transparent',
        },
        colorDotActive: {
            borderColor: theme.ink,
        },

        // Pattern picker
        patternRow: {
            flexDirection: 'row', flexWrap: 'wrap',
            gap: Spacing.sm, marginTop: Spacing.xs,
        },
        patternChip: {
            paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
            borderRadius: Radius.full, backgroundColor: theme.surface,
            borderWidth: 1.5, borderColor: theme.border,
        },
        patternChipActive: {
            backgroundColor: theme.ink,
            borderColor: theme.ink,
        },
        patternChipText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.muted },
        patternChipTextActive: { color: theme.bg },

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

        // Delete (edit mode only) — disabled state explains why
        // instead of just refusing to respond to a tap.
        deleteBtn: {
            marginTop: Spacing.sm,
            alignItems: 'center',
            padding: Spacing.md,
        },
        deleteBtnDisabled: {},
        deleteBtnText: {
            fontSize: FontSize.sm, fontWeight: '600',
            color: theme.moneyOut,
        },
        deleteBtnTextDisabled: {
            color: theme.muted,
        },
    });
}