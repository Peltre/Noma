// Global background, mounted once in App.js behind the navigator —
// NOT the illustrated scene anymore (that's HeroArt.jsx now, scoped
// to just Home's hero card). Every other glass card in the app
// (credit cards, transaction lists, Ahorros/Historial/Settings
// cards, the tab bar) blurs THIS.
//
// Went through a few pure-gradient iterations before this one (single
// centered glow, four scattered glows, a too-subtle 2-tone gradient)
// before landing on this: keep the same anchored-to-theme.bg gradient
// as the stable base, but give each theme its own small "personality"
// of scattered particles instead of trying to make one shape design
// work for all three — Medianoche gets quiet stars, Brasa gets warm
// embers (literal to the theme's name), Arena gets drifting dust/light
// motes. Coordinates below are baked-in (not random-per-render) so
// the layout is stable across re-renders and matches what was
// actually approved in mockup — generated once with a seeded PRNG and
// copied in, not computed on the fly.
//
// Same platform note as HeroArt: react-native-svg doesn't reliably
// support <filter> (feGaussianBlur) across iOS/Android/web, so ember
// "glow" here is a second, larger, low-opacity circle underneath the
// dot rather than an actually-blurred halo.
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';

const VB_W = 400;
const VB_H = 870;

// [topColor, bottomColor] per theme. Deliberately darker than each
// theme's own `theme.bg` now — a later, explicit request to go past
// that anchor, after this had been restored to match it exactly.
// Particles (stars/embers/dust) still carry the visual interest on
// top of this — see the STARS/EMBERS/DUST arrays below, untouched by
// this.
const PALETTES = {
    medianoche: { top: '#11121a', bottom: '#11121a', accent: '#ECEEE7', accent2: '#5FC9BD' },
    brasa: { top: '#150E0A', bottom: '#150E0A', accent: '#D9763E', accent2: '#F2A65A' },
    arena: { top: '#F1E9D9', bottom: '#F1E9D9', accent: '#F0C87E', accent2: '#C17C3A' },
};

// Medianoche — 26 quiet stars, mostly small and dim, plus two
// brighter "sparkle" accents (a dot with a small 4-point cross) for a
// touch of twinkle without turning the whole field busy.
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
const SPARKLES = [[90, 140, 1], [320, 400, 0.85]];

// Brasa — 22 embers, warm two-tone (accent/accent2 alternating), the
// bigger ones (r > 2.4) get a soft low-opacity halo underneath to
// read as glowing rather than just a solid warm dot.
const EMBERS = [
    [0.1, 777.6, 2.6, 0.29, 1], [326.8, 30.4, 3.4, 0.63, 1], [174.8, 371.6, 1.7, 0.55, 2],
    [261.4, 665.8, 1.4, 0.42, 2], [73.9, 94.8, 3.5, 0.44, 1], [237, 20.2, 2.0, 0.31, 2],
    [10.8, 668.5, 3.0, 0.27, 2], [88.5, 798.7, 2.7, 0.57, 2], [173.9, 536, 3.3, 0.48, 2],
    [239.6, 779.5, 2.2, 0.65, 1], [345.2, 443.8, 1.6, 0.27, 1], [265.3, 611.9, 2.9, 0.25, 2],
    [360.9, 86.6, 1.9, 0.26, 1], [347, 744, 3.6, 0.59, 1], [6.2, 392.5, 1.2, 0.29, 1],
    [87.1, 610.4, 1.3, 0.55, 1], [84.8, 659.5, 1.9, 0.31, 2], [340, 171.3, 3.5, 0.65, 1],
    [52.1, 643, 2.9, 0.37, 2], [244.6, 57.2, 2.3, 0.62, 2], [328.3, 255.9, 1.8, 0.62, 2],
    [230.6, 568, 2.9, 0.55, 1],
];

// Arena — 30 small dust/light motes, dimmer and smaller than either
// of the night themes' particles since this is meant to read as
// "sunlight catching dust", not a focal point.
const DUST = [
    [0.1, 296.4, 1.9, 0.19], [232.5, 196.3, 1.4, 0.26], [166.7, 735, 1.5, 0.19],
    [168.7, 122.6, 1.7, 0.28], [59.2, 221, 1.5, 0.21], [310.8, 577.2, 1.2, 0.35],
    [369.4, 338.1, 0.6, 0.31], [291.2, 121.2, 0.7, 0.19], [264.4, 492.7, 1.0, 0.38],
    [350.8, 836.5, 1.6, 0.17], [60.9, 369, 1.8, 0.39], [200, 346.8, 1.8, 0.2],
    [399.8, 349.4, 1.0, 0.36], [338.6, 62.6, 1.8, 0.29], [22, 541.7, 0.6, 0.43],
    [341.4, 564.9, 0.7, 0.3], [223.7, 262.1, 1.7, 0.43], [110.5, 377.3, 1.3, 0.34],
    [57.5, 135.7, 1.3, 0.24], [20.9, 567.9, 0.8, 0.27], [127.2, 119.2, 1.3, 0.35],
    [260.9, 674.2, 1.0, 0.41], [392.8, 280.9, 1.6, 0.18], [233.4, 816.1, 1.3, 0.41],
    [239.5, 669.8, 1.8, 0.35], [292.4, 383.9, 1.3, 0.4], [29.1, 752.2, 1.3, 0.18],
    [254.7, 391.4, 1.3, 0.34], [120.5, 343.1, 1.5, 0.37], [108.9, 18.1, 1.4, 0.24],
];

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

function Embers({ colorA, colorB }) {
    return (
        <G>
            {EMBERS.map(([x, y, r, op, which], i) => {
                const color = which === 1 ? colorA : colorB;
                return (
                    <G key={i}>
                        {r > 2.4 && <Circle cx={x} cy={y} r={r * 3} fill={color} opacity={op * 0.15} />}
                        <Circle cx={x} cy={y} r={r} fill={color} opacity={op} />
                    </G>
                );
            })}
        </G>
    );
}

function Dust({ color }) {
    return (
        <G fill={color}>
            {DUST.map(([x, y, r, op], i) => (
                <Circle key={i} cx={x} cy={y} r={r} opacity={op} />
            ))}
        </G>
    );
}

export default function AppBackground({ themeName }) {
    const { width, height } = useWindowDimensions();
    const palette = PALETTES[themeName] || PALETTES.medianoche;

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="xMidYMid slice"
            >
                <Defs>
                    <LinearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={palette.top} />
                        <Stop offset="100%" stopColor={palette.bottom} />
                    </LinearGradient>
                </Defs>
                <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#bgSky)" />

                {themeName === 'brasa' ? (
                    <Embers colorA={palette.accent} colorB={palette.accent2} />
                ) : themeName === 'arena' ? (
                    <Dust color={palette.accent2} />
                ) : (
                    <Stars color={palette.accent} />
                )}
            </Svg>
        </View>
    );
}