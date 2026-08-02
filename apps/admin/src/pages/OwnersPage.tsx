import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createOwnersService, createVenuesService } from '@vms/shared/services';
import { PageHeader } from '../components/ui/PageHeader';
import { OwnerList } from '../components/owners/OwnerList';
import type { Owner } from '@vms/shared/types';

interface OwnerWithCount extends Owner {
  venues?: [{ count: number }];
}

export function OwnersPage() {
  const queryClient = useQueryClient();
  const ownersService = createOwnersService(supabase);
  const venuesService = createVenuesService(supabase);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: owners, isLoading, error } = useQuery({
    queryKey: ['owners'],
    queryFn: () => ownersService.listAllOwners() as Promise<OwnerWithCount[]>
  });

  const deactivateMutation = useMutation({
    mutationFn: async (owner: OwnerWithCount) => {
      // Step 1: Check active venues
      const activeVenues = await venuesService.getVenues(owner.id);
      if (activeVenues.length > 0) {
        throw new Error(`Cannot deactivate owner because they have ${activeVenues.length} active venue(s).`);
      }
      // Step 2: Deactivate owner
      await ownersService.deactivateOwner(owner.id);
    },
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    }
  });

  const handleDeactivate = (owner: OwnerWithCount) => {
    if (window.confirm(`Are you sure you want to deactivate ${owner.full_name}?`)) {
      deactivateMutation.mutate(owner);
    }
  };

  if (isLoading) return <div className="p-8">Loading owners...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading owners: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Owners" description="Manage all venue owners on the platform" />
        <Link
          to="/owners/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add Owner
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

      <OwnerList owners={owners || []} onDeactivate={handleDeactivate} />
    </div>
  );
}
