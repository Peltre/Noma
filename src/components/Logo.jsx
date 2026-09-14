// Logo de Noma: la luna del héroe de Inicio, hecha moneda. Un solo
// SVG, dos tamaños de uso (bienvenida a 96, encabezados a 28). El
// `mark` va solo; `wordmark` agrega "Noma" debajo.
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../store/useTheme';

function LogoMark({ size = 96 }) {
    const { theme } = useTheme();
    return (
        <Svg width={size} height={size} viewBox="0 0 96 96">
            <Defs>
                <RadialGradient id="nomaMoon" cx="40%" cy="35%" r="70%">
                    <Stop offset="0" stopColor="#8FD3C7" />
                    <Stop offset="1" stopColor={theme.brand} />
                </RadialGradient>
            </Defs>
            <Circle cx="48" cy="48" r="36" fill="url(#nomaMoon)" />
            {/* El recorte de la luna es del color del fondo: sobre otro fondo, cambia bg. */}
            <Circle cx="62" cy="40" r="30" fill={theme.bg} />
            <Circle cx="70" cy="30" r="3" fill={theme.ink} />
            <Circle cx="24" cy="70" r="1.6" fill={theme.ink} opacity={0.7} />
        </Svg>
    );
}

export default function Logo({ size = 96, wordmark = true }) {
    const { theme } = useTheme();
    return (
        <View style={styles.wrap}>
            <LogoMark size={size} />
            {wordmark && (
                <Text style={[styles.word, { color: theme.ink, fontSize: Math.round(size * 0.34) }]}>Noma</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center' },
    word: { fontWeight: '800', letterSpacing: -0.8, marginTop: 6 },
});