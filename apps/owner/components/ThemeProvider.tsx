import React, { useEffect } from 'react';

import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  console.log('ThemeProvider render, colorScheme:', colorScheme, 'theme:', theme);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </>
  );
}
