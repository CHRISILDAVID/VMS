import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { createBookingsService, BookingWithDetails } from '@vms/shared/services';
import { BookingStatus, BookingPaymentStatus, PaymentMode } from '@vms/shared/types';
import { useVenueStore } from '../../../stores/venueStore';
import { useAuthContext } from '../../../contexts/AuthContext';

const bookingsService = createBookingsService(supabase);

export function useBookings(filters?: {
  date?: string;
  courtId?: string;
  statusTab?: BookingStatus;
  search?: string;
}) {
  const { selectedVenueId } = useVenueStore();

  const query = useQuery({
    queryKey: ['bookings', selectedVenueId, filters],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      return await bookingsService.getBookings(selectedVenueId, filters);
    },
    enabled: !!selectedVenueId,
    staleTime: 60 * 1000,
  });

  return query;
}

export function useBookingDetail(bookingId?: string) {
  const query = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      return await bookingsService.getBookingById(bookingId);
    },
    enabled: !!bookingId,
    staleTime: 60 * 1000,
  });

  return query;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { ownerProfile } = useAuthContext();

  const mutation = useMutation({
    mutationFn: async ({
      data,
      isForceBooked = false,
    }: {
      data: any;
      isForceBooked?: boolean;
    }) => {
      if (!ownerProfile?.id) throw new Error('Owner profile not loaded');
      const payload = {
        ...data,
        booked_by: ownerProfile.id,
      };
      return await bookingsService.createBooking(payload, isForceBooked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return mutation;
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      return await bookingsService.updateBookingStatus(id, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      payment_status,
      payment_mode,
      advance,
      pending,
      payment_notes,
    }: {
      id: string;
      payment_status: BookingPaymentStatus;
      payment_mode?: PaymentMode | null;
      advance?: number;
      pending?: number;
      payment_notes?: string | null;
    }) => {
      return await bookingsService.updatePaymentStatus(
        id,
        payment_status,
        payment_mode,
        advance,
        pending,
        payment_notes
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return await bookingsService.cancelBooking(id, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}

export function useMoveBooking() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      updates,
      isForceBooked = false,
    }: {
      id: string;
      updates: {
        date: string;
        start_time: string;
        end_time: string;
        duration_minutes: number;
        court_id: string;
        venue_id: string;
      };
      isForceBooked?: boolean;
    }) => {
      return await bookingsService.moveBooking(id, updates, isForceBooked);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}
