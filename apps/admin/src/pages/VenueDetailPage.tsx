import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, MapPin, Phone, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createVenuesService, createOwnersService, createCourtsService } from '@vms/shared/services';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { CourtList } from '../components/venues/CourtList';
import { VenuePhotos } from '../components/venues/VenuePhotos';
import { OwnerSearchSelect } from '../components/owners/OwnerSearchSelect';
import type { Venue } from '@vms/shared/types';
import { formatPhone } from '@vms/shared/utils';

interface VenueWithCount extends Venue {
  owners?: { full_name: string; business_name: string };
  courts?: [{ count: number }];
}

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const venuesService = createVenuesService(supabase);
  const ownersService = createOwnersService(supabase);
  const courtsService = createCourtsService(supabase);

  const [reassigning, setReassigning] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

  const { data: venue, isLoading, error } = useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      // In a real scenario, we might use a dedicated RPC to fetch venue detail with owner info and stats
      // Since venuesService.getVenue only returns raw Venue, we can just fetch the joined data here
      const { data, error } = await supabase
        .from('venues')
        .select('*, owners(id, full_name, business_name)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as VenueWithCount & { owners: any };
    }
  });

  const { data: courts } = useQuery({
    queryKey: ['courts', id],
    queryFn: () => courtsService.getCourts(id as string)
  });

  const { data: stats } = useQuery({
    queryKey: ['venue_stats', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_reports_chart_data', { p_venue_id: id, p_time_filter: 'month' });
      if (error) throw error;
      return data;
    }
  });

  const reassignMutation = useMutation({
    mutationFn: async (newOwnerId: string) => {
      await venuesService.reassignVenue(id as string, newOwnerId === '' ? null : newOwnerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue', id] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      setReassigning(false);
    }
  });

  const handleReassign = () => {
    reassignMutation.mutate(selectedOwnerId);
  };

  if (isLoading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading venue details...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading venue details: {error.message}</div>;
  if (!venue) return <div className="p-8 text-slate-500 dark:text-slate-400">Venue not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader 
          title={venue.name} 
          description={
            <span className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${venue.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                {venue.is_active ? 'Active' : 'Inactive'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {venue.city || 'No city'}</span>
            </span>
          }
        />
        <div className="flex items-center gap-3">
          <Link
            to={`/venues/${venue.id}/schedule`}
            className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Manage Schedule
          </Link>
          <Link
            to={`/venues/${venue.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Venue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Venue Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <CourtList venueId={venue.id} />
            </CardContent>
          </Card>
          
          <VenuePhotos venueId={venue.id} photos={venue.photos || []} />
        </div>

        {/* Right Column: Stats & Info */}
        <div className="space-y-6">
          
          {/* Owner Info & Reassignment */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 size={18} className="text-slate-400" />
                Ownership
              </h3>
            </CardHeader>
            <CardContent>
              {reassigning ? (
                <div className="space-y-3">
                  <OwnerSearchSelect 
                    value={selectedOwnerId} 
                    onChange={setSelectedOwnerId} 
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReassign}
                      disabled={reassignMutation.isPending}
                      className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      {reassignMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setReassigning(false)}
                      className="flex-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    {venue.owners ? (
                      <>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{venue.owners.full_name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{venue.owners.business_name}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Unassigned</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOwnerId(venue.owners?.id || '');
                      setReassigning(true);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Reassign
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Stats Summary</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total Courts</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{courts?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total Bookings</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stats ? Math.round((stats.summary.current.occupancy * (courts?.length || 0) * 14)) || 0 : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Active Members</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stats ? stats.summary.current.members : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Revenue (MTD)</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stats ? `₹ ${stats.summary.current.revenue.toLocaleString()}` : '₹ --'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Contact & Legal</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <p>{venue.address || 'No address provided'}</p>
                  {(venue.city || venue.state || venue.pincode) && (
                    <p className="mt-1">
                      {[venue.city, venue.state, venue.pincode].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{venue.contact_phone ? formatPhone(venue.contact_phone) : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{venue.contact_email || 'N/A'}</span>
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">GSTIN</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{venue.gstin || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {venue.gst_enabled ? (
                    <><CheckCircle2 size={16} className="text-green-500" /> <span className="text-slate-700 dark:text-slate-300">GST Enabled on receipts</span></>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">GST Disabled</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
