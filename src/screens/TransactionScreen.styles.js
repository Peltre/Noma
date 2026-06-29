import { StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSize, Spacing, Radius } from '../constants';

const { height: SCREEN_H } = Dimensions.get('window');

export default StyleSheet.create({

    root: { flex: 1, backgroundColor: Colors.ink },

    // Dark hero
    hero: {
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
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    backText: { fontSize: FontSize.lg, color: Colors.white, fontWeight: '600' },
    heroTitle: {
        fontSize: FontSize.md, fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
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
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    typePillText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
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
        color: Colors.white,
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: Spacing.sm,
        zIndex: 2,
    },
    msiBannerText: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    msiBannerAmt: { fontWeight: '800' },
    msiBannerSub: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.35)',
        marginTop: 3,
    },

    // White sheet
    sheet: {
        flex: 1,
        backgroundColor: Colors.paper,
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
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
    },

    // Text input
    input: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.ink,
        borderWidth: 1,
        borderColor: Colors.mid,
    },

    // Category / account pills
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
        backgroundColor: Colors.white,
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
    toggleText: { fontSize: FontSize.sm, color: Colors.ink, fontWeight: '500' },
    checkbox: {
        width: 22, height: 22, borderRadius: 6,
        borderWidth: 2, borderColor: Colors.mid,
        backgroundColor: Colors.white,
        justifyContent: 'center', alignItems: 'center',
    },
    checkboxOn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
    checkmark: { color: Colors.white, fontSize: 13, fontWeight: '700' },

    // Confirm button 
    confirmBtn: {
        marginTop: Spacing.lg,
        paddingVertical: 16,
        borderRadius: Radius.sm,
        alignItems: 'center',
    },
    confirmText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});