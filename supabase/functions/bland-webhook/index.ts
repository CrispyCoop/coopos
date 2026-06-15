import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Bland AI webhook receiver.
// Configure in Bland AI dashboard: Webhook URL → this function's URL
// Bland AI sends POST with call transcript + extracted data after each call.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, bland-signature',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Verify Bland AI webhook signature (optional but recommended)
    const blandSecret = Deno.env.get('BLAND_WEBHOOK_SECRET')
    const incomingSig = req.headers.get('bland-signature')
    if (blandSecret && incomingSig !== blandSecret) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Bland AI call payload structure
    const {
      call_id,
      from,          // caller phone
      to,            // our number
      duration,      // seconds
      status,        // completed | no-answer | failed
      transcript,    // full transcript text
      variables,     // extracted variables from Bland AI pathway
    } = body

    // Extract order details from Bland AI pathway variables
    const orderItems = variables?.items ?? null
    const orderTotal = variables?.total ?? null
    const customerName = variables?.customer_name ?? null
    const orderType = variables?.order_type ?? 'phone'    // phone | collection | delivery

    // Log the call
    const { data: callLog, error: callErr } = await supabase.from('voice_call_logs').insert({
      call_id: call_id ?? null,
      caller_phone: from ?? null,
      duration_seconds: duration ?? null,
      status: status ?? 'completed',
      transcript: transcript ?? null,
      order_type: orderType,
      customer_name: customerName,
      raw_variables: variables ?? null,
    }).select().single()

    if (callErr) {
      console.error('Failed to log call:', callErr)
    }

    // If the call resulted in a completed order, create a sales session record
    if (status === 'completed' && orderTotal && callLog) {
      await supabase.from('voice_orders').insert({
        call_log_id: callLog.id,
        customer_name: customerName,
        customer_phone: from,
        order_items: orderItems,
        total_amount: Number(orderTotal),
        order_type: orderType,
        status: 'received',
      })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
