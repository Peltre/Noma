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

        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },

        // ── Total en ahorros ──
        totalCard: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.sm,
            borderRadius: Radius.md,
            padding: Spacing.lg,
            ...Shadow.card,
        },
        totalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
        acctRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
        acctName: { fontSize: FontSize.sm, color: theme.inkMid, fontWeight: '600', flexShrink: 1 },
        acctPct: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '600', width: 34, textAlign: 'right' },

        // Fila compacta de objetivo (~52 px) y su hoja.
        goalRow: {
            flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2,
            paddingVertical: Spacing.sm + 1, paddingHorizontal: Spacing.md,
            borderBottomWidth: 1, borderBottomColor: theme.border,
        },
        goalRowRing: { width: 36, height: 36 },
        goalRowRingCenter: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
        goalRowPct: { fontSize: FontSize.xs - 2, fontWeight: '800', color: theme.ink },
        goalRowName: { fontSize: FontSize.sm + 1, fontWeight: '700', color: theme.ink },
        goalRowSub: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '500', marginTop: 2 },
        goalRowUrgent: { color: theme.moneyOut, fontWeight: '700' },
        goalSheetHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.xs },
        goalSheetName: { fontSize: FontSize.lg, fontWeight: '800', color: theme.ink },
        goalPaceBox: { marginTop: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 2 },
        sheetGroup: { paddingHorizontal: Spacing.md, paddingVertical: 2 },
        sheetRow: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingVertical: Spacing.sm + 1, gap: Spacing.sm,
        },
        sheetRowBorder: { borderTopWidth: 1, borderTopColor: theme.border },
        sheetRowLabel: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '500' },
        sheetRowValue: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '700' },
        sheetRowText: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '600', flexShrink: 1 },

        // Interruptor General / Detalle en la tarjeta del total.
        segment: {
            flexDirection: 'row', padding: 2, borderRadius: Radius.full,
            backgroundColor: theme.inputFill, borderWidth: 1, borderColor: theme.border,
            alignSelf: 'flex-start', marginBottom: 6,
        },
        segmentBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
        segmentBtnOn: { backgroundColor: theme.glassFill, borderWidth: 1, borderColor: theme.glassBorderTop, paddingHorizontal: 9, paddingVertical: 4 },
        segmentText: { fontSize: FontSize.xs, fontWeight: '700', color: theme.inkDim },
        segmentTextOn: { color: theme.ink },

        // "Todo tu dinero": tarjeta y, con sangría, sus apartados.
        acctBlock: { marginTop: 2 },
        acctChildren: {
            marginLeft: 3, paddingLeft: 12,
            borderLeftWidth: 1, borderLeftColor: theme.border,
        },
        acctChild: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
        acctChildName: { fontSize: FontSize.xs + 1, color: theme.inkMid, fontWeight: '500', flexShrink: 1 },
        acctChip: {
            fontSize: FontSize.xs - 2, fontWeight: '800', color: theme.inkMid,
            borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
        },
        legendDotFree: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.inkDim },

        // Encabezado de Objetivos = total de ahorro.
        goalsHead: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginTop: Spacing.lg, marginBottom: Spacing.sm },
        goalsHeadLabel: { fontSize: FontSize.xs - 0.5, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', color: theme.inkDim },
        goalsHeadRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2, minWidth: 0 },
        goalsHeadSub: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '600', flexShrink: 1 },
        goalsHeadAction: { fontSize: FontSize.sm, fontWeight: '700', color: theme.brand, paddingBottom: 4 },

        // Ahorro en grande.
        savedStrong: { color: theme.ink, fontWeight: '800' },

        // "BBVA › Viaje"
        placeLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3, minWidth: 0 },
        placeText: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '600', flexShrink: 1 },
        placeTextStrong: { color: theme.ink, fontSize: FontSize.sm, fontWeight: '700' },
        placeSep: { fontSize: FontSize.xs, color: theme.inkDim, opacity: 0.7 },

        // Selector de lugar.
        placeGroup: { marginBottom: Spacing.sm },
        placeChildren: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs + 2, marginTop: Spacing.xs + 2, marginLeft: Spacing.md },
        newApartadoLink: { paddingVertical: Spacing.xs + 2 },
        newApartadoText: { fontSize: FontSize.sm, fontWeight: '700', color: theme.brand },

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
            gap: 2,
            height: 7,
            borderRadius: 4,
            overflow: 'hidden',
            marginTop: Spacing.md,
            backgroundColor: theme.border,
        },

        legendDot: { width: 7, height: 7, borderRadius: 4 },


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
        accountRowLast: { borderBottomWidth: 0 },

        // ── Tarjeta de objetivo ──
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
        // El anillo de la hoja mide 84; el wrap debe medir lo mismo o el
        // texto del centro queda descentrado.
        goalRingWrap: { width: 84, height: 84, flexShrink: 0 },
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
        goalRingPctFull: { fontSize: FontSize.lg, letterSpacing: -0.5 },
        goalRowPctFull: { fontSize: FontSize.xs - 3 },
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




        // DecimalInput no puede vivir dentro de <Field> (necesita su
        // propio inputAccessoryView): lleva fieldSurface y aquí solo lo
        // tipográfico.
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
        // Igual que hint pero turquesa: avisa que es tocable.
    });
}