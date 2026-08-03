import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { createVenuesService } from '@vms/shared/services';
import { useAuthContext } from '../contexts/AuthContext';
import { useVenueStore } from '../stores/venueStore';
import { useEffect } from 'react';

const venuesService = createVenuesService(supabase);

export function useVenues() {
  const { user } = useAuthContext();
  const { selectedVenueId, setSelectedVenueId } = useVenueStore();

  const query = useQuery({
    queryKey: ['venues', user?.id],
    queryFn: () => venuesService.getVenues(user!.id),
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Auto-select first venue if none selected
  useEffect(() => {
    if (query.data && query.data.length > 0 && !selectedVenueId) {
      setSelectedVenueId(query.data[0].id);
    }
  }, [query.data, selectedVenueId, setSelectedVenueId]);

  return query;
}

export function useCurrentVenue() {
  const { data: venues } = useVenues();
  const { selectedVenueId } = useVenueStore();

  if (!venues || !selectedVenueId) return null;
  return venues.find((v) => v.id === selectedVenueId) || null;
}
