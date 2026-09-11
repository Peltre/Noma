import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// La ÚNICA línea de la app que nombra la fuente fuera de
// constants/theme.js. Se importa el paquete entero en vez de peso por
// peso para que agregar o quitar un peso sea cosa de WEIGHT_SUFFIX y
// no haya que tocar dos archivos a la vez.
import * as FontPack from '@expo-google-fonts/bricolage-grotesque';

import AppNavigator from './src/navigation/AppNavigator';
import OnboardingOverlay from './src/screens/OnboardingOverlayScreen';
import { FinanceProvider, useFinance } from './src/store/FinanceContext';
import { useTheme } from './src/store/useTheme';
import AppBackground from './src/components/AppBackground';
import { FONT_FILE_NAMES } from './src/constants/theme';

// { BricolageGrotesque_400Regular: <módulo ttf>, ... } armado a partir
// de la lista de theme.js. Si un peso no existe en el paquete queda
// fuera en vez de entrar como undefined, que haría fallar useFonts con
// un error que no dice cuál faltó.
const FONT_ASSETS = Object.fromEntries(
  FONT_FILE_NAMES.filter((name) => FontPack[name]).map((name) => [name, FontPack[name]]),
);

if (__DEV__) {
  const missing = FONT_FILE_NAMES.filter((name) => !FontPack[name]);
  if (missing.length) {
    console.warn(
      `[Noma] El paquete de fuentes no trae estos pesos: ${missing.join(', ')}. ` +
      'Ajusta WEIGHT_SUFFIX en src/constants/theme.js — si no, esos textos ' +
      'caen a la fuente del sistema sin avisar.',
    );
  }
}

function RootApp() {
  const { settings, isLoading } = useFinance();
  const { theme } = useTheme();

  if (isLoading) return null;

  // NavigationContainer pinta su propio fondo; transparente para que
  // AppBackground (montado detrás, como hermano) se vea a través.
  const isDark = theme.statusBarStyle === 'light';
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: 'transparent',
      card: theme.surface,
      text: theme.ink,
      border: theme.border,
      primary: theme.brand,
    },
  };

  return (
    <View style={styles.root}>
      <AppBackground />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
        {/* Bienvenida completa la primera vez; sólo el tour cuando se
            pide desde Ajustes ("Ver el recorrido"). */}
        <OnboardingOverlay
          visible={!settings.onboardingCompleted || !!settings.showTour}
          tourOnly={!!settings.onboardingCompleted && !!settings.showTour}
        />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  // Si una fuente falla, la app arranca con la del sistema en vez de
  // quedarse en blanco.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <RootApp />
      </FinanceProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});