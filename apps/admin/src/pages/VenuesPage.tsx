import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createVenuesService } from '@vms/shared/services';
import { PageHeader } from '../components/ui/PageHeader';
import { VenueList } from '../components/venues/VenueList';
import type { Venue } from '@vms/shared/types';

interface VenueWithCount extends Venue {
  owners?: { full_name: string; business_name: string };
  courts?: [{ count: number }];
}

export function VenuesPage() {
  const queryClient = useQueryClient();
  const venuesService = createVenuesService(supabase);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: () => venuesService.listAllVenues() as Promise<VenueWithCount[]>
  });

  const deactivateMutation = useMutation({
    mutationFn: async (venue: VenueWithCount) => {
      // In a real app we might check for future bookings before deactivating.
      // For now, we allow deactivation (soft delete).
      await venuesService.deactivateVenue(venue.id);
    },
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    }
  });

  const handleDeactivate = (venue: VenueWithCount) => {
    if (window.confirm(`Are you sure you want to deactivate ${venue.name}?`)) {
      deactivateMutation.mutate(venue);
    }
  };

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading venues...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading venues: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Venues" description="Manage all badminton venues on the platform" />
        <Link
          to="/venues/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Venue
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-800 p-4 rounded-r-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      <VenueList venues={venues || []} onDeactivate={handleDeactivate} />
    </div>
  );
}
