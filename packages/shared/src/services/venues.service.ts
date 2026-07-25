import type { SupabaseClient } from '@supabase/supabase-js'
import type { Venue } from '../types/database'

export const createVenuesService = (supabase: SupabaseClient) => ({
  async getVenues(ownerId: string): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .order('name')

    if (error) throw error
    return data || []
  },

  async getVenue(venueId: string): Promise<Venue | null> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return data
  }
})
