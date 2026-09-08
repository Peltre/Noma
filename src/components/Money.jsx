// Todo monto de la app pasa por aquí: signo elevado y tenue, enteros
// al 100%, centavos al 52% y media opacidad, cifras tabulares.
//
//   <Money value={48320.75} size={FontSize.hero} />
//   <Money value={1240.5} size={15} sign="-" color={theme.moneyOut} />
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../store/useTheme';
import { TabularNums } from '../constants';
import { displayFont } from '../setup/Typography';

const group = (n) =>
    new Intl.NumberFormat('es-MX', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);

export default function Money({
    value = 0,
    size = 15,
    color,
    // 'auto' según el número · '+' o '-' forzado por el tipo de
    // movimiento · 'none' sin signo (traspasos)
    sign = 'auto',
    decimals = true,
    // Abrevia sobre 10,000, como formatCurrencyShort.
    compact = false,
    // Color del signo $. Por defecto inkDim, que está calibrado
    // contra el fondo de la app. Sobre un fondo propio —la cara de
    // una tarjeta, que trae su propio color— ese gris se apaga, así
    // que ahí se pasa uno explícito.
    currencyColor,
    style,
}) {
    const { theme } = useTheme();
    const tone = color || theme.ink;
    const abs = Math.abs(Number(value) || 0);

    let prefix = '';
    if (sign === 'auto') prefix = (Number(value) || 0) < 0 ? '−' : '';
    else if (sign === '+') prefix = '+';
    else if (sign === '-' || sign === '−') prefix = '−';

    let intText;
    let decText = null;

    if (compact && abs >= 10000) {
        intText = `${group(Math.round(abs / 100) / 10)}k`;
    } else {
        intText = group(Math.floor(abs));
        if (decimals) {
            decText = `.${Math.round((abs - Math.floor(abs)) * 100).toString().padStart(2, '0')}`;
        }
    }

    return (
        <View style={[styles.row, style]}>
            {!!prefix && (
                <Text style={[styles.int, displayFont('700'), { fontSize: size, color: tone }]}>
                    {prefix}
                </Text>
            )}
            <Text
                style={[
                    styles.cur,
                    displayFont('500'),
                    {
                        fontSize: size * 0.46,
                        color: currencyColor || theme.inkDim,
                        // Lo sube a la altura de mayúsculas en vez de
                        // dejarlo sentado en la línea base.
                        transform: [{ translateY: -size * 0.3 }],
                        marginRight: size * 0.05,
                    },
                ]}
            >
                $
            </Text>
            <Text style={[styles.int, displayFont('700'), { fontSize: size, color: tone }]}>
                {intText}
            </Text>
            {decText !== null && (
                <Text style={[styles.dec, displayFont('500'), { fontSize: size * 0.52, color: tone }]}>
                    {decText}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // baseline mantiene los centavos en la misma línea que los enteros
    // aunque midan la mitad.
    row: { flexDirection: 'row', alignItems: 'baseline' },
    int: { letterSpacing: -0.6, ...TabularNums },
    cur: { letterSpacing: 0, ...TabularNums },
    dec: { opacity: 0.5, letterSpacing: 0, ...TabularNums },
});