import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Stat } from '@/components/ui/Stat'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'

type Row = Record<string, unknown>

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'sites', label: 'Sites' },
  { key: 'benchmarks', label: 'Benchmarking' },
  { key: 'sops', label: 'SOP Distribution' },
]

const STATUS_BADGE: Record<string, 'green' | 'amber' | 'grey' | 'red'> = {
  active: 'green', setup: 'amber', paused: 'red', closed: 'grey',
}

export default function FranchisePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [siteFormOpen, setSiteFormOpen] = useState(false)
  const qc = useQueryClient()

  const [siteName, setSiteName] = useState('')
  const [siteCity, setSiteCity] = useState('')
  const [sitePhone, setSitePhone] = useState('')
  const [siteOpen, setSiteOpen] = useState(todayISO())

  const { data: sites } = useQuery({
    queryKey: ['franchise-sites'],
    queryFn: async () => {
      const { data, error } = await supabase.from('franchise_sites').select('*').order('opened_at')
      if (error) throw error
      return data
    },
  })

  const { data: benchmarks } = useQuery({
    queryKey: ['franchise-benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('franchise_benchmarks')
        .select('*, franchise_sites(name)')
        .order('period', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
  })

  const { data: sops } = useQuery({
    queryKey: ['sops-active'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sops').select('id, reference, title, "group"').eq('status', 'active').order('reference')
      if (error) throw error
      return data
    },
  })

  const addSite = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('franchise_sites').insert({
        name: siteName, city: siteCity, phone: sitePhone || null, opened_at: siteOpen, status: 'setup',
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['franchise-sites'] })
      setSiteFormOpen(false)
      setSiteName('')
      setSiteCity('')
    },
  })

  const siteCount = (sites ?? []).length
  const activeSites = (sites ?? []).filter((s: { status?: string }) => s.status === 'active').length

  // Compute benchmark aggregates
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthBenchmarks = (benchmarks ?? []).filter((b: { period?: string }) => b.period?.startsWith(thisMonth))
  const totalRevenue = monthBenchmarks.reduce((s: number, b: { revenue?: number }) => s + (b.revenue ?? 0), 0)
  const avgLabourPct = monthBenchmarks.length > 0
    ? monthBenchmarks.reduce((s: number, b: { labour_pct?: number }) => s + (b.labour_pct ?? 0), 0) / monthBenchmarks.length
    : 0

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Franchise Portal"
        subtitle="Multi-site management, benchmarking, and SOP distribution"
        colour="purple"
        action={activeTab === 'sites' ? <Button onClick={() => setSiteFormOpen(true)}>+ Add Site</Button> : undefined}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Total Sites" value={String(siteCount)} accent="blue" />
        <Stat label="Active Sites" value={String(activeSites)} accent="green" />
        <Stat label="Network Revenue (MTD)" value={formatGBP(totalRevenue)} accent="green" />
        <Stat label="Avg Labour %" value={`${avgLabourPct.toFixed(1)}%`} accent={avgLabourPct > 30 ? 'red' : 'green'} />
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {!(sites ?? []).length ? (
            <EmptyState icon="🏪" title="No sites yet" message="Add your first franchise site to get started." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(sites ?? []).map((site: { id: string; name: string; city: string; status?: string; opened_at?: string }) => (
                <Card key={site.id} title="">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm font-semibold text-dark">{site.name}</span>
                      <Badge variant={STATUS_BADGE[site.status ?? 'setup'] ?? 'grey'}>{site.status}</Badge>
                    </div>
                    <p className="font-body text-sm text-muted">{site.city}</p>
                    <p className="font-body text-xs text-muted">Opened: {site.opened_at ?? '—'}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sites' && (
        <Card title="All Sites">
          {!(sites ?? []).length ? (
            <EmptyState icon="🏪" title="No sites" message="Add franchise sites to track them here." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'name', header: 'Site Name', render: (r) => <span className="font-medium">{r.name as string}</span> },
                { key: 'city', header: 'City', render: (r) => r.city as string },
                { key: 'phone', header: 'Phone', render: (r) => (r.phone as string) || '—' },
                { key: 'status', header: 'Status', render: (r) => (
                  <Badge variant={STATUS_BADGE[r.status as string] ?? 'grey'}>{r.status as string}</Badge>
                )},
                { key: 'opened_at', header: 'Opened', render: (r) => (r.opened_at as string) || '—' },
              ]}
              data={(sites ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'benchmarks' && (
        <Card title="Network Benchmarks">
          {!(benchmarks ?? []).length ? (
            <EmptyState
              icon="📊"
              title="No benchmark data"
              message="Benchmark data is submitted by each site monthly. Connect site databases to populate this view."
            />
          ) : (
            <Table<Row>
              columns={[
                { key: 'period', header: 'Period', render: (r) => r.period as string },
                { key: 'site', header: 'Site', render: (r) => {
                  const s = r.franchise_sites as { name: string } | null
                  return s?.name ?? '—'
                }},
                { key: 'revenue', header: 'Revenue', render: (r) => formatGBP(r.revenue as number) },
                { key: 'labour_pct', header: 'Labour %', render: (r) => `${(r.labour_pct as number).toFixed(1)}%` },
                { key: 'food_cost_pct', header: 'Food Cost %', render: (r) => `${(r.food_cost_pct as number).toFixed(1)}%` },
                { key: 'net_margin_pct', header: 'Net Margin', render: (r) => {
                  const m = r.net_margin_pct as number
                  return <Badge variant={m > 15 ? 'green' : m > 5 ? 'amber' : 'red'}>{m.toFixed(1)}%</Badge>
                }},
              ]}
              data={(benchmarks ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'sops' && (
        <Card title="SOP Distribution">
          <div className="space-y-3">
            <p className="font-body text-sm text-muted">
              {(sops ?? []).length} active SOPs in Hertford master library.
              In a fully connected franchise network, these would be pushed to all sites automatically.
            </p>
            <Table<Row>
              columns={[
                { key: 'reference', header: 'Ref', render: (r) => (
                  <span className="font-mono text-xs font-medium">{r.reference as string}</span>
                )},
                { key: 'title', header: 'SOP Title', render: (r) => r.title as string },
                { key: 'group', header: 'Category', render: (r) => (
                  <Badge variant="grey">{(r.group as string).replace('_', ' ')}</Badge>
                )},
                { key: 'distributed', header: 'Status', render: () => (
                  <Badge variant="green">Master</Badge>
                )},
              ]}
              data={(sops ?? []) as unknown as Row[]}
            />
          </div>
        </Card>
      )}

      <Modal isOpen={siteFormOpen} onClose={() => setSiteFormOpen(false)} title="Add Franchise Site" size="sm">
        <div className="space-y-4">
          <Input label="Site Name" placeholder="e.g. Crispy Coop Ware" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          <Input label="City / Town" value={siteCity} onChange={(e) => setSiteCity(e.target.value)} />
          <Input label="Phone" value={sitePhone} onChange={(e) => setSitePhone(e.target.value)} />
          <Input label="Opening Date" type="date" value={siteOpen} onChange={(e) => setSiteOpen(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setSiteFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addSite.mutate()} loading={addSite.isPending} disabled={!siteName || !siteCity}>Add Site</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
