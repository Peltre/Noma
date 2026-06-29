// Stylesheet for onboarding 
// src/components/OnboardingOverlay.styles.js
import { StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
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
        backgroundColor: Colors.paper,
        borderRadius: 28,
        padding: Spacing.lg,
        paddingBottom: Spacing.lg,
        width: '100%',
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
        backgroundColor: Colors.mid,
    },
    progressDotActive: {
        backgroundColor: Colors.ink,
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
        color: Colors.ink,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.muted,
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
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.ink,
        borderWidth: 1,
        borderColor: Colors.mid,
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
        backgroundColor: Colors.white,
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
        color: Colors.ink,
        flex: 1,
    },
    removeBtn: {
        fontSize: FontSize.xs,
        color: Colors.coral,
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
        borderColor: Colors.mid,
        borderStyle: 'dashed',
        marginTop: Spacing.xs,
    },
    addBtnText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.muted,
    },

    // Yes/No selector
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
        borderColor: Colors.mid,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    yesNoBtnActive: {
        backgroundColor: Colors.tealLt,
        borderColor: Colors.teal,
    },
    yesNoBtnText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.muted,
    },
    yesNoBtnTextActive: {
        color: Colors.teal,
    },

    // Tour highlight tooltip
    tooltip: {
        backgroundColor: Colors.ink,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        ...Shadow.float,
    },
    tooltipText: {
        fontSize: FontSize.sm,
        color: Colors.white,
        lineHeight: 20,
        textAlign: 'center',
    },
    tooltipArrow: {
        alignItems: 'center',
        marginTop: -8,
    },
    tooltipArrowText: {
        fontSize: 20,
        color: Colors.ink,
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
        backgroundColor: Colors.mid,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtnText: {
        fontSize: FontSize.lg,
        color: Colors.ink,
        fontWeight: '600',
    },
    nextBtn: {
        flex: 1,
        height: 52,
        borderRadius: Radius.sm,
        backgroundColor: Colors.ink,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextBtnText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.white,
    },
    nextBtnDisabled: {
        backgroundColor: Colors.mid,
    },
    laterBtn: {
        alignItems: 'center',
        paddingTop: Spacing.md,
    },
    laterBtnText: {
        fontSize: FontSize.sm,
        color: Colors.muted,
    },
});