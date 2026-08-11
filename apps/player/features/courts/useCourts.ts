import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBookingPlayerService } from '@vms/shared/services';
import type { OnlineBookingInput } from '@vms/shared/types';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const bookingService = createBookingPlayerService(supabase);

/**
 * useCourts — React Query hooks for court booking flow.
 */

export function usePublicVenues(city?: string | null) {
  return useQuery({
    queryKey: ['publicVenues', city ?? 'all'],
    queryFn: () => bookingService.getPublicVenues(city ?? undefined),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useVenueDetail(venueId: string | null) {
  return useQuery({
    queryKey: ['venueDetail', venueId],
    queryFn: () => bookingService.getVenueDetail(venueId!),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVenueCourts(venueId: string | null) {
  return useQuery({
    queryKey: ['venueCourts', venueId],
    queryFn: () => bookingService.getVenueCourts(venueId!),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOccupiedSlots(courtId: string | null, date: Date | null) {
  const dateStr = date ? format(date, 'yyyy-MM-dd') : null;
  return useQuery({
    queryKey: ['occupiedSlots', courtId, dateStr],
    queryFn: () => bookingService.getOccupiedSlots(courtId!, dateStr!),
    enabled: !!courtId && !!dateStr,
    staleTime: 60 * 1000, // 1 min — slots change frequently
    refetchInterval: 60 * 1000,
  });
}

export function usePricingBlocks(venueId: string | null, dayOfWeek: string | null) {
  return useQuery({
    queryKey: ['pricingBlocks', venueId, dayOfWeek],
    queryFn: () => bookingService.getPricingBlocks(venueId!, dayOfWeek!),
    enabled: !!venueId && !!dayOfWeek,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OnlineBookingInput) => bookingService.createOnlineBooking(input),
    onSuccess: (data) => {
      // Invalidate occupied slots so they refresh after booking
      queryClient.invalidateQueries({ queryKey: ['occupiedSlots'] });
      // Invalidate wallet balance
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
    },
  });
}

export function usePlayerBookings(playerId: string | null) {
  return useQuery({
    queryKey: ['playerBookings', playerId],
    queryFn: () => bookingService.getPlayerBookings(playerId!),
    enabled: !!playerId,
    staleTime: 2 * 60 * 1000,
  });
}
