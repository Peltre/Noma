// Aplica las fuentes a toda la app sin tocar los *.styles.js: envuelve
// Text y TextInput una vez y traduce el `fontWeight` que ya está escrito
// al archivo de familia correspondiente.
//
// Se llama desde App.js cuando las fuentes ya cargaron. Es idempotente.
//
// ── Por qué cambió al subir a SDK 57 ──
// La versión anterior sobrescribía `Component.render`, porque en RN 0.81
// Text y TextInput eran objetos de forwardRef y ese campo existía.
//
// En RN 0.86 los dos son funciones normales:
//   Libraries/Text/Text.js                 -> export default TextImpl
//   Libraries/Components/TextInput/...js   -> export default TextInput
//
// Ya no tienen `.render`, así que el patch salía en su primera línea:
//
//     const originalRender = Component.render;
//     if (typeof originalRender !== 'function') return;   // <- siempre
//
// Y lo hacía EN SILENCIO. La app siguió arrancando, solo que con la
// fuente del sistema en todas las pantallas menos los montos, que son
// los únicos que traen fontFamily puesto a mano vía displayFont().
//
// ── Cómo se parchea ahora ──
// En vez de tocar internals del componente, se envuelve el componente y
// se reemplaza la exportación del módulo `react-native`. Eso funciona
// porque su index es un object literal con getters:
//
//     module.exports = { get Text() { return require(...).default; }, ... }
//
// Los getters de un object literal son configurable:true, así que
// Object.defineProperty puede sustituirlos. Y como Babel compila
// `import { Text } from 'react-native'` a un acceso `_reactNative.Text`
// que se evalúa en cada uso —no se captura al importar—, las 60
// pantallas recogen el componente envuelto sin cambiar una línea.
//
// Requisito: applyGlobalTypography() tiene que correr ANTES del primer
// render de cualquier texto. App.js ya lo llama en el cuerpo de App(),
// antes de devolver JSX.
//
// ── Y ahora falla RUIDOSAMENTE ──
// El pecado del bug anterior no fue romperse: fue romperse callado. Si
// el parcheo no toma, en __DEV__ sale un warning que dice exactamente
// qué pasó y qué revisar.
import { createElement } from 'react';
import { StyleSheet } from 'react-native';
import * as ReactNative from 'react-native';
import { UI_FAMILY_BY_WEIGHT, DISPLAY_FAMILY_BY_WEIGHT, FONT_FAMILY_PREFIX } from '../constants/theme';

const PATCHED = Symbol.for('noma.typography.patched');

function resolveFont(flat) {
    const weight = String(flat?.fontWeight ?? '400');
    const asked = flat?.fontFamily;

    // Ya viene resuelta a un archivo nuestro (displayFont(), o un
    // *.styles.js que nombró la familia a mano). Se respeta tal cual y
    // solo se limpia el peso.
    //
    // Antes esto se decidía por prefijo —SpaceGrotesk iba al mapa de
    // display, Manrope al de UI—, pero con una sola familia los dos
    // mapas producen nombres que empiezan igual. Ahora manda quien
    // pidió: si ya nombró un archivo, se usa ese.
    if (asked && asked.startsWith(FONT_FAMILY_PREFIX)) {
        // fontWeight se anula SIEMPRE: dejarlo puesto sobre un archivo
        // estático provoca falso-negrita en Android — un 800ExtraBold
        // con fontWeight '700' encima sale emborronado.
        return { fontFamily: asked, fontWeight: undefined };
    }

    // Familia de terceros: no la tocamos.
    if (asked) return null;

    return {
        fontFamily: UI_FAMILY_BY_WEIGHT[weight] || UI_FAMILY_BY_WEIGHT['400'],
        fontWeight: undefined,
    };
}

function wrap(Original, name) {
    function NomaTypography(props) {
        const flat = StyleSheet.flatten(props.style) || {};
        const font = resolveFont(flat);
        if (!font) return createElement(Original, props);
        // El estilo del call site va primero para que siga ganando en
        // tamaño, color y tracking. En React 19 `ref` es un prop normal,
        // así que se propaga con el resto sin forwardRef.
        return createElement(Original, { ...props, style: [props.style, font] });
    }

    NomaTypography.displayName = `Noma(${name})`;

    // Estáticos del original: TextInput.State, Text.propTypes y demás.
    // Sin esto, cualquier código que los use se rompe al envolver.
    for (const key of Object.keys(Original)) {
        if (!(key in NomaTypography)) {
            try {
                NomaTypography[key] = Original[key];
            } catch {
                // Propiedad de solo lectura: se ignora, no vale tirar la app.
            }
        }
    }

    NomaTypography[PATCHED] = true;
    return NomaTypography;
}

export function applyGlobalTypography() {
    for (const name of ['Text', 'TextInput']) {
        const Original = ReactNative[name];

        if (typeof Original !== 'function' && typeof Original !== 'object') {
            if (__DEV__) {
                console.warn(
                    `[Noma] react-native no exporta ${name} como componente. ` +
                    'La tipografía no se va a aplicar. Revisa setup/Typography.js.',
                );
            }
            continue;
        }

        if (Original[PATCHED]) continue;

        const descriptor = Object.getOwnPropertyDescriptor(ReactNative, name);
        if (descriptor && descriptor.configurable === false) {
            if (__DEV__) {
                console.warn(
                    `[Noma] ${name} no es configurable en este bundle, así que no se ` +
                    'puede envolver. Toda la app va a usar la fuente del sistema. ' +
                    'Pasó al cambiar de SDK: ver el comentario de setup/Typography.js.',
                );
            }
            continue;
        }

        Object.defineProperty(ReactNative, name, {
            value: wrap(Original, name),
            configurable: true,
            enumerable: true,
            writable: true,
        });
    }

    // Comprobación final: si algo cambió río arriba y el parcheo no
    // tomó, que se sepa aquí y no tres pantallas después.
    if (__DEV__) {
        const failed = ['Text', 'TextInput'].filter(n => !ReactNative[n]?.[PATCHED]);
        if (failed.length) {
            console.warn(
                `[Noma] La tipografía global NO se aplicó a: ${failed.join(', ')}. ` +
                'Esos textos van a salir con la fuente del sistema.',
            );
        }
    }
}

export const displayFont = (weight = '700') => ({
    fontFamily: DISPLAY_FAMILY_BY_WEIGHT[String(weight)] || DISPLAY_FAMILY_BY_WEIGHT['700'],
});