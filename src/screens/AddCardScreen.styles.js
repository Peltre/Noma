// AddCardScreen styles — el header, los campos, las pastillas y los
// botones ya viven en components/ui; la cara de la tarjeta vive en
// CardFace.jsx. Aquí queda solo la disposición del formulario y el
// hueco del selector de color.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing } from '../constants';

export default function createAddCardStyles(theme) {
    return StyleSheet.create({

        safeArea: { flex: 1, backgroundColor: 'transparent' },

        previewWrap: {
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.sm,
        },

        form: { paddingHorizontal: Spacing.lg },

        // DecimalInput es un TextInput pelón (necesita su propio
        // inputAccessoryView), así que no puede ir dentro de <Field>:
        // se le pinta la misma superficie con fieldSurface y solo se
        // agrega lo tipográfico.
        decimalInput: {
            fontSize: FontSize.md,
            color: theme.ink,
            letterSpacing: 0.2,
            paddingVertical: 0,
        },

        hint: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            marginTop: 6,
            fontWeight: '500',
            lineHeight: FontSize.xs * 1.4,
        },
        hintError: { color: theme.moneyOut, fontWeight: '700' },
        hintCentered: { textAlign: 'center' },

        balanceHintRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: Spacing.sm,
        },

        row: { flexDirection: 'row', gap: Spacing.md },

        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

        pickerWrap: { height: 240, marginTop: Spacing.sm },

        actions: { flexDirection: 'row', marginTop: Spacing.xl },
        actionsSecondary: { flexDirection: 'row', marginTop: Spacing.sm },
    });
}