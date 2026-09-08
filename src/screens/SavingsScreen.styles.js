// SavingsScreen styles — header, secciones, vacíos, hojas, pastillas,
// campos y botones vienen de components/ui. Lo que queda aquí es lo
// propio de Ahorros: la tarjeta de total, la fila de apartado (con su
// columna de acciones), la tarjeta de objetivo con su barra de
// progreso, y los campos de interés en porcentaje.
//
// De 596 líneas a esto: todo lo que se fue era una segunda versión de
// algo que el kit ya resolvía.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow, TabularNums } from '../constants';

export default function createSavingsStyles(theme) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: 'transparent' },

        section: { paddingHorizontal: Spacing.lg },

        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },

        // ── Total en ahorros ──
        totalCard: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.sm,
            borderRadius: Radius.md,
            padding: Spacing.lg,
            ...Shadow.card,
        },
        totalLabel: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.inkDim,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
            marginBottom: Spacing.sm,
        },



        // Barra de reparto del total. Mismo azul en dos opacidades a
        // propósito: es un solo bote de dinero en dos estados, no dos
        // montones distintos. Dos colores dirían lo contrario.
        splitBar: {
            flexDirection: 'row',
            height: 7,
            borderRadius: 4,
            overflow: 'hidden',
            marginTop: Spacing.md,
            backgroundColor: theme.border,
        },
        splitFree: { backgroundColor: theme.savings },
        splitCommitted: { backgroundColor: theme.savings, opacity: 0.42 },

        legendRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.md,
            marginTop: Spacing.sm + 2,
        },
        legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
        legendDot: { width: 7, height: 7, borderRadius: 4 },
        legendLabel: { fontSize: FontSize.sm, color: theme.inkMid, fontWeight: '500' },

        backingNote: { fontSize: FontSize.xs, color: theme.inkDim, marginTop: 6, fontWeight: '500' },

        // Medidor de lo comprometido, ahora del ancho de una etiqueta y
        // dentro del subtítulo de la fila. Ancho fijo a propósito: si
        // fuera flexible, cada apartado tendría una barra de distinto
        // largo y dejarían de ser comparables entre sí de un vistazo.
        miniBar: {
            flexDirection: 'row',
            width: 62,
            height: 4,
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: theme.border,
            flexShrink: 0,
        },
        // Solo avisa que hay riesgo; la cifra vive en la hoja de acciones.
        riskDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.moneyOut },

        // Fila de apartado (tocable: abre la hoja de acciones)
        accountNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        accountSub: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 5 },
        accountRight: { alignItems: 'flex-end' },
        earnedText: { fontSize: FontSize.xs - 1, color: theme.savings, fontWeight: '700', marginTop: 2 },

        // La tasa pasó de una fila propia a una pastilla junto al nombre
        ratePill: {
            borderWidth: 1,
            borderColor: theme.savings + '66',
            borderRadius: Radius.full,
            paddingHorizontal: 6,
            paddingVertical: 1,
        },
        ratePillText: { fontSize: FontSize.xs - 2, color: theme.savings, fontWeight: '800' },

        actionsTotal: { alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xs },
        sheetBtnsTight: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },

        // Aviso de riesgo — mismo bloque en la tarjeta de total y en
        // la de objetivo: triángulo ámbar + una línea que explica.
        riskRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.xs + 2,
            marginTop: Spacing.md,
            paddingTop: Spacing.sm + 2,
            borderTopWidth: 1,
            borderTopColor: theme.border,
        },
        riskText: {
            flex: 1,
            fontSize: FontSize.xs,
            color: theme.moneyOut,
            fontWeight: '600',
            lineHeight: FontSize.xs * 1.4,
        },

        // ── Fila de apartado ──
        accountsGroup: {
            borderRadius: Radius.md,
            ...Shadow.card,
        },
        accountRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md - 2,
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        accountRowLast: { borderBottomWidth: 0 },
        // 26 en vez de 38: sigue identificando el apartado, deja de ser
        // el elemento más grande de una fila donde no carga ningún dato.
        accountDot: { width: 26, height: 26, borderRadius: 13, flexShrink: 0 },
        accountInfo: { flex: 1, minWidth: 0 },
        accountsFooter: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm + 2,
            borderTopWidth: 1,
            borderTopColor: theme.border,
        },
        accountsFooterLabel: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '700' },
        accountName: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.2,
        },
        accountLinked: { fontSize: FontSize.xs, color: theme.inkDim, marginTop: 1, fontWeight: '500' },



        // ── Tarjeta de objetivo ──
        goalCard: {
            borderRadius: Radius.md,
            padding: Spacing.md,
            marginBottom: Spacing.sm + 2,
            ...Shadow.card,
        },
        goalHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: Spacing.sm,
        },
        goalInfo: { flex: 1 },
        goalName: {
            fontSize: FontSize.md,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.2,
        },
        goalDeadline: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            marginTop: 2,
            fontWeight: '500',
            textTransform: 'capitalize',
        },

        // Anillo + columna de información. La tarjeta ya no crece por
        // bloques apilados: el progreso, el porcentaje y el riesgo
        // caben todos dentro de los mismos 74x74.
        goalMain: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md - 2 },
        goalRingWrap: { width: 74, height: 74, flexShrink: 0 },
        goalRingCenter: {
            ...StyleSheet.absoluteFill,
            alignItems: 'center',
            justifyContent: 'center',
        },
        goalRingPct: {
            fontSize: FontSize.xl - 1,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -0.6,
        },
        goalRingLabel: {
            fontSize: FontSize.xs - 3,
            fontWeight: '800',
            color: theme.inkDim,
            letterSpacing: 1,
            marginTop: 1,
        },

        goalAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 7 },
        // Comparte fila con un <Money> en goalAmountRow, así que necesita
        // los mismos dígitos: dos importes juntos con juegos distintos se
        // ven como dos fuentes.
        goalOf: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '500', ...TabularNums },

        // "Sale de": puntos encimados + los nombres en una línea. Antes
        // era divisor + etiqueta + fichas, tres elementos para decir lo
        // que aquí cabe en uno.
        goalSrcRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
        stackDots: { flexDirection: 'row' },
        stackDot: {
            width: 13,
            height: 13,
            borderRadius: 7,
            borderWidth: 2,
            // El borde del color de la superficie es lo que hace que se
            // lean como fichas encimadas y no como una barra segmentada.
            borderColor: theme.surface,
            marginLeft: -4,
        },
        stackDotFirst: { marginLeft: 0 },
        goalSrcText: { flex: 1, fontSize: FontSize.xs, color: theme.inkMid, fontWeight: '500' },

        // Una sola línea de estado. Con riesgo lleva caja ámbar; sin
        // riesgo es solo una línea tenue: no hay nada mal, solo hay algo
        // que decir.
        statusBox: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: Spacing.xs + 2,
            marginTop: Spacing.md,
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.sm + 2,
            borderRadius: Radius.xs,
            backgroundColor: theme.moneyOutSoft,
        },
        statusBoxQuiet: { backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0, marginTop: Spacing.sm + 2 },
        statusText: {
            flex: 1,
            fontSize: FontSize.xs,
            color: theme.moneyOut,
            fontWeight: '600',
            lineHeight: FontSize.xs * 1.45,
        },
        statusTextQuiet: { color: theme.inkMid, fontWeight: '500' },

        // Menú "···" de la tarjeta de objetivo — mismo gesto que el de
        // Inicio, horizontal porque aquí vive en una fila de título.
        kebabBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 4, paddingVertical: 6 },
        kebabDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: theme.inkDim },

        goalBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },

        // ── Dentro de las hojas ──
        // Título con punto de color a la izquierda (interés, mover
        // dinero): Sheet centra su propio `title`, y estos necesitan
        // el punto pegado al texto.
        sheetTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            marginBottom: Spacing.xs,
        },
        sheetTitle: {
            fontSize: FontSize.lg,
            fontWeight: '800',
            color: theme.ink,
            letterSpacing: -0.3,
        },

        preview: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md - 2,
            paddingVertical: Spacing.md,
        },
        previewName: {
            flex: 1,
            fontSize: FontSize.lg,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.3,
        },

        colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
        colorDot: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: 'transparent',
        },

        // Casilla (interés, fecha límite) — misma anatomía que en
        // TransactionScreen.
        toggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
            paddingVertical: Spacing.sm + 2,
            marginTop: Spacing.sm,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
        },
        toggleText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.inkMid },

        // Bloque de interés — sangrado a la izquierda para que se lea
        // como "esto depende de la casilla de arriba".
        interestBox: {
            paddingLeft: Spacing.md,
            borderLeftWidth: 2,
            borderLeftColor: theme.savingsSoft,
            marginTop: Spacing.xs,
        },
        percentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
        percentInput: { flex: 1 },
        percentSign: { fontSize: FontSize.sm, fontWeight: '700', color: theme.inkDim },

        // DecimalInput no puede vivir dentro de <Field> (necesita su
        // propio inputAccessoryView): lleva fieldSurface y aquí solo lo
        // tipográfico.
        decimalInput: {
            fontSize: FontSize.md,
            color: theme.ink,
            letterSpacing: 0.2,
            paddingVertical: 0,
        },
        decimalInputLarge: {
            fontSize: FontSize.xl,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.4,
            paddingVertical: 0,
        },

        hint: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            fontWeight: '500',
            marginTop: 6,
            lineHeight: FontSize.xs * 1.45,
        },
        hintError: { color: theme.moneyOut, fontWeight: '700' },
        // Igual que hint pero turquesa: avisa que es tocable.
        hintTappable: {
            fontSize: FontSize.xs,
            color: theme.brand,
            fontWeight: '700',
            marginTop: 6,
        },
    });
}