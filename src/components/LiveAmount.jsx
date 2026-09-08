// Un monto relleno con un degradado que se desplaza. Se usa solo en el
// balance del héroe de Inicio: es la carta de presentación de la app y
// el único sitio donde una cifra merece llamar la atención.
//
// ── La idea ──
// En vez de decorar alrededor del dato, el dato ES la decoración. El
// fondo del héroe puede quedarse limpio porque el movimiento vive
// dentro de los números: turquesa, azul y violeta —los tres colores de
// marca— recorriendo la cifra.
//
// ── Cómo está hecho ──
// MaskedView recorta una banda de degradado usando el propio <Money>
// como máscara. Lo que se mueve es la banda, no el texto, y se mueve
// con `translateX` sobre un Animated.View normal: eso lo puede animar
// el DRIVER NATIVO, así que el hilo de JS queda libre y el scroll no
// se entrecorta. Es la razón de hacerlo con máscara y no pintando un
// degradado dentro de un <Text> de SVG, que obligaría a animar
// atributos desde JS a 60 fps.
//
// La banda mide el doble del texto y repite la misma secuencia de
// color dos veces, así que al desplazarla exactamente un ancho vuelve
// a quedar idéntica: el bucle no tiene costura.
//
// ── Cómo se mide (importa) ──
// MaskedView necesita un tamaño explícito, y el tamaño correcto es el
// del texto. La trampa es medirlo con un onLayout sobre el contenedor
// de la propia máscara: entonces el contenedor mide lo que mide la
// máscara y la máscara mide lo que mide el contenedor. El valor se
// queda clavado en el que se le diera de arranque y la cifra ocupa un
// ancho que no le toca, empujando a sus vecinos de fila.
//
// Por eso la medición sale de una COPIA INVISIBLE del <Money> en
// position:'absolute'. Al estar fuera del flujo no aporta tamaño al
// contenedor, así que se dimensiona sola por su contenido y devuelve
// el ancho real del texto. Sin ciclo.
//
// REQUIERE: npx expo install @react-native-masked-view/masked-view
import { useEffect, useRef, useState } from 'react';
import { Animated, View, Easing, AccessibilityInfo, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Money from './Money';

export default function LiveAmount({
    value,
    size,
    colors,          // [inicio, medio, pico] — se refleja para cerrar el ciclo
    duration = 9000,
    ...moneyProps
}) {
    const isFocused = useIsFocused();
    // null hasta la primera medición: mientras tanto se pinta el Money
    // normal, que además es lo que le da tamaño a la fila.
    const [box, setBox] = useState(null);
    const [reduceMotion, setReduceMotion] = useState(false);
    const shift = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let alive = true;
        AccessibilityInfo.isReduceMotionEnabled().then((v) => {
            if (alive) setReduceMotion(v);
        });
        const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
        return () => { alive = false; sub?.remove?.(); };
    }, []);

    useEffect(() => {
        // Quieto si Inicio no está a la vista o si el sistema pide menos
        // movimiento. No se apaga el degradado, solo el desplazamiento:
        // la cifra sigue teniendo color.
        if (!isFocused || reduceMotion || !box) return undefined;

        shift.setValue(0);
        const loop = Animated.loop(
            Animated.timing(shift, {
                toValue: 1,
                duration,
                easing: Easing.linear,   // lineal: cualquier otra curva se nota como un tirón al cerrar el ciclo
                useNativeDriver: true,
            }),
        );
        loop.start();
        return () => loop.stop();
    }, [isFocused, reduceMotion, box, duration, shift]);

    const translateX = shift.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -(box?.width ?? 0)],
    });

    const [a, b, c] = colors;
    const w = box?.width ?? 0;
    const h = box?.height ?? 0;

    return (
        <View style={styles.wrap}>
            {/* Copia invisible, fuera del flujo: existe solo para saber
                cuánto mide la cifra de verdad. */}
            <View
                style={styles.measure}
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    if (width === 0 || height === 0) return;
                    // Solo re-mide si cambió de verdad: onLayout también
                    // se dispara al rotar, y reiniciaría el bucle sin
                    // que la cifra haya cambiado.
                    setBox((prev) =>
                        !prev || Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1
                            ? { width, height }
                            : prev,
                    );
                }}
            >
                <Money value={value} size={size} {...moneyProps} />
            </View>

            {!box ? (
                // Primer fotograma: el monto normal. Da tamaño a la fila
                // y evita un hueco mientras llega la medida.
                <Money value={value} size={size} {...moneyProps} />
            ) : (
                <MaskedView
                    style={{ width: w, height: h }}
                    maskElement={
                        // Blanco opaco: a MaskedView le importa el alfa, no el
                        // tono. Los centavos conservan su opacity 0.5 de
                        // Money, así que reciben el degradado a media fuerza
                        // y siguen leyéndose como detalle.
                        <View style={styles.maskHost}>
                            <Money value={value} size={size} color="#FFFFFF" {...moneyProps} />
                        </View>
                    }
                >
                    <Animated.View style={{ width: w * 2, height: h, transform: [{ translateX }] }}>
                        <Svg width={w * 2} height={h}>
                            <Defs>
                                {/* Dos ciclos idénticos en una sola banda. Por eso
                                los topes de 0 y 0.5 son el mismo color: al
                                desplazar un ancho exacto, la imagen coincide
                                consigo misma y no hay salto. */}
                                <LinearGradient id="liveAmount" x1="0" y1="0" x2="1" y2="0">
                                    <Stop offset="0" stopColor={a} />
                                    <Stop offset="0.125" stopColor={b} />
                                    <Stop offset="0.25" stopColor={c} />
                                    <Stop offset="0.375" stopColor={b} />
                                    <Stop offset="0.5" stopColor={a} />
                                    <Stop offset="0.625" stopColor={b} />
                                    <Stop offset="0.75" stopColor={c} />
                                    <Stop offset="0.875" stopColor={b} />
                                    <Stop offset="1" stopColor={a} />
                                </LinearGradient>
                            </Defs>
                            <Rect x="0" y="0" width={w * 2} height={h} fill="url(#liveAmount)" />
                        </Svg>
                    </Animated.View>
                </MaskedView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // alignSelf evita que el bloque se estire a todo el ancho del héroe:
    // la máscara debe medir lo que mide la cifra, ni un pixel más. Eso
    // es lo que permite que la pastilla de tendencia quepa a su lado en
    // vez de irse al renglón siguiente.
    wrap: { alignSelf: 'flex-start' },
    // opacity 0 y no display:'none': hace falta que se pinte para que
    // onLayout devuelva una medida.
    measure: { position: 'absolute', top: 0, left: 0, opacity: 0 },
    maskHost: { backgroundColor: 'transparent', alignSelf: 'flex-start' },
});