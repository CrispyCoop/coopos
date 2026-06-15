import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Stripe webhook receiver for app order payments.
// Configure in Stripe dashboard: Developers → Webhooks → Add endpoint
// Events to listen for: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',')
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2)
  const v1 = parts.find((p) => p.startsWith('v1='))?.slice(3)
  if (!timestamp || !v1) return false

  const signed = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed))
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return hex === v1
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const signature = req.headers.get('stripe-signature') ?? ''
    const rawBody = await req.text()

    if (stripeSecret) {
      const valid = await verifyStripeSignature(rawBody, signature, stripeSecret)
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid Stripe signature' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const event = JSON.parse(rawBody)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object
      const amount = pi.amount / 100  // Stripe stores in pence
      const metadata = pi.metadata ?? {}

      // Insert a financial transaction for this payment
      await supabase.from('financial_transactions').insert({
        type: 'income',
        category: 'app_order',
        amount,
        description: `Stripe payment — ${metadata.order_ref ?? pi.id}`,
        date: new Date().toISOString().split('T')[0],
        reference: pi.id,
      })

      // Log to stripe_payments table
      await supabase.from('stripe_payments').insert({
        stripe_payment_intent_id: pi.id,
        amount,
        currency: pi.currency,
        status: 'succeeded',
        customer_id: metadata.customer_id ?? null,
        order_ref: metadata.order_ref ?? null,
        metadata: metadata,
      })
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object
      await supabase.from('stripe_payments').insert({
        stripe_payment_intent_id: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency,
        status: 'failed',
        metadata: pi.metadata ?? {},
      })
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object
      const refundAmount = charge.amount_refunded / 100

      await supabase.from('financial_transactions').insert({
        type: 'expense',
        category: 'refund',
        amount: refundAmount,
        description: `Stripe refund — ${charge.payment_intent}`,
        date: new Date().toISOString().split('T')[0],
        reference: charge.id,
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
