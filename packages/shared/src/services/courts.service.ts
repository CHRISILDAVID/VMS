import type { SupabaseClient } from '@supabase/supabase-js'
import type { Court } from '../types/database'

export const createCourtsService = (supabase: SupabaseClient) => ({
  async getCourts(venueId: string): Promise<Court[]> {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order')

    if (error) throw error
    return data || []
  }
})
