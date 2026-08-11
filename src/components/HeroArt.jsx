// Decoration for Home's hero card ONLY — not a global background.
// Landscape-proportioned (viewBox is ~2:1) instead of the portrait
// canvas a full-screen version would use, since this only ever fills
// the width-heavy hero card.
//
// Sized via measured width/height (same pattern the very first
// version of this idea used, before a full-screen background was
// tried and then walked back) rather than a fixed canvas, because the
// hero's actual height is content-driven (padding + text), not
// fixed — HomeScreen measures it with onLayout and passes the result
// in here. `preserveAspectRatio="xMidYMid slice"` then crops the
// fixed-design 280×140 canvas to cover whatever that turns out to be.
//
// Every theme shared one template for a while (sky gradient + glow +
// a sun/moon circle + one horizon curve, just recolored) — this is
// the redesign away from that: each theme gets its own composition
// instead of a palette swap of the same shapes, so they read as five
// different scenes rather than one scene in five colors. The shared
// pieces that DIDN'T need to change (the horizon curve's silhouette,
// the small scattered-dot star field) stay shared constants/
// components below — only reused where it's actually the same idea,
// not reused just to save effort.
//
// Same platform note as AppBackground: react-native-svg doesn't
// reliably support <filter> (feGaussianBlur) across iOS/Android/web,
// so every "soft glow" here is a radial gradient fading to
// transparent, never a blurred shape.
import { StyleSheet } from 'react-native';
import { Svg, Defs, RadialGradient, LinearGradient, Stop, Circle, Path, Line, ClipPath, Rect, G } from 'react-native-svg';

const VB_W = 280;
const VB_H = 140;

// Off-center on purpose (peaks left, moon/sun sits right) — a
// centered peak under a centered composition reads as static, two
// off-set focal points give the frame some diagonal balance instead.
// Shared by every theme below except Neón, which trades the organic
// horizon for a geometric grid instead — see NeonHero.
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

// The "classic" scene, unchanged — moon + stars + one horizon curve.
// Gets a second, subtler hill layer behind the main one now (more
// depth), which none of the other four copy — the extra layer is
// Medianoche's own distinguishing touch, not a shared piece.
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

// No moon at all now — a low, warm glow sitting AT the horizon
// instead of a colored circle in the sky, plus small embers drifting
// up out of it. Reads as "the warmth is coming from the ground" (a
// dying campfire, coals) instead of "the moon happens to be warm-
// colored", which fits the theme's name (brasa = embers/coals) more
// literally than the old recolored-moon version did — and reads
// nothing like Medianoche's scene at a glance, not just a different
// tint of the same shapes.
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

// Sun rays radiating outward instead of just a soft glow — the
// classic "desert sun" silhouette, which Amanecer's rings (below)
// deliberately don't share even though both are daytime scenes.
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

// Just the gradient — no shapes, no particles, nothing decorative at
// all. Went through a sun with rings, then no-sun-plus-snowballs,
// then snowballs-plus-sparks; none of it landed. This is the reset:
// the three colors already established for this theme (pink, cream,
// lavender), diagonal, doing all the work on their own. Opacity below
// 1 on purpose — there's nothing else in this scene for it to layer
// over, so it blends straight into the card's own white surface
// underneath, landing somewhere lighter/softer than the three raw
// colors instead of full-strength.
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

// The one that trades the organic horizon curve every other theme
// shares for a geometric perspective grid — a synthwave skyline
// instead of a desert one, the most deliberately different-looking
// of the five since "cyberpunk" is the one theme that isn't a desert
// time-of-day to begin with (see themes.js's own comment on it). The
// glow stays a soft radial circle (ambient light spreads the same way
// regardless of the source's shape), but the light source itself is
// a hexagon now, not a circle — every other theme's sun/moon is a
// plain circle, so this was reading as "the red one" rather than
// something that actually looks different. A hexagon reads as a
// signal light or a HUD element instead of a moon, and doesn't
// compete with any desert theme's shape language.
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

// The genre's own signature image: a striped retro sun (a circle
// clipped by horizontal bands, the classic "outrun" look) over a
// two-color grid — pink lines on the near side, cyan on the far —
// instead of Neón's single-color grid. Same grid MECHANIC as Neón
// (borrowed once it worked well there), but colored and paired with
// a sun that makes this read as a different genre, not a red reskin
// of the same scene.
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