// Set de iconos de toda la app — una sola librería (react-native-svg).
//
// ── El problema que resuelve este archivo ──
// Antes todos los iconos compartían `SW = 2`, pero eso son unidades del
// viewBox, no píxeles: el trazo REAL que se pinta es SW × (size / 24).
// Con tamaños por defecto que iban de 12 a 22, el trazo en pantalla iba
// de 1.0px a 2.2px. Los iconos estaban bien dibujados; lo que no
// cuadraba era el peso, y por eso no se leían como un set.
//
// Aquí el grosor se calcula al revés: se declara cuánto debe MEDIR el
// trazo en pantalla y se despeja el valor de viewBox que hace falta
// para ese tamaño. Un icono a 12 y uno a 30 pesan lo mismo.
//
// ── La rejilla ──
// Caja de 24 con área viva de 20 (2 de aire por lado). Todo se apoya en
// cuatro plantillas para que dos iconos del mismo `size` se vean del
// mismo tamaño:
//
//   cuadrado    18×18   (3 → 21)      casa, historial, calendario
//   círculo     ø19     (r 9.5)       moneda, usuario, porcentaje
//   horizontal  20×15   (2,4.5)       tarjetas, billete, documento
//   vertical    15×20   (4.5,2)       recibo, candado
//
// Antes IconCards ocupaba 22×15 (x=1) y IconHistory 18×18 (x=3): al
// mismo `size`, la tarjeta se veía notoriamente más grande que todo lo
// demás. Ahora nada sale del área viva.
//
// Cada icono recibe `color` (obligatorio) y `size` (opcional, del
// IconSize de abajo). Los de la barra de tabs reciben además `focused`
// (relleno sólido) y, cuando dibujan un hueco claro encima de ese
// relleno, `bgColor`.
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ── Escala ──────────────────────────────────────────────────────
// Seis pasos, no once. Cada uno tiene un trabajo; si un icono no cabe
// en ninguno, casi siempre el que está mal es el layout, no el icono.
export const IconSize = {
    xs: 12,   // dentro de una pastilla o pegado a texto de FontSize.xs
    sm: 14,   // metadatos, chevrons dentro de una fila
    md: 16,   // acción de fila, chevron de navegación, casillas
    lg: 18,   // encabezados de sección, icono dentro de una tarjeta
    xl: 22,   // barra de tabs
    hero: 30, // estados vacíos y el "+" flotante
};

// ── Peso óptico ─────────────────────────────────────────────────
// OPTICAL es lo que mide el trazo en pantalla. Los topes evitan los dos
// extremos: sin MAX, un icono a 12 pediría 3.0 unidades de viewBox y el
// dibujo se empastaría; sin MIN, uno a 30 bajaría a 1.2 y se vería
// desvanecido. Entre 14 y 24 —donde vive casi todo— el trazo sale
// exactamente en OPTICAL.
const OPTICAL = 1.5;
const MIN_VB = 1.5;
const MAX_VB = 2.6;
const sw = (size) => Math.min(MAX_VB, Math.max(MIN_VB, (OPTICAL * 24) / size));

// Props de trazo compartidos. Todo va con remate y unión redondos, sin
// excepción: mezclar caps redondos y rectos es lo que hace que un set
// se sienta de dos manos distintas.
const line = (size, color) => ({
    stroke: color,
    strokeWidth: sw(size),
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
});

const svg = (size) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' });

// Radios de esquina de la rejilla: uno para cajas grandes, uno para
// chicas. Antes convivían rx 2, 2.5, 3, 3.5 y 4 sin criterio.
const R_BOX = 5;
const R_SMALL = 3;

// ── Barra de tabs ───────────────────────────────────────────────
export function IconHome({ color, bgColor, size = IconSize.xl, focused }) {
    const d = 'M3.6 10.4 12 3.4l8.4 7v9.2a1.4 1.4 0 0 1-1.4 1.4h-4.3v-6.2H9.3V21H5a1.4 1.4 0 0 1-1.4-1.4v-9.2Z';
    return (
        <Svg {...svg(size)}>
            {focused
                ? <Path d={d} fill={color} />
                : <Path d={d} {...line(size, color)} />}
        </Svg>
    );
}

export function IconHistory({ color, bgColor, size = IconSize.xl, focused }) {
    const rows = 'M7.6 9.4h8.8M7.6 12.8h8.8M7.6 16.2h5.4';
    return (
        <Svg {...svg(size)}>
            {focused ? (
                <>
                    <Rect x="3" y="3" width="18" height="18" rx={R_BOX} fill={color} />
                    <Path d={rows} {...line(size, bgColor)} />
                </>
            ) : (
                <>
                    <Rect x="3" y="3" width="18" height="18" rx={R_BOX} {...line(size, color)} />
                    <Path d={rows} {...line(size, color)} />
                </>
            )}
        </Svg>
    );
}

// Monedas apiladas. Antes era un círculo con una cola y dos marcas
// sueltas que no terminaba de leerse como nada; y compartía forma
// redonda con IconPercent. Tres elipses son inconfundibles y no se
// parecen a ningún otro icono del set.
// Ahorros: una bolsa de dinero. Antes eran tres elipses apiladas —una
// pila de monedas— que se leía abstracta al lado de las otras tres
// pestañas.
//
// ── El $ no se dibuja siempre ──
// Este icono sale a cuatro tamaños: 16 en las filas de "Objetivo
// cumplido" de Inicio e Historial, 20 en los estados vacíos, 22 en la
// barra de tabs y 30 si algún día va a un hero. La 'S' del símbolo no
// sobrevive a los chicos: cada bucle mide 3.9 unidades, así que a 16
// son 2.6px con un trazo de 1.5 encima — contraforma de 1.1px, que se
// rellena de sólido y queda una mancha. A 20 sube a 1.75px y respira.
//
// Por eso debajo de 20 se dibuja solo la bolsa. Una silueta limpia se
// lee mejor que un símbolo empastado, y a ese tamaño la bolsa sola ya
// dice lo suficiente: el símbolo es el detalle, la forma es el mensaje.
const SAVINGS_SYMBOL_MIN_SIZE = 20;
const BAG_TIE = 'M9.4 3.4h5.2l-1.3 3h-2.6z';
const BAG_BODY =
    'M10.7 6.4C7.2 8.6 4.4 12.3 4.4 15.8A5.6 5.6 0 0 0 10 21.4h4a5.6 5.6 0 0 0 5.6-5.6c0-3.5-2.8-7.2-6.3-9.4z';
const BAG_SYMBOL_BAR = 'M12 10v8.6';
const BAG_SYMBOL_S =
    'M14.4 12.6c0-1-1.1-1.8-2.4-1.8s-2.4.7-2.4 1.7 1.1 1.6 2.4 1.9 2.4.9 2.4 1.9-1.1 1.8-2.4 1.8-2.4-.8-2.4-1.8';

export function IconSavings({ color, bgColor, size = IconSize.xl, focused }) {
    const showSymbol = size >= SAVINGS_SYMBOL_MIN_SIZE;
    // En el estado activo la bolsa va maciza y el símbolo se cala en
    // bgColor. Sale mejor que en contorno: un hueco de 1.5px sobre un
    // relleno se lee más limpio que un trazo dentro de otro trazo.
    const symbolTone = focused ? bgColor : color;
    return (
        <Svg {...svg(size)}>
            {focused ? (
                <>
                    <Path d={BAG_TIE} fill={color} />
                    <Path d={BAG_BODY} fill={color} />
                </>
            ) : (
                <>
                    <Path d={BAG_TIE} {...line(size, color)} />
                    <Path d={BAG_BODY} {...line(size, color)} />
                </>
            )}
            {showSymbol && (
                <>
                    <Path d={BAG_SYMBOL_BAR} {...line(size, symbolTone)} />
                    <Path d={BAG_SYMBOL_S} {...line(size, symbolTone)} />
                </>
            )}
        </Svg>
    );
}

export function IconCards({ color, bgColor, size = IconSize.xl, focused }) {
    return (
        <Svg {...svg(size)}>
            {focused ? (
                <>
                    <Rect x="2" y="4.5" width="20" height="15" rx={R_SMALL} fill={color} />
                    <Rect x="2" y="8" width="20" height="2.6" fill={bgColor} />
                    <Path d="M5.6 15.4h3.6" {...line(size, bgColor)} />
                </>
            ) : (
                <>
                    <Rect x="2" y="4.5" width="20" height="15" rx={R_SMALL} {...line(size, color)} />
                    <Path d="M2 9.2h20" {...line(size, color)} />
                    <Path d="M5.6 15.4h3.6" {...line(size, color)} />
                </>
            )}
        </Svg>
    );
}

// ── Chrome / estructura ─────────────────────────────────────────
export function IconPlus({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M12 4.4v15.2M4.4 12h15.2" {...line(size, color)} />
        </Svg>
    );
}

export function IconChevronLeft({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M14.8 5.2 8 12l6.8 6.8" {...line(size, color)} />
        </Svg>
    );
}

export function IconChevronRight({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M9.2 5.2 16 12l-6.8 6.8" {...line(size, color)} />
        </Svg>
    );
}

export function IconChevronDown({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M5.2 9.2 12 16l6.8-6.8" {...line(size, color)} />
        </Svg>
    );
}

export function IconChevronUp({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M5.2 14.8 12 8l6.8 6.8" {...line(size, color)} />
        </Svg>
    );
}

export function IconCheck({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M4.6 12.4 9.6 17.4 19.4 6.6" {...line(size, color)} />
        </Svg>
    );
}

export function IconPencil({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M15.6 4.6 19.4 8.4 8.8 19H5v-3.8L15.6 4.6Z" {...line(size, color)} />
            <Path d="M13.4 6.8 17.2 10.6" {...line(size, color)} />
        </Svg>
    );
}

export function IconTrash({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M4.6 6.8h14.8" {...line(size, color)} />
            <Path d="M9.4 6.8V4.6h5.2v2.2" {...line(size, color)} />
            <Path d="M6.4 6.8 7.3 19a1.4 1.4 0 0 0 1.4 1.3h6.6a1.4 1.4 0 0 0 1.4-1.3l.9-12.2" {...line(size, color)} />
            <Path d="M10.4 10.4v6M13.6 10.4v6" {...line(size, color)} />
        </Svg>
    );
}

export function IconUser({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Circle cx="12" cy="8.4" r="3.8" {...line(size, color)} />
            <Path d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0" {...line(size, color)} />
        </Svg>
    );
}

export function IconLock({ color, size = IconSize.xs }) {
    return (
        <Svg {...svg(size)}>
            <Rect x="4.6" y="10.4" width="14.8" height="10" rx={R_SMALL} {...line(size, color)} />
            <Path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6" {...line(size, color)} />
        </Svg>
    );
}

export function IconSparkle({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M12 3.2c0 4.8 2.4 7.2 7.2 7.2-4.8 0-7.2 2.4-7.2 7.2 0-4.8-2.4-7.2-7.2-7.2 4.8 0 7.2-2.4 7.2-7.2Z" {...line(size, color)} />
            <Path d="M18.4 16.4c0 2-1 3-3 3 2 0 3 1 3 3 0-2 1-3 3-3-2 0-3-1-3-3Z" {...line(size, color)} />
        </Svg>
    );
}

export function IconSwap({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M4.6 8.6h14.8M15.4 4.6l4 4" {...line(size, color)} />
            <Path d="M19.4 15.4H4.6M8.6 19.4l-4-4" {...line(size, color)} />
        </Svg>
    );
}

export function IconTrendUp({ color, size = IconSize.xs }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M4.6 16.6 9.6 11l3.4 3.4 6.4-6.8" {...line(size, color)} />
            <Path d="M14.6 7.6h4.8v4.8" {...line(size, color)} />
        </Svg>
    );
}

export function IconTrendDown({ color, size = IconSize.xs }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M4.6 7.4 9.6 13l3.4-3.4 6.4 6.8" {...line(size, color)} />
            <Path d="M14.6 16.4h4.8v-4.8" {...line(size, color)} />
        </Svg>
    );
}

export function IconPercent({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M18.4 5.6 5.6 18.4" {...line(size, color)} />
            <Circle cx="8" cy="8" r="2.6" {...line(size, color)} />
            <Circle cx="16" cy="16" r="2.6" {...line(size, color)} />
        </Svg>
    );
}

export function IconCurrency({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Circle cx="12" cy="12" r="9" {...line(size, color)} />
            <Path d="M14.8 9.2a3 3 0 0 0-2.8-1.8c-1.7 0-3 1-3 2.4 0 3.2 6 1.6 6 4.8 0 1.4-1.3 2.4-3 2.4a3 3 0 0 1-2.8-1.8" {...line(size, color)} />
            <Path d="M12 6v12" {...line(size, color)} />
        </Svg>
    );
}

// ── Instrumentos ────────────────────────────────────────────────
export function IconCash({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Rect x="2" y="4.5" width="20" height="15" rx={R_SMALL} {...line(size, color)} />
            <Circle cx="12" cy="12" r="3" {...line(size, color)} />
            <Path d="M5.6 8.4h.1M18.4 15.6h.1" {...line(size, color)} />
        </Svg>
    );
}

// Ingreso. Billete a plantilla completa (20×15) con una insignia sólida
// montada en la esquina inferior derecha.
//
// ── Historia, para no repetir los dos intentos malos ──
// 1. El "+" iba DENTRO del rectángulo. No significa nada: un billete no
//    lleva un más impreso.
// 2. Se probó encogerlo a 14.5×11 para sacar el "+" fuera. Funcionaba,
//    pero dejaba el billete un 27% más corto que el de IconCash, y en el
//    Historial un Ingreso y un Pago TDC quedan en filas contiguas: se
//    notaba el desajuste.
// La insignia resuelve las dos cosas. Al ser OPACA puede montarse sobre
// la esquina del billete, así que el billete no tiene que ceder espacio
// y vuelve a medir lo mismo que todos los demás de su plantilla.
//
// ── bgColor es OBLIGATORIO aquí ──
// Se usa dos veces: el círculo de r 5.5 es el anillo de separación que
// impide que la insignia se funda con el trazo del billete (los dos son
// del mismo color), y el "+" va calado en bgColor sobre el relleno.
// Sin bgColor, el "+" desaparece y la insignia queda como un punto
// macizo. HomeScreen e HistoryScreen ya pasan theme.surface, que queda
// a 23/765 del color real del chip — indistinguible a este tamaño.
//
// El billete se dibuja COMPLETO y simétrico, y la insignia se estampa
// encima: el círculo va en el centro exacto (10.35, 11.3) y los dos
// puntos de esquina guardan la misma sangría proporcional que en
// IconCash. Nada se corre para esquivar la insignia.
//
// Consecuencia buscada: el anillo tapa el punto inferior derecho y toda
// la esquina redondeada del billete. Se dibujan igual. Un dibujo que se
// deforma para dejarle sitio a lo que tiene encima se ve deforme; uno
// que sigue derecho y queda tapado se lee como profundidad. Del borde
// inferior sobrevive de x 2 a 13.8 y del derecho de y 8.1 a 12.6, que es
// suficiente para que el rectángulo se siga leyendo por detrás.
//
// Ojo: el círculo centrado vuelve a acercarse al patrón de cámara. Lo
// que lo evita ahora son los puntos de esquina y la propia insignia —
// una cámara no lleva insignia. Si algún día se quitan los puntos,
// vuelve el problema.
//
// Para un interior sin círculo —cero riesgo de cámara— cambia el Circle
// y el Path del punto por: <Path d="M5.6 9h9.4M5.6 13h5.8" />
// Ingreso: un fajo. Un billete al frente y otro asomando por detrás.
//
// La caja envolvente es 20×15 EXACTA, la misma que IconCash — el pago de
// tarjeta, con el que comparte fila en Inicio e Historial. No por
// casualidad: el billete de atrás va de y 4.5 a 15.5 y el de adelante de
// 8.5 a 19.5, así que la unión da justo 15 de alto; y de x 2 a 22 entre
// los dos, justo 20 de ancho. Si se mueve cualquiera de los dos, hay que
// rehacer la cuenta o los dos iconos dejan de medir lo mismo.
//
// El billete de atrás es un trazo PARCIAL, no un rectángulo completo:
// arranca en (6.6, 8.5) —sobre el borde superior del de adelante— y
// termina en (17.6, 15.5), justo antes de su borde derecho. Como aquí
// nada lleva relleno, un rectángulo entero se vería a través del otro y
// el fajo parecería dos marcos superpuestos en vez de dos billetes.
//
// El círculo y los dos puntos son los de IconCash con la sangría
// proporcional al billete más chico. Los puntos no son adorno: un
// rectángulo redondeado con un círculo centrado se lee como CÁMARA, y
// las marcas de esquina son lo que lo devuelve a billete.
//
// bgColor ya no se usa —la versión con insignia calada quedó atrás— pero
// se deja en la firma porque HomeScreen e HistoryScreen aún lo pasan.
export function IconBanknotePlus({ color, bgColor, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Path
                d="M6.6 8.5V7.1a2.6 2.6 0 0 1 2.6-2.6h10.2a2.6 2.6 0 0 1 2.6 2.6v5.8a2.6 2.6 0 0 1-2.6 2.6h-1.8"
                {...line(size, color)}
            />
            <Rect x="2" y="8.5" width="15.4" height="11" rx={R_SMALL} {...line(size, color)} />
            <Circle cx="9.7" cy="14" r="2.3" {...line(size, color)} />
            <Path d="M4.8 11.4h.1M14.6 16.6h.1" {...line(size, color)} />
        </Svg>
    );
}

export function IconCard({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Rect x="2" y="4.5" width="20" height="15" rx={R_SMALL} {...line(size, color)} />
            <Path d="M2 9.2h20" {...line(size, color)} />
            <Path d="M5.6 15.4h3.6" {...line(size, color)} />
        </Svg>
    );
}

// Pago de tarjeta: la misma tarjeta de IconCardAdd, con una palomita
// en la esquina en vez del "+". Es el icono de la familia cardPayment
// en Inicio, Historial y el menú de Tarjetas; IconCash queda para
// efectivo.
export function IconCardPayment({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M2 12.6V7.5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3.2" {...line(size, color)} />
            <Path d="M12.4 19.5H5a3 3 0 0 1-3-3" {...line(size, color)} />
            <Path d="M2 9.2h20" {...line(size, color)} />
            <Path d="M14.6 16.8l2.2 2.2 4.4-4.6" {...line(size, color)} />
        </Svg>
    );
}

// Objetivo: un blanco con la flecha clavada en el centro y saliendo
// hacia arriba a la derecha. Antes los objetivos usaban la bolsa de
// IconSavings, que es el ícono de la pestaña; ahora la bolsa es
// "ahorros" y esto es "un objetivo". Por debajo de 16 px la flecha
// se omite (se confundiría con un reloj) y queda sólo el blanco.
export function IconGoal({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Circle cx="12" cy="12" r="8.5" {...line(size, color)} />
            <Circle cx="12" cy="12" r="4.6" {...line(size, color)} />
            {size >= 16 ? (
                <>
                    <Path d="M12 12l5.6-5.6" {...line(size, color)} />
                    <Path d="M17.6 6.4l3.1-.5-.5 3.1" {...line(size, color)} />
                </>
            ) : (
                <Circle cx="12" cy="12" r="1.15" fill={color} />
            )}
        </Svg>
    );
}

export function IconCardAdd({ color, bgColor, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M2 12.6V7.5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3.2" {...line(size, color)} />
            <Path d="M12.4 19.5H5a3 3 0 0 1-3-3" {...line(size, color)} />
            <Path d="M2 9.2h20" {...line(size, color)} />
            <Path d="M17.6 13.4v6.4M14.4 16.6h6.4" {...line(size, color)} />
        </Svg>
    );
}

export function IconWallet({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M2 8.5a3 3 0 0 1 3-3h11.6a3 3 0 0 1 3 3" {...line(size, color)} />
            <Rect x="2" y="8.5" width="20" height="11" rx={R_SMALL} {...line(size, color)} />
            <Path d="M22 12.4h-4a1.8 1.8 0 0 0 0 3.6h4" {...line(size, color)} />
        </Svg>
    );
}

export function IconReceipt({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M4.5 3.4h15v17.2l-2.5-1.6-2.5 1.6-2.5-1.6-2.5 1.6-2.5-1.6-2.5 1.6V3.4Z" {...line(size, color)} />
            <Path d="M8.6 8.4h6.8M8.6 12.4h4.6" {...line(size, color)} />
        </Svg>
    );
}

export function IconDocument({ color, size = IconSize.lg }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M13.4 2.6H7a2.4 2.4 0 0 0-2.4 2.4v14a2.4 2.4 0 0 0 2.4 2.4h10a2.4 2.4 0 0 0 2.4-2.4V8.6l-6-6Z" {...line(size, color)} />
            <Path d="M13.4 2.6v6h6" {...line(size, color)} />
            <Path d="M8.6 13.4h6.8M8.6 17h4.6" {...line(size, color)} />
        </Svg>
    );
}

export function IconCalendar({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Rect x="3" y="5.4" width="18" height="15.6" rx={R_SMALL} {...line(size, color)} />
            <Path d="M3 10.2h18" {...line(size, color)} />
            <Path d="M8.2 3v4.4M15.8 3v4.4" {...line(size, color)} />
        </Svg>
    );
}

export function IconCalendarClock({ color, size = IconSize.md }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M21 11.4V8.4a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v9.6a3 3 0 0 0 3 3h5.4" {...line(size, color)} />
            <Path d="M3 10.2h18" {...line(size, color)} />
            <Path d="M8.2 3v4.4M15.8 3v4.4" {...line(size, color)} />
            <Circle cx="17.4" cy="17.4" r="4.2" {...line(size, color)} />
            <Path d="M17.4 15.6v1.9l1.3.9" {...line(size, color)} />
        </Svg>
    );
}

export function IconWarningTriangle({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M12 3.8 21.4 20H2.6L12 3.8Z" {...line(size, color)} />
            <Path d="M12 10v4.2M12 17.4h.1" {...line(size, color)} />
        </Svg>
    );
}

// ── Etiquetas ───────────────────────────────────────────────────
// Las diez viven en el mismo paso (IconSize.sm por defecto, porque
// siempre salen dentro de una pastilla) y respetan la misma rejilla que
// el resto. Antes tenían su propio tamaño por defecto de 18 y quedaban
// más grandes que los chevrons que las acompañaban en la misma fila.
export function IconTagFood({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M6.4 3v8.4a2.6 2.6 0 0 0 5.2 0V3" {...line(size, color)} />
            <Path d="M9 3v18" {...line(size, color)} />
            <Path d="M17.6 3c-1.6 1.6-2.4 3.6-2.4 6s.8 3.4 2.4 3.4V21" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagTransport({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M3.4 14.4 5 8.6a2.6 2.6 0 0 1 2.5-1.9h9a2.6 2.6 0 0 1 2.5 1.9l1.6 5.8" {...line(size, color)} />
            <Rect x="2.6" y="14.4" width="18.8" height="4.6" rx={R_SMALL} {...line(size, color)} />
            <Path d="M6.6 21v-2M17.4 21v-2" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagCart({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M2.6 3.6h2.6l2.6 11.2a1.6 1.6 0 0 0 1.6 1.2h7.8a1.6 1.6 0 0 0 1.6-1.2l1.6-6.6H6.2" {...line(size, color)} />
            <Circle cx="9.4" cy="20" r="1.4" {...line(size, color)} />
            <Circle cx="17.4" cy="20" r="1.4" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagHealth({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M12 20.4S3.6 15.4 3.6 9.6a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 8.4 2.6c0 5.8-8.4 10.8-8.4 10.8Z" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagEntertainment({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M9.4 18.6V5.4l10 3.2v6.8" {...line(size, color)} />
            <Circle cx="6.4" cy="18.6" r="3" {...line(size, color)} />
            <Circle cx="16.4" cy="15.4" r="3" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagClothing({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M9 3.4 3.4 6.6l2 4.2 2-.9V20.6h9.2V9.9l2 .9 2-4.2L15 3.4a3 3 0 0 1-6 0Z" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagHome({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M3.6 10.4 12 3.4l8.4 7v9.2a1.4 1.4 0 0 1-1.4 1.4H5a1.4 1.4 0 0 1-1.4-1.4v-9.2Z" {...line(size, color)} />
            <Path d="M9.3 21v-6.2h5.4V21" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagServices({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M13 3.4 5.6 13h5.4l-2 7.6L16.4 11H11l2-7.6Z" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagEducation({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Path d="M12 4 2.6 8.6 12 13.2l9.4-4.6L12 4Z" {...line(size, color)} />
            <Path d="M6.4 10.8v5.4c0 1.8 2.5 3.2 5.6 3.2s5.6-1.4 5.6-3.2v-5.4" {...line(size, color)} />
        </Svg>
    );
}

export function IconTagOther({ color, size = IconSize.sm }) {
    return (
        <Svg {...svg(size)}>
            <Circle cx="5.6" cy="12" r="1.7" {...line(size, color)} />
            <Circle cx="12" cy="12" r="1.7" {...line(size, color)} />
            <Circle cx="18.4" cy="12" r="1.7" {...line(size, color)} />
        </Svg>
    );
}