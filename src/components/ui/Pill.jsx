// Seleccionado = relleno soft + borde sólido + texto del acento.
// Nunca relleno sólido ni texto invertido. El acento solo cambia
// cuando la pastilla elige un tipo (gasto, MSI...), porque ahí el
// color sí carga información.
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useTheme';
import { useAccent } from '../../store/useAccent';
import { FontSize, Radius, Spacing } from '../../constants';

export default function Pill({ label, icon: Icon, selected = false, onPress, accent, style }) {
    const { theme } = useTheme();
    const { accent: ctxAccent } = useAccent();
    const tone = accent || ctxAccent;
    const fg = selected ? tone : theme.muted;
    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper
            style={[
                styles.base,
                {
                    borderColor: selected ? tone : theme.border,
                    backgroundColor: selected ? tone + '29' : 'transparent',
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole={onPress ? 'button' : undefined}
            accessibilityState={selected ? { selected: true } : {}}
        >
            {Icon && <Icon color={fg} size={14} />}
            <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md - 2,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1.5,
    },
    label: { fontSize: FontSize.sm, fontWeight: '600' },
});