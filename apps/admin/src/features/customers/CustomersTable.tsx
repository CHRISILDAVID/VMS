import React, { useState } from 'react';
import { Search, Phone, MessageCircle, TrendingUp, Users, Award, X, Loader2 } from 'lucide-react';
import StatusChip from '../../components/StatusChip';
import { useAdminCustomers } from './hooks/useAdminCustomers';
import { formatPhone } from '@vms/shared/utils';

const TABS = ['All', 'Frequent', 'Recent'];

export default function CustomersTable() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const { data: customers, isLoading } = useAdminCustomers(search, tab);

  // Compute summary stats
  const totalCount = customers?.length || 0;
  const totalRevenueRs = (customers?.reduce((sum: number, c: any) => sum + (c.total_spent || 0), 0) || 0) / 100;
  const avgVisits = totalCount > 0 
    ? ((customers?.reduce((sum: number, c: any) => sum + (c.total_visits || 0), 0) || 0) / totalCount).toFixed(1)
    : '0';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      {/* Top Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customers Directory</h1>
            <p className="text-sm text-slate-500">Track player loyalty, visit history, and revenue contributions</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
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
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 w-fit">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pb-0">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Players</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Spend Generated</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">₹{totalRevenueRs.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Visits / Player</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{avgVisits}</div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto my-8">
            <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Customers Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No players match your search or filter criteria. New customers will appear automatically when they make a booking.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Total Visits</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Loyalty Tag</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm font-medium text-slate-800 dark:text-slate-200">
                {customers.map((c: any) => {
                  const spentRs = (c.total_spent || 0) / 100;
                  const tag = (c.total_visits || 0) >= 3 ? 'frequent' : 'recent';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm shadow-inner">
                            {(c.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{c.full_name || 'Unnamed Player'}</div>
                            {c.email && (
                              <div className="text-xs text-slate-400 font-normal">{c.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {c.owner?.full_name || 'No Owner'}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone size={14} className="text-slate-400" />
                          <span>{formatPhone(c.phone || "")}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                          {c.total_visits || 0} visits
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 dark:text-white">₹{spentRs.toLocaleString()}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusChip status={tag} size="sm" />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            title="View Player Profile"
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            View Notes
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Notes Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-lg">
                  {(selectedCustomer.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCustomer.full_name || 'Unnamed Player'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{formatPhone(selectedCustomer.phone || "")}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="py-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">Total Visits</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">{selectedCustomer.total_visits || 0}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">Total Spent</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">₹{((selectedCustomer.total_spent || 0) / 100).toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/60 p-4 rounded-2xl">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-500 uppercase tracking-wider mb-1">Player Notes / Preferences</div>
                <p className="text-xs text-amber-900 dark:text-amber-400 font-medium leading-relaxed">
                  {selectedCustomer.notes || 'No specific preferences or admin notes recorded for this player.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
