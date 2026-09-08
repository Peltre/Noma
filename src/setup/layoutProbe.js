// ── SONDA DE LAYOUT (TEMPORAL) ─────────────────────────────────────────
// Se quita cuando termine el diagnóstico: borrar este archivo y las
// líneas marcadas con `[LAYOUT PROBE]` en App.js, CurvedTabBar.jsx y
// HomeScreen.jsx.
//
// Qué hace: cada contenedor clave reporta su frame real (x, y, ancho,
// alto) tal como lo midió el sistema nativo. Se imprime en la terminal
// de `npx expo start` con el prefijo [LAYOUT] y además se dibuja en un
// recuadro amarillo fijo arriba de la pantalla, con tamaño explícito
// en píxeles, para que se vea aunque el resto del árbol mida cero.
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DIAG_LAYOUT = true;

const frames = {};
let notify = () => { };

const r = (n) => (typeof n === 'number' ? Math.round(n * 10) / 10 : String(n));

export function report(name, layout) {
    if (!DIAG_LAYOUT || !layout) return;
    frames[name] = layout;
    console.log(`[LAYOUT] ${name} → x=${r(layout.x)} y=${r(layout.y)} w=${r(layout.width)} h=${r(layout.height)}`);
    notify();
}

// Envuelve cualquier cosa y reporta su frame. `style` se pasa tal cual.
export function Probe({ name, style, children }) {
    return (
        <View style={style} onLayout={(e) => report(name, e.nativeEvent.layout)}>
            {children}
        </View>
    );
}

export function LayoutHud() {
    const [, force] = useState(0);
    const insets = useSafeAreaInsets();
    const win = useWindowDimensions();

    useEffect(() => {
        notify = () => force((n) => n + 1);
        return () => { notify = () => { }; };
    }, []);

    useEffect(() => {
        console.log(`[LAYOUT] window → w=${r(win.width)} h=${r(win.height)}`);
        console.log(`[LAYOUT] insets → top=${r(insets.top)} bottom=${r(insets.bottom)} left=${r(insets.left)} right=${r(insets.right)}`);
    }, [win.width, win.height, insets.top, insets.bottom, insets.left, insets.right]);

    if (!DIAG_LAYOUT) return null;

    const lines = [
        `window  w=${r(win.width)} h=${r(win.height)}`,
        `insets  t=${r(insets.top)} b=${r(insets.bottom)} l=${r(insets.left)} r=${r(insets.right)}`,
        ...Object.entries(frames).map(
            ([k, l]) => `${k}  x=${r(l.x)} y=${r(l.y)} w=${r(l.width)} h=${r(l.height)}`,
        ),
    ];

    // Todo en píxeles absolutos: nada de flex ni porcentajes, para que
    // este recuadro no dependa del layout que estamos midiendo.
    return (
        <View style={[styles.box, { top: 70, left: 8, width: Math.max(win.width - 16, 200), pointerEvents: 'none' }]}>
            <Text style={styles.title}>SONDA DE LAYOUT</Text>
            {lines.map((line, i) => (
                <Text key={i} style={styles.line}>{line}</Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        zIndex: 99999,
        elevation: 99999,
        backgroundColor: 'rgba(255, 230, 0, 0.95)',
        padding: 8,
        borderRadius: 6,
    },
    title: { color: '#000', fontSize: 12, fontWeight: '700', marginBottom: 4 },
    line: { color: '#000', fontSize: 11, fontFamily: undefined },
});