import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { cssInterop, useColorScheme } from 'nativewind';

cssInterop(GestureHandlerRootView, { className: 'style' });
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider, useAuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../components/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, ownerProfile, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as any) === '(auth)';

    if (!session) {
      // Not logged in
      if (!inAuthGroup) {
        router.replace('/(auth)/login' as any);
      }
    } else if (session && !ownerProfile) {
      // Logged in, but no owner profile
      if (segments.join('/') !== '(auth)/account-not-configured') {
        router.replace('/(auth)/account-not-configured' as any);
      }
    } else if (session && ownerProfile) {
      // Fully logged in and profile exists
      if (inAuthGroup) {
        router.replace('/(tabs)/schedule' as any);
      }
    }
  }, [session, ownerProfile, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} className={colorScheme === 'dark' ? 'dark' : ''}>
      <AuthProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="booking" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </AuthGuard>
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
