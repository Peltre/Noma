import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

import HomeScreen from "../screens/HomeScreen";
import TransactionScreen from '../screens/TransactionScreen';
import HistoryScreen from "../screens/HistoryScreen";
import CardsScreen from "../screens/CardsScreen";
import AddCardScreen from "../screens/AddCardScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ScheduledFundsScreen from "../screens/ScheduledFundsScreen";
import SavingsScreen from "../screens/SavingsScreen";
import { Colors } from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// SVG icons 

function IconHome({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M2 9.5L11 2l9 7.5V20a1 1 0 01-1 1h-5v-5H9v5H3a1 1 0 01-1-1V9.5z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconHistory({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Rect x="3" y="3" width="16" height="16" rx="2.5"
        stroke={color} strokeWidth={1.6} />
      <Path d="M7 8h8M7 11.5h8M7 15h5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function IconSavings({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M6 11a5 5 0 1010 0A5 5 0 006 11z"
        stroke={color} strokeWidth={1.6}
      />
      <Path
        d="M6 11C6 7 3.5 4 1 4"
        stroke={color} strokeWidth={1.6} strokeLinecap="round"
      />
      <Path
        d="M11 4V2"
        stroke={color} strokeWidth={1.6} strokeLinecap="round"
      />
      <Path
        d="M16 19l1.5 1.5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round"
      />
    </Svg>
  );
}

function IconCards({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Rect x="1" y="5" width="20" height="14" rx="2"
        stroke={color} strokeWidth={1.6} />
      <Path d="M1 9h20"
        stroke={color} strokeWidth={1.6} />
      <Path d="M5 14h3"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function IconSettings({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="3"
        stroke={color} strokeWidth={1.6} />
      <Path
        d="M11 2v2M11 18v2M2 11h2M18 11h2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M4.22 17.78l1.42-1.42M16.36 5.64l1.42-1.42"
        stroke={color} strokeWidth={1.6} strokeLinecap="round"
      />
    </Svg>
  );
}

// Tab icon wrapper active tab gets ink background pill

function TabIcon({ Icon, focused }) {
  const color = focused ? Colors.white : Colors.muted;
  return (
    <View style={{
      width: 44, height: 32,
      borderRadius: 10,
      backgroundColor: focused ? Colors.ink : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon color={color} />
    </View>
  );
}

// Stacks

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddTransaction" component={TransactionScreen} />
      <Stack.Screen name="ScheduledFunds" component={ScheduledFundsScreen} />
    </Stack.Navigator>
  );
}

function CardsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cards" component={CardsScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
    </Stack.Navigator>
  );
}

// Navigator

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.mid,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 16,
          paddingHorizontal: 8,
        },
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.4,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconHome} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconHistory} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SavingsTab"
        component={SavingsScreen}
        options={{
          tabBarLabel: 'Ahorros',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconSavings} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CardsTab"
        component={CardsStack}
        options={{
          tabBarLabel: 'Tarjetas',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconCards} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Config.',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconSettings} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}