import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Calendar, Users, LogOut, Shield, ChevronDown, Loader2 } from 'lucide-react';
import { useAdminAuth } from './features/auth/useAdminAuth';
import LoginScreen from './features/auth/LoginScreen';
import BookingsTable from './features/bookings/BookingsTable';
import CustomersTable from './features/customers/CustomersTable';
import { useAdminVenues } from './features/bookings/hooks/useAdminBookings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AdminDashboard() {
  const { session, user, isLoading: authLoading, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'customers'>('bookings');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');

  const { data: venues, isLoading: venuesLoading } = useAdminVenues();

  // Auto-select first venue if available
  useEffect(() => {
    if (venues && venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  if (authLoading || venuesLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  const selectedVenue = venues?.find((v: any) => v.id === selectedVenueId);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-md shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-lg shadow-blue-600/30 font-bold">
              🏸
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight leading-tight">Venue OS</div>
              <div className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Admin Portal</div>
            </div>
          </div>

          {/* Venue Dropdown */}
          <div className="relative">
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-white outline-none appearance-none cursor-pointer transition-colors shadow-inner"
            >
              {venues?.map((v: any) => (
                <option key={v.id} value={v.id}>
                  📍 {v.name} ({v.city})
                </option>
              ))}
              {!venues || venues.length === 0 && (
                <option value="">No Venues Found</option>
              )}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Navigation Tabs */}
          <nav className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Bookings</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Customers</span>
            </button>
          </nav>
        </div>

        {/* User Status / Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 font-semibold">
            <Shield size={14} className="text-emerald-400" />
            <span>Admin ({user?.phone || 'Logged In'})</span>
          </div>

          <button
            onClick={signOut}
            title="Sign Out"
            className="p-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 border border-slate-700 hover:border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'bookings' ? (
          <BookingsTable venueId={selectedVenueId} />
        ) : (
          <CustomersTable />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}
