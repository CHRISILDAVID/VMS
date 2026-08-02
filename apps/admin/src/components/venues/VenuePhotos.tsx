import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { UploadCloud, X, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createVenuesService } from '@vms/shared/services';

interface VenuePhotosProps {
  venueId: string;
  photos: string[];
}

export function VenuePhotos({ venueId, photos }: VenuePhotosProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const venuesService = createVenuesService(supabase);

  const updatePhotosMutation = useMutation({
    mutationFn: async (newPhotos: string[]) => {
      await venuesService.updateVenue(venueId, { photos: newPhotos });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue', venueId] });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const newPhotos = [...(photos || [])];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (!file.type.startsWith('image/')) continue;
      
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('venue-photos')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        alert(`Failed to upload ${file.name}: ${error.message}`);
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('venue-photos')
          .getPublicUrl(data.path);
        newPhotos.push(publicUrl);
      }
    }

    await updatePhotosMutation.mutateAsync(newPhotos);
    setUploading(false);
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    // Attempt to delete from bucket if we can extract the path
    try {
      const urlObj = new URL(photoUrl);
      const parts = urlObj.pathname.split('venue-photos/');
      if (parts.length > 1) {
        const path = parts[1];
        await supabase.storage.from('venue-photos').remove([path]);
      }
    } catch (e) {
      console.warn("Could not parse or delete photo from bucket:", e);
    }

    // Update DB
    const newPhotos = photos.filter(url => url !== photoUrl);
    await updatePhotosMutation.mutateAsync(newPhotos);
  };

  if (!isManaging && (!photos || photos.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ImageIcon size={18} className="text-slate-400" />
              Venue Photos
            </h3>
            <button 
              onClick={() => setIsManaging(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Manage
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            No photos uploaded yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ImageIcon size={18} className="text-slate-400" />
            Venue Photos
          </h3>
          <button 
            onClick={() => setIsManaging(!isManaging)}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            {isManaging ? 'Done' : 'Manage'}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isManaging && (
          <div className="flex items-center justify-center w-full mb-4">
            <label htmlFor="venue-photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              </div>
              <input id="venue-photo-upload" type="file" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        )}

        {uploading && (
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading photos...
          </div>
        )}

        {photos && photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <img src={photo} alt={`Venue ${idx + 1}`} className="w-full h-full object-cover" />
                
                {isManaging && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Delete Photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
