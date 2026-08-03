import type { SupabaseClient } from '@supabase/supabase-js'
import type { Customer } from '../types'

export const createCustomersService = (supabase: SupabaseClient) => ({
  async getCustomers(ownerId: string, search?: string): Promise<Customer[]> {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .order('full_name')

    if (search && search.trim() !== '') {
      const term = search.trim();
      query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`);
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getCustomerById(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createOrGetCustomer(
    ownerId: string, 
    data: { full_name: string; phone: string; email?: string | null; notes?: string | null }
  ): Promise<Customer> {
    const cleanPhone = data.phone.trim();
    
    // Check if customer already exists by phone
    const { data: existing, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('phone', cleanPhone)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return existing;
    }

    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        owner_id: ownerId,
        full_name: data.full_name.trim(),
        phone: cleanPhone,
        email: data.email?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return created
  },

  async updateCustomerStats(customerId: string, visitIncrement: number, spendIncrement: number): Promise<void> {
    const { data: cust, error: fetchError } = await supabase
      .from('customers')
      .select('total_visits, total_spent')
      .eq('id', customerId)
      .single()

    if (fetchError || !cust) return;

    await supabase
      .from('customers')
      .update({
        total_visits: (cust.total_visits || 0) + visitIncrement,
        total_spent: (cust.total_spent || 0) + spendIncrement,
      })
      .eq('id', customerId);
  }
})
