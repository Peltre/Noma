// Custom bottom tab bar: the top edge is a smooth "hill" — highest at
// the center, curving down toward both sides — instead of a straight
// line. Icons are outlined when inactive and filled with the brand
// accent when active.
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../store/useTheme';
import { Shadow, FontSize } from '../constants';
import { IconHome, IconHistory, IconSavings, IconCards, IconPlus } from '../components/Icons';

const BASE_HEIGHT = 48;
const PEAK_EXTRA = 8;

// Fixed regardless of theme — same reasoning CardFace.jsx already
// uses for its own colors: this is a signature action, not a themed
// surface, so it should look the same in Arena/Medianoche/Brasa
// instead of inheriting each theme's own (very different) brand hue.
const FAB_COLOR = '#5FC9BD';
const FAB_ON = '#11151D';

const ICONS = {
    HomeTab: IconHome,
    HistoryTab: IconHistory,
    SavingsTab: IconSavings,
    CardsTab: IconCards,
};

// ── Hill-shaped background ─────────────────────────────────────
function HillBackground({ width, height, theme }) {
    if (!width) return null;
    const dip = PEAK_EXTRA;
    const d = `M0,${dip} `
        + `C${width * 0.18},${dip} ${width * 0.30},0 ${width * 0.5},0 `
        + `C${width * 0.70},0 ${width * 0.82},${dip} ${width},${dip} `
        + `L${width},${height} L0,${height} Z`;
    return (
        <Svg
            width={width} height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={StyleSheet.absoluteFillObject}
        >
            <Path d={d} fill={theme.surface} stroke={theme.border} strokeWidth={1} />
        </Svg>
    );
}

// ── Main bar ────────────────────────────────────────────────────
export default function CurvedTabBar({ state, descriptors, navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [width, setWidth] = useState(0);

    // AppNavigator sets tabBarStyle: { display: 'none' } on the
    // focused tab's options while one of its nested full-screen
    // routes (AddTransaction, Settings, etc.) is open. That option is
    // normally applied automatically by React Navigation's own tab
    // bar — since this is a custom one, we have to read it ourselves
    // and bail out before rendering anything, or this bar (and its
    // floating "+") would stay floating on top of those screens.
    const focusedOptions = descriptors[state.routes[state.index].key].options;
    if (focusedOptions.tabBarStyle?.display === 'none') return null;

    const totalHeight = BASE_HEIGHT + PEAK_EXTRA + insets.bottom;

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
        <View
            style={[styles.wrap, { height: totalHeight, backgroundColor: theme.bg }]}
            onLayout={e => setWidth(e.nativeEvent.layout.width)}
        >
            <HillBackground width={width} height={totalHeight} theme={theme} />

            <View style={[styles.row, { height: BASE_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
                <View style={styles.tabGroup}>
                    {leftRoutes.map((route, i) => renderTab(route, i))}
                </View>

                <View style={styles.fabSlot}>
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: FAB_COLOR }]}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('HomeTab', { screen: 'AddTransaction' })}
                    >
                        <IconPlus color={FAB_ON} size={26} />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabGroup}>
                    {rightRoutes.map((route, i) => renderTab(route, i + leftRoutes.length))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        ...Shadow.float,
    },
    row: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 6,
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
        marginTop: -32, // floats further above the bar now — more of it pokes past the (lower, flatter) hill
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
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