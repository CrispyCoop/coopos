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
    const { weekStart } = await req.json()

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    const weatherKey = Deno.env.get('OPENWEATHERMAP_API_KEY')

    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get last 8 weeks of revenue data for the same days of week
    const eightWeeksAgo = new Date(weekStart)
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
    const { data: historical } = await supabase
      .from('daily_revenue_summary')
      .select('date, total_revenue, total_orders')
      .gte('date', eightWeeksAgo.toISOString().split('T')[0])
      .lte('date', weekStart)
      .order('date')

    // Get local events in the forecast week
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const { data: events } = await supabase
      .from('local_events')
      .select('event_date, name, demand_impact')
      .gte('event_date', weekStart)
      .lte('event_date', weekEnd.toISOString().split('T')[0])

    // Get weather forecast for Hertford (lat: 51.7957, lon: -0.0785)
    let weatherSummary = 'Weather data unavailable'
    if (weatherKey) {
      try {
        const wRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=51.7957&lon=-0.0785&appid=${weatherKey}&units=metric&cnt=7`
        )
        const wData = await wRes.json()
        if (wData.list) {
          const days = wData.list.slice(0, 7).map((item: { dt_txt: string; main: { temp: number }; weather: { description: string }[] }) =>
            `${item.dt_txt.slice(0, 10)}: ${Math.round(item.main.temp)}°C, ${item.weather[0].description}`
          )
          weatherSummary = days.join('\n')
        }
      } catch (_) { /* weather fetch failed, continue without it */ }
    }

    // Build avg revenue per day of week from historical
    const dowRevenue: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    ;(historical ?? []).forEach((r: { date: string; total_revenue?: number }) => {
      const dow = new Date(r.date).getDay()
      if (r.total_revenue) dowRevenue[dow].push(r.total_revenue)
    })
    const avgByDow = Object.entries(dowRevenue).map(([dow, vals]) => ({
      dow: Number(dow),
      avg: vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0,
    }))

    const prompt = `You are the demand forecasting AI for Crispy Coop, a fried chicken restaurant in Hertford, UK.

HISTORICAL REVENUE (last 8 weeks daily data):
${(historical ?? []).slice(-21).map((r: { date: string; total_revenue?: number; total_orders?: number }) => `${r.date}: £${(r.total_revenue ?? 0).toFixed(2)} (${r.total_orders ?? 0} orders)`).join('\n')}

AVERAGE BY DAY OF WEEK:
${avgByDow.map(({ dow, avg }) => `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]}: £${avg.toFixed(2)}`).join('\n')}

WEATHER FORECAST FOR HERTFORD (week of ${weekStart}):
${weatherSummary}

LOCAL EVENTS THIS WEEK:
${(events ?? []).length > 0 ? (events ?? []).map((e: { event_date: string; name: string; demand_impact: string }) => `${e.event_date}: ${e.name} (${e.demand_impact} impact)`).join('\n') : 'No events logged'}

TASK:
Generate a 7-day revenue and order count forecast for the week starting ${weekStart}.
Consider: historical trends by day of week, weather impact on footfall, local events, and seasonal patterns.
Hertford is a market town — market days (Tue/Sat) and events significantly boost trade.
Poor weather reduces walk-ins but can increase delivery orders.

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{
  "forecast": [
    {"date": "YYYY-MM-DD", "predicted_revenue": 000.00, "predicted_orders": 00, "confidence": "high|medium|low", "notes": "brief reason"}
  ],
  "weekly_total": 0000.00,
  "key_insight": "one sentence summary of the week"
}`

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
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const text = anthropicData.content?.[0]?.text ?? '{}'
    const forecast = JSON.parse(text)

    return new Response(JSON.stringify(forecast), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
