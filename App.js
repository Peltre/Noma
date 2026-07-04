// App.js
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingOverlay from './src/screens/OnboardingOverlayScreen';
import { FinanceProvider, useFinance } from './src/store/FinanceContext';

function RootApp() {
  // Driven live by settings instead of a one-time storage read on
  // mount — this way, resetting all data (which resets settings too)
  // brings the onboarding overlay back on its own, no app restart
  // needed.
  const { settings, isLoading } = useFinance();

  if (isLoading) return null;

  return (
    <NavigationContainer>
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