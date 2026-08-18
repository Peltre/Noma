// SettingsScreen styles — theme-driven, same pattern as the rest of the app.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createSettingsStyles(theme) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        scroll: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        header: {
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
            fontSize: FontSize.xxl,
            fontWeight: '700',
            color: theme.ink,
        },
        section: {
            paddingHorizontal: Spacing.lg,
            marginBottom: Spacing.lg,
        },
        sectionTitle: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: Spacing.sm,
        },
        // GlassCard supplies background/border now.
        // GlassCard supplies background/border now.
        card: {
            borderRadius: Radius.md,
            ...Shadow.card,
        },
        // Same shape as `card`, but for lists INSIDE a modal sheet
        // (CurrencyPickerModal's MXN/USD list) — modals keep their
        // existing solid treatment for now rather than becoming glass
        // too, so this keeps the old background+border instead of
        // reusing the now-transparent-ready `card`.
        sheetCard: {
            backgroundColor: theme.surface,
            borderRadius: Radius.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
        },
        fieldRow: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            gap: Spacing.md,
        },
        fieldRowLast: {
            borderBottomWidth: 0,
        },
        fieldIcon: {
            width: 36,
            height: 36,
            borderRadius: Radius.sm,
            backgroundColor: theme.brandSoft,
            justifyContent: 'center',
            alignItems: 'center',
        },
        fieldInfo: { flex: 1 },
        fieldLabel: {
            fontSize: FontSize.xs,
            color: theme.muted,
            marginBottom: 2,
        },
        fieldInput: {
            fontSize: FontSize.md,
            fontWeight: '500',
            color: theme.ink,
            padding: 0,
        },
        fieldValue: {
            fontSize: FontSize.md,
            fontWeight: '500',
            color: theme.muted,
        },
        editNameBtn: {
            padding: Spacing.xs,
        },
        saveBtn: {
            backgroundColor: theme.brand,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            alignItems: 'center',
            marginTop: Spacing.md,
        },
        saveBtnText: {
            color: theme.brandOn,
            fontSize: FontSize.md,
            fontWeight: '700',
        },
        // Generic picker row — reused by the currency picker sheet.
        // radio mirrors the checkbox language used for toggles
        // elsewhere (MSI, etc.)
        themeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            gap: Spacing.md,
        },
        themeName: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: 2,
        },
        themeDesc: {
            fontSize: FontSize.xs,
            color: theme.muted,
        },
        radio: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: theme.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        radioActive: {
            backgroundColor: theme.brand,
            borderColor: theme.brand,
        },
        versionText: {
            textAlign: 'center',
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: Spacing.md,
        },
        // GlassCard supplies background/border now.
        dangerCard: {
            borderRadius: Radius.md,
            ...Shadow.card,
        },
        dangerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.md,
            gap: Spacing.md,
        },
        // Destructive action reuses moneyOut — no separate "danger" hue
        // in the theme system (same rule as History's delete button).
        dangerIcon: {
            width: 36,
            height: 36,
            borderRadius: Radius.sm,
            backgroundColor: theme.moneyOutSoft,
            justifyContent: 'center',
            alignItems: 'center',
        },
        dangerLabel: {
            fontSize: FontSize.md,
            fontWeight: '500',
            color: theme.moneyOut,
        },
        bottomPadding: { height: Spacing.xl },

        // Currency picker sheet — same bottom-sheet shape SavingsScreen's
        // modals use, kept local here since this is the only sheet in
        // Settings so far.
        modalBg: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        sheet: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: Radius.lg,
            borderTopRightRadius: Radius.lg,
            padding: Spacing.lg,
            paddingBottom: 44,
            ...Shadow.float,
        },
        sheetHandle: {
            width: 36, height: 4,
            backgroundColor: theme.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: Spacing.lg,
        },
        sheetTitle: {
            fontSize: FontSize.xl,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -0.3,
            marginBottom: Spacing.xs,
        },
        sheetSubtitle: {
            fontSize: FontSize.sm,
            color: theme.muted,
            marginBottom: Spacing.lg,
            fontWeight: '500',
            lineHeight: 18,
        },
        convertingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            marginTop: Spacing.lg,
        },
        convertingText: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.muted,
        },
    });
}