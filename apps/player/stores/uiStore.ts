import { create } from 'zustand';

interface UIState {
  /** City selected in the header city picker — used to filter courts, tournaments, etc. */
  cityFilter: string | null;

  /** Whether the alerts/notifications panel is visible */
  isAlertsPanelOpen: boolean;

  /** Whether the wallet popover is visible */
  isWalletPopoverOpen: boolean;

  /**
   * The current user's GPS coordinates from expo-location.
   * Set by usePlayerLocation() on app open. Null if permission denied or not yet acquired.
   */
  userCoords: { latitude: number; longitude: number } | null;

  setCityFilter: (city: string | null) => void;
  setAlertsPanelOpen: (open: boolean) => void;
  setWalletPopoverOpen: (open: boolean) => void;
  setUserCoords: (coords: { latitude: number; longitude: number } | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cityFilter: null,
  isAlertsPanelOpen: false,
  isWalletPopoverOpen: false,
  userCoords: null,

  setCityFilter: (city) => set({ cityFilter: city }),
  setAlertsPanelOpen: (open) => set({ isAlertsPanelOpen: open }),
  setWalletPopoverOpen: (open) => set({ isWalletPopoverOpen: open }),
  setUserCoords: (coords) => set({ userCoords: coords }),
}));
