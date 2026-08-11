const SUPABASE_URL = "https://zrokzmkhrznmtgfdibig.supabase.co";
const ANON_KEY = "af9530dc9118c7323a448d9fecccf28d4ea2f3ae73c4cb0b45e3032bd8f324d7";

async function run() {
  console.log("Invoking create-razorpay-order...");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-razorpay-order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount: 10000, currency: "INR", receipt: "test_1" })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
