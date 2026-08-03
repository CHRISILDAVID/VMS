import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Plus, AlertTriangle, X } from 'lucide-react';
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

  // Modal states
  const [modalOwner, setModalOwner] = useState<OwnerWithCount | null>(null);
  const [modalMode, setModalMode] = useState<'select' | 'deactivate' | 'delete'>('select');

  const { data: owners, isLoading, error } = useQuery({
    queryKey: ['owners'],
    queryFn: () => ownersService.listAllOwners() as Promise<OwnerWithCount[]>
  });

  const { data: ownerVenues, isLoading: isLoadingVenues } = useQuery({
    queryKey: ['owner_venues', modalOwner?.id],
    queryFn: () => venuesService.getVenues(modalOwner!.id),
    enabled: !!modalOwner
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
      setModalOwner(null);
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
      setModalOwner(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (owner: OwnerWithCount) => {
      await ownersService.adminDeleteOwner(owner.id);
    },
    onSuccess: () => {
      setErrorMsg(null);
      setModalOwner(null);
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
      setModalOwner(null);
    }
  });

  const handleDeleteAction = (owner: OwnerWithCount) => {
    setModalOwner(owner);
    setModalMode('select');
  };

  const closeModal = () => {
    setModalOwner(null);
  };

  if (isLoading) return <div className="p-8">Loading owners...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading owners: {error.message}</div>;

  return (
    <div className="space-y-6 relative">
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

      <OwnerList owners={owners || []} onDeleteAction={handleDeleteAction} />

      {/* Delete / Deactivate Modal */}
      {modalOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Remove Owner: {modalOwner.full_name}
              </h2>
              
              {modalMode === 'select' && (
                <div className="mt-4 space-y-4">
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                    How would you like to proceed with removing this owner?
                  </p>
                  
                  <div 
                    onClick={() => setModalMode('deactivate')}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <h3 className="font-medium text-slate-900 dark:text-slate-200">Deactivate Owner</h3>
                    <p className="text-xs text-slate-500 mt-1">Soft deletes the owner. Hides them from the platform but keeps their historical data intact. (Requires them to have no active venues)</p>
                  </div>

                  <div 
                    onClick={() => setModalMode('delete')}
                    className="border border-red-200 dark:border-red-900/50 rounded-lg p-4 cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <h3 className="font-medium text-red-600 dark:text-red-400">Complete Delete</h3>
                    <p className="text-xs text-red-500 mt-1">Permanently destroys the owner account and everything associated with it, including all venues, courts, and bookings.</p>
                  </div>
                </div>
              )}

              {modalMode === 'deactivate' && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm text-blue-800 dark:text-blue-300">
                    <p>Are you sure you want to deactivate this owner? They will be unable to log in, but their past bookings and customer data will remain in the database for accounting purposes.</p>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalMode('select')} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900">Back</button>
                    <button 
                      onClick={() => deactivateMutation.mutate(modalOwner)}
                      disabled={deactivateMutation.isPending}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {deactivateMutation.isPending ? 'Deactivating...' : 'Confirm Deactivate'}
                    </button>
                  </div>
                </div>
              )}

              {modalMode === 'delete' && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-sm text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <p className="font-medium">Warning: Destructive Action</p>
                      <p className="mt-1">This will permanently delete the user's authentication account. Due to cascading database rules, <strong>ALL venues, courts, bookings, and customers</strong> associated with this owner will be immediately destroyed.</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Affected Venues:</h4>
                    {isLoadingVenues ? (
                      <p className="text-xs text-slate-500">Loading venues...</p>
                    ) : ownerVenues && ownerVenues.length > 0 ? (
                      <ul className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded list-disc pl-6 max-h-32 overflow-y-auto">
                        {ownerVenues.map(v => (
                          <li key={v.id}>{v.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No venues found for this owner.</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalMode('select')} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900">Back</button>
                    <button 
                      onClick={() => deleteMutation.mutate(modalOwner)}
                      disabled={deleteMutation.isPending}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
