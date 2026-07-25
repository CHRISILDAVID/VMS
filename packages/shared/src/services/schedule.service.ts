import type { SupabaseClient } from '@supabase/supabase-js'
import type { DayOfWeek, Booking, MembershipSlot, OperatingSchedule, PricingBlock } from '../types/database'

export const createScheduleService = (supabase: SupabaseClient) => ({
  async getOperatingSchedule(venueId: string, dayOfWeek: DayOfWeek) {
    const { data, error } = await supabase
      .from('operating_schedules')
      .select(`
        *,
        pricing_blocks (*)
      `)
      .eq('venue_id', venueId)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as (OperatingSchedule & { pricing_blocks: PricingBlock[] }) | null
  },

  async getScheduleSlots(venueId: string, dateStr: string) {
    // 1. Fetch bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('venue_id', venueId)
      .eq('date', dateStr)
      .is('deleted_at', null)
      .not('status', 'eq', 'cancelled')
      
    if (bookingsError) throw bookingsError

    // 2. Fetch membership slots active on this day
    const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() as DayOfWeek
    const { data: membershipBlocks, error: membershipsError } = await supabase
      .from('membership_slots')
      .select('*')
      .eq('venue_id', venueId)
      .contains('playing_days', [dayOfWeek])
      .is('deleted_at', null)
      
    if (membershipsError) throw membershipsError
    
    // Note: We also need to fetch releases to exclude released blocks, but keeping it simple for now
    const { data: releases, error: releasesError } = await supabase
      .from('membership_slot_releases')
      .select('slot_id')
      .eq('release_date', dateStr)
      
    if (releasesError) throw releasesError
    
    const releasedSlotIds = new Set(releases?.map(r => r.slot_id) || [])
    const activeBlocks = membershipBlocks?.filter(b => !releasedSlotIds.has(b.id)) || []

    return {
      bookings: bookings as Booking[],
      membershipBlocks: activeBlocks as MembershipSlot[]
    }
  }
})
