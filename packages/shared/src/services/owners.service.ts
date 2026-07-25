import type { SupabaseClient } from '@supabase/supabase-js'
import type { Owner } from '../types/database'

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
  }
})
