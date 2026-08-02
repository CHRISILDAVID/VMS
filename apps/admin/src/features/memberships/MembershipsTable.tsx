import React, { useState } from 'react';
import { Search, Loader2, Calendar, Clock, MapPin, Download, X } from 'lucide-react';
import StatusChip from '../../components/StatusChip';
import { useAdminMemberships } from './hooks/useAdminMemberships';

export default function MembershipsTable() {
  const [search, setSearch] = useState('');
  
  const { data: slots, isLoading } = useAdminMemberships(search);

  const exportToCSV = () => {
    if (!slots || slots.length === 0) return;
    
    const headers = ['Slot Name', 'Venue Name', 'Owner Name', 'Days', 'Time', 'Monthly Fee', 'Capacity', 'Active Members', 'Status'];
    const rows = slots.map((s: any) => {
      const feeRs = (s.monthly_fee || 0) / 100;
      const status = !s.is_published ? 'draft' : (!s.is_recruiting ? 'closed' : (s.active_members_count >= s.capacity ? 'full' : 'recruiting'));
      
      return [
        s.name,
        s.venue?.name || 'Unknown Venue',
        s.venue?.owner?.full_name || 'No Owner',
        (s.playing_days || []).join(' | '),
        `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`,
        feeRs,
        s.capacity,
        s.active_members_count,
        status
      ].map(val => `"${val}"`).join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `memberships_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by slot name or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              onClick={exportToCSV}
              disabled={!slots || slots.length === 0}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : !slots || slots.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto my-8">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Memberships Found</h3>
            <p className="text-sm text-slate-500">
              No membership slots match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Slot Name</th>
                  <th className="py-3.5 px-4">Venue & Owner</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4">Fee / Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm font-medium text-slate-800 dark:text-white">
                {slots.map((s: any) => {
                  const feeRs = (s.monthly_fee || 0) / 100;
                  const isFull = s.active_members_count >= s.capacity;
                  const status = !s.is_published ? 'draft' : (!s.is_recruiting ? 'closed' : (isFull ? 'full' : 'recruiting'));

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          {s.venue?.name || 'Unknown Venue'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 ml-5">
                          {s.venue?.owner?.full_name || 'No Owner'}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="capitalize">{(s.playing_days || []).map((d: string) => d.slice(0,3)).join(', ')}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" />
                          <span>{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">₹{feeRs.toLocaleString()}/mo</div>
                        <div className="text-xs mt-0.5 font-semibold">
                          <span className={isFull ? 'text-red-600' : 'text-emerald-600'}>
                            {s.active_members_count} / {s.capacity} Members
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusChip status={status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
