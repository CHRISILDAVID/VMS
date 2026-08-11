import { useQuery } from '@tanstack/react-query';
import { createCoachesService } from '@vms/shared/services';
import { supabase } from '../../lib/supabase';

const coachesService = createCoachesService(supabase);

export function useCoaches(venueId?: string) {
  return useQuery({
    queryKey: ['coaches', venueId],
    queryFn: () => coachesService.getCoaches(venueId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCoachDetail(id: string | null) {
  return useQuery({
    queryKey: ['coachDetail', id],
    queryFn: () => coachesService.getCoach(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
