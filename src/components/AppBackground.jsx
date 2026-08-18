// Global background, mounted once in App.js behind the navigator —
// NOT the illustrated scene (that's HeroArt.jsx, scoped to Home's
// hero card). Every other glass card/tab bar in the app blurs THIS.
//
// A gradient anchored to theme.bg with a scattered starfield on top —
// coordinates are baked-in (generated once with a seeded PRNG), not
// random-per-render, so the layout is stable.
//
// Same as HeroArt: react-native-svg doesn't reliably support <filter>
// across platforms, so the star "sparkle" glow is a plus-shaped
// stroke, not an actual blur.
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';

const VB_W = 400;
const VB_H = 870;

// Deliberately darker than theme.bg — the stars carry the visual
// interest on top, not the gradient itself.
const PALETTE = { top: '#11121a', bottom: '#11121a', accent: '#ECEEE7' };

// 26 quiet stars plus two brighter "sparkle" accents (dot + 4-point cross).
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
const SPARKLES = [[240, 95, 1], [320, 400, 0.85]];

function Stars({ color }) {
    return (
        <>
            <G fill={color}>
                {STARS.map(([x, y, r, op], i) => (
                    <Circle key={i} cx={x} cy={y} r={r} opacity={op} />
                ))}
            </G>
            {SPARKLES.map(([x, y, s], i) => (
                <G key={i} opacity="0.55">
                    <Circle cx={x} cy={y} r={1.6 * s} fill={color} />
                    <Path
                        d={`M${x},${y - 6 * s} L${x},${y + 6 * s} M${x - 6 * s},${y} L${x + 6 * s},${y}`}
                        stroke={color}
                        strokeWidth={0.6 * s}
                        strokeLinecap="round"
                    />
                </G>
            ))}
        </>
    );
}

export default function AppBackground() {
    const { width, height } = useWindowDimensions();

    return (
        <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}>
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="xMidYMid slice"
            >
                <Defs>
                    <LinearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={PALETTE.top} />
                        <Stop offset="100%" stopColor={PALETTE.bottom} />
                    </LinearGradient>
                </Defs>
                <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#bgSky)" />
                <Stars color={PALETTE.accent} />
            </Svg>
        </View>
    );
}