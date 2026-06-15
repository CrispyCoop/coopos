import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function is intended to be triggered by a Supabase cron job at 06:00 daily.
// Configure in Supabase dashboard: Database → Cron Jobs → New → 0 6 * * * → HTTP POST to this function URL
// The generated briefing is stored in business_settings.last_ai_briefing for the dashboard to display.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayISO = yesterday.toISOString().split('T')[0]

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString().split('T')[0]

    const [
      { data: yesterdayRev },
      { data: weekRev },
      { data: todayEvents },
      { data: overdueEquipment },
      { data: tempFails },
      { data: staffAbsences },
      { data: settings },
    ] = await Promise.all([
      supabase.from('daily_revenue_summary').select('total_revenue, total_orders').eq('date', yesterdayISO),
      supabase.from('daily_revenue_summary').select('total_revenue').gte('date', sevenDaysAgoISO).lte('date', yesterdayISO),
      supabase.from('local_events').select('name, demand_impact').eq('event_date', today),
      supabase.from('equipment').select('name, next_service_date').lt('next_service_date', today).not('next_service_date', 'is', null),
      supabase.from('temperature_logs').select('check_type, temperature').eq('is_pass', false).gte('created_at', yesterdayISO).lte('created_at', yesterdayISO + 'T23:59:59'),
      supabase.from('staff_absences').select('type').eq('absence_date', today),
      supabase.from('business_settings').select('value').eq('key', 'daily_revenue_target').maybeSingle(),
    ])

    const yRev = (yesterdayRev ?? [])[0]?.total_revenue ?? 0
    const yOrders = (yesterdayRev ?? [])[0]?.total_orders ?? 0
    const weekTotal = (weekRev ?? []).reduce((s: number, r: { total_revenue?: number }) => s + (r.total_revenue ?? 0), 0)
    const dailyTarget = Number((settings as { value?: string } | null)?.value ?? 419)
    const vsTarget = yRev - dailyTarget
    const vsTargetPct = dailyTarget > 0 ? (vsTarget / dailyTarget) * 100 : 0

    const prompt = `You are the morning briefing AI for Crispy Coop, a fried chicken restaurant in Hertford, UK. Generate a concise morning briefing for the management team.

TODAY IS: ${today}

YESTERDAY'S PERFORMANCE:
- Revenue: £${yRev.toFixed(2)} (target: £${dailyTarget.toFixed(2)}, ${vsTargetPct > 0 ? '+' : ''}${vsTargetPct.toFixed(1)}% vs target)
- Orders: ${yOrders}
- 7-day rolling revenue: £${weekTotal.toFixed(2)}

TODAY'S LOCAL EVENTS:
${(todayEvents ?? []).length > 0 ? (todayEvents ?? []).map((e: { name: string; demand_impact: string }) => `- ${e.name} (${e.demand_impact} demand impact)`).join('\n') : 'No events today'}

STAFF ABSENCES TODAY:
${(staffAbsences ?? []).length > 0 ? `${(staffAbsences ?? []).length} absence(s) logged` : 'Full team available'}

FOOD SAFETY FLAGS (yesterday):
${(tempFails ?? []).length > 0 ? (tempFails ?? []).map((t: { check_type?: string; temperature?: number }) => `- ${t.check_type}: ${t.temperature}°C FAILED`).join('\n') : 'No failures'}

OVERDUE EQUIPMENT SERVICES:
${(overdueEquipment ?? []).length > 0 ? (overdueEquipment ?? []).map((e: { name: string; next_service_date?: string }) => `- ${e.name} (due ${e.next_service_date})`).join('\n') : 'None'}

Write a brief morning briefing (3-4 short paragraphs). Cover: yesterday's performance, today's outlook, any flags to action. Keep it direct, practical, and under 200 words. Start with the most important point.`

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const anthropicData = await anthropicRes.json()
    if (!anthropicRes.ok) {
      return new Response(JSON.stringify({ error: anthropicData.error?.message ?? 'Anthropic error' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const briefing = anthropicData.content?.[0]?.text ?? ''

    // Upsert into daily_briefings — this is what the dashboard DailyBriefingCard reads
    await supabase
      .from('daily_briefings')
      .upsert(
        { date: today, content: briefing, generated_at: new Date().toISOString() },
        { onConflict: 'date' }
      )

    return new Response(JSON.stringify({ success: true, briefing }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
