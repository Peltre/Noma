import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

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

// Screens nested inside a tab's own stack that are meant to take over
// the whole screen — each has its own back button, its own hero
// starting right at insets.top, and its own bottom padding that only
// ever accounts for the home indicator (insets.bottom), never for the
// tab bar's height. Without this list, CurvedTabBar stays mounted
// underneath all of them by default (that's just how a nested
// stack-inside-a-tab works), floating its own "+" on top of screens
// that don't expect it — AddTransaction most confusingly of all,
// since it's already the screen you'd reach by tapping that same "+".
const FULLSCREEN_ROUTES = ['AddTransaction', 'ScheduledFunds', 'Settings', 'AddCard'];

// Reads which screen is actually focused *inside* a tab's nested
// stack (not just which tab is active) and returns the tabBarStyle
// that hides the bar for it. `route` here is the Tab.Screen's own
// route, so this only ever runs for HomeTab/CardsTab.
function getTabBarStyle(route) {
  const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;
  return FULLSCREEN_ROUTES.includes(focusedRouteName) ? { display: 'none' } : undefined;
}

// Navigator

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CurvedTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={({ route }) => ({ tabBarLabel: 'Inicio', tabBarStyle: getTabBarStyle(route) })}
      />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} options={{ tabBarLabel: 'Historial' }} />
      <Tab.Screen name="SavingsTab" component={SavingsScreen} options={{ tabBarLabel: 'Ahorros' }} />
      <Tab.Screen
        name="CardsTab"
        component={CardsStack}
        options={({ route }) => ({ tabBarLabel: 'Tarjetas', tabBarStyle: getTabBarStyle(route) })}
      />
    </Tab.Navigator>
  );
}