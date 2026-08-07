// App.js
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingOverlay from './src/screens/OnboardingOverlayScreen';
import { FinanceProvider, useFinance } from './src/store/FinanceContext';
import { useTheme } from './src/store/useTheme';
import AppBackground from './src/components/AppBackground';

function RootApp() {
  // Driven live by settings instead of a one-time storage read on
  // mount — this way, resetting all data (which resets settings too)
  // brings the onboarding overlay back on its own, no app restart
  // needed.
  const { settings, isLoading } = useFinance();
  const { theme, themeName } = useTheme();

  if (isLoading) return null;

  // NavigationContainer paints its own background — its own, not
  // whatever's rendered inside it — and left unset, that's
  // react-navigation's own light-mode white. That used to be the
  // root of a white flash during a tab-bar-hiding transition, fixed
  // by pointing it at `theme.bg`. Now that AppBackground (below)
  // paints the actual background for the whole app as a sibling
  // BEHIND the NavigationContainer instead of each screen painting
  // its own flat color, the fix is the same idea taken one step
  // further: transparent, so the still-mounted AppBackground shows
  // through consistently instead of either flashing white or
  // painting a flat color over it.
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
      {/* Mounted once, here, instead of per-screen — switching tabs
          never remounts it, and every screen's own background just
          needs to stay transparent to let it show through. */}
      <AppBackground themeName={themeName} />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
        <OnboardingOverlay visible={!settings.onboardingCompleted} />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
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