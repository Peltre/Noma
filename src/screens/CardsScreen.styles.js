// CardsScreen styles — header, hojas, vacíos, pastillas y botones
// vienen de components/ui. La cara de la tarjeta vive en CardFace.jsx
// y el apilamiento en FocusStack.jsx. Aquí queda: el encabezado de
// mazo, el popover de acciones rápidas y la lista de detalle.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing, Radius, Shadow } from '../constants';

export default function createCardsStyles(theme) {
    return StyleSheet.create({

        // Detalle de Efectivo: no hay botones, sólo esta nota.
        cashNote: {
            flex: 1,
            fontSize: FontSize.xs,
            color: theme.inkDim,
            fontWeight: '500',
            lineHeight: FontSize.xs * 1.45,
        },
        safeArea: { flex: 1, backgroundColor: 'transparent' },


        // Mazo vacío: una sola fila punteada, no un estado vacío
        // completo — el otro mazo puede tener tarjetas y no queremos
        // dos bloques grandes compitiendo.
        emptyDeckRow: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
            paddingVertical: Spacing.md,
            borderRadius: Radius.md,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.border,
            alignItems: 'center',
        },
        emptyDeckText: { fontSize: FontSize.sm, color: theme.inkDim, fontWeight: '600' },

        // Encabezado de mazo
        deckSection: { marginBottom: Spacing.sm },
        deckHead: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 2,
        },
        deckHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
        deckDot: { width: 7, height: 7, borderRadius: 4 },
        deckTitle: {
            fontSize: FontSize.xs,
            fontWeight: '800',
            color: theme.inkDim,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
        },
        deckCount: {
            fontSize: FontSize.xs - 1,
            fontWeight: '700',
            color: theme.inkDim,
            paddingHorizontal: 6,
            paddingVertical: 1,
            borderRadius: Radius.full,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
        },
        deckHeadRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
        chevCollapsed: { transform: [{ rotate: '-90deg' }] },
        deckStackWrap: { paddingHorizontal: Spacing.lg },

        // Popover de acciones rápidas (long press)
        popoverBackdrop: { flex: 1, backgroundColor: 'rgba(6,8,12,0.45)' },
        popover: {
            position: 'absolute',
            flexDirection: 'row',
            gap: Spacing.xs,
            padding: Spacing.sm,
            borderRadius: Radius.md,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            ...Shadow.float,
        },
        popoverBtn: { width: 60, alignItems: 'center', gap: 5, paddingVertical: 4 },
        popoverIconWrap: {
            width: 34, height: 34,
            borderRadius: Radius.xs,
            backgroundColor: theme.glassFill,
            alignItems: 'center', justifyContent: 'center',
        },
        popoverLabel: { fontSize: FontSize.xs - 1, fontWeight: '700', color: theme.ink },

        // Detalle dentro de la hoja
        detailFace: { marginBottom: Spacing.md },
        detailCard: {
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
        detailVal: { fontSize: FontSize.sm, color: theme.ink, fontWeight: '600', textAlign: 'right' },

        // DecimalInput no puede vivir dentro de <Field> (necesita su
        // propio inputAccessoryView): lleva fieldSurface y aquí solo
        // lo tipográfico.
        decimalInputLarge: {
            fontSize: FontSize.xl,
            fontWeight: '700',
            color: theme.ink,
            letterSpacing: -0.4,
            paddingVertical: 0,
        },
        inputError: {
            fontSize: FontSize.xs,
            color: theme.moneyOut,
            fontWeight: '700',
            marginTop: 6,
        },

        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
        sheetBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
    });
}