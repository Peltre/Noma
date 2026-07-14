// TransactionScreen styles — theme-driven. The hero no longer changes
// background per transaction type (that would need 3 extra dark
// tones not defined in the theme registry); it now stays on theme.bg
// and only the glow/pills/amount carry the type accent, same rule as
// everywhere else in the app.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius } from '../constants';

export default function createTransactionStyles(theme) {
    return StyleSheet.create({

        root: { flex: 1, backgroundColor: theme.bg },

        // Hero
        hero: {
            backgroundColor: theme.bg,
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.lg,
            position: 'relative',
            overflow: 'hidden',
        },
        heroGlow: {
            position: 'absolute',
            width: 300, height: 300,
            borderRadius: 150,
            bottom: -100, right: -80,
        },

        heroTop: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.lg,
        },
        backBtn: {
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: theme.border,
            justifyContent: 'center', alignItems: 'center',
        },
        backText: { fontSize: FontSize.lg, color: theme.ink, fontWeight: '600' },
        heroTitle: {
            fontSize: FontSize.md, fontWeight: '700',
            color: theme.muted,
            letterSpacing: 0.2,
        },

        // Type pills — inside hero
        typeRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginBottom: Spacing.lg,
        },
        typePill: {
            flex: 1,
            paddingVertical: 9,
            borderRadius: Radius.full,
            alignItems: 'center',
            backgroundColor: theme.border,
        },
        typePillText: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.muted,
            letterSpacing: 0.2,
        },

        // Amount — big and centered
        amountRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.xs,
            marginBottom: Spacing.md,
            zIndex: 2,
        },
        currencySign: {
            fontSize: 36,
            fontWeight: '300',
            lineHeight: 80,
        },
        amountInput: {
            fontSize: 64,
            fontWeight: '900',
            color: theme.ink,
            minWidth: 120,
            textAlign: 'center',
            letterSpacing: -3,
            height: 80,
            includeFontPadding: false,
            textAlignVertical: 'center',
        },

        // MSI preview banner inside hero
        msiBanner: {
            borderWidth: 1,
            borderRadius: Radius.sm,
            padding: Spacing.sm + 2,
            backgroundColor: theme.surface,
            marginBottom: Spacing.sm,
            zIndex: 2,
        },
        msiBannerText: {
            fontSize: FontSize.sm,
            color: theme.ink,
            fontWeight: '600',
        },
        msiBannerAmt: { fontWeight: '800' },
        msiBannerSub: {
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: 3,
        },

        // Sheet
        sheet: {
            flex: 1,
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
        },
        sheetContent: {
            padding: Spacing.lg,
            paddingTop: Spacing.lg + Spacing.sm,
        },

        // Field label
        fieldLabel: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            marginBottom: Spacing.sm,
            marginTop: Spacing.md,
        },

        // Small inline hint under a field (e.g. credit available)
        fieldHint: {
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: Spacing.xs,
        },

        // Text input
        input: {
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            fontSize: FontSize.md,
            color: theme.ink,
            borderWidth: 1,
            borderColor: theme.border,
        },

        // Shared pill style — reused for accounts, MSI months, and
        // the frequency/date pickers inside "Programada". No longer
        // used for a category picker; that's gone entirely.
        pillsWrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
        },
        catPill: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm - 1,
            borderRadius: Radius.full,
            borderWidth: 1.5,
            backgroundColor: theme.bg,
        },
        catPillText: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            letterSpacing: 0.2,
        },

        // Toggle (credit card / MSI)
        toggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            marginTop: Spacing.md,
            marginBottom: Spacing.sm,
        },
        toggleText: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '500' },
        checkbox: {
            width: 22, height: 22, borderRadius: 6,
            borderWidth: 2, borderColor: theme.border,
            backgroundColor: theme.bg,
            justifyContent: 'center', alignItems: 'center',
        },
        checkboxOn: { backgroundColor: theme.ink, borderColor: theme.ink },
        checkmark: { color: theme.bg, fontSize: 13, fontWeight: '700' },

        // Confirm button
        confirmBtn: {
            marginTop: Spacing.lg,
            paddingVertical: 16,
            borderRadius: Radius.sm,
            alignItems: 'center',
        },
        confirmText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            letterSpacing: 0.2,
        },

        // "Otro tipo" sheet — Retiro/Traspaso/Programada, opened from
        // the hero's third pill instead of crowding the type row.
        modalBg: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        typeSheet: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.lg,
            paddingBottom: Spacing.xl,
        },
        sheetHandle: {
            width: 36, height: 4,
            backgroundColor: theme.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: Spacing.lg,
        },
        typeSheetTitle: {
            fontSize: FontSize.lg,
            fontWeight: '800',
            color: theme.ink,
            marginBottom: Spacing.md,
            textAlign: 'center',
        },
        typeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        typeOptionDot: {
            width: 12, height: 12, borderRadius: 6,
        },
        typeOptionLabel: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: 2,
        },
        typeOptionDesc: {
            fontSize: FontSize.xs,
            color: theme.muted,
        },
    });
}