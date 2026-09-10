// OnboardingOverlay styles — la pantalla completa de bienvenida y las
// mini-pantallas del tour. Campos y botones vienen de components/ui.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius } from '../constants';

const FRAME_PAD = 24; // el mismo número que usa la pantalla para medir cada slide

export default function createOnboardingStyles(theme) {
    return StyleSheet.create({
        overlay: { flex: 1 },
        // El BlurView desenfoca la app; esto la oscurece para que el
        // contenido tenga contraste y las estrellas queden de fondo.
        backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6,8,12,0.72)' },
        frame: { flex: 1, paddingHorizontal: FRAME_PAD },
        stepFill: { flex: 1 },
        // Button.base lleva flex: 1 (para filas); aquí van en columna y
        // no deben estirarse a lo alto.
        // Cada botón va en una fila: ver Cta en la pantalla.
        ctaRow: { flexDirection: 'row' },
        centerBlock: { flex: 1, justifyContent: 'center', paddingBottom: 24 },

        // Fila superior en flujo (no absoluta): con top negativo el
        // "Omitir" caía bajo la isla dinámica y no se veía.
        topRow: { height: 28, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
        skipText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.inkDim },

        iconBadge: {
            width: 64, height: 64, borderRadius: Radius.md,
            backgroundColor: theme.brandSoft,
            alignItems: 'center', justifyContent: 'center',
            alignSelf: 'center', marginBottom: Spacing.lg,
        },
        title: { fontSize: FontSize.xl + 4, fontWeight: '800', color: theme.ink, textAlign: 'center', letterSpacing: -0.4 },
        subtitle: {
            fontSize: FontSize.sm + 1, color: theme.inkMid, textAlign: 'center',
            marginTop: Spacing.sm, lineHeight: (FontSize.sm + 1) * 1.5,
        },
        slide: { justifyContent: 'center', paddingBottom: 24 },
        tourTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.lg },
        tourTitle: { fontSize: FontSize.lg, fontWeight: '800', color: theme.ink, letterSpacing: -0.3 },
        tourText: { fontSize: FontSize.sm + 1, color: theme.inkMid, marginTop: 6, lineHeight: (FontSize.sm + 1) * 1.5 },

        dots: { flexDirection: 'row', gap: 5, justifyContent: 'center', marginBottom: Spacing.lg },
        dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.border },
        dotOn: { width: 16, backgroundColor: theme.brand },

        decimalInput: { fontSize: FontSize.md, fontWeight: '700', color: theme.ink, marginBottom: Spacing.md },
        helperNote: { fontSize: FontSize.xs, color: theme.inkDim, marginTop: Spacing.sm, lineHeight: FontSize.xs * 1.5 },

        // ── Mini-pantalla ──
        mini: {
            height: 210, borderRadius: Radius.md, overflow: 'hidden',
            backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
        },
        miniBody: { padding: 10, flex: 1 },
        miniCard: {
            backgroundColor: theme.glassFill, borderRadius: Radius.xs, padding: 8,
            borderWidth: 1, borderColor: theme.glassBorder,
        },
        miniTabBar: {
            height: 34, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
            backgroundColor: theme.glassFill, borderTopWidth: 1, borderTopColor: theme.glassBorderTop,
        },
        miniTab: { alignItems: 'center', width: 44, gap: 1 },
        miniTabLabel: { fontSize: 7, fontWeight: '700', color: theme.inkDim },
        miniFab: {
            position: 'absolute', left: '50%', bottom: 18, width: 30, height: 30, marginLeft: -15,
            borderRadius: 15, backgroundColor: theme.brand, alignItems: 'center', justifyContent: 'center',
        },
        // Lo que la frase explica va iluminado; el resto, atenuado.
        hl: { borderWidth: 1.5, borderColor: theme.brand, borderRadius: Radius.xs },
        dim: { opacity: 0.35 },

        miniLabel: { fontSize: 7, letterSpacing: 1.2, fontWeight: '700', color: theme.inkDim },
        miniBig: { fontSize: 17, fontWeight: '800', color: theme.ink, marginTop: 1 },
        miniStrong: { fontSize: 9, fontWeight: '700', color: theme.ink },
        miniText: { fontSize: 9, color: theme.inkMid, fontWeight: '500' },
        miniMuted: { fontSize: 8, color: theme.inkDim, fontWeight: '500' },
        miniRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
        miniBar: { height: 5, borderRadius: 3, flexDirection: 'row', gap: 2, overflow: 'hidden', marginVertical: 5 },
        miniDot: { width: 6, height: 6, borderRadius: 2 },
        miniIndent: { marginLeft: 3, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: theme.border },
        miniRing: {
            width: 26, height: 26, borderRadius: 13, borderWidth: 2.5, borderColor: '#6FB3A6',
            alignItems: 'center', justifyContent: 'center',
        },
        miniRingText: { fontSize: 7, fontWeight: '800', color: theme.ink },
        // Caras reales de tarjeta, a escala, apiladas como en Tarjetas.
        miniCardsStack: { height: 130, position: 'relative' },
        miniFaceScale: { position: 'absolute', left: 0, right: 0, transform: [{ scale: 0.74 }], transformOrigin: 'top' },
        miniCardsNote: { color: theme.moneyOut, fontWeight: '700', textAlign: 'center', marginTop: 4 },
        miniFace: { borderRadius: Radius.xs, padding: 8, height: 44 },
        miniFaceText: { fontSize: 10, fontWeight: '700', color: theme.brandOn },
        miniFaceTag: { fontSize: 7, fontWeight: '700', color: theme.brandOn, opacity: 0.8 },
        miniFaceTrack: { height: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.25)', marginTop: 4, overflow: 'hidden' },
    });
}