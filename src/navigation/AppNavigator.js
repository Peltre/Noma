// Complete "map" of the app, here all screens are located & connected
// This is what react navigation will read to build all nav structure correctly
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Settings, Text } from 'react-native';

import HomeScreen from "../screens/HomeScreen";
import TransactionScreen from '../screens/TransactionScreen';
import HistoryScreen from "../screens/HistoryScreen";
import CardsScreen from "../screens/CardsScreen";
import AddCardScreen from "../screens/AddCardScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { Colors } from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// HomeStack groups HomeScreen with TransactionScreen
// When user clicks "add transaction" from Home, TransactionScreen appears on top with animation
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen name="AddTransaction" component={TransactionScreen}/>
        </Stack.Navigator>
    );
}

// Same logic with CardScreen & AddCardScreen
function CardsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Cards" component={CardsScreen}/>
            <Stack.Screen name="AddCard" component={AddCardScreen}/>
        </Stack.Navigator>
    );
}

// Root structure AppNavigator, defines 4 tabs & appearance
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
                }
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⌂</Text>
                }}
            />
            <Tab.Screen
                name="HistoryTab"
                component={HistoryScreen}
                options={{
                    tabBarLabel: 'Historial',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>
                }}
            />
            <Tab.Screen
                name="CardsTab"
                component={CardsStack}
                options={{
                    tabBarLabel: 'Tarjetas',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💳</Text>
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={Settings}
                options={{
                    tabBarLabel: 'Config.',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙</Text>
                }}
            />

           
        </Tab.Navigator>
    )
}