// HistoryScreen styles — header, hojas, vacíos, pastillas y botones
// vienen de components/ui. Aquí queda lo propio de esta pantalla: el
// campo de periodo, la tarjeta de KPIs, la fila de movimiento y el
// detalle dentro de la hoja.
//
// HistorySheet.styles.js ya no existe: su marco (backdrop, panel,
// handle, botones) lo pone Sheet, y lo que quedaba —la lista de
// detalle y las etiquetas— vive aquí abajo con prefijo sheet*/detail*.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createHistoryStyles(theme) {
    return StyleSheet.create({

        safeArea: { flex: 1, backgroundColor: 'transparent' },

        // Filtros
        filterRow: {
            flexDirection: 'row',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.md,
        },
        // La superficie (alto, radio, borde) la pone fieldSurface para
        // que Tipo y Periodo se lean como un par.
        periodField: {
            flex: 1.15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.xs,
        },
        periodCenter: { flex: 1, alignItems: 'center' },
        periodLabel: {
            fontSize: FontSize.xs - 2,
            fontWeight: '800',
            color: theme.inkDim,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 1,
        },
        periodValue: {
            fontSize: FontSize.sm,
            fontWeight: '700',
            color: theme.ink,
            textTransform: 'capitalize',
        },

        // Opción dentro del selector de granularidad
        pickerOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        pickerOptionText: { fontSize: FontSize.md, fontWeight: '600', color: theme.ink },

        // KPIs del periodo
        statsCard: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md,
            ...Shadow.card,
        },
        statsRow: { flexDirection: 'row', alignItems: 'center' },
        statCell: { flex: 1, alignItems: 'center', gap: 4 },
        statDivider: { width: 1, height: 30, backgroundColor: theme.border },
        statLbl: {
            fontSize: FontSize.xs - 1,
            fontWeight: '700',
            color: theme.inkDim,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
        },

        emptyWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

        // Encabezado de mes dentro de la lista
        monthLabelRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.lg,
            marginTop: Spacing.md,
            marginBottom: Spacing.sm,
        },
        monthLabel: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.inkDim,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
        },
        monthCount: { fontSize: FontSize.xs, color: theme.inkDim, fontWeight: '500' },

        // Fila de movimiento
        txnCard: {
            marginHorizontal: Spacing.lg,
            borderRadius: Radius.md,
            ...Shadow.card,
        },
        txnRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
            padding: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        txnRowLast: { borderBottomWidth: 0 },
        txnInfo: { flex: 1 },
        txnName: {
            fontSize: FontSize.md,
            fontWeight: '600',
            color: theme.ink,
            letterSpacing: -0.2,
        },
        txnMeta: { fontSize: FontSize.xs, color: theme.inkDim, marginTop: 2, fontWeight: '500' },
        txnRight: { alignItems: 'flex-end', gap: 3 },
        txnDate: { fontSize: FontSize.xs - 1, color: theme.inkDim, fontWeight: '500' },

        // Detalle dentro de la hoja
        sheetHead: { alignItems: 'center', gap: Spacing.sm },
        sheetType: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1.4,
        },
        sheetAmount: { alignItems: 'center', marginTop: Spacing.md },
        sheetReason: {
            fontSize: FontSize.md,
            color: theme.inkMid,
            textAlign: 'center',
            marginTop: 4,
            fontWeight: '500',
        },

        detailList: {
            marginTop: Spacing.lg,
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.inputFill,
            paddingHorizontal: Spacing.md,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.md,
            paddingVertical: Spacing.sm + 4,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        detailKey: { fontSize: FontSize.sm, color: theme.inkDim, fontWeight: '600' },
        detailVal: {
            flex: 1,
            fontSize: FontSize.sm,
            color: theme.ink,
            fontWeight: '600',
            textAlign: 'right',
        },

        tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

        // DecimalInput no puede vivir dentro de <Field> (necesita su
        // propio inputAccessoryView), así que lleva fieldSurface y solo
        // lo tipográfico aquí.
        decimalInputLarge: {
            fontSize: FontSize.xl,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.4,
            paddingVertical: 0,
        },

        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
    });
}