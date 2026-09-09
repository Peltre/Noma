// Campo presionable que abre una hoja con la lista de opciones.
// La superficie es la misma que Field (fieldSurface) y la hoja es la
// misma Sheet del resto de la app: un dropdown no debería inventar su
// propio material.
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../store/useTheme';
import { useAccent } from '../store/useAccent';
import { FontSize, Spacing } from '../constants';
import { fieldSurface } from './ui/Field';
import Sheet from './ui/Sheet';
import { IconChevronDown, IconCheck } from './Icons';

export default function SelectField({
    label,               // rótulo chico arriba del valor actual, ej. "TIPO"
    value,                // key de la opción seleccionada
    options,              // [{ key, label }]
    onChange,             // (key) => void
    style,
}) {
    const { theme } = useTheme();
    const { accent } = useAccent();
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.key === value);

    return (
        <>
            <TouchableOpacity
                style={[styles.field, fieldSurface(theme, { focused: open, accent }), style]}
                onPress={() => setOpen(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
            >
                <View style={{ flex: 1 }}>
                    {!!label && <Text style={[styles.label, { color: theme.inkDim }]}>{label}</Text>}
                    <Text style={[styles.value, { color: theme.ink }]} numberOfLines={1}>
                        {selected?.label ?? '—'}
                    </Text>
                </View>
                <IconChevronDown color={theme.inkDim} size={14} />
            </TouchableOpacity>

            {open && (
                <Sheet onClose={() => setOpen(false)} title={label}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {options.map(opt => {
                            const isSelected = opt.key === value;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[styles.option, { borderBottomColor: theme.border }]}
                                    onPress={() => { onChange(opt.key); setOpen(false); }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: isSelected ? accent : theme.ink },
                                        isSelected && { fontWeight: '800' },
                                    ]}>
                                        {opt.label}
                                    </Text>
                                    {isSelected && <IconCheck color={accent} size={14} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Sheet>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.xs,
    },
    label: {
        fontSize: FontSize.xs - 2,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 1,
    },
    value: { fontSize: FontSize.sm, fontWeight: '700' },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    optionText: { fontSize: FontSize.md, fontWeight: '600' },
});