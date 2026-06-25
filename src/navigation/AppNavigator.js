import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

import HomeScreen from "../screens/HomeScreen";
import TransactionScreen from '../screens/TransactionScreen';
import HistoryScreen from "../screens/HistoryScreen";
import CardsScreen from "../screens/CardsScreen";
import AddCardScreen from "../screens/AddCardScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { Colors } from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ emoji }) {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddTransaction" component={TransactionScreen} />
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

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.warmMid,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 10,
          height: 70,
        },
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: () => <TabIcon emoji="⌂" />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: () => <TabIcon emoji="📋" />,
        }}
      />
      <Tab.Screen
        name="CardsTab"
        component={CardsStack}
        options={{
          tabBarLabel: 'Tarjetas',
          tabBarIcon: () => <TabIcon emoji="💳" />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Config.',
          tabBarIcon: () => <TabIcon emoji="⚙" />,
        }}
      />
    </Tab.Navigator>
  );
}