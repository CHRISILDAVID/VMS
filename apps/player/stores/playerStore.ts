import { create } from 'zustand';

/**
 * Player profile type (mirrors the `players` DB table from Migration 014)
 */
export interface Player {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  date_of_birth: string | null;
  player_id: string | null;         // 'SH' + 5 chars — only after Rankings registration
  player_id_verified: boolean;
  player_id_doc_type: string | null;
  player_id_verified_at: string | null;
  linked_customer_id: string | null;
  fcm_token: string | null;
  theme_preference: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface PlayerState {
  playerProfile: Player | null;
  walletBalance: number | null;       // paise (₹1 = 100 paise)
  alertsCount: number;

  setPlayerProfile: (profile: Player | null) => void;
  setWalletBalance: (balance: number) => void;
  setAlertsCount: (count: number) => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  playerProfile: null,
  walletBalance: null,
  alertsCount: 0,

  setPlayerProfile: (profile) => set({ playerProfile: profile }),
  setWalletBalance: (balance) => set({ walletBalance: balance }),
  setAlertsCount: (count) => set({ alertsCount: count }),
  clearPlayer: () => set({ playerProfile: null, walletBalance: null, alertsCount: 0 }),
}));
