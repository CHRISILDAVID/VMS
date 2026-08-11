import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PublicVenue,
  OccupiedSlot,
  OnlineBookingInput,
  PlayerBookingPayment,
  PricingBlock,
} from '../types';

/**
 * Booking service factory — player-facing court discovery and online booking.
 * Separate from the owner's bookings.service.ts to avoid RLS conflicts.
 */
export function createBookingPlayerService(supabase: SupabaseClient) {
  /**
   * Fetch all active venues with their courts and min pricing.
   * Used by the Home tab "Nearby Courts" and Play tab "Book Court" listing.
   */
  async function getPublicVenues(city?: string): Promise<PublicVenue[]> {
    let query = supabase
      .from('venues')
      .select(`
        id, name, address, city, state, latitude, longitude,
        contact_phone, amenities, photos, is_active, open_time, close_time,
        courts!inner(id, name, court_type, sort_order, is_active)
      `)
      .eq('is_active', true)
      .eq('courts.is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;

    // Enrich with min_price_per_hour by fetching pricing blocks
    const venues = (data ?? []) as any[];
    const enriched: PublicVenue[] = await Promise.all(
      venues.map(async (v) => {
        let minPrice: number | null = null;
        try {
          const { data: blocks } = await supabase
            .from('pricing_blocks')
            .select('price_per_hour, schedule_id, operating_schedules!inner(venue_id)')
            .eq('operating_schedules.venue_id', v.id)
            .eq('is_active', true)
            .order('price_per_hour', { ascending: true })
            .limit(1);
          minPrice = (blocks as any[])?.[0]?.price_per_hour ?? null;
        } catch {
          // pricing optional
        }

        return {
          id: v.id,
          name: v.name,
          address: v.address,
          city: v.city,
          state: v.state,
          latitude: v.latitude,
          longitude: v.longitude,
          contact_phone: v.contact_phone,
          amenities: v.amenities ?? [],
          photos: v.photos ?? [],
          is_active: v.is_active,
          open_time: v.open_time,
          close_time: v.close_time,
          min_price_per_hour: minPrice,
          courts: (v.courts ?? []).sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          ),
        } as PublicVenue;
      })
    );

    return enriched;
  }

  /**
   * Fetch courts for a specific venue.
   */
  async function getVenueCourts(venueId: string) {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order');

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Fetch all occupied (upcoming/ongoing) booking slots for a court on a given date.
   * Used to colour the 30-min slot grid.
   */
  async function getOccupiedSlots(
    courtId: string,
    date: string
  ): Promise<OccupiedSlot[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('court_id', courtId)
      .eq('date', date)
      .in('status', ['upcoming', 'ongoing'])
      .is('deleted_at', null);

    if (error) throw error;
    return (data ?? []).map((b: any) => ({
      start_time: b.start_time,
      end_time: b.end_time,
      booking_id: b.id,
    })) as OccupiedSlot[];
  }

  /**
   * Fetch pricing blocks for a venue on a given day of week.
   * Returns blocks sorted by start_time.
   */
  async function getPricingBlocks(
    venueId: string,
    dayOfWeek: string
  ): Promise<PricingBlock[]> {
    const { data, error } = await supabase
      .from('operating_schedules')
      .select(`
        id, day_of_week, is_closed,
        pricing_blocks(id, start_time, end_time, price_per_hour, court_ids, is_active, sort_order)
      `)
      .eq('venue_id', venueId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return [];
      throw error;
    }

    const blocks = (data as any)?.pricing_blocks ?? [];
    return blocks
      .filter((b: any) => b.is_active)
      .sort((a: any, b: any) => a.sort_order - b.sort_order) as PricingBlock[];
  }

  /**
   * Fetch a single venue with full details (courts, pricing, contact info).
   */
  async function getVenueDetail(venueId: string): Promise<PublicVenue | null> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        id, name, address, city, state, latitude, longitude,
        contact_phone, amenities, photos, is_active, open_time, close_time,
        courts(id, name, court_type, sort_order, is_active)
      `)
      .eq('id', venueId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      amenities: (data as any).amenities ?? [],
      photos: (data as any).photos ?? [],
      open_time: (data as any).open_time,
      close_time: (data as any).close_time,
      min_price_per_hour: null, // fetched separately if needed
      courts: ((data as any).courts ?? []).filter((c: any) => c.is_active),
    } as PublicVenue;
  }

  /**
   * Create an online booking.
   * 1. Inserts a booking row with source='online'
   * 2. Inserts a player_booking_payments row
   * 3. If payment_method='wallet', deducts from player_wallets + inserts player_transactions
   *
   * Returns { booking_id, payment_id, booking_number }
   */
  async function createOnlineBooking(input: OnlineBookingInput): Promise<{
    booking_id: string;
    booking_number: string;
    payment_id: string;
  }> {
    const bookingNumber = `BK-OL-${Date.now()}`;

    // 1. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        venue_id: input.venue_id,
        court_id: input.court_id,
        booked_by: input.player_id, // player is booker
        date: input.date,
        start_time: input.start_time,
        end_time: input.end_time,
        duration_minutes: input.duration_minutes,
        base_amount: input.base_amount,
        discount: 0,
        final_amount: input.final_amount,
        advance: input.payment_method === 'pay_at_court' ? 0 : input.final_amount,
        pending: input.payment_method === 'pay_at_court' ? input.final_amount : 0,
        status: 'upcoming',
        payment_status:
          input.payment_method === 'pay_at_court' ? 'pending' : 'paid',
        source: 'online',
        slot_type: 'booked',
      })
      .select('id, booking_number')
      .single();

    if (bookingError) throw bookingError;
    const bookingId = (booking as any).id as string;

    // 2. Handle wallet deduction
    let walletTxId: string | null = null;
    if (input.payment_method === 'wallet') {
      // Get wallet
      const { data: wallet, error: walletFetchErr } = await supabase
        .from('player_wallets')
        .select('id, balance')
        .eq('player_id', input.player_id)
        .single();
      if (walletFetchErr) throw walletFetchErr;

      const currentBalance = (wallet as any).balance as number;
      if (currentBalance < input.final_amount) {
        // Rollback booking
        await supabase.from('bookings').delete().eq('id', bookingId);
        throw new Error('Insufficient wallet balance.');
      }

      // Deduct
      const { error: deductErr } = await supabase
        .from('player_wallets')
        .update({
          balance: currentBalance - input.final_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', input.player_id);
      if (deductErr) throw deductErr;

      // Record transaction
      const { data: tx, error: txErr } = await supabase
        .from('player_transactions')
        .insert({
          wallet_id: (wallet as any).id,
          amount: -input.final_amount,
          type: 'debit',
          reason: 'court_booking',
          reference_id: bookingId,
          reference_table: 'bookings',
        })
        .select('id')
        .single();
      if (txErr) throw txErr;
      walletTxId = (tx as any).id;
    }

    // 3. Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('player_booking_payments')
      .insert({
        booking_id: bookingId,
        player_id: input.player_id,
        amount: input.final_amount,
        payment_method: input.payment_method,
        payment_status:
          input.payment_method === 'pay_at_court' ? 'pending' : 'paid',
        razorpay_order_id: input.razorpay_order_id ?? null,
        razorpay_payment_id: input.razorpay_payment_id ?? null,
        razorpay_signature: input.razorpay_signature ?? null,
        wallet_transaction_id: walletTxId,
      })
      .select('id')
      .single();

    if (paymentError) throw paymentError;

    return {
      booking_id: bookingId,
      booking_number: (booking as any).booking_number,
      payment_id: (payment as any).id,
    };
  }

  /**
   * Fetch a player's own booking history (for Play Activity in Profile).
   */
  async function getPlayerBookings(playerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_number, date, start_time, end_time, final_amount,
        status, payment_status, source, created_at,
        venues(id, name, city),
        courts(id, name)
      `)
      .eq('booked_by', playerId)
      .eq('source', 'online')
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data ?? [];
  }

  return {
    getPublicVenues,
    getVenueCourts,
    getOccupiedSlots,
    getPricingBlocks,
    getVenueDetail,
    createOnlineBooking,
    getPlayerBookings,
  };
}
