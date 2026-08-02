import type { SupabaseClient } from '@supabase/supabase-js'
import type { Owner } from '../types'

export const createOwnersService = (supabase: SupabaseClient) => ({
  async getOwner(userId: string): Promise<Owner | null> {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "Results contain 0 rows"
      throw error
    }
    
    return data
  },

  async createOwner(ownerData: Partial<Owner>): Promise<Owner> {
    const { data, error } = await supabase
      .from('owners')
      .insert(ownerData)
      .select('*')
      .single()

    if (error) throw error
    return data
  },
  
  async updateOwner(userId: string, ownerData: Partial<Owner>): Promise<Owner> {
     const { data, error } = await supabase
      .from('owners')
      .update(ownerData)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // --- Admin Methods ---
  async listAllOwners(): Promise<Owner[]> {
    const { data, error } = await supabase
      .from('owners')
      .select('*, venues(count)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    if (error) throw error
    return data
  },

  async searchOwners(query: string = '', limit: number = 10): Promise<Owner[]> {
    let q = supabase
      .from('owners')
      .select('id, full_name, business_name, email')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (query) {
      q = q.or(`full_name.ilike.%${query}%,business_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data, error } = await q
    if (error) throw error
    return data as Owner[]
  },

  async adminCreateOwner(ownerData: { phone: string; full_name: string; business_name: string; email?: string }): Promise<Owner> {
    const { data, error } = await supabase.functions.invoke('create-owner-account', {
      body: ownerData
    })
    
    if (error) throw error
    if (data.error) throw new Error(data.error)
    return data.owner
  },

  async getOwnerWithVenues(userId: string) {
    const { data, error } = await supabase
      .from('owners')
      .select('*, venues(*)')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },
  
  async deactivateOwner(userId: string) {
    const { error } = await supabase
      .from('owners')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId)
      
    if (error) throw error
  }
})
