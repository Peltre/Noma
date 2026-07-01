// Stylesheet for onboarding — theme-driven, same pattern as the rest
// of the app.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createOnboardingStyles(theme) {
    return StyleSheet.create({
        // Full screen overlay
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.lg,
        },
        kavWrapper: {
            width: '100%',
            justifyContent: 'center',
        },
        blur: {
            flex: 1,
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.55)',
        },

        // Card that slides up from bottom
        card: {
            backgroundColor: theme.surface,
            borderRadius: 28,
            padding: Spacing.lg,
            paddingBottom: Spacing.lg,
            width: '100%',
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.float,
        },

        // Progress dots
        progressRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginBottom: Spacing.lg,
            justifyContent: 'center',
        },
        progressDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.border,
        },
        progressDotActive: {
            backgroundColor: theme.ink,
            width: 24,
        },

        // Step content
        emoji: {
            fontSize: 40,
            marginBottom: Spacing.sm,
            textAlign: 'center',
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.ink,
            marginBottom: Spacing.sm,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: FontSize.md,
            color: theme.muted,
            lineHeight: 22,
            marginBottom: Spacing.lg,
            textAlign: 'center',
        },

        // Input
        fieldGroup: {
            gap: Spacing.xs,
            marginBottom: Spacing.md,
        },
        fieldLabel: {
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: theme.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },
        input: {
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            fontSize: FontSize.md,
            color: theme.ink,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.card,
        },
        inputLarge: {
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
            padding: Spacing.lg,
        },

        // Account cards
        accountCard: {
            backgroundColor: theme.bg,
            borderRadius: Radius.sm,
            padding: Spacing.md,
            marginBottom: Spacing.sm,
            gap: Spacing.sm,
            ...Shadow.card,
        },
        accountCardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
        },
        accountCardEmoji: { fontSize: 18 },
        accountCardTitle: {
            fontSize: FontSize.md,
            fontWeight: '600',
            color: theme.ink,
            flex: 1,
        },
        removeBtn: {
            fontSize: FontSize.xs,
            color: theme.moneyOut,
            fontWeight: '600',
        },

        // Add card button
        addBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            padding: Spacing.md,
            borderRadius: Radius.sm,
            borderWidth: 1.5,
            borderColor: theme.border,
            borderStyle: 'dashed',
            marginTop: Spacing.xs,
        },
        addBtnText: {
            fontSize: FontSize.sm,
            fontWeight: '600',
            color: theme.muted,
        },

        // Yes/No selector — "yes" leans on moneyIn (affirmative,
        // same fixed accent used for income everywhere else)
        yesNoRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginBottom: Spacing.md,
        },
        yesNoBtn: {
            flex: 1,
            padding: Spacing.md,
            borderRadius: Radius.sm,
            borderWidth: 1.5,
            borderColor: theme.border,
            backgroundColor: theme.bg,
            alignItems: 'center',
        },
        yesNoBtnActive: {
            backgroundColor: theme.moneyInSoft,
            borderColor: theme.moneyIn,
        },
        yesNoBtnText: {
            fontSize: FontSize.md,
            fontWeight: '600',
            color: theme.muted,
        },
        yesNoBtnTextActive: {
            color: theme.moneyIn,
        },

        // Tour highlight tooltip
        tooltip: {
            backgroundColor: theme.ink,
            borderRadius: Radius.md,
            padding: Spacing.md,
            marginBottom: Spacing.lg,
            ...Shadow.float,
        },
        tooltipText: {
            fontSize: FontSize.sm,
            color: theme.bg,
            lineHeight: 20,
            textAlign: 'center',
        },
        tooltipArrow: {
            alignItems: 'center',
            marginTop: -8,
        },
        tooltipArrowText: {
            fontSize: 20,
            color: theme.ink,
        },

        // Bottom buttons
        bottomRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            marginTop: Spacing.lg,
        },
        backBtn: {
            width: 52,
            height: 52,
            borderRadius: Radius.sm,
            backgroundColor: theme.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backBtnText: {
            fontSize: FontSize.lg,
            color: theme.ink,
            fontWeight: '600',
        },
        nextBtn: {
            flex: 1,
            height: 52,
            borderRadius: Radius.sm,
            backgroundColor: theme.ink,
            justifyContent: 'center',
            alignItems: 'center',
        },
        nextBtnText: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.bg,
        },
        nextBtnDisabled: {
            backgroundColor: theme.border,
        },
        laterBtn: {
            alignItems: 'center',
            paddingTop: Spacing.md,
        },
        laterBtnText: {
            fontSize: FontSize.sm,
            color: theme.muted,
        },
    });
}