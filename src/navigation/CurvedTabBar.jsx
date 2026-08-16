// Bottom tab bar — a glass panel over AppBackground, so it uses plain
// rounded top corners instead of the old wavy "hill" edge: BlurView
// can only be clipped via overflow:'hidden' + borderRadius, not
// masked to an arbitrary SVG path. Icons stay outlined when inactive,
// filled with the brand accent when active.
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../store/useTheme';
import { Shadow, FontSize, Radius, Spacing } from '../constants';
import { IconHome, IconHistory, IconSavings, IconCards, IconPlus } from '../components/Icons';

// Tight to icon+label content. Nudged up slightly to make room for
// `row`'s bigger paddingTop below.
const BASE_HEIGHT = 46;
// How far the "+" pokes up above the glass bar's top edge — a flat
// number, not tied to the safe-area inset (which made it look
// inconsistently "floaty" across devices).
const FAB_POKE = 18;

const ICONS = {
    HomeTab: IconHome,
    HistoryTab: IconHistory,
    SavingsTab: IconSavings,
    CardsTab: IconCards,
};

// Own constant since `glass` and `borderOverlay` both need the exact
// same value to stay lined up.
const CORNER_RADIUS = 10;

export default function CurvedTabBar({ state, descriptors, navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    // AppNavigator hides the tab bar (tabBarStyle: display:'none')
    // while a nested full-screen route is open — React Navigation
    // applies that automatically for its own tab bar, but this custom
    // one has to read and honor it manually.
    const focusedOptions = descriptors[state.routes[state.index].key].options;
    if (focusedOptions.tabBarStyle?.display === 'none') return null;

    const totalHeight = BASE_HEIGHT + insets.bottom;

    // The "+" isn't a real tab (no screen to be "on") — splitting the
    // routes around it keeps state.index/focused meaning what it
    // already means for the 5 real tabs.
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
        // Outer wrapper isn't clipped — only `glass` needs
        // overflow:hidden. The FAB pokes above the bar's own top edge
        // on purpose, so it renders outside this clipped container.
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

                    {/* Same width as the floating FAB, just spacing the two tab groups apart. */}
                    <View style={styles.fabSlot} />

                    <View style={styles.tabGroup}>
                        {rightRoutes.map((route, i) => renderTab(route, i + leftRoutes.length))}
                    </View>
                </View>
            </View>

            {/* Border on its own plain (non-blur) overlay, same fix as
                GlassCard.jsx — a native blur doesn't reliably respect
                border-radius clipping at the corners. pointerEvents in
                style (not as a prop), same reason as GlassCard. */}
            <View
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.borderOverlay,
                    { height: totalHeight, borderTopColor: theme.glassBorderTop, pointerEvents: 'none' },
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
    // Unclipped — carries the drop shadow (which draws outside an
    // element's bounds, so it'd be clipped away by glass's overflow:hidden).
    outer: {
        width: '100%',
        ...Shadow.float,
    },
    // Clipped — needs overflow:hidden to clip BlurView to its rounded top corners.
    glass: {
        width: '100%',
        overflow: 'hidden',
        borderTopLeftRadius: CORNER_RADIUS,
        borderTopRightRadius: CORNER_RADIUS,
    },
    // Matches `glass`'s radius exactly so the border lines up with the blur's clip.
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
    // Sibling of the clipped `glass` bar, not a child of it. `bottom`
    // is set inline since it needs the runtime totalHeight value.
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