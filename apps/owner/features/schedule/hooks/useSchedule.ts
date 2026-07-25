import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { createScheduleService } from '@vms/shared/services';
import { useVenueStore } from '../../../stores/venueStore';

const scheduleService = createScheduleService(supabase);

export function useSchedule(dateStr: string) {
  const { selectedVenueId } = useVenueStore();

  const query = useQuery({
    queryKey: ['schedule', selectedVenueId, dateStr],
    queryFn: async () => {
      if (!selectedVenueId) return null;
      
      const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() as any;
      
      const [operatingSchedule, slots] = await Promise.all([
        scheduleService.getOperatingSchedule(selectedVenueId, dayOfWeek),
        scheduleService.getScheduleSlots(selectedVenueId, dateStr),
      ]);

      return {
        operatingSchedule,
        bookings: slots.bookings,
        membershipBlocks: slots.membershipBlocks,
      };
    },
    enabled: !!selectedVenueId && !!dateStr,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
}
