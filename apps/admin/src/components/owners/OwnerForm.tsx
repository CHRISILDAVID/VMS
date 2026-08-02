import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';

const ownerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.union([z.literal(''), z.string().email('Invalid email address')]).optional(),
});

export type OwnerFormData = z.infer<typeof ownerSchema>;

interface OwnerFormProps {
  initialValues?: Partial<OwnerFormData>;
  onSubmit: (data: OwnerFormData) => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export function OwnerForm({ initialValues, onSubmit, isSubmitting, isEditMode }: OwnerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      full_name: initialValues?.full_name || '',
      business_name: initialValues?.business_name || '',
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
    }
  });

  return (
    <Card className="max-w-2xl">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <Input
              id="full_name"
              type="text"
              {...register('full_name')}
              error={errors.full_name?.message}
            />
          </div>

          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
            <Input
              id="business_name"
              type="text"
              {...register('business_name')}
              error={errors.business_name?.message}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <Input
              id="phone"
              type="tel"
              disabled={isEditMode}
              {...register('phone')}
              placeholder="+1234567890"
              error={errors.phone?.message}
            />
            {isEditMode && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Phone number cannot be changed once created.</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Owner'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
