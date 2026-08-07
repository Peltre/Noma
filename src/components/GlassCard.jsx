// Drop-in replacement for a plain `<View style={styles.card}>` now that
// AppBackground paints a gradient behind every screen instead of each
// card carrying its own solid fill. A card's own style object should
// only carry LAYOUT now (padding, borderRadius, margin, gap, shadow)
// — background and border color come from here, themed, so every
// glass surface in the app stays visually consistent in one place
// instead of each screen re-deriving its own translucent color. (The
// Home hero is the one exception — it isn't a GlassCard at all; see
// HeroArt.jsx and HomeScreen.jsx.)
//
// Four things this has to reconcile:
//
// 1. The blur needs to be clipped to the card's rounded corners
//    (overflow:'hidden'), but a shadow is drawn OUTSIDE an element's
//    own bounds — put both on the same View and overflow:'hidden'
//    silently clips the shadow away too (found this the hard way in
//    CurvedTabBar.jsx, where it was clipping the floating "+" button,
//    not just a shadow — same underlying mechanism). So this splits
//    into an OUTER, unclipped View that carries shadow/elevation/
//    margin, wrapping an INNER, clipped View that carries the blur,
//    padding, and border radius.
//
// 2. The border used to live on that same INNER view, right alongside
//    BlurView. That's the first bug report that prompted this
//    rewrite: BlurView is a native component (UIVisualEffectView on
//    iOS, a native blur on Android), and its own rendering doesn't
//    reliably respect the parent's border-radius clip AT THE CORNERS
//    the way a plain JS-rendered View does — it clips fine along
//    straight edges, but at each rounded corner the blur's native
//    paint can extend slightly past the intended mask and sit on top
//    of the border, erasing it right at the curve. On small cards, or
//    cards with a large radius relative to their size, that eaten
//    corner area is enough of the total perimeter that the border can
//    look entirely missing rather than just "cut at the corners".
//    Fixed by moving the border to a dedicated overlay View, rendered
//    on top of everything (including the blur) instead of behind/
//    alongside it — a plain View's own border+radius always renders
//    correctly, regardless of what a native child underneath it does.
//
// 3. That overlay is a plain RN View border for the DEFAULT (solid)
//    case — but a card asking for `borderStyle: 'dashed'` (the signal
//    PendingFundCard and ScheduledFundsScreen both use for "this
//    hasn't happened yet") hits a SECOND, unrelated bug: Android just
//    doesn't render `borderStyle:'dashed'` combined with
//    `borderRadius` at all — a long-standing React Native/Android gap,
//    nothing to do with BlurView. So the dashed case skips the View
//    border entirely; it measures itself (onLayout) and draws an SVG
//    <Rect> with strokeDasharray instead, which supports dashed +
//    rounded corners correctly on every platform since it's vector
//    rendering, not the native border renderer.
//
// 4. A completed savings goal intentionally overrides the border's
//    color/width for the solid (non-dashed) path — green for "done".
//    Those keys are pulled out of the card's own style and re-applied
//    on top of the theme default, so a card can still ask for a
//    custom border and have it win, same as before this rewrite.
//
// How the blur avoids fighting the card's own padding: BlurView and
// the tint overlay are absolutely positioned
// (StyleSheet.absoluteFillObject), which fills the INNER view up to
// its border edge, ignoring ITS padding — so the blur extends
// edge-to-edge under where the padding would be, while `children`
// renders in normal flow and still respects that padding.
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../store/useTheme';

// Style keys that belong on the OUTER (unclipped) wrapper. Everything
// else in a passed `style` goes on the inner, clipped one — EXCEPT
// border appearance keys (below), which go on the border overlay.
const OUTER_KEYS = [
    'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation',
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'marginHorizontal', 'marginVertical', 'marginStart', 'marginEnd',
    'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'width', 'height',
];

// Pulled out of `innerStyle` and re-applied to the border overlay
// instead, layered AFTER the theme default so a card that sets any of
// these (goalCardComplete's green border, a dashed card's borderStyle)
// still wins.
const BORDER_APPEARANCE_KEYS = ['borderWidth', 'borderColor', 'borderTopColor', 'borderTopWidth', 'borderStyle'];

// Radius keys are NOT removed from innerStyle (the inner view still
// needs them to clip the blur to the right shape) — they're COPIED
// onto the border overlay too, so its visible border always matches
// whatever shape `inner` is actually clipped to, including asymmetric
// cases like TransactionScreen's sheetWrap (rounded top corners only).
// The SVG dashed path only ever sees plain `borderRadius` in this app
// (nothing asymmetric asks for dashed), so it just reads that one key
// directly rather than handling all four corners separately.
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
                // Only the dashed path needs its pixel size (to draw an
                // SVG rect matching it exactly) — everything else skips
                // this entirely.
                onLayout={isDashed ? (e => setSize(e.nativeEvent.layout)) : undefined}
            >
                <BlurView
                    intensity={theme.glassIntensity}
                    tint={theme.glassTint}
                    style={StyleSheet.absoluteFillObject}
                />
                {/* BlurView's `tint` only picks a light/dark blur algorithm,
                    not a brand color — this second layer is what actually
                    ties the glass to each theme's own surface hue (teal-dark
                    for Medianoche, warm-dark for Brasa, soft white for
                    Arena) instead of a generic system blur look. */}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.glassFill }]} />
                {children}
            </View>

            {isDashed ? (
                size.width > 0 && size.height > 0 && (
                    // pointerEvents="none" goes on a plain View wrapper,
                    // not directly on <Svg> — that was the actual bug
                    // report that prompted this fix: react-native-svg's
                    // root <Svg> doesn't reliably forward that prop the
                    // way a native View does, so touches meant for the
                    // TouchableOpacity underneath (PendingFundCard on
                    // Home, in particular) were getting swallowed by
                    // this overlay instead of passing through to it. A
                    // plain View's pointerEvents handling is core RN
                    // behavior, not a third-party library's prop
                    // forwarding, so it doesn't have that risk.
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
                // Border, on top of everything, on its own plain
                // (non-blur) View — see reconciliation #2 above for why
                // this can't just live on `inner`. `pointerEvents:
                // 'none'` (in style, not as a standalone prop — see the
                // comment on the dashed branch above for why that
                // distinction turned out to matter) so it never blocks
                // touches meant for the content underneath.
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
        // flex: 1 makes this always fill whatever size the outer
        // wrapper resolves to — necessary for cards that pass
        // `flex: 1` themselves (e.g. TransactionScreen's sheetWrap,
        // which needs to fill the rest of the screen), and harmless
        // for ordinary content-sized cards (with nothing forcing the
        // outer to a specific size, flex:1 here has no extra space to
        // grow into, so it just sizes to content as normal).
        flex: 1,
        overflow: 'hidden',
    },
    borderOverlay: {
        borderWidth: 1,
    },
});