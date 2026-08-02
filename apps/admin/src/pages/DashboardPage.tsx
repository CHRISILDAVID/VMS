import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { Users, MapPin, Ticket, CreditCard, LayoutDashboard, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVenues: 0,
    activeVenues: 0,
    totalOwners: 0,
    totalCourts: 0,
    unassignedVenues: 0,
    totalBookings: 0,
    activeMembers: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        const [
          { count: totalVenues },
          { count: activeVenues },
          { count: totalOwners },
          { count: totalCourts },
          { count: unassignedVenues },
          { count: activeMembers },
          { data: recentBookingsData },
        ] = await Promise.all([
          supabase.from('venues').select('*', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('venues').select('*', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
          supabase.from('owners').select('*', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('courts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('venues').select('*', { count: 'exact', head: true }).is('owner_id', null).is('deleted_at', null),
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
          supabase.from('bookings').select('id, date, start_time, end_time, payment_status, final_amount, venues(name), customers(full_name, phone)').order('created_at', { ascending: false }).limit(10),
        ]);

        // Revenue & Total Bookings (This Month) would typically need a custom RPC for sum, 
        // but for now we'll just mock revenue or do a basic query if small enough.
        // Doing a quick fetch of this month's paid bookings to calculate revenue:
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthBookings } = await supabase
          .from('bookings')
          .select('final_amount')
          .eq('payment_status', 'paid')
          .gte('date', startOfMonth.toISOString().split('T')[0]);

        const totalRevenue = (monthBookings || []).reduce((acc, b) => acc + (b.final_amount || 0), 0);
        
        setStats({
          totalVenues: totalVenues || 0,
          activeVenues: activeVenues || 0,
          totalOwners: totalOwners || 0,
          totalCourts: totalCourts || 0,
          unassignedVenues: unassignedVenues || 0,
          totalBookings: monthBookings?.length || 0,
          activeMembers: activeMembers || 0,
          totalRevenue: totalRevenue,
        });

        setRecentBookings(recentBookingsData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Empty State
  if (stats.totalVenues === 0 && stats.totalOwners === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <LayoutDashboard size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Welcome to Venue OS</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Your platform is currently empty. To get started, you should create your first venue owner, and then set up a venue for them to manage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link to="/owners" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Plus size={18} />
            Create First Owner
          </Link>
          <Link to="/venues" className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
            View Venues
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description="Overview of platform health and key metrics across all venues."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Venues" value={stats.totalVenues.toString()} icon={MapPin} color="bg-blue-500" link="/venues" />
        <MetricCard title="Active Venues" value={stats.activeVenues.toString()} icon={MapPin} color="bg-blue-400" link="/venues" />
        <MetricCard title="Unassigned Venues" value={stats.unassignedVenues.toString()} icon={MapPin} color="bg-orange-500" link="/venues" />
        <MetricCard title="Total Owners" value={stats.totalOwners.toString()} icon={Users} color="bg-indigo-500" link="/owners" />
        <MetricCard title="Total Courts" value={stats.totalCourts.toString()} icon={LayoutDashboard} color="bg-purple-500" />
        <MetricCard title="Active Members" value={stats.activeMembers.toString()} icon={Ticket} color="bg-emerald-500" link="/memberships" />
        <MetricCard title="Total Bookings (Mo)" value={stats.totalBookings.toString()} icon={Ticket} color="bg-cyan-500" link="/bookings" />
        <MetricCard title="Revenue (Mo)" value={`₹${(stats.totalRevenue / 100).toLocaleString()}`} icon={CreditCard} color="bg-amber-500" link="/payments" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <Link to="/bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">View all bookings &rarr;</Link>
        </div>
        
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Venue</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No recent bookings found.</td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 dark:text-white">{booking.venues?.name || 'Unknown Venue'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 dark:text-slate-300">{booking.customers?.full_name || booking.customers?.phone}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {format(new Date(booking.date), 'MMM d, yyyy')} • {booking.start_time.slice(0, 5)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        ₹{(booking.final_amount / 100).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                          booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                          booking.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {booking.payment_status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, link }: { title: string, value: string, icon: any, color: string, link?: string }) {
  const content = (
    <Card className="hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-700/50">
      <CardContent className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-sm`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}
