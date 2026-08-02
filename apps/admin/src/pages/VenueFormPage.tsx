import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { createVenuesService } from '@vms/shared/services';
import { PageHeader } from '../components/ui/PageHeader';
import { VenueForm } from '../components/venues/VenueForm';
import type { Venue } from '@vms/shared/types';

export function VenueFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const venuesService = createVenuesService(supabase);

  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => venuesService.getVenue(id as string),
    enabled: isEditMode,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Venue>) => venuesService.createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      navigate('/venues');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Venue>) => venuesService.updateVenue(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue', id] });
      navigate('/venues');
    },
  });

  const handleSubmit = async (data: Partial<Venue>) => {
    if (isEditMode) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error;

  if (isEditMode && isLoading) {
    return <div className="p-8 text-slate-500 dark:text-slate-400">Loading venue details...</div>;
  }

  if (isEditMode && error) {
    return <div className="p-8 text-red-500">Error loading venue details: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isEditMode ? 'Edit Venue' : 'Create New Venue'} 
        description={isEditMode ? 'Update venue information and photos' : 'Add a new venue to the platform'}
        showBack={true}
      />

      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-800 p-4 rounded-r-md max-w-4xl mx-auto">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{submitError.message}</p>
            </div>
          </div>
        </div>
      )}

      <VenueForm 
        initialData={initialData || undefined} 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}
