import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import type { Venue } from '@vms/shared/types';
import { OwnerSearchSelect } from '../owners/OwnerSearchSelect';
import { ScrollTimePicker } from '../ui/ScrollTimePicker';

const venueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  owner_id: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  gstin: z.string().optional().nullable(),
  gst_enabled: z.boolean().default(false),
  open_time: z.string().default('06:00:00'),
  close_time: z.string().default('22:00:00'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

type VenueFormData = z.infer<typeof venueSchema>;

interface VenueFormProps {
  initialData?: Venue;
  onSubmit: (data: Partial<Venue>) => Promise<void>;
  isSubmitting: boolean;
}

export function VenueForm({ initialData, onSubmit, isSubmitting }: VenueFormProps) {
  const isEditMode = !!initialData;
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: initialData?.name || '',
      owner_id: initialData?.owner_id || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      pincode: initialData?.pincode || '',
      contact_phone: initialData?.contact_phone || '',
      contact_email: initialData?.contact_email || '',
      gstin: initialData?.gstin || '',
      gst_enabled: initialData?.gst_enabled || false,
      open_time: initialData?.open_time || '06:00:00',
      close_time: initialData?.close_time || '22:00:00',
      latitude: initialData?.latitude || null,
      longitude: initialData?.longitude || null,
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const newPhotos = [...photos];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (!file.type.startsWith('image/')) continue;
      
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      // In a real app, you might group by venue_id, but here it's globally unique
      const filePath = `images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('venue-photos')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('venue-photos')
          .getPublicUrl(data.path);
        newPhotos.push(publicUrl);
      }
    }

    setPhotos(newPhotos);
    setUploading(false);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleFormSubmit = (data: VenueFormData) => {
    // Convert empty string owner_id to null
    const submitData = {
      ...data,
      owner_id: data.owner_id === '' ? null : data.owner_id,
      photos
    };
    onSubmit(submitData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pt-2">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Venue Name *</label>
              <Input
                id="name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="e.g. Feather Touch Badminton"
              />
            </div>
            
            <div className="flex flex-col z-10">
              <label htmlFor="owner_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign to Owner</label>
              <Controller
                name="owner_id"
                control={control}
                render={({ field }) => (
                  <OwnerSearchSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Location Info */}
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <Input id="address" {...register('address')} error={errors.address?.message} />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
              <Input id="city" {...register('city')} error={errors.city?.message} />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
              <Input id="state" {...register('state')} error={errors.state?.message} />
            </div>
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
              <Input id="pincode" {...register('pincode')} error={errors.pincode?.message} />
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Operating Hours */}
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Operating Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="open_time" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Open Time *</label>
              <Controller
                name="open_time"
                control={control}
                render={({ field }) => (
                  <ScrollTimePicker 
                    value={field.value.substring(0, 5)} 
                    onChange={(val) => field.onChange(`${val}:00`)} 
                    disabled={isSubmitting} 
                  />
                )}
              />
              {errors.open_time && <p className="mt-1 text-sm text-red-500">{errors.open_time.message}</p>}
            </div>
            <div>
              <label htmlFor="close_time" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Close Time *</label>
              <Controller
                name="close_time"
                control={control}
                render={({ field }) => (
                  <ScrollTimePicker 
                    value={field.value.substring(0, 5)} 
                    onChange={(val) => field.onChange(`${val}:00`)} 
                    disabled={isSubmitting} 
                  />
                )}
              />
              {errors.close_time && <p className="mt-1 text-sm text-red-500">{errors.close_time.message}</p>}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Contact & Legal */}
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Contact & Billing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <Input id="contact_phone" type="tel" {...register('contact_phone')} error={errors.contact_phone?.message} />
            </div>
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
              <Input id="contact_email" type="email" {...register('contact_email')} error={errors.contact_email?.message} />
            </div>
            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
              <Input id="gstin" {...register('gstin')} error={errors.gstin?.message} />
            </div>
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id="gst_enabled"
                  type="checkbox"
                  {...register('gst_enabled')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="gst_enabled" className="font-medium text-slate-700 dark:text-slate-300">Enable GST on receipts</label>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Photos */}
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Photos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WebP (MAX. 5MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            
            {uploading && (
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading photos...
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
                    <img src={url} alt={`Venue photo ${idx+1}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Venue' : 'Create Venue')}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
