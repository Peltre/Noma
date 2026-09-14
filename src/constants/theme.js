// El radio crece con la superficie:
// xs chips e iconos · sm inputs y botones · md tarjetas · lg héroe y hojas
export const Radius = {
    xs: 10,
    sm: 14,
    md: 20,
    lg: 28,
    xl: 36,
    full: 999,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const FontSize = {
    xs: 11,
    sm: 12.5,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 30,
    hero: 44,
    input: 64,
};

// ─────────────────────────────────────────────────────────────────
// TIPOGRAFÍA — fuente única de verdad
//
// Para cambiar la fuente de TODA la app hay que tocar tres cosas y
// ninguna más:
//
//   1. npx expo install @expo-google-fonts/<la-nueva>
//   2. el import de App.js (una línea)
//   3. FONT_FAMILY_PREFIX y WEIGHT_SUFFIX de aquí abajo
//
// Antes había 31 veces escrito 'BricolageGrotesque' a mano entre este
// archivo y App.js. Ahora los nombres de archivo se construyen, así que
// no hay forma de que uno se quede desincronizado de los demás.
//
// Los *.styles.js NO nombran familias: escriben `fontWeight` normal y
// setup/Typography.js lo traduce al archivo correcto. Esa es la razón de
// que no haya un solo `fontFamily` suelto en las 60 pantallas.
// ─────────────────────────────────────────────────────────────────

// Typography.js lo usa para saber qué familia es suya y qué es de un
// tercero; con una sola familia ya no puede distinguir display de UI
// por el nombre.
const FONT_FAMILY_PREFIX = 'BricolageGrotesque';

// Cómo nombra los archivos el paquete de @expo-google-fonts: peso +
// sufijo, unidos al prefijo con guion bajo. Casi todas las familias de
// Google siguen este mismo patrón, así que cambiar de fuente suele ser
// solo ajustar qué pesos existen — algunas no traen 300 o 800.
const WEIGHT_SUFFIX = {
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
};

const file = (weight) => `${FONT_FAMILY_PREFIX}_${weight}${WEIGHT_SUFFIX[weight]}`;

// Los archivos que App.js debe cargar. Solo estos: el paquete de
// Bricolage exporta también un 200ExtraLight que la app no usa, y
// cargar un TTF que nadie pide es peso muerto en el arranque.
export const FONT_FILE_NAMES = Object.keys(WEIGHT_SUFFIX).map(file);

// React Native no sintetiza pesos con una familia estática: hay que
// nombrar el archivo exacto. setup/Typography.js usa estos mapas para
// traducir el `fontWeight` que ya está escrito en cada *.styles.js.
//
// Antes eran dos familias (Manrope para UI, Space Grotesk para
// display). Ahora es una sola: Bricolage Grotesque. La distinción de
// voz la hace el PESO, no la familia — el display arranca donde el UI
// termina, así que un título nunca compite con un cuerpo aunque
// compartan las mismas formas.
//
// Las claves 'normal' y 'bold' están porque React Native acepta esos
// dos alias además de los números, y algún componente de terceros los
// manda así. Sin ellas caerían al fallback de 400.

// Display: los montos y titulares. Todo sube un escalón respecto al
// mapa de arriba y el tope se planta en 800, que es donde Bricolage
// enseña su carácter —la 'g', el '4', la '$'—. Un peso 400 pedido
// desde displayFont() no devuelve 400: devuelve 600.
export const DISPLAY_FAMILY_BY_WEIGHT = {
    '400': file(600),
    '500': file(600),
    '600': file(700),
    '700': file(800),
    '800': file(800),
    '900': file(800),
};

// Cifras de ancho fijo. Bricolage trae DOS juegos de dígitos y `tnum`
// cambia los diez por variantes .tf: el '1' pasa de 360 a 629 unidades,
// un 75% más ancho. Sin esto, el mismo archivo y el mismo peso dibujan
// números visiblemente distintos — no parece otro peso, parece otra
// fuente. Era exactamente el bug del saldo en la cara de la tarjeta.
//
// LA REGLA: cifra SUELTA lleva tabulares; cifra DENTRO DE UNA FRASE, no.
//   sí  -> el saldo del héroe, el monto de una fila, el % de tendencia
//   no  -> "Faltan $2,400 para completarlo", "1 USD = 17.4 MXN"
// Los tabulares en prosa se ven separados, porque están hechos para que
// una columna de números cuadre, no para leerse corrido.
//
// Por eso NO va en setup/Typography.js: si se aplicara a todo <Text>,
// cada número dentro de una oración quedaría suelto y ancho.
export const TabularNums = { fontVariant: ['tabular-nums'] };

export const Shadow = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 3,
    },
    float: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.38,
        shadowRadius: 24,
        elevation: 10,
    },
};