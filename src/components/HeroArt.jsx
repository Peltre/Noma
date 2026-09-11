// Decoración de la tarjeta héroe de Inicio. El fondo global es
// AppBackground.jsx.
//
// ── Por qué cambió ──
// Antes esta pieza pintaba un cielo OPACO con siete colores horneados
// a mano (#1D2534, #5FCDBE, #ECEEE7…) que imitaban el tema sin serlo:
// su turquesa era #5FCDBE y theme.brand es #47BEAE, así que ya estaban
// desincronizados. Al ser opaca, además, obligaba a que el héroe fuera
// la única tarjeta de la app SIN el material de vidrio: no había nada
// detrás que desenfocar.
//
// Ahora todo es translúcido y todo sale de `theme`. El BlurView de
// GlassCard sigue trabajando por debajo, así que el héroe usa el mismo
// material que el resto y el cielo de AppBackground se ve a través.
// Cambiar la paleta ya mueve esta tarjeta con las demás.
//
// react-native-svg no soporta <filter> de forma confiable en todas las
// plataformas, así que cada resplandor es un gradiente radial, no un blur.
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';

const VB_W = 280;
const VB_H = 150;

// Coordenadas fijas, nunca aleatorias por render: el layout tiene que
// ser el mismo en cada pintada.
const STARS = [
    [34, 26, 0.9, 0.32], [96, 16, 1.0, 0.26], [142, 34, 0.85, 0.36],
    [236, 20, 0.75, 0.28], [254, 78, 1.1, 0.22], [150, 92, 0.8, 0.28],
    [20, 62, 0.9, 0.24], [68, 48, 0.7, 0.22], [118, 60, 0.75, 0.2],
];

export default function HeroArt({ width, height, theme }) {
    if (!width || !height || !theme) return null;

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid slice"
            style={StyleSheet.absoluteFill}
        >
            <Defs>
                {/* Halo de la luna: el único lugar del héroe donde el
                    turquesa de marca aparece como luz y no como dato. */}
                <RadialGradient id="heroHalo" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={theme.brand} stopOpacity="0.20" />
                    <Stop offset="60%" stopColor={theme.brand} stopOpacity="0.06" />
                    <Stop offset="100%" stopColor={theme.brand} stopOpacity="0" />
                </RadialGradient>

                {/* Las dunas se apoyan en bgBottom con alfa, no en un
                    color sólido: así el desenfoque del vidrio sigue
                    leyéndose a través de ellas. */}
                <LinearGradient id="heroDuneFar" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={theme.bgTop} stopOpacity="0.34" />
                    <Stop offset="100%" stopColor={theme.bgBottom} stopOpacity="0.42" />
                </LinearGradient>
                <LinearGradient id="heroDuneNear" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={theme.bgBottom} stopOpacity="0.46" />
                    <Stop offset="100%" stopColor={theme.bgBottom} stopOpacity="0.66" />
                </LinearGradient>
            </Defs>

            {/* En diagonal desde el saludo hacia abajo a la derecha, a la
                altura del balance y con aire respecto al engrane de ajustes
                (esquina superior derecha).
                La luna es un disco SÓLIDO, no un degradado. El borde
                desvanecido la hacía leer como mancha, y de paso se fundía
                con el halo: no se distinguía dónde acababa el cuerpo y
                empezaba la luz. Con canto duro, el halo por fin se lee
                como resplandor alrededor de algo.
                cy pasó de 22 a 36 porque a r=11 quedaba pegada al borde
                superior. Ojo si se sube de nuevo: el kebab de ajustes vive
                por ahí (~x 250 en estas coordenadas) y es ink a 0.85, así
                que sobre la luna desaparecería. */}
            <Circle cx="188" cy="44" r="74" fill="url(#heroHalo)" />
            <Circle cx="190" cy="44" r="11" fill={theme.ink} opacity={0.82} />

            <G fill={theme.ink}>
                {STARS.map(([cx, cy, r, op], i) => (
                    <Circle key={i} cx={cx} cy={cy} r={r} opacity={op} />
                ))}
            </G>

            {/* Dos crestas, no una: la separación entre ambas es lo que
                da sensación de profundidad sin necesitar sombra. */}
            <Path
                d="M0,116 C46,102 86,110 130,104 C176,98 226,108 280,100 L280,150 L0,150 Z"
                fill="url(#heroDuneFar)"
            />
            <Path
                d="M0,128 Q48,113 96,123 T196,117 T280,130 L280,150 L0,150 Z"
                fill="url(#heroDuneNear)"
            />
        </Svg>
    );
}