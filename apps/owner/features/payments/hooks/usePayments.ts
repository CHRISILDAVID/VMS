import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPaymentsService } from '@vms/shared/services';
import { PaymentMode } from '@vms/shared/types';
import { supabase } from '../../../lib/supabase';

const paymentsService = createPaymentsService(supabase);

export const useSlotPayments = (slotId?: string) => {
  return useQuery({
    queryKey: ['payments', 'slot', slotId],
    queryFn: () => paymentsService.getPaymentsBySlot(slotId!),
    enabled: !!slotId,
  });
};

export const useVenuePaymentSummary = (venueId?: string) => {
  return useQuery({
    queryKey: ['payments', 'summary', venueId],
    queryFn: () => paymentsService.getVenuePaymentSummary(venueId!),
    enabled: !!venueId,
  });
};

export const useMarkPaymentAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      paymentId: string;
      mode: PaymentMode;
      paidOn: string;
      notes?: string;
      receiptUrl?: string;
    }) => paymentsService.markAsPaid(params),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};
