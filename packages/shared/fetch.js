const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zrokzmkhrznmtgfdibig.supabase.co';
const supabaseAnonKey = 'sb_publishable_AkZgpHCxy0h9Dcmp5GWM_g_Op2QAUSQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('membership_payments').select('id, amount, status, is_voided, billing_period, slot_id, member_id').limit(10);
  console.log(data, error);
}
run();
