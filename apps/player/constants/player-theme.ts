/**
 * PLAYER_COLORS — ShuttleHub Design Tokens
 *
 * These are the resolved hex values for native components that cannot use
 * NativeWind className (e.g., tab bar, bottom sheets, charts, modals).
 * For all components that support className, use the semantic tokens from
 * tailwind.config.js instead of these values directly.
 *
 * Theme: Navy (#0B1F3A) + Lime (#A7FF3F) — Sporty & Professional
 */

export const PLAYER_COLORS = {
  /** Brand accent — Lime, always the same in both modes */
  lime: '#A7FF3F',
  /** Brand primary dark — Navy, always the same in both modes */
  navy: '#0B1F3A',

  light: {
    background: '#FFFFFF',
    foreground: '#0B1F3A',

    card: '#F5F7FA',
    cardForeground: '#0B1F3A',

    primary: '#0B1F3A',        // Navy button bg in light mode
    primaryForeground: '#A7FF3F', // Lime text on Navy button

    accent: '#A7FF3F',
    accentForeground: '#0B1F3A',

    border: '#D1D9E0',
    muted: '#EEF1F5',
    mutedForeground: '#5A6B7B',

    destructive: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',

    tabBarActive: '#0B1F3A',   // Navy active tab icon
    tabBarInactive: '#94A3B8',
    tabBarBackground: '#FFFFFF',
  },

  dark: {
    background: '#0B1F3A',     // Navy background in dark mode
    foreground: '#FFFFFF',

    card: '#102844',
    cardForeground: '#F0F4F8',

    primary: '#A7FF3F',        // Lime button bg in dark mode
    primaryForeground: '#0B1F3A', // Navy text on Lime button

    accent: '#A7FF3F',
    accentForeground: '#0B1F3A',

    border: '#1A3655',
    muted: '#1A3655',
    mutedForeground: '#94A3B8',

    destructive: '#F87171',
    success: '#4ADE80',
    warning: '#FBBF24',

    tabBarActive: '#A7FF3F',   // Lime active tab icon in dark mode
    tabBarInactive: '#4A6B8A',
    tabBarBackground: '#0D2545',
  },
} as const;

export type PlayerColorMode = 'light' | 'dark';
export type PlayerColors = typeof PLAYER_COLORS.light;
