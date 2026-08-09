import type { SupabaseClient } from '@supabase/supabase-js'
import type { Booking, BookingStatus, BookingPaymentStatus, PaymentMethod, Customer, Court, Venue, DayOfWeek } from '../types'

export interface BookingWithDetails extends Booking {
  customer?: Customer;
  court?: Court;
  venue?: Venue;
}

function applyDynamicStatus(b: any) {
  if (!b || b.status === 'cancelled') return b;
  const startDateTime = new Date(`${b.date}T${b.start_time}`);
  const endDateTime = new Date(`${b.date}T${b.end_time}`);
  const now = new Date();
  if (now < startDateTime) {
    b.status = 'upcoming';
  } else if (now >= startDateTime && now < endDateTime) {
    b.status = 'ongoing';
  } else {
    b.status = 'completed';
  }
  return b;
}

export const createBookingsService = (supabase: SupabaseClient) => ({
  async getBookings(
    venueId: string, 
    filters?: { 
      date?: string; 
      courtId?: string; 
      statusTab?: BookingStatus; 
      search?: string;
    }
  ): Promise<BookingWithDetails[]> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        court:courts(*)
      `)
      .eq('venue_id', venueId)
      .is('deleted_at', null)
      .order('start_time', { ascending: true })

    if (filters?.date) {
      query = query.eq('date', filters.date);
    }

    if (filters?.courtId) {
      query = query.eq('court_id', filters.courtId);
    }

    if (filters?.statusTab) {
      if (filters.statusTab === 'cancelled') {
        query = query.eq('status', 'cancelled');
      } else {
        query = query.neq('status', 'cancelled');
      }
    }

    if (filters?.search && filters.search.trim() !== '') {
      const term = filters.search.trim();
      // First find matching customer IDs
      const { data: matchingCustomers } = await supabase
        .from('customers')
        .select('id')
        .or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`);
      
      const custIds = matchingCustomers?.map(c => c.id) || [];
      if (custIds.length > 0) {
        query = query.or(`booking_number.ilike.%${term}%,customer_id.in.(${custIds.join(',')})`);
      } else {
        query = query.ilike('booking_number', `%${term}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    
    let processedData = (data || []).map(applyDynamicStatus);
    if (filters?.statusTab && filters.statusTab !== 'cancelled') {
      processedData = processedData.filter((b: any) => b.status === filters.statusTab);
    }
    
    return processedData as BookingWithDetails[];
  },

  async getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        court:courts(*),
        venue:venues(*)
      `)
      .eq('id', bookingId)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return applyDynamicStatus(data) as BookingWithDetails | null;
  },

  async checkOverlap(
    venueId: string,
    courtId: string, 
    dateStr: string, 
    startTime: string, 
    endTime: string, 
    excludeBookingId?: string
  ): Promise<{ hasOverlap: boolean; conflicts: any[] }> {
    // Check bookings
    let bQuery = supabase
      .from('bookings')
      .select('*')
      .eq('court_id', courtId)
      .eq('date', dateStr)
      .is('deleted_at', null)
      .not('status', 'eq', 'cancelled')
      .or(`end_time.gt.${startTime},end_time.eq.00:00:00,end_time.eq.00:00`);

    if (endTime !== '00:00:00' && endTime !== '00:00') {
      bQuery = bQuery.lt('start_time', endTime);
    }

    if (excludeBookingId) {
      bQuery = bQuery.neq('id', excludeBookingId);
    }

    const { data: bConflicts, error: bError } = await bQuery;
    if (bError) throw bError;

    // Check memberships active on this day of week
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() as DayOfWeek;
    
    let mQuery = supabase
      .from('membership_slots')
      .select('*')
      .eq('venue_id', venueId)
      .contains('playing_days', [dayOfWeek])
      .is('deleted_at', null)
      .or(`end_time.gt.${startTime},end_time.eq.00:00:00,end_time.eq.00:00`);

    if (endTime !== '00:00:00' && endTime !== '00:00') {
      mQuery = mQuery.lt('start_time', endTime);
    }

    const { data: mConflicts, error: mError } = await mQuery;

    if (mError && !mError.message?.includes('schema cache') && !mError.message?.includes('does not exist')) {
      throw mError;
    }

    // Filter memberships by court_id (if null/all courts or matches courtId)
    const matchingMemberships = (mConflicts || []).filter(
      m => !m.court_id || m.court_id === courtId
    );

    const conflicts = [...(bConflicts || []), ...matchingMemberships];
    return {
      hasOverlap: conflicts.length > 0,
      conflicts
    };
  },

  async createBooking(data: any, isForceBooked = false): Promise<BookingWithDetails> {
    // Perform overlap check unless force booked
    if (!isForceBooked && data.venue_id && data.court_id && data.date && data.start_time && data.end_time) {
      const { hasOverlap, conflicts } = await this.checkOverlap(
        data.venue_id,
        data.court_id,
        data.date,
        data.start_time,
        data.end_time
      );
      if (hasOverlap) {
        const err: any = new Error('OVERLAP_DETECTED');
        err.code = 'OVERLAP_DETECTED';
        err.conflicts = conflicts;
        throw err;
      }
    }

    // Generate booking number if not present
    let bookingNumber = data.booking_number;
    if (!bookingNumber) {
      const datePart = data.date ? data.date.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      bookingNumber = `BK-${datePart}-${randomPart}`;
    }

    const insertData = {
      ...data,
      booking_number: bookingNumber,
      is_force_booked: isForceBooked,
    };

    const { data: created, error } = await supabase
      .from('bookings')
      .insert(insertData)
      .select(`
        *,
        customer:customers(*),
        court:courts(*)
      `)
      .single();

    if (error) throw error;
    return applyDynamicStatus(created) as BookingWithDetails;
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<BookingWithDetails> {
    const { data: updated, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        customer:customers(*),
        court:courts(*)
      `)
      .single();

    if (error) throw error;
    return applyDynamicStatus(updated) as BookingWithDetails;
  },

  async updatePaymentStatus(
    id: string, 
    payment_status: BookingPaymentStatus, 
    payment_mode?: PaymentMethod | null,
    advance?: number,
    pending?: number,
    payment_notes?: string | null
  ): Promise<BookingWithDetails> {
    const updatePayload: any = { payment_status };
    if (payment_mode !== undefined) updatePayload.payment_mode = payment_mode;
    if (advance !== undefined) updatePayload.advance = advance;
    if (pending !== undefined) updatePayload.pending = pending;
    if (payment_notes !== undefined) updatePayload.payment_notes = payment_notes;

    const { data: updated, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        customer:customers(*),
        court:courts(*)
      `)
      .single();

    if (error) throw error;
    return applyDynamicStatus(updated) as BookingWithDetails;
  },

  async cancelBooking(id: string, reason?: string): Promise<BookingWithDetails> {
    const updatePayload: any = {
      status: 'cancelled',
      payment_status: 'cancelled',
    };
    if (reason) {
      updatePayload.notes = reason;
    }

    const { data: updated, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        customer:customers(*),
        court:courts(*)
      `)
      .single();

    if (error) throw error;
    return applyDynamicStatus(updated) as BookingWithDetails;
  },

  async moveBooking(
    id: string,
    updates: {
      date: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      court_id: string;
      venue_id: string;
      base_amount?: number;
      final_amount?: number;
      pending?: number;
    },
    isForceBooked = false
  ): Promise<BookingWithDetails> {
    if (!isForceBooked) {
      const { hasOverlap, conflicts } = await this.checkOverlap(
        updates.venue_id,
        updates.court_id,
        updates.date,
        updates.start_time,
        updates.end_time,
        id
      );
      if (hasOverlap) {
        const err: any = new Error('OVERLAP_DETECTED');
        err.code = 'OVERLAP_DETECTED';
        err.conflicts = conflicts;
        throw err;
      }
    }

    const updatePayload: any = {
      date: updates.date,
      start_time: updates.start_time,
      end_time: updates.end_time,
      duration_minutes: updates.duration_minutes,
      court_id: updates.court_id,
      is_force_booked: isForceBooked,
    };

    if (updates.base_amount !== undefined) updatePayload.base_amount = updates.base_amount;
    if (updates.final_amount !== undefined) updatePayload.final_amount = updates.final_amount;
    if (updates.pending !== undefined) updatePayload.pending = updates.pending;

    const { data: updated, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        customer:customers(*),
        court:courts(*)
      `)
      .single();

    if (error) throw error;
    return applyDynamicStatus(updated) as BookingWithDetails;
  },

  async blockSlot(params: {
    venue_id: string;
    court_id: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    notes?: string;
    booked_by: string;
  }): Promise<any> {
    // Generate a random booking number for the block
    const booking_number = `BLK-${params.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_number,
        venue_id: params.venue_id,
        court_id: params.court_id,
        booked_by: params.booked_by,
        date: params.date,
        start_time: params.start_time,
        end_time: params.end_time,
        duration_minutes: params.duration_minutes,
        base_amount: 0,
        final_amount: 0,
        status: 'completed',
        payment_status: 'paid',
        slot_type: 'blocked',
        notes: params.notes,
        is_force_booked: true, // Bypass overlap in UI logic, but still a real row
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unblockSlot(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
      
    if (error) throw error;
  }
})
