import { useColorScheme } from 'nativewind';

/**
 * Returns resolved theme colors for components that cannot use NativeWind className
 * (e.g., native tab bar, bottom sheets, charts, third-party components).
 */
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    colors: {
      background: isDark ? '#090E17' : '#F8FAFC',
      foreground: isDark ? '#F8FAFC' : '#0F172A',
      card: isDark ? '#121B2A' : '#ffffff',
      cardForeground: isDark ? '#F1F5F9' : '#0F172A',
      primary: isDark ? '#3B82F6' : '#1E40AF',
      primaryForeground: '#ffffff',
      border: isDark ? '#1E293B' : '#E2E8F0',
      muted: isDark ? '#1E293B' : '#F1F5F9',
      mutedForeground: isDark ? '#94A3B8' : '#64748B',
      destructive: isDark ? '#F87171' : '#EF4444',
      success: isDark ? '#4ADE80' : '#22C55E',
      warning: isDark ? '#FBBF24' : '#F59E0B',
    },
  };
}
