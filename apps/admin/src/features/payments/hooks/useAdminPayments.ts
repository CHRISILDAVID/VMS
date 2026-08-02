import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useAdminPayments(search?: string, tab?: string) {
  return useQuery({
    queryKey: ['admin-payments', search, tab],
    queryFn: async () => {
      // 1. Fetch Bookings Payments (from bookings table where amount > 0)
      const { data: bookingsData, error: bError } = await supabase
        .from('bookings')
        .select(`
          id, booking_number, booking_date:date, final_amount, advance, status, payment_status, 
          customer:customers(full_name, phone),
          court:courts(name, venue:venues(name, owner:owners(full_name)))
        `)
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .limit(1000);

      if (bError) throw bError;

      // 2. Fetch Membership Payments
      const { data: memData, error: mError } = await supabase
        .from('membership_payments')
        .select(`
          id, amount, billing_period, due_date, status, payment_mode, paid_on,
          member:members(customer:customers(full_name, phone)),
          slot:membership_slots(name, venue:venues(name, owner:owners(full_name)))
        `)
        .order('billing_period', { ascending: false })
        .limit(1000);

      if (mError) throw mError;

      // Transform and combine
      const combined = [];

      // Add Booking Payments
      for (const rawB of bookingsData || []) {
        const b = rawB as any;
        // Exclude cancelled bookings that are unpaid, or 0 amount
        const total = (b.final_amount || 0) / 100;
        if (total === 0) continue;
        const advance = (b.advance || 0) / 100;
        const pending = Math.max(0, total - advance);

        combined.push({
          id: b.id,
          type: 'Booking',
          reference: b.booking_number,
          date: b.booking_date,
          customer_name: b.customer?.full_name || 'Guest',
          customer_phone: b.customer?.phone || 'N/A',
          venue_name: b.court?.venue?.name || 'Unknown',
          owner_name: b.court?.venue?.owner?.full_name || 'No Owner',
          amount: total,
          paid: advance,
          pending: pending,
          status: b.status === 'cancelled' ? 'cancelled' : (pending <= 0 ? 'paid' : (advance > 0 ? 'partial' : 'due')),
          raw: b
        });
      }

      // Add Membership Payments
      for (const rawM of memData || []) {
        const m = rawM as any;
        const amount = (m.amount || 0) / 100;
        combined.push({
          id: m.id,
          type: 'Membership',
          reference: m.slot?.name || 'Membership',
          date: m.billing_period,
          customer_name: m.member?.customer?.full_name || 'Unknown',
          customer_phone: m.member?.customer?.phone || 'N/A',
          venue_name: m.slot?.venue?.name || 'Unknown',
          owner_name: m.slot?.venue?.owner?.full_name || 'No Owner',
          amount: amount,
          paid: m.status === 'paid' ? amount : 0,
          pending: m.status === 'paid' ? 0 : amount,
          status: m.is_voided ? 'voided' : (m.status === 'paid' ? 'paid' : (new Date(m.due_date) < new Date() ? 'overdue' : 'due')),
          raw: m
        });
      }

      // Sort combined by date desc
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate KPIs for "This Month"
      const now = new Date();
      const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
      
      let collectedThisMonth = 0;
      let dueThisMonth = 0;
      let overdueTotal = 0;

      for (const item of combined) {
        const itemMonth = item.date.slice(0, 7);
        
        if (itemMonth === currentMonthStr) {
          collectedThisMonth += item.paid;
          if (item.status === 'due' || item.status === 'partial') {
            dueThisMonth += item.pending;
          }
        }
        
        if (item.status === 'overdue') {
          overdueTotal += item.pending;
        }
      }

      let filtered = combined;
      
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(item => 
          item.customer_name.toLowerCase().includes(q) ||
          item.reference.toLowerCase().includes(q) ||
          item.venue_name.toLowerCase().includes(q)
        );
      }

      if (tab === 'Pending') {
        filtered = filtered.filter(item => item.pending > 0 && item.status !== 'cancelled' && item.status !== 'voided');
      } else if (tab === 'Paid') {
        filtered = filtered.filter(item => item.pending <= 0 && item.status !== 'cancelled' && item.status !== 'voided');
      } else if (tab === 'Membership') {
        filtered = filtered.filter(item => item.type === 'Membership');
      } else if (tab === 'Booking') {
        filtered = filtered.filter(item => item.type === 'Booking');
      }

      return {
        payments: filtered,
        kpis: {
          collectedThisMonth,
          dueThisMonth,
          overdueTotal
        }
      };
    },
    enabled: true,
  });
}
