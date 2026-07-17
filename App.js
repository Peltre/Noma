// App.js
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingOverlay from './src/screens/OnboardingOverlayScreen';
import { FinanceProvider, useFinance } from './src/store/FinanceContext';
import { useTheme } from './src/store/useTheme';

function RootApp() {
  // Driven live by settings instead of a one-time storage read on
  // mount — this way, resetting all data (which resets settings too)
  // brings the onboarding overlay back on its own, no app restart
  // needed.
  const { settings, isLoading } = useFinance();
  const { theme } = useTheme();

  if (isLoading) return null;

  // NavigationContainer paints its own background — its own, not
  // whatever's rendered inside it — and left unset, that's
  // react-navigation's own light-mode white. That's the root of the
  // white flash during a tab-bar-hiding transition: every screen and
  // navigator inside can be themed correctly and this would still
  // show through underneath all of them for an instant, since it
  // sits further up the tree than any of that. Spreading a real base
  // theme (Dark/DefaultTheme) instead of a bare object keeps
  // whatever `fonts` or other keys this react-navigation version
  // expects intact — only `colors` actually needs to change.
  const isDark = theme.statusBarStyle === 'light';
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.bg,
      card: theme.surface,
      text: theme.ink,
      border: theme.border,
      primary: theme.brand,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <AppNavigator />
      <OnboardingOverlay visible={!settings.onboardingCompleted} />
    </NavigationContainer>
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