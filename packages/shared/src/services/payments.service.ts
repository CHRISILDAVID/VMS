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
    // We need to join through membership_slots to filter by venue
    const { data, error } = await supabase
      .from('membership_payments')
      .select(`
        amount,
        status,
        membership_slots!inner (
          venue_id
        )
      `)
      .eq('membership_slots.venue_id', venueId);

    if (error) throw error;
    
    const totalCollected = data.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = data.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0);
    const dueCount = data.filter(p => p.status === 'due' || p.status === 'overdue').length;

    return {
      totalCollected,
      totalOutstanding,
      dueCount
    };
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
