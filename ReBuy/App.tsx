import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/api/queryClient';
import ErrorBoundary from './src/components/ui/ErrorBoundary';
import AppProviders from './src/context/AppProviders';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/auth/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // GestureHandlerRootView lets the drawer respond to swipes.
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {showSplash ? (
                <SplashScreen onFinish={() => setShowSplash(false)} />
              ) : (
                <AppProviders>
                  <RootNavigator />
                </AppProviders>
              )}
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
