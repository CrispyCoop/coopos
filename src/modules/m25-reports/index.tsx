import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import type { ReportData } from './ReportPDF'

interface ReportType {
  id: string
  title: string
  description: string
  icon: string
  category: 'finance' | 'operations' | 'compliance' | 'ai'
  defaultDays: number
}

const REPORT_TYPES: ReportType[] = [
  { id: 'daily-summary', title: 'Daily Trading Summary', description: 'Revenue, orders, channels, top sellers', icon: '📊', category: 'finance', defaultDays: 1 },
  { id: 'weekly-pl', title: 'Weekly P&L', description: 'Income vs expenses, net profit for the week', icon: '💰', category: 'finance', defaultDays: 7 },
  { id: 'monthly-finance', title: 'Monthly Finance Report', description: 'Full monthly income, expenses, VAT, net P&L', icon: '📅', category: 'finance', defaultDays: 30 },
  { id: 'labour-cost', title: 'Labour Cost Report', description: 'Wages, hours, labour % of revenue', icon: '👥', category: 'operations', defaultDays: 30 },
  { id: 'menu-performance', title: 'Menu Performance', description: 'Best and worst sellers, margins, revenue by item', icon: '🍗', category: 'operations', defaultDays: 30 },
  { id: 'food-safety', title: 'Food Safety Compliance', description: 'Temperature logs, pest control, audit summary', icon: '✅', category: 'compliance', defaultDays: 30 },
  { id: 'allergen', title: 'Allergen Report', description: 'Full allergen matrix for all active menu items', icon: '⚠️', category: 'compliance', defaultDays: 0 },
  { id: 'supplier', title: 'Supplier Summary', description: 'Purchase orders, delivery performance, spend', icon: '🚚', category: 'operations', defaultDays: 30 },
  { id: 'stock-valuation', title: 'Stock Valuation', description: 'Current stock levels and total value', icon: '📦', category: 'operations', defaultDays: 0 },
  { id: 'customer-analysis', title: 'Customer Analysis', description: 'Segments, LTV, churn risk, VIPs', icon: '👤', category: 'operations', defaultDays: 90 },
  { id: 'campaign-roi', title: 'Campaign ROI', description: 'Campaign spend vs revenue uplift, promo code redemptions', icon: '📣', category: 'operations', defaultDays: 30 },
  { id: 'equipment-log', title: 'Equipment Maintenance Log', description: 'All services, repairs, upcoming service dates', icon: '🔧', category: 'compliance', defaultDays: 90 },
  { id: 'vat-summary', title: 'VAT Summary', description: 'Output VAT, input VAT, net VAT due for the period', icon: '🧾', category: 'finance', defaultDays: 90 },
  { id: 'ai-briefing', title: 'AI Executive Briefing', description: 'Claude-generated business intelligence summary', icon: '🤖', category: 'ai', defaultDays: 7 },
]

const CATEGORY_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'purple'> = {
  finance: 'green', operations: 'blue', compliance: 'amber', ai: 'purple',
}

function getDateRange(days: number): { from: string; to: string } {
  const to = todayISO()
  if (days === 0) return { from: to, to }
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString().split('T')[0], to }
}

async function fetchReportData(type: string, from: string, to: string): Promise<ReportData> {
  const now = new Date().toLocaleString('en-GB')
  const dateRange = from === to ? from : `${from} to ${to}`

  if (type === 'daily-summary' || type === 'weekly-pl' || type === 'monthly-finance') {
    const [{ data: rev }, { data: txns }] = await Promise.all([
      supabase.from('daily_revenue_summary').select('*').gte('date', from).lte('date', to),
      supabase.from('financial_transactions').select('*').gte('date', from).lte('date', to),
    ])
    const totalRev = (rev ?? []).reduce((s, r) => s + (r.total_revenue ?? 0), 0)
    const totalOrders = (rev ?? []).reduce((s, r) => s + (r.total_orders ?? 0), 0)
    const income = (txns ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = (txns ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return {
      type, title: REPORT_TYPES.find((r) => r.id === type)!.title, dateRange, generatedAt: now,
      sections: [
        {
          title: 'Trading Overview',
          stats: [
            { label: 'Total Revenue', value: formatGBP(totalRev) },
            { label: 'Total Orders', value: String(totalOrders) },
            { label: 'Avg Order Value', value: totalOrders > 0 ? formatGBP(totalRev / totalOrders) : '—' },
          ],
        },
        {
          title: 'Financial Transactions',
          stats: [
            { label: 'Total Income', value: formatGBP(income) },
            { label: 'Total Expenses', value: formatGBP(expenses) },
            { label: 'Net P&L', value: formatGBP(income - expenses) },
          ],
        },
        {
          title: 'Daily Breakdown',
          rows: (rev ?? []).map((r) => ({ label: r.date, value: formatGBP(r.total_revenue), value2: `${r.total_orders} orders` })),
        },
      ],
    }
  }

  if (type === 'vat-summary') {
    const { data: txns } = await supabase.from('financial_transactions').select('*').gte('date', from).lte('date', to)
    const income = (txns ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = (txns ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const outputVAT = income * 0.2
    const inputVAT = expenses * 0.2
    return {
      type, title: 'VAT Summary', dateRange, generatedAt: now,
      sections: [{
        title: 'VAT Calculation',
        stats: [
          { label: 'Output VAT (Sales)', value: formatGBP(outputVAT) },
          { label: 'Input VAT (Expenses)', value: formatGBP(inputVAT) },
          { label: 'Net VAT Due', value: formatGBP(outputVAT - inputVAT) },
        ],
      }, {
        title: 'Transaction Summary',
        rows: [
          { label: 'Total Taxable Income', value: formatGBP(income), value2: `${formatGBP(outputVAT)} VAT @ 20%` },
          { label: 'Total Reclaimable Expenses', value: formatGBP(expenses), value2: `${formatGBP(inputVAT)} VAT @ 20%` },
        ],
      }],
    }
  }

  if (type === 'stock-valuation') {
    const { data: stock } = await supabase.from('ingredients').select('*, stock_levels(quantity_on_hand)').order('name')
    const total = (stock ?? []).reduce((s: number, i: { cost_per_unit?: number; stock_levels?: { quantity_on_hand?: number }[] }) => {
      const qty = (i.stock_levels?.[0]?.quantity_on_hand ?? 0)
      return s + qty * (i.cost_per_unit ?? 0)
    }, 0)
    return {
      type, title: 'Stock Valuation', dateRange: 'Current', generatedAt: now,
      sections: [{
        title: `Total Stock Value: ${formatGBP(total)}`,
        rows: (stock ?? []).slice(0, 40).map((i: { name: string; cost_per_unit?: number; unit?: string; stock_levels?: { quantity_on_hand?: number }[] }) => ({
          label: i.name,
          value: `${(i.stock_levels?.[0]?.quantity_on_hand ?? 0).toFixed(2)} ${i.unit ?? ''}`,
          value2: formatGBP((i.stock_levels?.[0]?.quantity_on_hand ?? 0) * (i.cost_per_unit ?? 0)),
        })),
      }],
    }
  }

  if (type === 'equipment-log') {
    const [{ data: equip }, { data: services }, { data: repairs }] = await Promise.all([
      supabase.from('equipment').select('*').order('name'),
      supabase.from('equipment_services').select('*, equipment(name)').order('service_date', { ascending: false }).limit(50),
      supabase.from('equipment_repairs').select('*, equipment(name)').order('repair_date', { ascending: false }).limit(50),
    ])
    return {
      type, title: 'Equipment Maintenance Log', dateRange, generatedAt: now,
      sections: [
        {
          title: 'Equipment Register',
          rows: (equip ?? []).map((e: { name: string; category: string; next_service_date?: string }) => ({
            label: e.name, value: e.category, value2: e.next_service_date ?? 'No service date',
          })),
        },
        {
          title: 'Service History',
          rows: (services ?? []).map((s: { service_date: string; equipment?: { name: string }; cost?: number }) => ({
            label: s.service_date, value: s.equipment?.name ?? '—', value2: s.cost != null ? formatGBP(s.cost) : '—',
          })),
        },
        {
          title: 'Repair Log',
          rows: (repairs ?? []).map((r: { repair_date: string; equipment?: { name: string }; issue: string; cost?: number }) => ({
            label: r.repair_date, value: r.equipment?.name ?? '—', value2: r.cost != null ? formatGBP(r.cost) : '—',
          })),
        },
      ],
    }
  }

  if (type === 'customer-analysis') {
    const { data: customers } = await supabase.from('customers').select('*').order('lifetime_value', { ascending: false }).limit(50)
    const total = (customers ?? []).length
    const totalLTV = (customers ?? []).reduce((s: number, c: { lifetime_value?: number }) => s + (c.lifetime_value ?? 0), 0)
    const segs: Record<string, number> = {}
    ;(customers ?? []).forEach((c: { segment?: string }) => { if (c.segment) segs[c.segment] = (segs[c.segment] || 0) + 1 })
    return {
      type, title: 'Customer Analysis', dateRange, generatedAt: now,
      sections: [
        {
          title: 'Summary',
          stats: [
            { label: 'Total Customers', value: String(total) },
            { label: 'Total LTV', value: formatGBP(totalLTV) },
            { label: 'Avg LTV', value: total > 0 ? formatGBP(totalLTV / total) : '—' },
          ],
        },
        {
          title: 'By Segment',
          rows: Object.entries(segs).map(([seg, count]) => ({ label: seg, value: String(count), value2: `${Math.round(count / total * 100)}%` })),
        },
        {
          title: 'Top 20 Customers by Lifetime Value',
          rows: (customers ?? []).slice(0, 20).map((c: { name?: string; segment?: string; lifetime_value?: number }) => ({
            label: c.name ?? 'Anonymous',
            value: formatGBP(c.lifetime_value ?? 0),
            value2: c.segment ?? '—',
          })),
        },
      ],
    }
  }

  if (type === 'food-safety') {
    const [{ data: temps }, { data: pest }] = await Promise.all([
      supabase.from('temperature_logs').select('*').gte('created_at', from).lte('created_at', to + 'T23:59:59').limit(100),
      supabase.from('pest_control_logs').select('*').gte('visit_date', from).lte('visit_date', to).limit(20),
    ])
    const failedTemps = (temps ?? []).filter((t: { is_pass?: boolean }) => t.is_pass === false).length
    return {
      type, title: 'Food Safety Compliance', dateRange, generatedAt: now,
      sections: [
        {
          title: 'Overview',
          stats: [
            { label: 'Temperature Checks', value: String((temps ?? []).length) },
            { label: 'Failed Checks', value: String(failedTemps) },
            { label: 'Pest Control Visits', value: String((pest ?? []).length) },
          ],
        },
        {
          title: 'Temperature Log (last 30)',
          rows: (temps ?? []).slice(0, 30).map((t: { check_type?: string; temperature?: number; is_pass?: boolean; created_at?: string }) => ({
            label: t.check_type ?? '—',
            value: `${t.temperature ?? '—'}°C`,
            value2: t.is_pass ? 'PASS' : 'FAIL',
          })),
        },
        {
          title: 'Pest Control Visits',
          rows: (pest ?? []).map((p: { visit_date: string; contractor?: string; outcome?: string }) => ({
            label: p.visit_date, value: p.contractor ?? '—', value2: p.outcome ?? '—',
          })),
        },
      ],
    }
  }

  if (type === 'supplier') {
    const [{ data: suppliers }, { data: pos }] = await Promise.all([
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('purchase_orders').select('*, suppliers(name)').gte('created_at', from).lte('created_at', to + 'T23:59:59').limit(50),
    ])
    const totalSpend = (pos ?? []).reduce((s: number, p: { total_amount?: number }) => s + (p.total_amount ?? 0), 0)
    return {
      type, title: 'Supplier Summary', dateRange, generatedAt: now,
      sections: [
        {
          title: 'Overview',
          stats: [
            { label: 'Active Suppliers', value: String((suppliers ?? []).length) },
            { label: 'Purchase Orders', value: String((pos ?? []).length) },
            { label: 'Total Spend', value: formatGBP(totalSpend) },
          ],
        },
        {
          title: 'Purchase Orders',
          rows: (pos ?? []).map((p: { created_at: string; suppliers?: { name: string }; status?: string; total_amount?: number }) => ({
            label: p.created_at.slice(0, 10),
            value: p.suppliers?.name ?? '—',
            value2: p.total_amount != null ? formatGBP(p.total_amount) : '—',
          })),
        },
      ],
    }
  }

  if (type === 'campaign-roi') {
    const [{ data: campaigns }, { data: promos }] = await Promise.all([
      supabase.from('campaigns').select('*').gte('start_date', from).lte('start_date', to),
      supabase.from('promo_codes').select('*').gte('created_at', from + 'T00:00:00').lte('created_at', to + 'T23:59:59'),
    ])
    const totalBudget = (campaigns ?? []).reduce((s: number, c: { budget?: number }) => s + (c.budget ?? 0), 0)
    const totalRedemptions = (promos ?? []).reduce((s: number, p: { redemption_count?: number }) => s + (p.redemption_count ?? 0), 0)
    return {
      type, title: 'Campaign ROI', dateRange, generatedAt: now,
      sections: [
        {
          title: 'Overview',
          stats: [
            { label: 'Campaigns', value: String((campaigns ?? []).length) },
            { label: 'Total Budget', value: formatGBP(totalBudget) },
            { label: 'Promo Redemptions', value: String(totalRedemptions) },
          ],
        },
        {
          title: 'Campaigns',
          rows: (campaigns ?? []).map((c: { name: string; status?: string; budget?: number }) => ({
            label: c.name, value: c.status ?? '—', value2: c.budget != null ? formatGBP(c.budget) : '—',
          })),
        },
        {
          title: 'Promo Codes',
          rows: (promos ?? []).map((p: { code: string; discount_type?: string; discount_value?: number; redemption_count?: number }) => ({
            label: p.code,
            value: `${p.discount_value}${p.discount_type === 'percentage' ? '%' : '£'} off`,
            value2: `${p.redemption_count ?? 0} uses`,
          })),
        },
      ],
    }
  }

  if (type === 'allergen') {
    const { data: items } = await supabase.from('menu_items').select('name, menu_item_allergens(allergen_name, contains, may_contain)').eq('active', true).order('name')
    return {
      type, title: 'Allergen Report', dateRange: 'Current Menu', generatedAt: now,
      sections: [{
        title: 'Menu Item Allergen Matrix',
        rows: (items ?? []).flatMap((item: { name: string; menu_item_allergens?: { allergen_name: string; contains?: boolean; may_contain?: boolean }[] }) =>
          (item.menu_item_allergens ?? []).filter((a) => a.contains || a.may_contain).map((a) => ({
            label: item.name,
            value: a.allergen_name,
            value2: a.contains ? 'CONTAINS' : 'MAY CONTAIN',
          }))
        ),
        text: (items ?? []).flatMap((i: { menu_item_allergens?: { contains?: boolean; may_contain?: boolean }[] }) => i.menu_item_allergens ?? []).length === 0
          ? 'No allergen data recorded.'
          : undefined,
      }],
    }
  }

  if (type === 'labour-cost') {
    const { data: wages } = await supabase
      .from('wage_payments')
      .select('*, staff_members(name)')
      .gte('payment_date', from)
      .lte('payment_date', to)
      .order('payment_date', { ascending: false })
    const totalWages = (wages ?? []).reduce((s: number, w: { amount?: number }) => s + (w.amount ?? 0), 0)
    return {
      type, title: 'Labour Cost Report', dateRange, generatedAt: now,
      sections: [
        {
          title: 'Overview',
          stats: [
            { label: 'Total Wage Payments', value: String((wages ?? []).length) },
            { label: 'Total Labour Cost', value: formatGBP(totalWages) },
          ],
        },
        {
          title: 'Wage Payments',
          rows: (wages ?? []).map((w: { payment_date: string; staff_members?: { name: string }; hours_worked?: number; amount?: number }) => ({
            label: w.payment_date,
            value: w.staff_members?.name ?? '—',
            value2: w.amount != null ? formatGBP(w.amount) : '—',
          })),
        },
      ],
    }
  }

  if (type === 'menu-performance') {
    const { data: records } = await supabase
      .from('sales_records')
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .limit(200)
    const itemTotals: Record<string, { name: string; qty: number; revenue: number }> = {}
    ;(records ?? []).forEach((r: { item_name?: string; quantity?: number; total?: number }) => {
      if (!r.item_name) return
      if (!itemTotals[r.item_name]) itemTotals[r.item_name] = { name: r.item_name, qty: 0, revenue: 0 }
      itemTotals[r.item_name].qty += r.quantity ?? 1
      itemTotals[r.item_name].revenue += r.total ?? 0
    })
    const sorted = Object.values(itemTotals).sort((a, b) => b.revenue - a.revenue)
    return {
      type, title: 'Menu Performance', dateRange, generatedAt: now,
      sections: [{
        title: 'Items by Revenue',
        rows: sorted.map((i) => ({ label: i.name, value: formatGBP(i.revenue), value2: `${i.qty} sold` })),
      }],
    }
  }

  // Fallback for ai-briefing and anything else
  return {
    type, title: REPORT_TYPES.find((r) => r.id === type)?.title ?? type, dateRange, generatedAt: now,
    sections: [{
      title: 'Report',
      text: type === 'ai-briefing'
        ? 'AI Briefing is generated via the Supabase Edge Function using Anthropic Claude. Download will trigger the Edge Function.'
        : 'No data available for this report type.',
    }],
  }
}

export default function ReportsPage() {
  const [selected, setSelected] = useState<ReportType | null>(null)
  const [dateFrom, setDateFrom] = useState(todayISO())
  const [dateTo, setDateTo] = useState(todayISO())
  const [generating, setGenerating] = useState(false)
  const [aiBriefing, setAiBriefing] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')

  function openReport(type: ReportType) {
    const range = getDateRange(type.defaultDays)
    setDateFrom(range.from)
    setDateTo(range.to)
    setSelected(type)
    setAiBriefing('')
    setAiError('')
  }

  async function handleGenerate() {
    if (!selected) return
    setGenerating(true)
    try {
      const data = await fetchReportData(selected.id, dateFrom, dateTo)
      // Lazy-load @react-pdf/renderer to keep the main bundle small
      const [{ pdf }, { ReportPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./ReportPDF'),
      ])
      const blob = await pdf(<ReportPDF report={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selected.id}-${dateFrom}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  async function handleAIBriefing() {
    setAiLoading(true)
    setAiError('')
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { type: 'daily-briefing', from: dateFrom, to: dateTo },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setAiBriefing(data?.briefing ?? 'No briefing generated.')
    } catch (err) {
      setAiError(String(err))
    } finally {
      setAiLoading(false)
    }
  }

  const categories = ['all', 'finance', 'operations', 'compliance', 'ai']
  const filtered = REPORT_TYPES.filter((r) => filterCat === 'all' || r.category === filterCat)

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Advanced Reports"
        subtitle="Generate PDF reports for any area of the business"
        colour="green"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full font-body text-sm transition-colors ${
              filterCat === cat
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-secondary hover:border-primary/40'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((type) => (
          <Card key={type.id} title="">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-body text-sm font-semibold text-dark">{type.title}</p>
                    <p className="font-body text-xs text-muted">{type.description}</p>
                  </div>
                </div>
                <Badge variant={CATEGORY_BADGE[type.category]}>{type.category}</Badge>
              </div>
              <Button variant="outline" onClick={() => openReport(type)}>
                Generate PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Report modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Generate: ${selected.title}` : ''}
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            {selected.id !== 'stock-valuation' && selected.id !== 'allergen' && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            )}

            {selected.id === 'ai-briefing' ? (
              <div className="space-y-3">
                <Alert type="info" message="The AI briefing uses Anthropic Claude via a Supabase Edge Function. Costs approximately 1-2p per generation." />
                {aiError && <Alert type="error" message={aiError} />}
                {aiBriefing && (
                  <div className="p-4 bg-surface rounded-xl border border-border">
                    <pre className="font-body text-xs text-dark whitespace-pre-wrap">{aiBriefing}</pre>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button onClick={handleAIBriefing} loading={aiLoading}>
                    Generate Briefing
                  </Button>
                  {aiBriefing && (
                    <Button variant="outline" onClick={() => {
                      const blob = new Blob([aiBriefing], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `ai-briefing-${dateFrom}.txt`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}>
                      Download Text
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button onClick={handleGenerate} loading={generating}>
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
