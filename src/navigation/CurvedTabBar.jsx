// Bottom tab bar — a glass panel over AppBackground instead of a
// solid-filled shape, so it traded its old wavy "hill" top edge for
// plain rounded top corners: BlurView blurs whatever's behind it in
// the actual native view hierarchy, and it can only be clipped to a
// shape via `overflow:'hidden'` + `borderRadius` on its container —
// it can't be masked to an arbitrary SVG path the way the old solid
// <Path> fill could. Rounded corners are the shape vocabulary that's
// actually reliable with a real blur.
// Icons stay outlined when inactive, filled with the brand accent
// when active — unchanged from before.
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../store/useTheme';
import { Shadow, FontSize, Radius, Spacing } from '../constants';
import { IconHome, IconHistory, IconSavings, IconCards, IconPlus } from '../components/Icons';

// Tight to the content (icon + label), not padded out further — went
// 74 → 54 → 40 already. Nudged back up slightly here (not a full
// reversal) specifically to make room for `row`'s bigger paddingTop
// below — without this, that extra top padding would just squeeze
// the icon/label content into a smaller box instead of actually
// adding visible breathing room.
const BASE_HEIGHT = 46;
// How far the "+" pokes up above the glass bar's own top edge. Was
// tied to a formula that grew with the device's bottom safe-area
// inset (taller on an iPhone with a home indicator than on a device
// without one) — that's why it could look like it was floating way
// off on some devices: not a fixed "a little proud of the bar" look,
// a variable one. Fixed to a flat number instead.
const FAB_POKE = 18;

const ICONS = {
    HomeTab: IconHome,
    HistoryTab: IconHistory,
    SavingsTab: IconSavings,
    CardsTab: IconCards,
};

// Top corner radius — kept as its own constant (not just inlined
// twice) because `glass` and `borderOverlay` both need the EXACT same
// value to stay lined up. Went 28 → 18 already after "the curve is
// crowding the corner icons" — screenshot showed it was still a very
// visible curve at 18, so this is a second, bigger cut instead of
// another small nudge.
const CORNER_RADIUS = 10;

export default function CurvedTabBar({ state, descriptors, navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    // AppNavigator sets tabBarStyle: { display: 'none' } on the
    // focused tab's options while one of its nested full-screen
    // routes (AddTransaction, Settings, etc.) is open. That option is
    // normally applied automatically by React Navigation's own tab
    // bar — since this is a custom one, we have to read it ourselves
    // and bail out before rendering anything, or this bar (and its
    // floating "+") would stay floating on top of those screens.
    const focusedOptions = descriptors[state.routes[state.index].key].options;
    if (focusedOptions.tabBarStyle?.display === 'none') return null;

    const totalHeight = BASE_HEIGHT + insets.bottom;

    // The "+" isn't a real tab — there's no screen you're ever "on"
    // for it, it just opens Nuevo movimiento. Splitting the routes
    // around it (rather than adding it as a 6th Tab.Screen) keeps
    // state.index/focused meaning exactly what it already means for
    // the 5 real tabs.
    const leftRoutes = state.routes.slice(0, 2);
    const rightRoutes = state.routes.slice(2);

    const renderTab = (route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const focused = state.index === index;
        const Icon = ICONS[route.name];
        const color = focused ? theme.brand : theme.muted;

        const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
            <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.item}
                activeOpacity={0.7}
            >
                {Icon && <Icon focused={focused} color={color} bgColor={theme.surface} />}
                <Text style={[styles.label, { color }, focused && styles.labelActive]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        // Outer wrapper is NOT clipped — only `glass` (the blurred bar
        // itself) needs overflow:hidden, to clip BlurView to its
        // rounded top corners. The FAB deliberately pokes up above
        // the bar's own top edge (see fabFloating's `bottom` below);
        // rendering it inside that clipped container was cutting off
        // exactly the part meant to float above it.
        <View style={[styles.outer, { height: totalHeight }]}>
            <View style={[styles.glass, { height: totalHeight }]}>
                <BlurView
                    intensity={theme.glassIntensity}
                    tint={theme.glassTint}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.glassFill }]} />

                <View style={[styles.row, { height: BASE_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
                    <View style={styles.tabGroup}>
                        {leftRoutes.map((route, i) => renderTab(route, i))}
                    </View>

                    {/* Empty spacer — same width as the floating FAB
                        below, just keeping the two tab groups spaced
                        apart correctly. */}
                    <View style={styles.fabSlot} />

                    <View style={styles.tabGroup}>
                        {rightRoutes.map((route, i) => renderTab(route, i + leftRoutes.length))}
                    </View>
                </View>
            </View>

            {/* Top border, on its own plain (non-blur) overlay instead
                of living on `glass` alongside BlurView — same fix as
                GlassCard.jsx, same reason: a native blur's rendering
                doesn't reliably respect its container's border-radius
                clip AT THE CORNERS, so a border on that same view gets
                partly erased right where it curves. A plain View's own
                border+radius doesn't have that problem. */}
            <View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.borderOverlay,
                    { height: totalHeight, borderTopColor: theme.glassBorderTop },
                ]}
            />

            <TouchableOpacity
                style={[styles.fab, styles.fabFloating, { backgroundColor: theme.brand, bottom: totalHeight - (56 - FAB_POKE) }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('HomeTab', { screen: 'AddTransaction' })}
            >
                <IconPlus color={theme.brandOn} size={26} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // Outer, unclipped — carries the drop shadow (a shadow is drawn
    // OUTSIDE an element's own bounds, so it would get clipped away
    // by `glass`'s overflow:hidden below if it lived there instead —
    // same reason the FAB moved out here too).
    outer: {
        width: '100%',
        ...Shadow.float,
    },
    // Inner, clipped — this is what actually needs overflow:hidden,
    // to clip BlurView to its own rounded top corners. No border here
    // anymore — see borderOverlay below.
    glass: {
        width: '100%',
        overflow: 'hidden',
        borderTopLeftRadius: CORNER_RADIUS,
        borderTopRightRadius: CORNER_RADIUS,
    },
    // Matches `glass`'s own corner radius exactly, so the visible
    // border always lines up with the shape the blur is actually
    // clipped to.
    borderOverlay: {
        width: '100%',
        borderTopLeftRadius: CORNER_RADIUS,
        borderTopRightRadius: CORNER_RADIUS,
        borderTopWidth: 1,
    },
    row: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        // Horizontal: keeps the leftmost/rightmost icon clear of the
        // rounded corner instead of sitting flush against where it
        // curves. Top: breathing room above the icons — went 0 → 4
        // already, screenshot showed 4 still reads as "almost none",
        // so this is a real jump instead of another 1-2px nudge.
        paddingHorizontal: Spacing.sm,
        paddingTop: 10,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    tabGroup: {
        flex: 1,
        flexDirection: 'row',
    },
    fabSlot: {
        width: 64,
        alignItems: 'center',
    },
    fab: {
        width: 56, height: 56, borderRadius: 28,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    // Absolutely positioned, centered, sibling of the clipped `glass`
    // bar instead of a child of it — see the `outer`/`glass` comment
    // above for why. `bottom` is computed inline (needs totalHeight,
    // a runtime value) so this only sets the parts that don't.
    fabFloating: {
        position: 'absolute',
        left: '50%',
        marginLeft: -28, // half of width: 56, for reliable centering
    },
    label: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    labelActive: {
        fontWeight: '800',
    },
});