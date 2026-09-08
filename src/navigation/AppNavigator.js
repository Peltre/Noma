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
import AddScheduledFundScreen from "../screens/AddScheduledFundScreen";
import SavingsScreen from "../screens/SavingsScreen";
import CurvedTabBar from './CurvedTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stacks — contentStyle:transparent so screens don't paint an opaque
// flat color in front of AppBackground (a single stable layer mounted
// once in App.js behind the whole navigator).

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddTransaction" component={TransactionScreen} />
      <Stack.Screen name="ScheduledFunds" component={ScheduledFundsScreen} />
      <Stack.Screen name="AddScheduledFund" component={AddScheduledFundScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function CardsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="Cards" component={CardsScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
    </Stack.Navigator>
  );
}

// Screens nested in a tab's stack that take over the whole screen —
// without this list, CurvedTabBar stays mounted underneath them,
// floating its "+" on top of screens that don't expect it.
const FULLSCREEN_ROUTES = ['AddTransaction', 'ScheduledFunds', 'AddScheduledFund', 'Settings', 'AddCard'];

// Reads which screen is focused *inside* a tab's nested stack (not
// just which tab is active) and hides the bar for fullscreen ones.
function getTabBarStyle(route) {
  const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;
  return FULLSCREEN_ROUTES.includes(focusedRouteName) ? { display: 'none' } : undefined;
}

// Navigator

export default function AppNavigator() {
  return (
    <Tab.Navigator
      // sceneStyle, NO sceneContainerStyle: ese prop era de
      // react-navigation 6. En la 7 no aparece ni una vez en todo
      // @react-navigation/bottom-tabs — se ignoraba en silencio.
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
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