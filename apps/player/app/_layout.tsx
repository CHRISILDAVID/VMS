import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { cssInterop, useColorScheme } from 'nativewind';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated } from 'react-native';

cssInterop(GestureHandlerRootView, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider, useAuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../components/layout/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes default
      retry: 2,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, playerProfile, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as any) === '(auth)';

    if (!session) {
      // Not logged in → go to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login' as any);
      }
    } else if (session && !playerProfile) {
      // Logged in but no player profile yet → go to profile creation
      if (segments.join('/') !== '(auth)/create-profile') {
        router.replace('/(auth)/create-profile' as any);
      }
    } else if (session && playerProfile) {
      // Fully authenticated → go to home tab
      if (inAuthGroup) {
        router.replace('/(tabs)/home' as any);
      }
    }
  }, [session, playerProfile, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    // Fonts will be added in a future milestone — using system fonts for now
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Hide splash once fonts are ready (or immediately since none loaded)
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} className={colorScheme === 'dark' ? 'dark' : ''}>
      <AuthProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="courts" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </AuthGuard>
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
