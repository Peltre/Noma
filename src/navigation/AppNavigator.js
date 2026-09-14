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
    <Stack.Navigator screenOptions={STACK_SCREEN}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Formularios: suben desde abajo, como una hoja grande. Las
          pantallas de consulta (fondos, ajustes) entran de lado. */}
      <Stack.Screen name="ScheduledFunds" component={ScheduledFundsScreen} />
      <Stack.Screen name="AddScheduledFund" component={AddScheduledFundScreen} options={FORM_SCREEN} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ── Transiciones ──
// Stack: las pantallas de consulta entran de lado (slide_from_right),
// igual en iOS y Android, con gesto de regreso. Android por defecto usa
// un fundido corto que se siente distinto al de iOS; aquí van iguales.
const STACK_SCREEN = {
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
  animation: 'slide_from_right',
  animationDuration: 280,
  gestureEnabled: true,
};

// Transición para pantallas de "crear/editar": suben desde abajo con
// la curva nativa de cada plataforma. El resto usa el push lateral
// por defecto del native-stack.
const FORM_SCREEN = { animation: 'slide_from_bottom', animationDuration: 420, gestureDirection: 'vertical' };

function CardsStack() {
  return (
    <Stack.Navigator screenOptions={STACK_SCREEN}>
      <Stack.Screen name="Cards" component={CardsScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} options={FORM_SCREEN} />
    </Stack.Navigator>
  );
}

// Screens nested in a tab's stack that take over the whole screen —
// without this list, CurvedTabBar stays mounted underneath them,
// floating its "+" on top of screens that don't expect it.
const FULLSCREEN_ROUTES = ['ScheduledFunds', 'AddScheduledFund', 'Settings', 'AddCard'];

// Reads which screen is focused *inside* a tab's nested stack (not
// just which tab is active) and hides the bar for fullscreen ones.
function getTabBarStyle(route) {
  const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;
  return FULLSCREEN_ROUTES.includes(focusedRouteName) ? { display: 'none' } : undefined;
}

// Navigator

// Raíz: las pestañas y, ENCIMA de ellas, "Nuevo movimiento". Vive en
// la raíz y no dentro del stack de Inicio para que abrirlo desde
// cualquier pestaña no obligue a cambiar primero a Inicio: antes se
// veían dos animaciones encimadas (el cambio de pestaña y la subida
// del formulario). Ahora sólo sube el formulario, sobre la pestaña
// en la que estés, y al cerrarlo vuelves ahí mismo.
const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={STACK_SCREEN}>
      <RootStack.Screen name="Tabs" component={Tabs} />
      <RootStack.Screen name="AddTransaction" component={TransactionScreen} options={FORM_SCREEN} />
    </RootStack.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      // sceneStyle, NO sceneContainerStyle: ese prop era de
      // react-navigation 6. En la 7 no aparece ni una vez en todo
      // @react-navigation/bottom-tabs — se ignoraba en silencio.
      // Cambio de pestaña: 'shift' desliza la escena un poco en la
      // dirección del cambio y la funde (react-navigation 7). Antes las
      // pestañas cambiaban de golpe.
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        animation: 'shift',
        transitionSpec: { animation: 'timing', config: { duration: 220 } },
      }}
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