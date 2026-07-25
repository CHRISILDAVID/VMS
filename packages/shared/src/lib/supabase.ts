import { createClient } from '@supabase/supabase-js'

// Environment-aware Supabase client initialization
// The actual URL and key are provided by each app's environment config

export function getSupabaseClient(
  url: string,
  anonKey: string,
  storageAdapter?: any // Allow passing custom storage adapter (like expo-secure-store)
) {
  return createClient(url, anonKey, {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Prevents errors in React Native
    },
  })
}
