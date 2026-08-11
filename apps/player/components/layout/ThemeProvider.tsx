import React, { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { usePlayerThemeStore } from '../../stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = usePlayerThemeStore();
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </>
  );
}
