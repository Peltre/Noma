// Custom bottom tab bar: the top edge is a smooth "hill" — highest at
// the center, curving down toward both sides — instead of a straight
// line. Icons are outlined when inactive and filled with the brand
// accent when active.
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '../store/useTheme';
import { Shadow } from '../constants';

const BASE_HEIGHT = 48;
const PEAK_EXTRA = 12;

// ── Icons ───────────────────────────────────────────────────────
// Each icon is a single component that switches between an outline
// (stroke) rendering and a filled (solid) one. Filled versions reuse
// the exact same silhouettes so notches (like the home door) fall
// out "for free". Icons that have separate detail strokes (the lines
// on the history/card icons) draw those details in `bgColor` — the
// tab bar's own background — so they read as light cutouts on the
// solid shape instead of just disappearing.

function IconHome({ focused, color, bgColor }) {
    const d = "M2 9.5L11 2l9 7.5V20a1 1 0 01-1 1h-5v-5H9v5H3a1 1 0 01-1-1V9.5z";
    return (
        <Svg width={19} height={19} viewBox="0 0 22 22" fill="none">
            {focused
                ? <Path d={d} fill={color} />
                : <Path d={d} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />}
        </Svg>
    );
}

function IconHistory({ focused, color, bgColor }) {
    return (
        <Svg width={19} height={19} viewBox="0 0 22 22" fill="none">
            {focused ? (
                <>
                    <Rect x="3" y="3" width="16" height="16" rx="4" fill={color} />
                    <Path d="M7 8h8M7 11.5h8M7 15h5" stroke={bgColor} strokeWidth={1.6} strokeLinecap="round" />
                </>
            ) : (
                <>
                    <Rect x="3" y="3" width="16" height="16" rx="2.5" stroke={color} strokeWidth={1.6} />
                    <Path d="M7 8h8M7 11.5h8M7 15h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
                </>
            )}
        </Svg>
    );
}

function IconSavings({ focused, color, bgColor }) {
    return (
        <Svg width={19} height={19} viewBox="0 0 22 22" fill="none">
            {focused
                ? <Circle cx="11" cy="11" r="5" fill={color} />
                : <Path d="M6 11a5 5 0 1010 0A5 5 0 006 11z" stroke={color} strokeWidth={1.6} />}
            <Path d="M6 11C6 7 3.5 4 1 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
            <Path d="M11 4V2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
            <Path d="M16 19l1.5 1.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
    );
}

function IconCards({ focused, color, bgColor }) {
    return (
        <Svg width={19} height={19} viewBox="0 0 22 22" fill="none">
            {focused ? (
                <>
                    <Rect x="1" y="5" width="20" height="14" rx="3" fill={color} />
                    <Rect x="1" y="8" width="20" height="2.4" fill={bgColor} />
                    <Path d="M5 14h3" stroke={bgColor} strokeWidth={1.6} strokeLinecap="round" />
                </>
            ) : (
                <>
                    <Rect x="1" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth={1.6} />
                    <Path d="M1 9h20" stroke={color} strokeWidth={1.6} />
                    <Path d="M5 14h3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
                </>
            )}
        </Svg>
    );
}

function IconSettings({ focused, color, bgColor }) {
    return (
        <Svg width={19} height={19} viewBox="0 0 22 22" fill="none">
            {focused
                ? <Circle cx="11" cy="11" r="3.6" fill={color} />
                : <Circle cx="11" cy="11" r="3" stroke={color} strokeWidth={1.6} />}
            <Path
                d="M11 2v2M11 18v2M2 11h2M18 11h2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M4.22 17.78l1.42-1.42M16.36 5.64l1.42-1.42"
                stroke={color} strokeWidth={1.6} strokeLinecap="round"
            />
        </Svg>
    );
}

const ICONS = {
    HomeTab: IconHome,
    HistoryTab: IconHistory,
    SavingsTab: IconSavings,
    CardsTab: IconCards,
    SettingsTab: IconSettings,
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

    const totalHeight = BASE_HEIGHT + PEAK_EXTRA + insets.bottom;

    return (
        <View
            style={[styles.wrap, { height: totalHeight, backgroundColor: theme.bg }]}
            onLayout={e => setWidth(e.nativeEvent.layout.width)}
        >
            <HillBackground width={width} height={totalHeight} theme={theme} />

            <View style={[styles.row, { height: BASE_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
                {state.routes.map((route, index) => {
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
                })}
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
    label: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    labelActive: {
        fontWeight: '800',
    },
});