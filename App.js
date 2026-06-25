// Main app that gets rendered
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { FinanceProvider } from "./src/store/FinanceContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </FinanceProvider>
    </SafeAreaProvider>
  )
}