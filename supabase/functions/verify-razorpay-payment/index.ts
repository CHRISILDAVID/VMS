// supabase/functions/verify-razorpay-payment/index.ts
// Verifies the Razorpay payment signature after checkout completes.
// The client sends order_id, payment_id, and signature from Razorpay SDK.
// This function verifies the HMAC-SHA256 to prevent spoofed payment confirmations.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';
import { encode as hexEncode } from 'https://deno.land/std@0.177.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Missing required payment fields.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return new Response(
        JSON.stringify({ verified: false, error: 'Payment gateway not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compute HMAC-SHA256: body = "order_id|payment_id"
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computedSignature = new TextDecoder().decode(
      hexEncode(new Uint8Array(signatureBuffer))
    );

    const isValid = computedSignature === razorpay_signature;

    if (!isValid) {
      console.warn('Razorpay signature mismatch', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
    }

    return new Response(
      JSON.stringify({ verified: isValid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('verify-razorpay-payment error:', err);
    return new Response(
      JSON.stringify({ verified: false, error: 'Internal server error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
