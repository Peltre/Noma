import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, TabularNums } from '../constants';
import { displayFont } from '../setup/Typography';

// Diámetro del resplandor del héroe. Vive aquí y no en el .jsx porque
// el estilo lo necesita para posicionarlo, y el SVG para dibujarlo.

export default function createHomeStyles(theme) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: 'transparent' },

        section: { paddingHorizontal: Spacing.lg },

        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },

        scroll: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.bg,
        },

        // El saludo y el balance comparten tarjeta. Es un GlassCard sin
        // nada encima: el fondo, el borde y el recorte los pone él, así
        // que aquí solo queda la forma.
        // Capa del resplandor: va detrás del contenido pero delante del
        // tinte del vidrio. Anclada a la esquina, con el centro fuera de
        // la tarjeta — GlassCard ya recorta al radio.
        heroCard: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
            borderRadius: Radius.lg,
            paddingHorizontal: Spacing.lg - 2,
            paddingTop: Spacing.md + 2,
            paddingBottom: Spacing.lg - 2,
        },
        heroHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
        },
        settingsBtn: {
            paddingLeft: Spacing.sm,
            paddingVertical: Spacing.xs,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0.85,
        },
        greeting: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: theme.inkDim,
            marginBottom: 4,
        },
        userName: {
            // Antes nombraba 'SpaceGrotesk_700Bold' a mano, que dejó de
            // existir al pasar a una sola familia. displayFont() resuelve
            // contra DISPLAY_FAMILY_BY_WEIGHT, así que un cambio de fuente
            // futuro no vuelve a dejar este texto huérfano.
            ...displayFont('700'),
            fontSize: FontSize.xl + 1,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.6,
        },

        // Balance
        heroBalance: {
            marginTop: Spacing.lg,
            zIndex: 1,
        },
        balanceLabelRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm - 2,
            marginBottom: Spacing.xs + 2,
        },
        balanceLabel: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: theme.inkDim,
        },
        currencyTag: {
            fontSize: FontSize.xs - 1,
            fontWeight: '800',
            letterSpacing: 1,
            color: theme.brand,
        },
        balanceRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: Spacing.sm + 2,
        },
        // Dos renglones: el dato arriba, contra qué se compara abajo.
        //
        // El ancho no cambia respecto a la versión de un renglón, y no
        // es casualidad: "ESTE MES" a 8.5px con tracking mide casi lo
        // mismo que la flecha más "+9.9%" a 11px. Por eso la píldora
        // sigue cabiendo al lado de la cifra del héroe en vez de
        // empujarse al renglón siguiente.
        // Barra Disponible / Ahorro al pie del héroe.
        splitWrap: { marginTop: Spacing.md },
        splitBar: {
            flexDirection: 'row', gap: 2, height: 6, borderRadius: 3, overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.08)',
        },
        splitSeg: { height: '100%' },
        splitLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
        splitItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
        splitDot: { width: 6, height: 6, borderRadius: 2 },
        splitLabel: { fontSize: FontSize.xs, color: theme.inkMid, fontWeight: '600' },

        trendPill: {
            alignItems: 'center',
            paddingHorizontal: Spacing.sm + 2,
            paddingVertical: 5,
            borderRadius: Radius.full,
        },
        trendPillTop: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        trendPillText: {
            // Cifra suelta que cambia sola: con dígitos proporcionales
            // la píldora se ensancha y encoge al pasar de 9.9% a 11.1%.
            ...TabularNums,
            fontSize: FontSize.xs,
            fontWeight: '700',
        },
        // Hereda el color del dato pero a 3/4 de fuerza: es la etiqueta
        // del número, no un segundo número.
        trendPillCaption: {
            fontSize: 8.5,
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            opacity: 0.75,
            marginTop: 1,
        },


        // Credit card — GlassCard supplies background/border.
        metaText: {
            fontSize: FontSize.xs,
            color: theme.inkMid,
            fontWeight: '500',
        },

        // Recent transactions — GlassCard supplies background/border.
        txnCard: {
            borderRadius: Radius.md,
        },
        txnRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 4,
            padding: Spacing.md - 3,
            paddingHorizontal: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        txnRowLast: {
            borderBottomWidth: 0,
        },
        txnIconWrap: {
            width: 36,
            height: 36,
            borderRadius: Radius.xs,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
        },
        txnInfo: { flex: 1 },
        txnName: {
            fontSize: FontSize.sm + 1,
            fontWeight: '600',
            color: theme.ink,
        },
        txnSub: {
            fontSize: FontSize.xs,
            color: theme.inkMid,
            marginTop: 2,
        },
        txnRight: {
            alignItems: 'flex-end',
            gap: 4,
        },
        txnDate: {
            fontSize: FontSize.xs - 1,
            color: theme.inkDim,
            fontWeight: '500',
        },

        bottomPadding: { height: Spacing.xl + Spacing.lg },

        // MSI pay sheet — <Sheet> supplies the panel, handle, title and
        // subtitle now. Only what's inside it lives here.
        sheetLabel: {
            fontSize: FontSize.xs - 0.5,
            fontWeight: '800',
            color: theme.inkDim,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginTop: Spacing.md,
            marginBottom: Spacing.sm,
        },
        pillsWrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
        },
    });
}