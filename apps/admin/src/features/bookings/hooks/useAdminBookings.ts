import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { createBookingsService, createVenuesService, createCourtsService } from '@vms/shared/services';

const bookingsService = createBookingsService(supabase);
const venuesService = createVenuesService(supabase);
const courtsService = createCourtsService(supabase);

export function useAdminBookings(venueId?: string, filters?: { status?: string; search?: string; date?: string; courtId?: string }) {
  return useQuery({
    queryKey: ['admin-bookings', venueId, filters],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          court:courts!inner(*),
          customer:customers(*)
        `)
        .is('deleted_at', null)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (venueId) {
        query = query.eq('court.venue_id', venueId);
      }
      if (filters?.date) {
        query = query.eq('booking_date', filters.date);
      }
      if (filters?.courtId && filters.courtId !== 'all' && filters.courtId !== 'All Courts') {
        query = query.eq('court_id', filters.courtId);
      }
      if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
        const s = filters.status.toLowerCase();
        if (s === 'upcoming') {
          query = query.eq('status', 'confirmed').gte('booking_date', new Date().toISOString().split('T')[0]);
        } else if (s === 'completed') {
          query = query.eq('status', 'completed');
        } else if (s === 'cancelled') {
          query = query.eq('status', 'cancelled');
        } else if (s === 'confirmed' || s === 'ongoing') {
          query = query.eq('status', 'confirmed');
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let res = data || [];
      if (filters?.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase().trim();
        res = res.filter((b: any) => 
          b.booking_number?.toLowerCase().includes(q) ||
          b.customer?.full_name?.toLowerCase().includes(q) ||
          b.customer?.phone?.includes(q)
        );
      }
      return res;
    },
    enabled: true,
  });
}

export function useAdminVenues() {
  return useQuery({
    queryKey: ['admin-venues'],
    queryFn: async () => {
      const { data, error } = await supabase.from('venues').select('*').is('deleted_at', null).order('name');
      if (error) throw error;
      return data || [];
    }
  });
}

export function useAdminCourts(venueId?: string) {
  return useQuery({
    queryKey: ['admin-courts', venueId],
    queryFn: async () => {
      if (!venueId) return [];
      const { data, error } = await supabase.from('courts').select('*').eq('venue_id', venueId).is('deleted_at', null).order('sort_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!venueId,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      return bookingsService.cancelBooking(bookingId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    }
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, amount, mode }: { bookingId: string; amount: number; mode: any }) => {
      return bookingsService.updatePaymentStatus(bookingId, 'paid', mode, amount, 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    }
  });
}
