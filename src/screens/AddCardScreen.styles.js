// Stylesheet for the AddCardScreen screen, lol

// src/screens/AddCardScreen.styles.js
import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.paper,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.warmMid,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: FontSize.lg,
        color: Colors.ink,
        fontWeight: '600',
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.ink,
    },

    // Preview de la tarjeta en tiempo real
    cardPreview: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: 20,
        padding: Spacing.lg,
        minHeight: 160,
        backgroundColor: Colors.sage,
        justifyContent: 'space-between',
        ...Shadow.float,
    },
    cardPreviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardPreviewName: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.5,
    },
    cardPreviewEmoji: { fontSize: 24 },
    cardPreviewLimitLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    cardPreviewLimit: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: -0.5,
    },
    cardPreviewMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
    },
    cardPreviewMetaText: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.5)',
    },

    // Formulario
    form: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    fieldGroup: {
        gap: Spacing.xs,
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
        borderColor: Colors.warmMid,
        ...Shadow.card,
    },
    inputHint: {
        fontSize: FontSize.xs,
        color: Colors.muted,
        marginTop: 2,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    rowField: {
        flex: 1,
        gap: Spacing.xs,
    },
    confirmBtn: {
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    confirmBtnText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    bottomPadding: { height: Spacing.xl },
});