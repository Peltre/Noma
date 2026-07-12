import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from "../screens/HomeScreen";
import TransactionScreen from '../screens/TransactionScreen';
import HistoryScreen from "../screens/HistoryScreen";
import CardsScreen from "../screens/CardsScreen";
import AddCardScreen from "../screens/AddCardScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ScheduledFundsScreen from "../screens/ScheduledFundsScreen";
import SavingsScreen from "../screens/SavingsScreen";
import CurvedTabBar from './CurvedTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stacks

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddTransaction" component={TransactionScreen} />
      <Stack.Screen name="ScheduledFunds" component={ScheduledFundsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
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
      screenOptions={{ headerShown: false }}
      tabBar={props => <CurvedTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} options={{ tabBarLabel: 'Historial' }} />
      <Tab.Screen name="SavingsTab" component={SavingsScreen} options={{ tabBarLabel: 'Ahorros' }} />
      <Tab.Screen name="CardsTab" component={CardsStack} options={{ tabBarLabel: 'Tarjetas' }} />
    </Tab.Navigator>
  );
}