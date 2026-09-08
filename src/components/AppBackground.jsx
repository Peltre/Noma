// Fondo global, montado una vez en App.js detrás del navigator. Todo
// el vidrio de la app —tarjetas, hojas, tab bar— desenfoca esto.
//
// Coordenadas horneadas, no aleatorias por render, para que el layout
// sea estable.
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';
import { useTheme } from '../store/useTheme';

const VB_W = 400;
const VB_H = 870;

const STARS = [
    [0, 388.8, 1.2, 0.21], [344.2, 355.4, 1.4, 0.34], [188.9, 245, 1.1, 0.41],
    [56.2, 330.9, 1.5, 0.45], [153.1, 73.7, 1.1, 0.42], [236.9, 482.4, 1.4, 0.27],
    [123.1, 692.7, 0.8, 0.26], [230.4, 620.4, 0.8, 0.32], [354.8, 454.2, 0.9, 0.38],
    [383.6, 278.8, 1.9, 0.21], [287, 703, 1.9, 0.29], [66.7, 695.6, 1.9, 0.42],
    [399.9, 696.5, 1.3, 0.28], [246.2, 20.9, 1.9, 0.45], [140.7, 760.6, 0.8, 0.4],
    [380.5, 478.3, 1.6, 0.35], [341.2, 377.4, 1.9, 0.5], [170.2, 705.8, 1.4, 0.27],
    [19.2, 45.2, 1.8, 0.23], [140.3, 479.3, 1.3, 0.34], [42.4, 329.7, 1.0, 0.37],
    [220.3, 804.7, 0.9, 0.49], [397.6, 673.6, 1.5, 0.31], [344.5, 562, 1.4, 0.29],
    [213.2, 223.3, 2.0, 0.37], [364.1, 128, 1.0, 0.49],
];

// Destello como trazo en cruz, no blur: misma razón que en HeroArt.
const SPARKLES = [[280, 95, 1], [320, 400, 0.85]];

export default function AppBackground() {
    const { width, height } = useWindowDimensions();
    const { theme } = useTheme();
    const accent = theme.ink;

    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="xMidYMid slice"
            >
                <Defs>
                    <LinearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={theme.bgTop} />
                        <Stop offset="46%" stopColor={theme.bg} />
                        <Stop offset="100%" stopColor={theme.bgBottom} />
                    </LinearGradient>
                </Defs>
                <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#bgSky)" />
                <G fill={accent}>
                    {STARS.map(([x, y, r, op], i) => (
                        <Circle key={i} cx={x} cy={y} r={r} opacity={op} />
                    ))}
                </G>
                {SPARKLES.map(([x, y, s], i) => (
                    <G key={i} opacity="0.55">
                        <Circle cx={x} cy={y} r={1.6 * s} fill={accent} />
                        <Path
                            d={`M${x},${y - 6 * s} L${x},${y + 6 * s} M${x - 6 * s},${y} L${x + 6 * s},${y}`}
                            stroke={accent}
                            strokeWidth={0.6 * s}
                            strokeLinecap="round"
                        />
                    </G>
                ))}
            </Svg>
        </View>
    );
}