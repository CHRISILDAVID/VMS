import { useColorScheme } from 'nativewind';
import { PLAYER_COLORS, type PlayerColors } from '../constants/player-theme';

/**
 * usePlayerThemeColors
 *
 * Returns resolved PLAYER_COLORS for the current color scheme.
 * Use this ONLY for native components that cannot accept NativeWind className
 * (tab bar, bottom sheets, charts, third-party components).
 *
 * For all other UI, use className with semantic tokens from tailwind.config.js.
 */
export function usePlayerThemeColors(): { isDark: boolean; colors: typeof PLAYER_COLORS.light | typeof PLAYER_COLORS.dark } {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    colors: isDark ? PLAYER_COLORS.dark : PLAYER_COLORS.light,
  };
}
