import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { createScheduleService } from '@vms/shared/services';
import type { Court, PricingBlock } from '@vms/shared/types';
import { Plus, Trash2, IndianRupee, Layers } from 'lucide-react';
import { Input } from '../ui/Input';
import { ScrollTimePicker } from '../ui/ScrollTimePicker';

interface PricingBlockEditorProps {
  scheduleId?: string;
  venueId: string;
  courts: Court[];
  initialBlocks: PricingBlock[];
}

export function PricingBlockEditor({ scheduleId, venueId, courts, initialBlocks }: PricingBlockEditorProps) {
  const queryClient = useQueryClient();
  const scheduleService = createScheduleService(supabase);
  const [blocks, setBlocks] = useState<PricingBlock[]>(initialBlocks || []);
  const [addingNew, setAddingNew] = useState(false);
  
  // New Block State
  const [newStartTime, setNewStartTime] = useState('06:00');
  const [newEndTime, setNewEndTime] = useState('22:00');
  const [newPrice, setNewPrice] = useState('500'); // Rupees
  const [newCourtIds, setNewCourtIds] = useState<string[]>([]); // Empty = All Courts

  const upsertMutation = useMutation({
    mutationFn: async (block: Partial<PricingBlock>) => {
      if (!scheduleId) {
        // Edge case: if schedule doesn't exist yet, it's handled upstream (but just in case)
        throw new Error("Schedule must be created first before adding pricing blocks.");
      }
      return await scheduleService.upsertPricingBlock({
        ...block,
        schedule_id: scheduleId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', venueId] });
      setAddingNew(false);
      resetNewForm();
    },
    onError: (err: any) => {
      alert(`Error saving pricing block: ${err.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (blockId: string) => {
      await scheduleService.deletePricingBlock(blockId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', venueId] });
    },
    onError: (err: any) => {
      alert(`Error deleting pricing block: ${err.message}`);
    }
  });

  const resetNewForm = () => {
    setNewStartTime('06:00');
    setNewEndTime('22:00');
    setNewPrice('500');
    setNewCourtIds([]);
  };

  const handleAddBlock = () => {
    if (!newStartTime || !newEndTime || !newPrice) return;
    
    // Validate time
    const endForValidation = newEndTime === "00:00" && newStartTime > "00:00" ? "24:00" : newEndTime;
    if (endForValidation <= newStartTime) {
      alert("End time must be after start time");
      return;
    }

    const priceInPaise = parseInt(newPrice) * 100;
    
    upsertMutation.mutate({
      start_time: `${newStartTime}:00`, // PostgreSQL TIME format
      end_time: `${newEndTime}:00`,
      price_per_hour: priceInPaise,
      court_ids: newCourtIds,
      is_active: true
    });
  };

  const handleCourtToggle = (courtId: string) => {
    setNewCourtIds(prev => 
      prev.includes(courtId) 
        ? prev.filter(id => id !== courtId)
        : [...prev, courtId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pricing Blocks</h4>
        <button
          onClick={() => setAddingNew(!addingNew)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          {addingNew ? 'Cancel' : <><Plus size={16} /> Add Block</>}
        </button>
      </div>

      {/* Add New Form */}
      {addingNew && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
              <ScrollTimePicker 
                value={newStartTime}
                onChange={(val) => setNewStartTime(val)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
              <ScrollTimePicker 
                value={newEndTime}
                onChange={(val) => setNewEndTime(val)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Price per Hour (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee size={14} className="text-slate-400" />
                </div>
                <Input 
                  type="number" 
                  min="0"
                  className="pl-8"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Apply to Courts</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setNewCourtIds([])}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  newCourtIds.length === 0 
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' 
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                All Courts
              </button>
              {courts.map(court => (
                <button
                  key={court.id}
                  type="button"
                  onClick={() => handleCourtToggle(court.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    newCourtIds.includes(court.id)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {court.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleAddBlock}
              disabled={upsertMutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {upsertMutation.isPending ? 'Saving...' : 'Save Block'}
            </button>
          </div>
        </div>
      )}

      {/* List Existing Blocks */}
      {!initialBlocks || initialBlocks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <Layers className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No pricing blocks configured for this day.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialBlocks.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((block) => {
            const isAllCourts = !block.court_ids || block.court_ids.length === 0;
            const priceInRupees = block.price_per_hour / 100;
            
            // Format time for display (remove seconds)
            const startTime = block.start_time.slice(0, 5);
            const endTime = block.end_time.slice(0, 5);

            return (
              <div key={block.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Time</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {startTime} - {endTime}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Price</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      ₹{priceInRupees}/hr
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Courts</span>
                    <div className="flex gap-1 mt-0.5">
                      {isAllCourts ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          All Courts
                        </span>
                      ) : (
                        block.court_ids!.map(cid => {
                          const c = courts.find(c => c.id === cid);
                          return (
                            <span key={cid} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                              {c ? c.name : 'Unknown Court'}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if(window.confirm('Delete this pricing block?')) {
                        deleteMutation.mutate(block.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete Block"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
