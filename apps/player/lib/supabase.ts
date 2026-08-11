import * as SecureStore from 'expo-secure-store';
import { getSupabaseClient } from '@vms/shared';

/**
 * Custom storage adapter using expo-secure-store.
 * Uses a player-specific key prefix to avoid colliding with the owner app
 * when both apps are installed on the same device.
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(`player_${key}`);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(`player_${key}`, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(`player_${key}`);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = getSupabaseClient(supabaseUrl, supabaseAnonKey, ExpoSecureStoreAdapter);
