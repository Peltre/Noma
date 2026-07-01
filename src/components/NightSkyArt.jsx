// Decorative night hero art: a moon with a soft glow rising behind a
// dune silhouette, with a few stars above. Colors come in as props so
// the same art can be reused for other dark themes later.
//
// width/height are required, explicit pixel numbers — not "100%".
// react-native-svg doesn't reliably stretch a percentage-sized Svg to
// match an auto-height flex parent on native (it renders at some
// smaller intrinsic size instead, leaving the card partly uncovered).
// The parent measures itself with onLayout and passes the real size
// down instead.
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

export default function NightSkyArt({
    width,
    height,
    glowColor,
    moonColor,
    duneColor,
    starColor,
    moonCx = 210,
    moonCy = 54,
}) {
    return (
        <Svg
            style={{ position: 'absolute', top: 0, left: 0 }}
            width={width}
            height={height}
            viewBox="0 0 280 140"
            preserveAspectRatio="none"
            pointerEvents="none"
        >
            <Defs>
                <RadialGradient id="nightGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={glowColor} stopOpacity={0.55} />
                    <Stop offset="45%" stopColor={glowColor} stopOpacity={0.18} />
                    <Stop offset="100%" stopColor={glowColor} stopOpacity={0} />
                </RadialGradient>
            </Defs>

            {/* Glow and moon disc */}
            <Circle cx={moonCx} cy={moonCy} r={38} fill="url(#nightGlow)" />
            <Circle cx={moonCx} cy={moonCy} r={13} fill={moonColor} />

            {/* Stars scattered in the upper area */}
            <Circle cx="36" cy="16" r="1.3" fill={starColor} opacity={0.5} />
            <Circle cx="68" cy="28" r="1" fill={starColor} opacity={0.35} />
            <Circle cx="118" cy="12" r="1.4" fill={starColor} opacity={0.45} />
            <Circle cx="150" cy="24" r="1" fill={starColor} opacity={0.35} />
            <Circle cx="20" cy="34" r="1" fill={starColor} opacity={0.35} />
            <Circle cx="92" cy="20" r="1" fill={starColor} opacity={0.4} />
            <Circle cx="178" cy="14" r="1.1" fill={starColor} opacity={0.4} />
            <Circle cx="130" cy="32" r="1" fill={starColor} opacity={0.3} />

            {/* Far ridge: translucent, suggests a second dune */}
            <Path
                d="M0,140 L0,86 C40,64 80,92 120,78 C160,62 200,90 240,74 C260,64 270,70 280,64 L280,140 Z"
                fill={duneColor}
                opacity={0.5}
            />
            {/* Near ridge: solid, covers the bottom of the card */}
            <Path
                d="M0,140 L0,108 C50,90 90,112 140,100 C180,90 210,108 280,94 L280,140 Z"
                fill={duneColor}
            />
        </Svg>
    );
}