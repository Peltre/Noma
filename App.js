// App.js
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingOverlay from './src/screens/OnboardingOverlayScreen';
import { FinanceProvider } from './src/store/FinanceContext';
import { loadData } from './src/store/storage';

function RootApp() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      const settings = await loadData('settings');
      setShowOnboarding(!settings?.onboardingCompleted);
      setChecked(true);
    };
    check();
  }, []);

  if (!checked) return null;

  return (
    <NavigationContainer>
      <AppNavigator />
      <OnboardingOverlay
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
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