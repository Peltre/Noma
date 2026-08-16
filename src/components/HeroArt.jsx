// Decoration for Home's hero card ONLY — not a global background.
// Landscape-proportioned (viewBox ~2:1), sized via measured
// width/height (HomeScreen passes it in via onLayout, since the hero's
// height is content-driven, not fixed). preserveAspectRatio="xMidYMid
// slice" crops the fixed 280×140 design to cover whatever that turns out to be.
//
// Each theme gets its own composition instead of a palette swap of
// the same shapes, so the five read as different scenes. Shared
// pieces (the horizon curve, the star field) stay shared below only
// where it's actually the same idea.
//
// Same as AppBackground: react-native-svg doesn't reliably support
// <filter> across platforms, so every "glow" here is a radial
// gradient fading to transparent, never a blur.
import { StyleSheet } from 'react-native';
import { Svg, Defs, RadialGradient, LinearGradient, Stop, Circle, Path, Line, ClipPath, Rect, G } from 'react-native-svg';

const VB_W = 280;
const VB_H = 140;

// Off-center on purpose — peaks left, moon/sun sits right, giving
// diagonal balance instead of a static centered composition. Shared
// by every theme except Neón, which uses a geometric grid instead.
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

// Moon + stars + horizon, with a second subtler hill layer for depth
// — Medianoche's own distinguishing touch.
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

// No moon — a warm glow AT the horizon plus drifting embers, reading
// as "warmth from the ground" (brasa = embers/coals) instead of a
// recolored moon.
function BrasaHero() {
    const embers = [
        [165, 95, 1.3, 0.6], [185, 70, 1, 0.5], [200, 50, 0.8, 0.4], [150, 60, 0.9, 0.45],
        [210, 85, 1.1, 0.55], [170, 40, 0.7, 0.35], [195, 100, 1.2, 0.6], [220, 65, 0.8, 0.4],
    ];
    return (
        <>
            <Defs>
                <LinearGradient id="hbrSky" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#140C10" />
                    <Stop offset="100%" stopColor="#1E160F" />
                </LinearGradient>
                <RadialGradient id="hbrGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#D9763E" stopOpacity="0.45" />
                    <Stop offset="100%" stopColor="#D9763E" stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#hbrSky)" />
            <Circle cx="180" cy="105" r="55" fill="url(#hbrGlow)" />
            <Path d={HORIZON} fill="#150C08" opacity="0.92" />
            <G fill="#F2A65A">
                {embers.map(([x, y, r, op], i) => <Circle key={i} cx={x} cy={y} r={r} opacity={op} />)}
            </G>
        </>
    );
}

// Sun rays radiating outward — the classic desert-sun silhouette,
// distinct from Amanecer's rings even though both are daytime.
function ArenaHero() {
    return (
        <>
            <Defs>
                <LinearGradient id="harSky" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FBF3E4" />
                    <Stop offset="100%" stopColor="#F6F1E7" />
                </LinearGradient>
                <RadialGradient id="harGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#F0C87E" stopOpacity="0.75" />
                    <Stop offset="100%" stopColor="#C17C3A" stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#harSky)" />
            <G stroke="#E8B979" strokeWidth="1.6" strokeLinecap="round" opacity="0.45">
                <Line x1="210" y1="42" x2="210" y2="10" />
                <Line x1="210" y1="42" x2="238" y2="18" />
                <Line x1="210" y1="42" x2="182" y2="18" />
                <Line x1="210" y1="42" x2="248" y2="42" />
                <Line x1="210" y1="42" x2="172" y2="42" />
                <Line x1="210" y1="42" x2="238" y2="66" />
                <Line x1="210" y1="42" x2="182" y2="66" />
            </G>
            <Circle cx="210" cy="42" r="36" fill="url(#harGlow)" />
            <Circle cx="210" cy="42" r="13" fill="#FBEBC4" />
            <Path d={HORIZON} fill="#D9BE8E" />
        </>
    );
}

// Just the gradient — no shapes. The three theme colors (pink, cream,
// lavender), diagonal, doing all the work. Opacity < 1 so it blends
// into the card's white surface rather than full-strength.
function AmanecerHero() {
    return (
        <>
            <Defs>
                <LinearGradient id="hamSky" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#F2A6B4" />
                    <Stop offset="50%" stopColor="#FBDDD3" />
                    <Stop offset="100%" stopColor="#C4B0E8" />
                </LinearGradient>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#hamSky)" opacity={0.95} />
        </>
    );
}

// Trades the shared organic horizon for a geometric perspective grid
// — a synthwave skyline, since "cyberpunk" isn't a desert time-of-day
// to begin with. Light source is a hexagon (not a circle, unlike
// every other theme's sun/moon) so it reads as a signal/HUD element,
// not just "the red moon".
function NeonHero() {
    const HEX = "M210,26 L196,34 L196,50 L210,58 L224,50 L224,34 Z";
    return (
        <>
            <Defs>
                <LinearGradient id="hneSky" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#150A0D" />
                    <Stop offset="100%" stopColor="#0A0708" />
                </LinearGradient>
                <RadialGradient id="hneGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#FF1744" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#FF1744" stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#hneSky)" />
            <Stars color="#FF7A9A" />
            <Circle cx="210" cy="42" r="42" fill="url(#hneGlow)" />
            <Path d={HEX} fill="#FF1744" />
            <Path d={HEX} fill="none" stroke="#FF7A9A" strokeWidth="1" opacity="0.6" />
            <Path d="M0,108 H280 V140 H0 Z" fill="#12050A" />
            <G stroke="#FF1744" strokeWidth="0.8" opacity="0.5" fill="none">
                <Line x1="0" y1="140" x2="280" y2="140" />
                <Line x1="10" y1="128" x2="270" y2="128" />
                <Line x1="30" y1="119" x2="250" y2="119" />
                <Line x1="55" y1="113" x2="225" y2="113" />
                <Line x1="85" y1="109" x2="195" y2="109" />
            </G>
            <G stroke="#FF1744" strokeWidth="0.8" opacity="0.4">
                <Line x1="140" y1="108" x2="0" y2="140" />
                <Line x1="140" y1="108" x2="56" y2="140" />
                <Line x1="140" y1="108" x2="112" y2="140" />
                <Line x1="140" y1="108" x2="168" y2="140" />
                <Line x1="140" y1="108" x2="224" y2="140" />
                <Line x1="140" y1="108" x2="280" y2="140" />
            </G>
        </>
    );
}

// The genre's signature image: a striped retro sun (circle clipped by
// horizontal bands, "outrun" style) over a two-color grid — pink near,
// cyan far — same grid mechanic as Neón, colored differently.
function SynthwaveHero() {
    return (
        <>
            <Defs>
                <LinearGradient id="hswSky" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#2D1445" />
                    <Stop offset="45%" stopColor="#7B2F6B" />
                    <Stop offset="75%" stopColor="#E8567A" />
                    <Stop offset="100%" stopColor="#1A0B2E" />
                </LinearGradient>
                <RadialGradient id="hswGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#FF2E97" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#FF2E97" stopOpacity="0" />
                </RadialGradient>
                <ClipPath id="hswSunClip">
                    <Circle cx="210" cy="50" r="22" />
                </ClipPath>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#hswSky)" />
            <Circle cx="210" cy="50" r="46" fill="url(#hswGlow)" />
            <G clipPath="url(#hswSunClip)">
                <Rect x="188" y="28" width="44" height="44" fill="#FFCC66" />
                <Rect x="188" y="34" width="44" height="4" fill="#FF9A3C" />
                <Rect x="188" y="42" width="44" height="4" fill="#FF9A3C" />
                <Rect x="188" y="50" width="44" height="4" fill="#FF9A3C" />
                <Rect x="188" y="58" width="44" height="4" fill="#FF9A3C" />
                <Rect x="188" y="66" width="44" height="4" fill="#FF9A3C" />
            </G>
            <Path d="M0,108 H280 V140 H0 Z" fill="#160A1E" />
            <G stroke="#FF2E97" strokeWidth="0.8" opacity="0.55" fill="none">
                <Line x1="0" y1="140" x2="280" y2="140" />
                <Line x1="10" y1="128" x2="270" y2="128" />
                <Line x1="30" y1="119" x2="250" y2="119" />
                <Line x1="55" y1="113" x2="225" y2="113" />
                <Line x1="85" y1="109" x2="195" y2="109" />
            </G>
            <G stroke="#00E5FF" strokeWidth="0.8" opacity="0.4">
                <Line x1="140" y1="108" x2="0" y2="140" />
                <Line x1="140" y1="108" x2="56" y2="140" />
                <Line x1="140" y1="108" x2="112" y2="140" />
                <Line x1="140" y1="108" x2="168" y2="140" />
                <Line x1="140" y1="108" x2="224" y2="140" />
                <Line x1="140" y1="108" x2="280" y2="140" />
            </G>
        </>
    );
}

const HEROES = {
    medianoche: MedianocheHero,
    brasa: BrasaHero,
    arena: ArenaHero,
    amanecer: AmanecerHero,
    neon: NeonHero,
    synthwave: SynthwaveHero,
};

export default function HeroArt({ themeName, width, height }) {
    const Hero = HEROES[themeName] || HEROES.medianoche;
    if (!width || !height) return null;

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid slice"
            style={StyleSheet.absoluteFillObject}
        >
            <Hero />
        </Svg>
    );
}