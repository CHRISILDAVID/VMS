import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0"

// Add Deno-specific typings if needed, but for scaffold we use any
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    // Create a Supabase client with the service role key to bypass RLS for background jobs
    const supabase = createClient(supabaseUrl, supabaseKey)

    const today = new Date()
    const currentDay = today.getDate()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

    // 1. Fetch slots that need billing today (or all active slots depending on business logic)
    // For MVP, let's assume we bill on the 1st of every month for all slots, or on slot.billing_day.
    const { data: slots, error: slotsError } = await supabase
      .from('membership_slots')
      .select('id, monthly_fee, billing_day')
      .is('deleted_at', null)

    if (slotsError) throw slotsError

    let createdCount = 0

    // 2. Iterate through slots
    for (const slot of slots || []) {
      // 3. Fetch active members for this slot
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id')
        .eq('slot_id', slot.id)
        .eq('is_active', true)
        .is('deleted_at', null)

      if (membersError) continue

      // 4. Generate payments for each active member
      for (const member of members || []) {
        // Check if payment already exists for this billing period
        const { data: existingPayment } = await supabase
          .from('membership_payments')
          .select('id')
          .eq('member_id', member.id)
          .eq('billing_period', firstDayOfMonth)
          .single()

        if (!existingPayment) {
          // Calculate due date (e.g., 7 days after billing period start)
          const dueDate = new Date(firstDayOfMonth)
          dueDate.setDate(dueDate.getDate() + 7)
          
          const { error: insertError } = await supabase
            .from('membership_payments')
            .insert({
              member_id: member.id,
              slot_id: slot.id,
              amount: slot.monthly_fee,
              billing_period: firstDayOfMonth,
              due_date: dueDate.toISOString().split('T')[0],
              status: 'due'
            })
            
          if (!insertError) {
            createdCount++
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ message: `Successfully generated ${createdCount} payments.` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
