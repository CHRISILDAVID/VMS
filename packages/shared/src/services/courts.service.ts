import type { SupabaseClient } from '@supabase/supabase-js'
import type { Court } from '../types'

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
  },

  // --- Admin Methods ---
  async createCourt(courtData: Partial<Court>): Promise<Court> {
    const { data, error } = await supabase
      .from('courts')
      .insert(courtData)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async updateCourt(courtId: string, courtData: Partial<Court>): Promise<Court> {
    const { data, error } = await supabase
      .from('courts')
      .update(courtData)
      .eq('id', courtId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async deleteCourt(courtId: string) {
    const { error } = await supabase
      .from('courts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', courtId)

    if (error) throw error
  },

  async reorderCourts(orderedIds: string[]) {
    // Supabase RPC or multiple updates. Multiple updates for now since we expect small n.
    const promises = orderedIds.map((id, index) =>
      supabase.from('courts').update({ sort_order: index }).eq('id', id)
    )
    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error).map(r => r.error)
    if (errors.length > 0) {
      throw errors[0]
    }
  }
})
