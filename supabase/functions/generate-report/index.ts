import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, from, to } = await req.json()

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Gather business data for the briefing
    const [{ data: revenue }, { data: txns }, { data: temps }, { data: absences }] = await Promise.all([
      supabase.from('daily_revenue_summary').select('*').gte('date', from).lte('date', to),
      supabase.from('financial_transactions').select('amount,type,category').gte('date', from).lte('date', to),
      supabase.from('temperature_logs').select('check_type,temperature,is_pass').gte('created_at', from).lte('created_at', to + 'T23:59:59').limit(20),
      supabase.from('staff_absences').select('type,absence_date').gte('absence_date', from).lte('absence_date', to).limit(10),
    ])

    const totalRev = (revenue ?? []).reduce((s: number, r: { total_revenue?: number }) => s + (r.total_revenue ?? 0), 0)
    const totalOrders = (revenue ?? []).reduce((s: number, r: { total_orders?: number }) => s + (r.total_orders ?? 0), 0)
    const income = (txns ?? []).filter((t: { type: string }) => t.type === 'income').reduce((s: number, t: { amount?: number }) => s + (t.amount ?? 0), 0)
    const expenses = (txns ?? []).filter((t: { type: string }) => t.type === 'expense').reduce((s: number, t: { amount?: number }) => s + (t.amount ?? 0), 0)
    const failedTemps = (temps ?? []).filter((t: { is_pass?: boolean }) => t.is_pass === false).length

    const contextData = `
CRISPY COOP - BUSINESS DATA SUMMARY (${from} to ${to})

TRADING:
- Total Revenue: £${totalRev.toFixed(2)}
- Total Orders: ${totalOrders}
- Avg Order Value: £${totalOrders > 0 ? (totalRev / totalOrders).toFixed(2) : '0.00'}

FINANCIALS:
- Total Income: £${income.toFixed(2)}
- Total Expenses: £${expenses.toFixed(2)}
- Net P&L: £${(income - expenses).toFixed(2)}

FOOD SAFETY:
- Temperature Checks: ${(temps ?? []).length}
- Failed Checks: ${failedTemps}

STAFF:
- Absences in period: ${(absences ?? []).length}
`

    const prompt = type === 'daily-briefing'
      ? `You are the business intelligence assistant for Crispy Coop, a fried chicken restaurant in Hertford, UK.

Based on the following operational data, write a concise executive briefing (4-6 paragraphs) covering:
1. Trading performance summary
2. Financial health
3. Operational highlights or concerns
4. Any food safety flags
5. A brief recommendation or focus area for the period ahead

Keep the tone professional but direct. Use specific numbers from the data. Flag any concerns clearly.

${contextData}`
      : `Summarise the following Crispy Coop business data in a clear report:\n${contextData}`

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const anthropicData = await anthropicRes.json()

    if (!anthropicRes.ok) {
      return new Response(JSON.stringify({ error: anthropicData.error?.message ?? 'Anthropic error' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const briefing = anthropicData.content?.[0]?.text ?? 'No briefing generated.'

    return new Response(JSON.stringify({ briefing }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
