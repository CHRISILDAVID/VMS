import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Copy, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createCourtsService } from '@vms/shared/services';
import type { Court } from '@vms/shared/types';
import { CourtFormModal, type CourtFormData } from './CourtFormModal';

interface CourtListProps {
  venueId: string;
}

export function CourtList({ venueId }: CourtListProps) {
  const queryClient = useQueryClient();
  const courtsService = createCourtsService(supabase);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | undefined>(undefined);
  const [batchCount, setBatchCount] = useState<number>(4);
  const [confirmBatch, setConfirmBatch] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: courts, isLoading } = useQuery({
    queryKey: ['courts', venueId],
    queryFn: () => courtsService.getCourts(venueId)
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Court>) => courtsService.createCourt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courts', venueId] });
      setIsModalOpen(false);
    },
    onError: (err: Error) => setErrorMsg(err.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, court: Partial<Court> }) => courtsService.updateCourt(data.id, data.court),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courts', venueId] });
      setIsModalOpen(false);
    },
    onError: (err: Error) => setErrorMsg(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courtsService.deleteCourt(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', venueId] }),
    onError: (err: Error) => setErrorMsg(err.message)
  });

  const batchCreateMutation = useMutation({
    mutationFn: async (count: number) => {
      const startingIndex = courts ? courts.length : 0;
      const promises = [];
      for (let i = 1; i <= count; i++) {
        promises.push(courtsService.createCourt({
          venue_id: venueId,
          name: `Court ${startingIndex + i}`,
          is_active: true,
          sort_order: startingIndex + i
        }));
      }
      await Promise.all(promises);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', venueId] }),
    onError: (err: Error) => setErrorMsg(err.message)
  });

  const cloneMutation = useMutation({
    mutationFn: async ({ court, count }: { court: Court, count: number }) => {
      const startingIndex = courts ? courts.length : 0;
      const promises = [];
      for (let i = 1; i <= count; i++) {
        // Strip the number if it ends in one, or just append " Copy"
        promises.push(courtsService.createCourt({
          venue_id: venueId,
          name: `${court.name} (Copy ${i})`,
          court_type: court.court_type,
          is_active: court.is_active,
          sort_order: startingIndex + i
        }));
      }
      await Promise.all(promises);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', venueId] }),
    onError: (err: Error) => setErrorMsg(err.message)
  });

  const handleModalSubmit = (data: CourtFormData) => {
    setErrorMsg(null);
    if (editingCourt) {
      updateMutation.mutate({ id: editingCourt.id, court: data });
    } else {
      createMutation.mutate({ ...data, venue_id: venueId });
    }
  };

  const handleOpenEdit = (court: Court) => {
    setEditingCourt(court);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingCourt(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (court: Court) => {
    // Basic warning - ideally we should check for future active bookings here
    if (window.confirm(`Are you sure you want to delete ${court.name}? Ensure no upcoming bookings are tied to it.`)) {
      deleteMutation.mutate(court.id);
    }
  };

  const handleBatchCreate = () => {
    if (!confirmBatch) {
      setConfirmBatch(true);
      setTimeout(() => setConfirmBatch(false), 3000); // Reset after 3 seconds
      return;
    }
    batchCreateMutation.mutate(batchCount);
    setConfirmBatch(false);
  };

  const handleClone = (court: Court) => {
    const input = window.prompt(`How many copies of "${court.name}" do you want to create?`, "1");
    if (input) {
      const count = parseInt(input, 10);
      if (!isNaN(count) && count > 0 && count <= 20) {
        cloneMutation.mutate({ court, count });
      } else {
        alert("Please enter a valid number between 1 and 20.");
      }
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Courts</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50 p-1">
            <input 
              type="number" 
              min="1" 
              max="20" 
              value={batchCount}
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="w-16 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm text-slate-900 dark:text-white"
            />
            <button 
              onClick={handleBatchCreate}
              disabled={batchCreateMutation.isPending}
              className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors flex items-center gap-1 disabled:opacity-50 ${
                confirmBatch 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600' 
                  : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <Copy size={14} /> {confirmBatch ? 'Confirm?' : 'Batch Add'}
            </button>
          </div>
          
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <Plus size={16} /> Add Court
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-4 text-sm text-slate-500">Loading courts...</div>
      ) : courts?.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center bg-slate-50 dark:bg-slate-800/20">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">No courts</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new court or using the batch add feature.</p>
          <div className="mt-4 text-xs font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 inline-flex px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            Warning: Venue has 0 active courts. It will not be bookable.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courts?.map((court) => (
            <div key={court.id} className="relative group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{court.name}</h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleClone(court)} className="text-slate-400 hover:text-green-600 dark:hover:text-green-400 p-1" title="Clone Court">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleOpenEdit(court)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1" title="Edit Court">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(court)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1" title="Delete Court">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-slate-500 dark:text-slate-400 capitalize">{court.court_type || 'Type unassigned'}</span>
                <span className={`inline-flex items-center self-start rounded-full px-2 py-0.5 text-xs font-medium ${court.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {court.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CourtFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCourt}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
