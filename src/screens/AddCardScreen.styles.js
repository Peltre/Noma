import { StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../constants';

export default StyleSheet.create({

    safeArea: { flex: 1, backgroundColor: Colors.paper },

    header: {
        flexDirection: 'row', alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: Colors.mid,
        justifyContent: 'center', alignItems: 'center',
    },
    backText: { fontSize: FontSize.lg, color: Colors.ink, fontWeight: '600' },
    title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },

    // Card preview
    cardPreview: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        height: 190,
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
    },
    // Decorative orbs inside preview
    previewOrbA: {
        position: 'absolute', width: 160, height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -40, right: -40,
    },
    previewOrbB: {
        position: 'absolute', width: 100, height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.04)',
        bottom: -20, left: 20,
    },
    previewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
    },
    previewBank: {
        fontSize: FontSize.lg, fontWeight: '800',
        color: Colors.white, letterSpacing: -0.3,
        flex: 1,
    },
    // SIM chip visual
    previewChip: {
        width: 32, height: 24, borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    previewChipInner: {
        width: 20, height: 14, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    previewBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 2,
    },
    previewLimitLbl: {
        fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)',
        fontWeight: '600', letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 2,
    },
    previewLimit: {
        fontSize: FontSize.xxl, fontWeight: '800',
        color: Colors.white, letterSpacing: -1,
    },
    previewDates: { alignItems: 'flex-end', gap: 3 },
    previewDateText: {
        fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },

    // Form
    form: { paddingHorizontal: Spacing.lg },

    fieldLabel: {
        fontSize: FontSize.xs, fontWeight: '800',
        color: Colors.muted, textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: Spacing.xs,
        marginTop: Spacing.md,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: Radius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md, color: Colors.ink,
        borderWidth: 1, borderColor: Colors.mid,
    },
    inputHint: {
        fontSize: FontSize.xs, color: Colors.muted,
        marginTop: 4, fontWeight: '500',
    },

    row: { flexDirection: 'row', gap: Spacing.md },

    confirmBtn: {
        marginTop: Spacing.lg,
        backgroundColor: Colors.ink,
        borderRadius: Radius.sm,
        paddingVertical: 16,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: Colors.white, fontSize: FontSize.md, fontWeight: '700',
    },
});