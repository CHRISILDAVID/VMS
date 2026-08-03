import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Validate the caller is a super_admin
    // The caller's JWT is passed in the Authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // We can use the anon client to get the user from the JWT to check their role
    const supabaseAnonUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseAnon = createClient(supabaseAnonUrl, supabaseAnonKey)
    
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Check if the user is a super_admin in the owners table
    const { data: adminData, error: adminError } = await supabase
      .from('owners')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || adminData?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Requires super_admin role' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 2. Parse request body
    const { phone, full_name, business_name, email } = await req.json()

    if (!phone || !full_name || !business_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. Create the user in auth.users using the service_role client
    // Note: If phone already exists, supabase will throw an error, but we want to handle existing auth users gracefully
    let authUserId: string | null = null;

    // Check if user with phone already exists first
    const { data: existingAuthUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (!listError && existingAuthUsers?.users) {
      const existingUser = existingAuthUsers.users.find(u => u.phone === phone.replace('+', '')) // auth.users stores phone without +
      if (existingUser) {
        authUserId = existingUser.id;
      }
    }

    if (!authUserId) {
      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        phone: phone,
        phone_confirm: true, // Auto-confirm phone for admin-created accounts
        email: email || undefined,
        email_confirm: !!email,
        user_metadata: {
          full_name,
        }
      })

      if (createError) {
        // Fallback for "already registered" if listUsers didn't catch it
        if (createError.message.includes('already registered')) {
          // This edge case is tricky because we can't search easily by phone via admin API without listing all
          return new Response(JSON.stringify({ error: 'Phone number already registered. Could not retrieve ID.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          })
        }
        return new Response(JSON.stringify({ error: createError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
      authUserId = newAuthUser.user.id;
    }

    // 4. Insert or restore into the owners table
    const { data: newOwner, error: ownerInsertError } = await supabase
      .from('owners')
      .upsert({
        id: authUserId as string,
        full_name: full_name,
        business_name: business_name,
        phone: phone,
        email: email || null,
        role: 'owner',
        deleted_at: null
      }, { onConflict: 'id' })
      .select()
      .single()

    if (ownerInsertError) {
      // If it's a unique constraint error on phone or id
      if (ownerInsertError.code === '23505') {
        return new Response(JSON.stringify({ error: 'Owner with this phone or ID already exists.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
      return new Response(JSON.stringify({ error: ownerInsertError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 5. Return success
    return new Response(
      JSON.stringify({ owner: newOwner }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
