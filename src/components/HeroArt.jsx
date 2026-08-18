// Decoration for Home's hero card ONLY — not a global background.
// Landscape-proportioned (viewBox ~2:1), sized via measured
// width/height (HomeScreen passes it in via onLayout, since the hero's
// height is content-driven, not fixed). preserveAspectRatio="xMidYMid
// slice" crops the fixed 280×140 design to cover whatever that turns out to be.
//
// Same as AppBackground: react-native-svg doesn't reliably support
// <filter> across platforms, so every "glow" here is a radial
// gradient fading to transparent, never a blur.
import { StyleSheet } from 'react-native';
import { Svg, Defs, RadialGradient, LinearGradient, Stop, Circle, Path, Line, ClipPath, Rect, G } from 'react-native-svg';

const VB_W = 280;
const VB_H = 140;

// Off-center on purpose — peaks left, moon sits right, giving
// diagonal balance instead of a static centered composition.
const HORIZON = "M0,108 C40,90 70,82 100,86 C150,92 220,102 280,110 L280,140 L0,140 Z";

function Stars({ color }) {
    return (
        <G fill={color}>
            <Circle cx="40" cy="20" r="0.9" opacity="0.35" /><Circle cx="75" cy="35" r="0.7" opacity="0.28" />
            <Circle cx="15" cy="45" r="0.7" opacity="0.26" /><Circle cx="100" cy="18" r="0.8" opacity="0.32" />
            <Circle cx="130" cy="50" r="0.7" opacity="0.26" /><Circle cx="55" cy="60" r="0.7" opacity="0.24" />
            <Circle cx="160" cy="25" r="0.7" opacity="0.26" /><Circle cx="25" cy="70" r="0.6" opacity="0.22" />
        </G>
    );
}

// Moon + stars + horizon, with a second subtler hill layer for depth.
function MedianocheHero() {
    return (
        <>
            <Defs>
                <LinearGradient id="hmnSky" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#0A0D14" />
                    <Stop offset="100%" stopColor="#11151D" />
                </LinearGradient>
                <RadialGradient id="hmnGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#5FC9BD" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#5FC9BD" stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#hmnSky)" />
            <Stars color="#ECEEE7" />
            <Circle cx="210" cy="42" r="42" fill="url(#hmnGlow)" />
            <Circle cx="210" cy="42" r="13" fill="#ECEEE7" />
            <Path d="M0,98 C50,80 90,92 140,84 C190,76 230,90 280,80 L280,140 L0,140 Z" fill="#161B24" opacity="0.6" />
            <Path d={HORIZON} fill="#0A0C10" opacity="0.92" />
        </>
    );
}

export default function HeroArt({ width, height }) {
    if (!width || !height) return null;

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid slice"
            style={StyleSheet.absoluteFillObject}
        >
            <MedianocheHero />
        </Svg>
    );
}