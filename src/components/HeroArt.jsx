// Decoration for Home's hero card ONLY — not a global background.
// Same visual language as the app's ambient gradient (AppBackground.
// jsx): a moon/sun with a soft glow, a scattered starfield, one
// off-center horizon curve. Landscape-proportioned (viewBox is ~2:1)
// instead of the portrait canvas a full-screen version would use,
// since this only ever fills the width-heavy hero card.
//
// Sized via measured width/height (same pattern the very first
// version of this idea used, before a full-screen background was
// tried and then walked back) rather than a fixed canvas, because the
// hero's actual height is content-driven (padding + text), not
// fixed — HomeScreen measures it with onLayout and passes the result
// in here. `preserveAspectRatio="xMidYMid slice"` then crops the
// fixed-design 280×140 canvas to cover whatever that turns out to be.
//
// Same platform note as AppBackground: react-native-svg doesn't
// reliably support <filter> (feGaussianBlur) across iOS/Android/web,
// so "soft glow" here is always a radial gradient fading to
// transparent, never a blurred shape.
import { StyleSheet } from 'react-native';
import { Svg, Defs, RadialGradient, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';

const VB_W = 280;
const VB_H = 140;

// Off-center on purpose (peaks left, moon/sun sits right) — the same
// reasoning as the full-screen version this was adapted from: a
// centered peak under a centered composition reads as static, two
// off-set focal points give the frame some diagonal balance instead.
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
            <Path d={HORIZON} fill="#0A0C10" opacity="0.92" />
        </>
    );
}

function BrasaHero() {
    return (
        <>
            <Defs>
                <LinearGradient id="hbrSky" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#140C10" />
                    <Stop offset="100%" stopColor="#1E160F" />
                </LinearGradient>
                <RadialGradient id="hbrGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#D9763E" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#D9763E" stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#hbrSky)" />
            <Stars color="#F2E6D6" />
            <Circle cx="210" cy="42" r="42" fill="url(#hbrGlow)" />
            <Circle cx="210" cy="42" r="13" fill="#F8F1E4" />
            <Path d={HORIZON} fill="#150C08" opacity="0.92" />
        </>
    );
}

function ArenaHero() {
    return (
        <>
            <Defs>
                <LinearGradient id="harSky" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FBF3E4" />
                    <Stop offset="100%" stopColor="#F6F1E7" />
                </LinearGradient>
                <RadialGradient id="harGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#F0C87E" stopOpacity="0.85" />
                    <Stop offset="40%" stopColor="#E8B979" stopOpacity="0.35" />
                    <Stop offset="100%" stopColor="#C17C3A" stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Path d={`M0,0 H${VB_W} V${VB_H} H0 Z`} fill="url(#harSky)" />
            <G fill="#FFFFFF" opacity="0.5">
                <Circle cx="45" cy="35" r="7" /><Circle cx="55" cy="31" r="9" /><Circle cx="66" cy="36" r="6" />
            </G>
            <Circle cx="210" cy="42" r="42" fill="url(#harGlow)" />
            <Circle cx="210" cy="42" r="13" fill="#FBEBC4" />
            <Path d={HORIZON} fill="#D9BE8E" />
        </>
    );
}

const HEROES = {
    medianoche: MedianocheHero,
    brasa: BrasaHero,
    arena: ArenaHero,
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