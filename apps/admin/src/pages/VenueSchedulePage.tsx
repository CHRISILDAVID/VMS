import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { createScheduleService, createVenuesService, createCourtsService } from '@vms/shared/services';
import type { DayOfWeek, Court } from '@vms/shared/types';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { PricingBlockEditor } from '../components/venues/PricingBlockEditor';
import { ArrowLeft, Clock, Copy, Loader2, AlertCircle } from 'lucide-react';

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
  { id: 'sun', label: 'Sunday' }
];

export function VenueSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const scheduleService = createScheduleService(supabase);
  const venuesService = createVenuesService(supabase);
  const courtsService = createCourtsService(supabase);

  const [activeTab, setActiveTab] = useState<DayOfWeek>('mon');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetDays, setCopyTargetDays] = useState<DayOfWeek[]>([]);

  const { data: venue, isLoading: isVenueLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => venuesService.getVenue(id as string)
  });

  const { data: courts, isLoading: isCourtsLoading } = useQuery({
    queryKey: ['courts', id],
    queryFn: () => courtsService.getCourts(id as string)
  });

  const { data: schedule, isLoading: isScheduleLoading } = useQuery({
    queryKey: ['schedule', id, activeTab],
    queryFn: () => scheduleService.getOperatingSchedule(id as string, activeTab)
  });

  const upsertScheduleMutation = useMutation({
    mutationFn: async (updates: { is_closed?: boolean; is_24h?: boolean }) => {
      await scheduleService.upsertOperatingSchedule({
        id: schedule?.id,
        venue_id: id as string,
        day_of_week: activeTab,
        ...updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', id, activeTab] });
    }
  });

  const copyScheduleMutation = useMutation({
    mutationFn: async () => {
      await scheduleService.copyScheduleAndPricingToDays(id as string, activeTab, copyTargetDays);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', id] });
      setShowCopyModal(false);
      setCopyTargetDays([]);
      alert('Schedule copied successfully!');
    },
    onError: (err: any) => {
      alert(`Error copying schedule: ${err.message}`);
    }
  });

  if (isVenueLoading || isCourtsLoading) {
    return <div className="p-8 text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading configuration...</div>;
  }

  if (!venue) {
    return <div className="p-8 text-red-500">Venue not found.</div>;
  }

  const handleCopyTargetToggle = (day: DayOfWeek) => {
    if (day === activeTab) return;
    setCopyTargetDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link to={`/venues/${id}`} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <PageHeader 
          title="Schedule & Pricing" 
          description={`Configure operating hours and pricing blocks for ${venue.name}`}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left column: Tabs */}
        <Card className="w-full lg:w-64 shrink-0 h-fit">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Days of Week</h3>
          </CardHeader>
          <div className="flex lg:flex-col overflow-x-auto p-2">
            {DAYS.map(day => (
              <button
                key={day.id}
                onClick={() => setActiveTab(day.id)}
                className={`text-left px-4 py-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === day.id 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Right column: Config */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock size={18} className="text-slate-400" />
                {DAYS.find(d => d.id === activeTab)?.label} Configuration
              </h3>
              
              <button
                onClick={() => setShowCopyModal(true)}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <Copy size={16} />
                Copy to other days
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              {isScheduleLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
              ) : (
                <div className="space-y-6">
                  {/* Toggles */}
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={schedule?.is_closed || false}
                          onChange={(e) => upsertScheduleMutation.mutate({ is_closed: e.target.checked })}
                          disabled={upsertScheduleMutation.isPending}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${schedule?.is_closed ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${schedule?.is_closed ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Closed for the day</span>
                    </label>

                    {!schedule?.is_closed && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={schedule?.is_24h || false}
                            onChange={(e) => upsertScheduleMutation.mutate({ is_24h: e.target.checked })}
                            disabled={upsertScheduleMutation.isPending}
                          />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${schedule?.is_24h ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${schedule?.is_24h ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Open 24 Hours</span>
                      </label>
                    )}
                  </div>

                  {schedule?.is_closed ? (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800/30">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Venue is marked as closed</h3>
                          <div className="mt-2 text-sm text-amber-700 dark:text-amber-400/80">
                            <p>No bookings can be made for this day. Pricing blocks below will be ignored.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <PricingBlockEditor 
                      scheduleId={schedule?.id} 
                      venueId={venue.id} 
                      courts={courts || []} 
                      initialBlocks={schedule?.pricing_blocks || []} 
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Copy {DAYS.find(d => d.id === activeTab)?.label} Configuration
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Select the days you want to copy this schedule and pricing to. This will overwrite any existing configuration for those days.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DAYS.map(day => (
                  <label 
                    key={day.id} 
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      day.id === activeTab 
                        ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700' 
                        : copyTargetDays.includes(day.id)
                          ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      checked={copyTargetDays.includes(day.id) || day.id === activeTab}
                      disabled={day.id === activeTab}
                      onChange={() => handleCopyTargetToggle(day.id)}
                    />
                    <span className={`text-sm font-medium ${day.id === activeTab ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyTargetDays([]);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => copyScheduleMutation.mutate()}
                disabled={copyTargetDays.length === 0 || copyScheduleMutation.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copyScheduleMutation.isPending ? 'Copying...' : 'Apply Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
