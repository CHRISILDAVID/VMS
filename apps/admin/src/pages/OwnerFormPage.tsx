import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { createOwnersService } from '@vms/shared/services';
import { PageHeader } from '../components/ui/PageHeader';
import { OwnerForm, type OwnerFormData } from '../components/owners/OwnerForm';

export function OwnerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ownersService = createOwnersService(supabase);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditMode = Boolean(id);

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['owner', id],
    queryFn: () => ownersService.getOwner(id!),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: async (data: OwnerFormData) => {
      if (isEditMode) {
        return ownersService.updateOwner(id!, data);
      } else {
        return ownersService.adminCreateOwner(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['owner', id] });
      }
      navigate('/owners');
    },
    onError: (error: Error) => {
      setErrorMsg(error.message);
    }
  });

  const handleSubmit = (data: OwnerFormData) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  if (isEditMode && isLoading) {
    return <div className="p-8">Loading owner data...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isEditMode ? 'Edit Owner' : 'Add New Owner'} 
        description={isEditMode ? 'Update details for this owner account.' : 'Create a new owner account and send them an invite.'} 
      />

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-2xl">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      <OwnerForm 
        initialValues={initialData || undefined}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        isEditMode={isEditMode}
      />
    </div>
  );
}
