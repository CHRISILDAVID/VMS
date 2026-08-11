import { create } from 'zustand';

interface UIState {
  /** City selected in the header city picker — used to filter courts, tournaments, etc. */
  cityFilter: string | null;

  /** Whether the alerts/notifications panel is visible */
  isAlertsPanelOpen: boolean;

  /** Whether the wallet popover is visible */
  isWalletPopoverOpen: boolean;

  setCityFilter: (city: string | null) => void;
  setAlertsPanelOpen: (open: boolean) => void;
  setWalletPopoverOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cityFilter: null,
  isAlertsPanelOpen: false,
  isWalletPopoverOpen: false,

  setCityFilter: (city) => set({ cityFilter: city }),
  setAlertsPanelOpen: (open) => set({ isAlertsPanelOpen: open }),
  setWalletPopoverOpen: (open) => set({ isWalletPopoverOpen: open }),
}));
