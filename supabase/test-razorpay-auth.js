const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://zrokzmkhrznmtgfdibig.supabase.co";
const ANON_KEY = "sb_publishable_AkZgpHCxy0h9Dcmp5GWM_g_Op2QAUSQ";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function run() {
  console.log("Logging in...");
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'admin@badmintonmanager.com',
    password: 'badmintonmanager2026'
  });
  
  if (error) {
    console.error("Login failed:", error.message);
    return;
  }
  
  console.log("Got JWT, invoking create-razorpay-order...");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-razorpay-order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount: 10000, currency: "INR", receipt: "test_1" })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
