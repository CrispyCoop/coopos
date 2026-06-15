import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'

type Row = Record<string, unknown>

const TABS = [
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'promo', label: 'Promo Codes' },
  { key: 'flyers', label: 'Flyers' },
]

const STATUS_BADGE: Record<string, 'green' | 'blue' | 'grey' | 'amber' | 'red'> = {
  active: 'green', planned: 'blue', completed: 'grey', paused: 'amber', cancelled: 'red',
}

const OBJECTIVE_OPTIONS = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'sales', label: 'Drive Sales' },
  { value: 'retention', label: 'Customer Retention' },
  { value: 'launch', label: 'Product Launch' },
  { value: 'other', label: 'Other' },
]

const DISCOUNT_OPTIONS = [
  { value: 'percentage', label: 'Percentage %' },
  { value: 'fixed', label: 'Fixed Amount £' },
  { value: 'free_item', label: 'Free Item' },
]

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [campaignFormOpen, setCampaignFormOpen] = useState(false)
  const [promoFormOpen, setPromoFormOpen] = useState(false)
  const [flyerFormOpen, setFlyerFormOpen] = useState(false)
  const qc = useQueryClient()

  // Campaign form state
  const [cName, setCName] = useState('')
  const [cObjective, setCObjective] = useState('sales')
  const [cStart, setCStart] = useState(todayISO())
  const [cEnd, setCEnd] = useState('')
  const [cBudget, setCBudget] = useState('')

  // Promo form state
  const [pCode, setPCode] = useState('')
  const [pType, setPType] = useState('percentage')
  const [pValue, setPValue] = useState('')
  const [pMinOrder, setPMinOrder] = useState('')
  const [pExpiry, setPExpiry] = useState('')
  const [pMaxUse, setPMaxUse] = useState('')

  // Flyer state
  const [fArea, setFArea] = useState('')
  const [fQty, setFQty] = useState('')
  const [fDate, setFDate] = useState(todayISO())
  const [fCode, setFCode] = useState('')

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase.from('campaigns').select('*').order('start_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { data: promos } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { data: flyers } = useQuery({
    queryKey: ['flyer-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('flyer_logs').select('*').order('distribution_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const addCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('campaigns').insert({
        name: cName, objective: cObjective, start_date: cStart, end_date: cEnd || null,
        budget: cBudget ? Number(cBudget) : null, status: 'planned',
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); setCampaignFormOpen(false); setCName('') },
  })

  const addPromo = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('promo_codes').insert({
        code: pCode.toUpperCase(), discount_type: pType, discount_value: Number(pValue),
        min_order_value: pMinOrder ? Number(pMinOrder) : null, expiry_date: pExpiry || null,
        max_redemptions: pMaxUse ? Number(pMaxUse) : null, redemption_count: 0, active: true,
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promo-codes'] }); setPromoFormOpen(false); setPCode(''); setPValue('') },
  })

  const addFlyer = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('flyer_logs').insert({
        area: fArea, quantity: Number(fQty), distribution_date: fDate, promo_code: fCode || null,
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['flyer-logs'] }); setFlyerFormOpen(false); setFArea(''); setFQty('') },
  })

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Marketing Campaigns"
        subtitle="Campaigns, promo codes, and flyer distribution tracking"
        colour="red"
        action={
          activeTab === 'campaigns' ? <Button onClick={() => setCampaignFormOpen(true)}>+ New Campaign</Button> :
          activeTab === 'promo' ? <Button onClick={() => setPromoFormOpen(true)}>+ Add Promo Code</Button> :
          <Button onClick={() => setFlyerFormOpen(true)}>+ Log Flyers</Button>
        }
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'campaigns' && (
        <Card title="Campaigns">
          {!(campaigns ?? []).length ? (
            <EmptyState icon="📣" title="No campaigns yet" message="Plan your first marketing campaign." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'name', header: 'Campaign', render: (r) => <span className="font-medium">{r.name as string}</span> },
                { key: 'objective', header: 'Objective', render: (r) => <Badge variant="grey">{r.objective as string}</Badge> },
                { key: 'start_date', header: 'Start', render: (r) => r.start_date as string },
                { key: 'end_date', header: 'End', render: (r) => (r.end_date as string) || '—' },
                { key: 'budget', header: 'Budget', render: (r) => r.budget != null ? formatGBP(r.budget as number) : '—' },
                { key: 'status', header: 'Status', render: (r) => (
                  <Badge variant={STATUS_BADGE[r.status as string] ?? 'grey'}>{r.status as string}</Badge>
                )},
              ]}
              data={(campaigns ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'promo' && (
        <Card title="Promo Codes">
          {!(promos ?? []).length ? (
            <EmptyState icon="🏷️" title="No promo codes" message="Create discount codes for your campaigns." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'code', header: 'Code', render: (r) => (
                  <span className="font-mono font-bold text-primary">{r.code as string}</span>
                )},
                { key: 'discount_type', header: 'Type', render: (r) => <Badge variant="grey">{r.discount_type as string}</Badge> },
                { key: 'discount_value', header: 'Value', render: (r) => {
                  const type = r.discount_type as string
                  const val = r.discount_value as number
                  return type === 'percentage' ? `${val}%` : formatGBP(val)
                }},
                { key: 'min_order_value', header: 'Min Order', render: (r) =>
                  r.min_order_value != null ? formatGBP(r.min_order_value as number) : '—'
                },
                { key: 'redemption_count', header: 'Redeemed', render: (r) => String(r.redemption_count) },
                { key: 'expiry_date', header: 'Expires', render: (r) => {
                  const exp = r.expiry_date as string | null
                  if (!exp) return <span className="text-muted">No expiry</span>
                  return <Badge variant={exp < todayISO() ? 'red' : 'green'}>{exp}</Badge>
                }},
                { key: 'active', header: 'Active', render: (r) => (
                  <Badge variant={r.active ? 'green' : 'grey'}>{r.active ? 'Active' : 'Inactive'}</Badge>
                )},
              ]}
              data={(promos ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'flyers' && (
        <Card title="Flyer Distribution Log">
          {!(flyers ?? []).length ? (
            <EmptyState icon="📄" title="No flyer logs" message="Track your flyer distributions." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'distribution_date', header: 'Date', render: (r) => r.distribution_date as string },
                { key: 'area', header: 'Area', render: (r) => r.area as string },
                { key: 'quantity', header: 'Quantity', render: (r) => String(r.quantity) },
                { key: 'promo_code', header: 'Promo Code', render: (r) => (r.promo_code as string) || '—' },
              ]}
              data={(flyers ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {/* Campaign Form */}
      <Modal isOpen={campaignFormOpen} onClose={() => setCampaignFormOpen(false)} title="New Campaign" size="md">
        <div className="space-y-4">
          <Input label="Campaign Name" value={cName} onChange={(e) => setCName(e.target.value)} />
          <Select label="Objective" options={OBJECTIVE_OPTIONS} value={cObjective} onChange={(e) => setCObjective(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={cStart} onChange={(e) => setCStart(e.target.value)} />
            <Input label="End Date" type="date" value={cEnd} onChange={(e) => setCEnd(e.target.value)} />
          </div>
          <Input label="Budget (£)" type="number" step="0.01" value={cBudget} onChange={(e) => setCBudget(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setCampaignFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addCampaign.mutate()} loading={addCampaign.isPending} disabled={!cName}>Create Campaign</Button>
          </div>
        </div>
      </Modal>

      {/* Promo Code Form */}
      <Modal isOpen={promoFormOpen} onClose={() => setPromoFormOpen(false)} title="Add Promo Code" size="sm">
        <div className="space-y-4">
          <Input label="Code" placeholder="e.g. SUMMER10" value={pCode} onChange={(e) => setPCode(e.target.value.toUpperCase())} />
          <Select label="Discount Type" options={DISCOUNT_OPTIONS} value={pType} onChange={(e) => setPType(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={pType === 'percentage' ? 'Discount %' : 'Discount £'} type="number" step="0.01" value={pValue} onChange={(e) => setPValue(e.target.value)} />
            <Input label="Min Order (£)" type="number" step="0.01" value={pMinOrder} onChange={(e) => setPMinOrder(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Expiry Date" type="date" value={pExpiry} onChange={(e) => setPExpiry(e.target.value)} />
            <Input label="Max Uses" type="number" value={pMaxUse} onChange={(e) => setPMaxUse(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setPromoFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addPromo.mutate()} loading={addPromo.isPending} disabled={!pCode || !pValue}>Add Code</Button>
          </div>
        </div>
      </Modal>

      {/* Flyer Form */}
      <Modal isOpen={flyerFormOpen} onClose={() => setFlyerFormOpen(false)} title="Log Flyer Distribution" size="sm">
        <div className="space-y-4">
          <Input label="Distribution Area" placeholder="e.g. Hertford Town Centre" value={fArea} onChange={(e) => setFArea(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" type="number" value={fQty} onChange={(e) => setFQty(e.target.value)} />
            <Input label="Distribution Date" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </div>
          <Input label="Promo Code Used" placeholder="Optional" value={fCode} onChange={(e) => setFCode(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setFlyerFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addFlyer.mutate()} loading={addFlyer.isPending} disabled={!fArea || !fQty}>Log</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
