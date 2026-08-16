// Drop-in replacement for <View style={styles.card}> — AppBackground
// paints a gradient behind every screen, so a card's own style should
// only carry LAYOUT (padding, radius, margin, shadow); background/
// border color come from here, themed. (Home's hero is the one
// exception — not a GlassCard, see HeroArt.jsx.)
//
// Structure reconciles a few native quirks:
// 1. A shadow draws OUTSIDE an element's bounds, but the blur needs
//    overflow:'hidden' to clip to the rounded corners — combining both
//    on one View clips the shadow away too. So: an OUTER unclipped
//    View carries shadow/margin, wrapping an INNER clipped View that
//    carries the blur/padding/radius.
// 2. BlurView (a native component) doesn't reliably respect the
//    parent's border-radius clip at the corners, so a border living
//    alongside it can look erased right at the curve. Fixed by
//    rendering the border on its own overlay View on top of
//    everything instead — a plain View's border+radius always renders correctly.
// 3. Android doesn't render borderStyle:'dashed' + borderRadius
//    together at all. The dashed case (PendingFundCard,
//    ScheduledFundsScreen) skips the View border and draws an SVG
//    <Rect strokeDasharray> instead, which supports both everywhere.
// 4. A completed savings goal overrides the border color/width (green
//    for "done") — those keys are pulled from the card's style and
//    re-applied on top of the theme default so a custom border still wins.
//
// BlurView/tint overlay are absolutely positioned, filling the inner
// view edge-to-edge ignoring its padding, while `children` renders in
// normal flow and respects it.
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../store/useTheme';

// Style keys for the OUTER (unclipped) wrapper. Everything else in a
// passed `style` goes on the inner view, except border keys (below).
const OUTER_KEYS = [
    'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'marginHorizontal', 'marginVertical', 'marginStart', 'marginEnd',
    'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'width', 'height',
];

// Pulled from innerStyle onto the border overlay, applied after the
// theme default so a card setting these (green border, dashed) still wins.
const BORDER_APPEARANCE_KEYS = ['borderWidth', 'borderColor', 'borderTopColor', 'borderTopWidth', 'borderStyle'];

// Kept on innerStyle (still needed to clip the blur) AND copied to the
// border overlay so its visible border matches the clip shape,
// including asymmetric radii (e.g. TransactionScreen's sheetWrap).
const RADIUS_KEYS = [
    'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomLeftRadius', 'borderBottomRightRadius',
];

export default function GlassCard({ style, children, ...rest }) {
    const { theme } = useTheme();
    const [size, setSize] = useState({ width: 0, height: 0 });
    const flat = StyleSheet.flatten(style) || {};

    const outerStyle = {};
    const innerStyle = {};
    const borderOverride = {};
    for (const key in flat) {
        if (OUTER_KEYS.includes(key)) outerStyle[key] = flat[key];
        else if (BORDER_APPEARANCE_KEYS.includes(key)) borderOverride[key] = flat[key];
        else innerStyle[key] = flat[key];
    }
    const radiusStyle = {};
    for (const key of RADIUS_KEYS) {
        if (innerStyle[key] !== undefined) radiusStyle[key] = innerStyle[key];
    }

    const isDashed = borderOverride.borderStyle === 'dashed';
    const borderWidth = borderOverride.borderWidth ?? 1;
    const borderColor = borderOverride.borderColor || theme.glassBorder;
    const radius = radiusStyle.borderRadius ?? 0;

    return (
        <View style={outerStyle} {...rest}>
            <View
                style={[localStyles.inner, innerStyle]}
                // Only the dashed path needs its pixel size, to draw a matching SVG rect.
                onLayout={isDashed ? (e => setSize(e.nativeEvent.layout)) : undefined}
            >
                <BlurView
                    intensity={theme.glassIntensity}
                    tint={theme.glassTint}
                    style={StyleSheet.absoluteFillObject}
                />
                {/* Ties the glass to each theme's own surface hue —
                    BlurView's tint only picks a light/dark algorithm, not a color. */}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.glassFill }]} />
                {children}
            </View>

            {isDashed ? (
                size.width > 0 && size.height > 0 && (
                    // pointerEvents="none" on a plain View wrapper, not on
                    // <Svg> directly — react-native-svg's root <Svg> doesn't
                    // reliably forward that prop, which was swallowing
                    // touches meant for the content underneath.
                    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}>
                        <Svg width={size.width} height={size.height}>
                            <Rect
                                x={borderWidth / 2}
                                y={borderWidth / 2}
                                width={Math.max(size.width - borderWidth, 0)}
                                height={Math.max(size.height - borderWidth, 0)}
                                rx={radius}
                                ry={radius}
                                fill="none"
                                stroke={borderColor}
                                strokeWidth={borderWidth}
                                strokeDasharray="4,3"
                            />
                        </Svg>
                    </View>
                )
            ) : (
                // Border overlay, on top of everything, non-blur (see
                // reconciliation #2 above). pointerEvents in style (not as a
                // prop) for the same forwarding reason as the dashed branch.
                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        localStyles.borderOverlay,
                        radiusStyle,
                        { borderColor: theme.glassBorder, borderTopColor: theme.glassBorderTop, pointerEvents: 'none' },
                        borderOverride,
                    ]}
                />
            )}
        </View>
    );
}

const localStyles = StyleSheet.create({
    inner: {
        // flex:1 fills whatever size the outer wrapper resolves to —
        // needed for cards passing flex:1 themselves (e.g.
        // TransactionScreen's sheetWrap), harmless otherwise.
        flex: 1,
        overflow: 'hidden',
    },
    borderOverlay: {
        borderWidth: 1,
    },
});