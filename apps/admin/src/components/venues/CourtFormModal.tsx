import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import type { Court } from '@vms/shared/types';

const courtSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  court_type: z.enum(['wooden', 'synthetic', 'cement', 'mat']).optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type CourtFormData = z.infer<typeof courtSchema>;

interface CourtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourtFormData) => void;
  initialData?: Court;
  isSubmitting: boolean;
}

export function CourtFormModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }: CourtFormModalProps) {
  const isEditMode = !!initialData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: '',
      court_type: null,
      is_active: true,
      sort_order: 0,
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        court_type: initialData?.court_type || null,
        is_active: initialData?.is_active ?? true,
        sort_order: initialData?.sort_order || 0,
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: CourtFormData) => {
    onSubmit({
      ...data,
      court_type: data.court_type === '' ? null : data.court_type
    } as CourtFormData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-900/80 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isEditMode ? 'Edit Court' : 'Add Court'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <form id="court-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Court Name *</label>
              <Input
                id="name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="e.g. Court 1"
              />
            </div>

            <div>
              <label htmlFor="court_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Court Type</label>
              <select
                id="court_type"
                {...register('court_type')}
                className="block w-full rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 py-2 px-3 shadow-sm sm:text-sm"
              >
                <option value="">-- Unspecified --</option>
                <option value="wooden">Wooden</option>
                <option value="synthetic">Synthetic</option>
                <option value="cement">Cement</option>
                <option value="mat">Mat</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                {...register('is_active')}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                Court is Active
              </label>
            </div>

            <div>
              <label htmlFor="sort_order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
                error={errors.sort_order?.message}
              />
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="court-form"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Court'}
          </button>
        </div>
      </div>
    </div>
  );
}
