// SettingsScreen styles — theme-driven, same pattern as the rest of the app.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createSettingsStyles(theme) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.bg,
        },
        header: {
            padding: Spacing.lg,
            paddingBottom: Spacing.md,
        },
        title: {
            fontSize: 28,
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
        card: {
            backgroundColor: theme.surface,
            borderRadius: Radius.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.card,
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
            borderRadius: 10,
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
        saveBtn: {
            backgroundColor: theme.brand,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            alignItems: 'center',
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.lg,
        },
        saveBtnText: {
            color: theme.brandOn,
            fontSize: FontSize.md,
            fontWeight: '700',
        },
        versionText: {
            textAlign: 'center',
            fontSize: FontSize.xs,
            color: theme.muted,
            marginTop: Spacing.md,
        },
        dangerCard: {
            backgroundColor: theme.surface,
            borderRadius: Radius.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
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
            borderRadius: 10,
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
    });
}