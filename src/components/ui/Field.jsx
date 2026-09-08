// Un solo material para todos los inputs: theme.inputFill sobre el
// vidrio, alto 52 igual que los botones, borde turquesa al enfocar.
//
// `hint` es la línea de ayuda debajo; con `error` la misma línea se
// vuelve ámbar y el borde también, para no inventar un segundo
// lenguaje de validación por pantalla.
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useTheme';
import { FontSize, Radius, Spacing } from '../../constants';

export function FieldLabel({ children, required, optional, style }) {
    const { theme } = useTheme();
    return (
        <Text style={[styles.label, { color: theme.inkDim }, style]}>
            {children}
            {required && <Text style={{ color: theme.brand }}> *</Text>}
            {optional && <Text style={styles.optional}> (opcional)</Text>}
        </Text>
    );
}

// El mismo alto/relleno/radio que usa el TextInput de abajo, para que
// DatePickerField y SelectField —que no pueden ser un TextInput— se
// vean idénticos sin duplicar los números.
export function fieldSurface(theme, { focused = false, error = false } = {}) {
    return {
        height: 52,
        borderRadius: Radius.sm,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        justifyContent: 'center',
        backgroundColor: theme.inputFill,
        borderColor: error ? theme.moneyOut : focused ? theme.brand : theme.border,
    };
}

export default function Field({
    label,
    required,
    optional,
    hint,
    error = false,
    // Permite meter DecimalInput u otro control en vez del TextInput.
    children,
    inputStyle,
    style,
    ...inputProps
}) {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);

    return (
        <View style={style}>
            {!!label && <FieldLabel required={required} optional={optional}>{label}</FieldLabel>}
            {children ?? (
                <TextInput
                    {...inputProps}
                    style={[
                        styles.input,
                        fieldSurface(theme, { focused, error }),
                        { color: theme.ink },
                        inputStyle,
                    ]}
                    placeholderTextColor={theme.inkDim}
                    onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e); }}
                />
            )}
            {!!hint && (
                <Text style={[
                    styles.hint,
                    { color: error ? theme.moneyOut : theme.inkDim },
                    error && styles.hintError,
                ]}>
                    {hint}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: FontSize.xs - 0.5,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginTop: Spacing.md + 2,
        marginBottom: Spacing.sm,
    },
    optional: { fontWeight: '600', letterSpacing: 0.4, textTransform: 'none', opacity: 0.75 },
    input: {
        fontSize: FontSize.md,
        letterSpacing: 0.2,
        // justifyContent no aplica a un TextInput: el texto se centra
        // solo dentro del alto fijo.
        paddingVertical: 0,
    },
    hint: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 6, lineHeight: FontSize.xs * 1.4 },
    hintError: { fontWeight: '700' },
});