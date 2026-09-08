// AddScheduledFundScreen styles — el header, los campos, las
// pastillas y los botones ya viven en components/ui, así que aquí
// solo queda la disposición: dónde respira el formulario.
import { StyleSheet } from 'react-native';
import { FontSize, Spacing } from '../constants';

export default function createAddScheduledFundStyles(theme) {
    return StyleSheet.create({

        safeArea: { flex: 1, backgroundColor: 'transparent' },

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

        pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

        // Una línea bajo "Cuenta destino" que dice qué pasa con el dinero.
        hint: {
            fontSize: FontSize.xs,
            color: theme.inkDim,
            marginTop: -Spacing.xs,
            marginBottom: Spacing.sm,
        },
        hintError: { color: theme.moneyOut, fontWeight: '700' },

        actions: { flexDirection: 'row', marginTop: Spacing.xl },
        actionsSecondary: { flexDirection: 'row', marginTop: Spacing.sm },
    });
}