import type { SupabaseClient } from '@supabase/supabase-js'

export const createAuthService = (supabase: SupabaseClient) => ({
  async signInWithOtp(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`, // Force Indian numbers for now based on specs
    })
    if (error) throw error
    return data
  },

  async verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getSession() {
    return supabase.auth.getSession()
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback)
    return data.subscription
  }
})
