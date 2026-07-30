const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/owner/.env' });
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function test() {
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
      .in('status', ['due', 'overdue'])
      .eq('is_voided', false)
      .order('due_date', { ascending: false });
  console.log(JSON.stringify(error || data, null, 2));
}
test();
