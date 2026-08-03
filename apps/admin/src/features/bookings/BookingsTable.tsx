import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, Phone, MessageCircle, Eye,
  CheckCircle2, XCircle, Clock, MapPin, IndianRupee, Calendar, X,
  AlertTriangle, Loader2, Download
} from 'lucide-react';
import StatusChip from '../../components/StatusChip';
import { useAdminBookings, useAdminCourts, useCancelBooking, useMarkPaid } from './hooks/useAdminBookings';
import { formatPhone } from '@vms/shared/utils';

const TAB_FILTERS = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

interface BookingsTableProps {
  venueId?: string;
}

export default function BookingsTable({ venueId }: BookingsTableProps) {
  const isGlobalView = !venueId;
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [courtFilter, setCourtFilter] = useState('All Courts');
  
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<any | null>(null);
  const [showPaidModal, setShowPaidModal] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'upi' | 'cash' | 'card' | 'bank_transfer'>('upi');

  const { data: courts } = useAdminCourts(venueId);
  const { data: bookings, isLoading, refetch } = useAdminBookings(venueId, {
    status: tab,
    search,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    courtId: courtFilter === 'All Courts' ? undefined : courtFilter,
  });

  const cancelMutation = useCancelBooking();
  const payMutation = useMarkPaid();

  const handleCancelSubmit = async () => {
    if (!showCancelModal) return;
    try {
      await cancelMutation.mutateAsync({
        bookingId: showCancelModal.id,
        reason: cancelReason || 'Cancelled by admin',
      });
      setShowCancelModal(null);
      setCancelReason('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handlePaySubmit = async () => {
    if (!showPaidModal) return;
    const amountRs = parseFloat(payAmount);
    if (isNaN(amountRs) || amountRs <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await payMutation.mutateAsync({
        bookingId: showPaidModal.id,
        amount: Math.round(amountRs * 100), // paise
        mode: payMode,
      });
      setShowPaidModal(null);
      setPayAmount('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const exportToCSV = () => {
    if (!bookings || bookings.length === 0) return;
    
    const headers = ['Booking Number', 'Date', 'Customer Name', 'Customer Phone', 'Venue', 'Court', 'Start Time', 'End Time', 'Total Amount', 'Advance Paid', 'Pending Balance', 'Status', 'Payment Status'];
    const rows = bookings.map((b: any) => {
      const totalRs = (b.final_amount || 0) / 100;
      const advanceRs = (b.advance || 0) / 100;
      const pendingRs = Math.max(0, totalRs - advanceRs);
      
      return [
        b.booking_number,
        b.date,
        b.customer?.full_name || 'Guest User',
        b.customer?.phone || 'N/A',
        b.court?.venue?.name || 'N/A',
        b.court?.name || 'N/A',
        b.start_time?.slice(0, 5),
        b.end_time?.slice(0, 5),
        totalRs,
        advanceRs,
        pendingRs,
        b.status,
        b.payment_status
      ].map(val => `"${val}"`).join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
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
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Court Bookings</h1>
            <p className="text-sm text-slate-500">Manage, monitor, and update reservations</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, name or phone..."
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

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-2">
              <span className="text-xs font-semibold text-slate-500 ml-2">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-2 bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 dark:[color-scheme:dark] focus:outline-none transition-all cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-500 border-l border-slate-200 pl-2">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-2 bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 dark:[color-scheme:dark] focus:outline-none transition-all cursor-pointer"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            
            <button
              onClick={exportToCSV}
              disabled={!bookings || bookings.length === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Status Tabs and Court Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 w-fit">
            {TAB_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {!isGlobalView && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setCourtFilter('All Courts')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  courtFilter === 'All Courts'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Courts
              </button>
              {courts?.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setCourtFilter(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    courtFilter === c.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto my-8">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Bookings Found</h3>
            <p className="text-sm text-slate-500">
              No bookings match your current filter criteria. Try adjusting the tabs or search terms.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking # / Date</th>
                  {isGlobalView && <th className="py-3.5 px-4">Venue & Owner</th>}
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Court & Time</th>
                  <th className="py-3.5 px-4">Financials</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm font-medium text-slate-800 dark:text-slate-200">
                {bookings.map((b: any) => {
                  const totalRs = (b.final_amount || 0) / 100;
                  const advanceRs = (b.advance || 0) / 100;
                  const pendingRs = Math.max(0, totalRs - advanceRs);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{b.booking_number}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {b.date}
                        </div>
                      </td>

                      {isGlobalView && (
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {b.court?.venue?.name || 'Unknown Venue'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            {b.court?.venue?.owner?.full_name || 'No Owner'}
                          </div>
                        </td>
                      )}

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {b.customer?.full_name || 'Guest User'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Phone size={12} />
                          <span>{b.customer?.phone ? formatPhone(b.customer.phone) : 'N/A'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {b.court?.name || 'Court'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Clock size={12} />
                          <span>{b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</span>
                          <span className="text-slate-400">({b.duration_minutes / 60}h)</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">₹{totalRs}</div>
                        <div className="text-xs mt-0.5 font-semibold">
                          {pendingRs > 0 ? (
                            <span className="text-red-600">Pending: ₹{pendingRs}</span>
                          ) : (
                            <span className="text-emerald-600">Fully Paid</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <StatusChip status={b.status} size="sm" />
                          <StatusChip status={b.payment_status} size="sm" />
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            title="View Details"
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>

                          {!isGlobalView && pendingRs > 0 && b.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setShowPaidModal(b);
                                setPayAmount(pendingRs.toString());
                              }}
                              title="Record Payment"
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 size={14} />
                              <span>Pay</span>
                            </button>
                          )}

                          {!isGlobalView && b.status === 'confirmed' && (
                            <button
                              onClick={() => setShowCancelModal(b)}
                              title="Cancel Booking"
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedBooking.booking_number}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedBooking.date}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="py-6 space-y-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Info</div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Name:</span>
                  <span className="text-slate-900 dark:text-white">{selectedBooking.customer?.full_name || 'Guest'}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-900 dark:text-white">{selectedBooking.customer?.phone ? formatPhone(selectedBooking.customer.phone) : 'N/A'}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Slot & Court</div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Court:</span>
                  <span className="text-slate-900 dark:text-white">{selectedBooking.court?.name}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Time:</span>
                  <span className="text-slate-900 dark:text-white">{selectedBooking.start_time?.slice(0, 5)} – {selectedBooking.end_time?.slice(0, 5)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Duration:</span>
                  <span className="text-slate-900 dark:text-white">{selectedBooking.duration_minutes / 60} hour(s)</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Financials</div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="text-slate-900 dark:text-white">₹{(selectedBooking.final_amount || 0) / 100}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Advance Paid:</span>
                  <span className="text-slate-900 dark:text-white">₹{(selectedBooking.advance || 0) / 100}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500">Pending Balance:</span>
                  <span className={`font-bold ${((selectedBooking.final_amount || 0) - (selectedBooking.advance || 0)) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{Math.max(0, ((selectedBooking.final_amount || 0) - (selectedBooking.advance || 0)) / 100)}
                  </span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-400 font-medium">
                  <strong>Notes:</strong> {selectedBooking.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Record Payment</h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Booking #{showPaidModal.booking_number} — {showPaidModal.customer?.full_name || 'Guest'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Payment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['upi', 'cash', 'card', 'bank_transfer'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMode(m)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        payMode === m
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaidModal(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={payMutation.isPending}
                  onClick={handlePaySubmit}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {payMutation.isPending ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Booking</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Are you sure you want to cancel booking <strong>#{showCancelModal.booking_number}</strong>? This slot will become available for other customers immediately.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Cancellation Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Customer requested cancellation"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={handleCancelSubmit}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
