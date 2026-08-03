import type { SupabaseClient } from '@supabase/supabase-js'
import type { DayOfWeek, Booking, MembershipSlot, OperatingSchedule, PricingBlock } from '../types'

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
      .select('*, customer:customers(*)')
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
      
    if (membershipsError && !membershipsError.message?.includes('schema cache') && !membershipsError.message?.includes('does not exist')) {
      throw membershipsError
    }
    
    // Note: We also need to fetch releases to exclude released blocks, but keeping it simple for now
    const { data: releases, error: releasesError } = await supabase
      .from('membership_slot_releases')
      .select('slot_id')
      .eq('release_date', dateStr)
      
    if (releasesError && !releasesError.message?.includes('schema cache') && !releasesError.message?.includes('does not exist')) {
      throw releasesError
    }
    
    const releasedSlotIds = new Set(releases?.map(r => r.slot_id) || [])
    const activeBlocks = membershipBlocks?.filter(b => !releasedSlotIds.has(b.id)) || []

    return {
      bookings: bookings as Booking[],
      membershipBlocks: activeBlocks as MembershipSlot[]
    }
  },

  async upsertOperatingSchedule(schedule: Partial<OperatingSchedule> & { venue_id: string, day_of_week: DayOfWeek }) {
    const { data, error } = await supabase
      .from('operating_schedules')
      .upsert({
        id: schedule.id,
        venue_id: schedule.venue_id,
        day_of_week: schedule.day_of_week,
        is_closed: schedule.is_closed ?? false,
        is_24h: schedule.is_24h ?? false,
      }, { onConflict: 'venue_id, day_of_week' })
      .select()
      .single()

    if (error) throw error
    return data as OperatingSchedule
  },

  async upsertPricingBlock(block: Partial<PricingBlock> & { schedule_id: string }) {
    const { data, error } = await supabase
      .from('pricing_blocks')
      .upsert({
        id: block.id,
        schedule_id: block.schedule_id,
        start_time: block.start_time,
        end_time: block.end_time,
        price_per_hour: block.price_per_hour,
        court_ids: block.court_ids || [],
        is_active: block.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error
    return data as PricingBlock
  },

  async deletePricingBlock(id: string) {
    const { error } = await supabase
      .from('pricing_blocks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async copyScheduleAndPricingToDays(
    venueId: string, 
    sourceDay: DayOfWeek, 
    targetDays: DayOfWeek[]
  ) {
    // Get source schedule and pricing blocks
    const sourceSchedule = await this.getOperatingSchedule(venueId, sourceDay)
    if (!sourceSchedule) throw new Error("Source schedule not found")

    // For each target day
    for (const targetDay of targetDays) {
      // 1. Upsert operating schedule
      const targetSchedule = await this.upsertOperatingSchedule({
        venue_id: venueId,
        day_of_week: targetDay,
        is_closed: sourceSchedule.is_closed,
        is_24h: sourceSchedule.is_24h
      })

      // 2. Delete existing pricing blocks for target day
      const { error: deleteError } = await supabase
        .from('pricing_blocks')
        .delete()
        .eq('schedule_id', targetSchedule.id)
      
      if (deleteError) throw deleteError

      // 3. Insert copied pricing blocks
      if (sourceSchedule.pricing_blocks && sourceSchedule.pricing_blocks.length > 0) {
        const blocksToInsert = sourceSchedule.pricing_blocks.map(b => ({
          schedule_id: targetSchedule.id,
          start_time: b.start_time,
          end_time: b.end_time,
          price_per_hour: b.price_per_hour,
          court_ids: b.court_ids,
          is_active: b.is_active,
        }))
        
        const { error: insertError } = await supabase
          .from('pricing_blocks')
          .insert(blocksToInsert)
          
        if (insertError) throw insertError
      }
    }
  }
})
