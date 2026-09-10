// El primario es turquesa, salvo cuando la acción tiene tipo: ahí toma
// el acento de ese tipo vía `accent` (gasto ámbar, MSI violeta) o del
// AccentProvider que envuelva la pantalla.
// theme.ink nunca es relleno de botón.
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useTheme';
import { useAccent } from '../../store/useAccent';
import { FontSize, Radius } from '../../constants';

export default function Button({
    label,
    onPress,
    variant = 'primary', // 'primary' | 'secondary' | 'danger'
    accent,
    accentOn,
    disabled = false,
    loading = false,
    loadingLabel = 'Procesando…',
    compact = false,
    style,
    children,
}) {
    const { theme } = useTheme();
    const ctx = useAccent();

    let bg = 'transparent';
    let fg = theme.ink;
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (disabled) {
        bg = 'rgba(255,255,255,0.06)';
        fg = theme.inkDim;
    } else if (variant === 'primary') {
        bg = accent || ctx.accent;
        fg = accentOn || ctx.accentOn;
    } else if (variant === 'secondary') {
        bg = theme.glassFill;
        borderColor = theme.glassBorder;
        borderWidth = 1;
    } else if (variant === 'danger') {
        // Se advierte, no se grita: contorno tenue. El relleno sólido
        // queda para la confirmación.
        fg = theme.moneyOut;
        borderColor = theme.moneyOutSoft;
        borderWidth = 1;
    }

    return (
        <TouchableOpacity
            style={[styles.base, compact && styles.compact, { backgroundColor: bg, borderColor, borderWidth }, style]}
            onPress={disabled || loading ? undefined : onPress}
            disabled={disabled || loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading }}
        >
            {children ?? (
                <Text
                    style={[styles.label, compact && styles.labelCompact, { color: fg }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                >
                    {loading ? loadingLabel : label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
        height: 52,
        borderRadius: Radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    compact: { height: 38, borderRadius: Radius.xs, flex: 0, paddingHorizontal: 14 },
    label: { fontSize: FontSize.md + 0.5, fontWeight: '700', textAlign: 'center' },
    labelCompact: { fontSize: FontSize.sm },
});