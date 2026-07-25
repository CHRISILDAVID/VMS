import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { createCustomersService } from '@vms/shared/services';
import { useAuthContext } from '../../../contexts/AuthContext';

const customersService = createCustomersService(supabase);

export function useCustomers(search?: string) {
  const { ownerProfile } = useAuthContext();
  const ownerId = ownerProfile?.id;

  const query = useQuery({
    queryKey: ['customers', ownerId, search],
    queryFn: async () => {
      if (!ownerId) return [];
      return await customersService.getCustomers(ownerId, search);
    },
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000,
  });

  return query;
}

export function useCreateOrGetCustomer() {
  const { ownerProfile } = useAuthContext();
  const ownerId = ownerProfile?.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { full_name: string; phone: string; email?: string | null; notes?: string | null }) => {
      if (!ownerId) throw new Error('Owner profile not loaded');
      return await customersService.createOrGetCustomer(ownerId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return mutation;
}
