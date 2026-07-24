import { createClient } from '@supabase/supabase-js'

// Environment-aware Supabase client initialization
// The actual URL and key are provided by each app's environment config

let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient(url: string, anonKey: string) {
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  }
  return supabaseInstance
}

export function resetSupabaseClient() {
  supabaseInstance = null
}
