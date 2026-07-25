import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { createCourtsService } from '@vms/shared/services';

const courtsService = createCourtsService(supabase);

export function useCourts(venueId: string | null) {
  return useQuery({
    queryKey: ['courts', venueId],
    queryFn: () => courtsService.getCourts(venueId!),
    enabled: !!venueId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
