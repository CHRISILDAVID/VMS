import type { SupabaseClient } from '@supabase/supabase-js';
import { PaymentMode } from '../types/database';

export const createPaymentsService = (supabase: SupabaseClient) => ({
  /**
   * Fetch all payments for a specific membership slot.
   */
  async getPaymentsBySlot(slotId: string) {
    const { data, error } = await supabase
      .from('membership_payments')
      .select(`
        *,
        members (
          id,
          customer_id,
          customers (
            full_name,
            phone
          )
        )
      `)
      .eq('slot_id', slotId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('getPaymentsBySlot ERROR:', error);
      throw error;
    }
    console.log(`getPaymentsBySlot RETURNED ${data?.length} rows`);
    return data;
  },

  /**
   * Fetch payment summary (KPIs) for all slots in a venue
   */
  async getVenuePaymentSummary(venueId: string) {
    const { data, error } = await supabase
      .from('membership_payments')
      .select(`
        id,
        amount,
        status,
        slot_id,
        member_id,
        billing_period,
        membership_slots!inner (
          venue_id,
          deleted_at
        )
      `)
      .eq('membership_slots.venue_id', venueId)
      .is('membership_slots.deleted_at', null)
      .eq('is_voided', false);

    if (error) throw error;
    
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalCollected = 0;
    let pendingAmount = 0;
    
    const paidMembers = new Set<string>();
    const dueMembers = new Set<string>();
    const overdueMembers = new Set<string>();
    const totalMembers = new Set<string>();

    const slotAggregates: Record<string, {
      expectedAmount: number;
      collectedAmount: number;
      pendingAmount: number;
      totalMembers: number;
      paidMembers: number;
      pendingMembers: number;
      _paidMembers: Set<string>;
      _pendingMembers: Set<string>;
      _totalMembers: Set<string>;
    }> = {};

    data.forEach(p => {
      if (!slotAggregates[p.slot_id]) {
        slotAggregates[p.slot_id] = {
          expectedAmount: 0,
          collectedAmount: 0,
          pendingAmount: 0,
          totalMembers: 0,
          paidMembers: 0,
          pendingMembers: 0,
          _paidMembers: new Set<string>(),
          _pendingMembers: new Set<string>(),
          _totalMembers: new Set<string>(),
        };
      }

      // billing_period is a DATE (e.g. "2026-07-01"), so we check if it starts with "2026-07"
      const isCurrentPeriod = p.billing_period.startsWith(currentPeriod);
      
      if (p.status === 'paid') {
        if (isCurrentPeriod) {
          totalCollected += p.amount;
          paidMembers.add(p.member_id);
          totalMembers.add(p.member_id);
          
          slotAggregates[p.slot_id].collectedAmount += p.amount;
          slotAggregates[p.slot_id]._paidMembers.add(p.member_id);
          slotAggregates[p.slot_id]._totalMembers.add(p.member_id);
          slotAggregates[p.slot_id].expectedAmount += p.amount;
        }
      } else {
        // Due or Overdue (Pending)
        if (isCurrentPeriod) {
          pendingAmount += p.amount;
          slotAggregates[p.slot_id].pendingAmount += p.amount;
          slotAggregates[p.slot_id]._pendingMembers.add(p.member_id);
          
          if (p.status === 'due') dueMembers.add(p.member_id);
          if (p.status === 'overdue') overdueMembers.add(p.member_id);
          
          totalMembers.add(p.member_id);
          slotAggregates[p.slot_id]._totalMembers.add(p.member_id);
          slotAggregates[p.slot_id].expectedAmount += p.amount;
        }
      }
    });

    // Finalize slot aggregates by counting sets and removing internal sets
    const finalSlotAggregates: Record<string, any> = {};
    for (const [slotId, agg] of Object.entries(slotAggregates)) {
      finalSlotAggregates[slotId] = {
        expectedAmount: agg.expectedAmount,
        collectedAmount: agg.collectedAmount,
        pendingAmount: agg.pendingAmount,
        totalMembers: agg._totalMembers.size,
        paidMembers: agg._paidMembers.size,
        pendingMembers: agg._pendingMembers.size,
      };
    }

    return {
      currentPeriod,
      totalCollected,
      pendingAmount,
      paidMembersCount: paidMembers.size,
      dueMembersCount: dueMembers.size,
      overdueMembersCount: overdueMembers.size,
      totalMembersCount: totalMembers.size,
      slotAggregates: finalSlotAggregates
    };
  },

  /**
   * Get all defaulters (unpaid payments) across all slots for a venue
   */
  async getDefaulters(venueId: string) {
    const { data, error } = await supabase
      .from('membership_payments')
      .select(`
        id,
        amount,
        status,
        slot_id,
        member_id,
        billing_period,
        due_date,
        is_voided,
        membership_slots!inner (
          name,
          venue_id,
          deleted_at
        ),
        members!inner (
          customer:customers!inner (
            full_name,
            phone
          )
        )
      `)
      .eq('membership_slots.venue_id', venueId)
      .in('status', ['due', 'overdue'])
      .eq('is_voided', false)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Mark a payment as voided
   */
  async voidPayment(paymentId: string) {
    const { data, error } = await supabase
      .from('membership_payments')
      .update({ is_voided: true })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark all pending payments as voided for a member
   */
  async voidPaymentsForMember(memberId: string) {
    const { data, error } = await supabase
      .from('membership_payments')
      .update({ is_voided: true })
      .eq('member_id', memberId)
      .in('status', ['due', 'overdue'])
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Mark all pending payments as voided for a slot
   */
  async voidPaymentsForSlot(slotId: string) {
    const { data, error } = await supabase
      .from('membership_payments')
      .update({ is_voided: true })
      .eq('slot_id', slotId)
      .in('status', ['due', 'overdue'])
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Mark a payment as paid.
   */
  async markAsPaid(params: {
    paymentId: string;
    mode: PaymentMode;
    paidOn: string; // YYYY-MM-DD
    notes?: string;
    receiptUrl?: string;
  }) {
    const { data, error } = await supabase
      .from('membership_payments')
      .update({
        status: 'paid',
        payment_mode: params.mode,
        paid_on: params.paidOn,
        notes: params.notes || null,
        receipt_url: params.receiptUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload a PDF receipt to Supabase Storage.
   * Assumes running in React Native (Expo) environment.
   */
  async uploadReceipt(paymentId: string, uri: string) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `receipt-${paymentId}-${Date.now()}.pdf`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
        
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }
});
