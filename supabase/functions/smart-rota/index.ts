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
    const { weekStart, forecast } = await req.json()

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get active staff
    const { data: staff } = await supabase
      .from('staff_members')
      .select('id, name, role, hourly_rate, contracted_hours')
      .eq('active', true)
      .order('name')

    // Get absences for this week
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const { data: absences } = await supabase
      .from('staff_absences')
      .select('staff_id, absence_date')
      .gte('absence_date', weekStart)
      .lte('absence_date', weekEnd.toISOString().split('T')[0])

    // Get last week's actual rota for reference
    const lastWeek = new Date(weekStart)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const { data: lastRotaWeek } = await supabase
      .from('rota_weeks')
      .select('id')
      .eq('week_start_date', lastWeek.toISOString().split('T')[0])
      .single()

    let lastRotaShifts: unknown[] = []
    if (lastRotaWeek) {
      const { data: shifts } = await supabase
        .from('rota_shifts')
        .select('shift_date, start_time, end_time, role, staff_members(name)')
        .eq('rota_week_id', lastRotaWeek.id)
      lastRotaShifts = shifts ?? []
    }

    const absentStaffIds = new Set((absences ?? []).map((a: { staff_id: string }) => a.staff_id))

    const staffList = (staff ?? []).map((s: { id: string; name: string; role: string; hourly_rate: number; contracted_hours?: number }) => ({
      ...s,
      available: !absentStaffIds.has(s.id),
    }))

    const forecastSummary = forecast?.forecast
      ? forecast.forecast.map((d: { date: string; predicted_revenue: number; predicted_orders: number }) =>
          `${d.date}: £${d.predicted_revenue.toFixed(2)} (${d.predicted_orders} orders)`
        ).join('\n')
      : 'No forecast available'

    const prompt = `You are the smart rota AI for Crispy Coop, a fried chicken restaurant in Hertford, UK.

STAFF AVAILABLE FOR WEEK OF ${weekStart}:
${staffList.map((s: { name: string; role: string; hourly_rate: number; contracted_hours?: number; available: boolean }) =>
  `- ${s.name} (${s.role}, £${s.hourly_rate}/hr, contracted ${s.contracted_hours ?? '?'}hrs/wk) — ${s.available ? 'AVAILABLE' : 'ABSENT'}`
).join('\n')}

DEMAND FORECAST FOR WEEK:
${forecastSummary}

KITCHEN CONTEXT:
- Opening hours: Mon-Thu 11:30-21:30, Fri-Sat 11:30-22:00, Sun 12:00-21:00
- Minimum staff: 2 kitchen + 1 counter at all times when open
- Busy sessions need: 3 kitchen + 2 counter
- Lunch peak: 12:00-14:00, Dinner peak: 17:00-20:30
- Closing shift: 1 person stays 30 min after close for cleanup

LAST WEEK'S SHIFTS (for reference):
${lastRotaShifts.slice(0, 10).map((s: unknown) => {
  const shift = s as { shift_date: string; start_time: string; end_time: string; role?: string; staff_members?: { name: string } }
  return `${shift.shift_date}: ${shift.staff_members?.name ?? '?'} ${shift.start_time}-${shift.end_time} (${shift.role ?? '?'})`
}).join('\n') || 'No previous rota data'}

TASK:
Generate a recommended rota for the week starting ${weekStart}.
Match staffing levels to the forecast demand — higher revenue days need more staff.
Don't schedule absent staff. Respect contracted hours roughly.
Prioritise covering all open hours with minimum staffing.

Respond ONLY with a JSON object (no markdown):
{
  "shifts": [
    {
      "staff_name": "Name",
      "shift_date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "role": "kitchen|counter|closing"
    }
  ],
  "total_hours": 00,
  "estimated_labour_cost": 000.00,
  "notes": "brief commentary on the rota decisions"
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
        max_tokens: 2048,
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
    const rota = JSON.parse(text)

    return new Response(JSON.stringify(rota), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
