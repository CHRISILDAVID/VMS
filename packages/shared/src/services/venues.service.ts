import type { SupabaseClient } from '@supabase/supabase-js'
import type { Venue } from '../types'

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
  },

  // --- Admin Methods ---
  async listAllVenues(): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select('*, owners(full_name, business_name), courts(id, deleted_at, is_active)')
      .is('deleted_at', null)
      .order('name')

    if (error) throw error
    return data || []
  },

  async createVenue(venueData: Partial<Venue>): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .insert(venueData)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async updateVenue(venueId: string, venueData: Partial<Venue>): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', venueId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async deactivateVenue(venueId: string) {
    const { error } = await supabase
      .from('venues')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', venueId)

    if (error) throw error
  },

  async reassignVenue(venueId: string, newOwnerId: string | null) {
    const { error } = await supabase
      .from('venues')
      .update({ owner_id: newOwnerId })
      .eq('id', venueId)

    if (error) throw error
  }
})
