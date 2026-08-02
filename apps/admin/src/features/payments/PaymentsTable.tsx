import React, { useState } from 'react';
import { Search, Loader2, Download, X, Wallet, TrendingUp, AlertCircle, IndianRupee } from 'lucide-react';
import StatusChip from '../../components/StatusChip';
import { useAdminPayments } from './hooks/useAdminPayments';

const TABS = ['All', 'Pending', 'Paid', 'Membership', 'Booking'];

export default function PaymentsTable() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  
  const { data, isLoading } = useAdminPayments(search, tab);
  const payments = data?.payments || [];
  const kpis = data?.kpis || { collectedThisMonth: 0, dueThisMonth: 0, overdueTotal: 0 };

  const exportToCSV = () => {
    if (!payments || payments.length === 0) return;
    
    const headers = ['Type', 'Reference', 'Date', 'Customer Name', 'Customer Phone', 'Venue Name', 'Owner Name', 'Total Amount', 'Paid Amount', 'Pending Amount', 'Status'];
    const rows = payments.map((p: any) => {
      return [
        p.type,
        p.reference,
        p.date,
        p.customer_name,
        p.customer_phone,
        p.venue_name,
        p.owner_name,
        p.amount,
        p.paid,
        p.pending,
        p.status
      ].map(val => `"${val}"`).join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pb-0">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected (This Month)</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">₹{kpis.collectedThisMonth.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Wallet size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending (This Month)</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">₹{kpis.dueThisMonth.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Overdue</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">₹{kpis.overdueTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="p-6 pb-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl gap-1 w-fit border border-slate-200 dark:border-slate-800 shadow-sm">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-all shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              onClick={exportToCSV}
              disabled={!payments || payments.length === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto my-8">
            <IndianRupee size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Payments Found</h3>
            <p className="text-sm text-slate-500">
              No payment records match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date / Type</th>
                  <th className="py-3.5 px-4">Venue & Owner</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Financials</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm font-medium text-slate-800 dark:text-slate-200">
                {payments.map((p: any) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{p.date}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {p.type}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{p.venue_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {p.owner_name}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{p.customer_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          +91 {p.customer_phone}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {p.reference}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">₹{p.amount.toLocaleString()}</div>
                        {p.pending > 0 && (
                          <div className="text-xs text-red-600 font-bold mt-0.5">
                            ₹{p.pending.toLocaleString()} Pending
                          </div>
                        )}
                        {p.pending === 0 && (
                          <div className="text-xs text-emerald-600 font-bold mt-0.5">
                            Fully Paid
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusChip status={p.status} size="sm" />
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
