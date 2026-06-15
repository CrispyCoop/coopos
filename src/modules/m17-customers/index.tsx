import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Stat } from '@/components/ui/Stat'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'

type Row = Record<string, unknown>

interface Customer {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  total_orders: number
  lifetime_value: number
  avg_order_value: number
  last_order_date: string | null
  segment: string | null
  loyalty_points: number
  opt_in_sms: boolean
  created_at: string
}

const SEGMENT_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'grey'> = {
  new: 'blue',
  regular: 'green',
  lapsed: 'amber',
  high_value: 'purple',
  at_risk: 'red',
  vip: 'purple',
}

const TABS = [
  { key: 'all', label: 'All Customers' },
  { key: 'segments', label: 'Segments' },
  { key: 'vip', label: 'VIPs' },
  { key: 'churn', label: 'Churn Risk' },
  { key: 'complaints', label: 'Complaints' },
]

const COMPLAINT_TYPES = [
  { value: 'food_quality', label: 'Food Quality' },
  { value: 'order_accuracy', label: 'Order Accuracy' },
  { value: 'wait_time', label: 'Wait Time' },
  { value: 'delivery', label: 'Delivery Issue' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'other', label: 'Other' },
]

const COMPLAINT_BADGE: Record<string, 'green' | 'red' | 'amber' | 'grey'> = {
  food_quality: 'red', order_accuracy: 'red', wait_time: 'amber',
  delivery: 'amber', customer_service: 'amber', other: 'grey',
}

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [complaintFormOpen, setComplaintFormOpen] = useState(false)
  const [cType, setCType] = useState('food_quality')
  const [cDesc, setCDesc] = useState('')
  const [cOrderRef, setCOrderRef] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('lifetime_value', { ascending: false })
        .limit(500)
      if (error) throw error
      return data as Customer[]
    },
  })

  const customers = data ?? []

  const { data: complaints } = useQuery({
    queryKey: ['customer-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data
    },
  })

  const addComplaint = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('customer_complaints').insert({
        complaint_type: cType,
        description: cDesc || null,
        order_ref: cOrderRef || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-complaints'] })
      setComplaintFormOpen(false)
      setCDesc('')
      setCOrderRef('')
    },
  })

  const filtered = customers.filter((c) => {
    if (search) {
      const q = search.toLowerCase()
      if (!c.name?.toLowerCase().includes(q) && !c.phone?.includes(q) && !c.email?.toLowerCase().includes(q)) return false
    }
    if (activeTab === 'vip') return c.segment === 'vip' || c.segment === 'high_value'
    if (activeTab === 'churn') return c.segment === 'lapsed' || c.segment === 'at_risk'
    return true
  })

  // Segment counts
  const segments: Record<string, number> = {}
  customers.forEach((c) => { if (c.segment) segments[c.segment] = (segments[c.segment] || 0) + 1 })

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((s, c) => s + c.lifetime_value, 0)
  const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const atRisk = customers.filter((c) => c.segment === 'at_risk' || c.segment === 'lapsed').length

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Customer Intelligence"
        subtitle="Customer database, segments, VIPs, churn risk, and complaints"
        colour="purple"
        action={activeTab === 'complaints' ? <Button onClick={() => setComplaintFormOpen(true)}>+ Log Complaint</Button> : undefined}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Total Customers" value={String(totalCustomers)} accent="blue" />
        <Stat label="Total Revenue" value={formatGBP(totalRevenue)} accent="green" />
        <Stat label="Avg Lifetime Value" value={formatGBP(avgLTV)} accent="green" />
        <Stat label="At Risk / Lapsed" value={String(atRisk)} accent={atRisk > 0 ? 'red' : 'green'} />
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'complaints' ? (
        <div className="space-y-4">
          {/* Complaint type summary */}
          {(complaints ?? []).length > 0 && (() => {
            const typeCounts: Record<string, number> = {}
            ;(complaints ?? []).forEach((c: { complaint_type?: string }) => {
              if (c.complaint_type) typeCounts[c.complaint_type] = (typeCounts[c.complaint_type] || 0) + 1
            })
            return (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(typeCounts).map(([type, count]) => (
                  <div key={type} className="p-3 bg-surface rounded-xl border border-border text-center">
                    <Badge variant={COMPLAINT_BADGE[type] ?? 'grey'}>{type.replace('_', ' ')}</Badge>
                    <p className="font-mono font-semibold text-dark text-lg mt-1">{count}</p>
                  </div>
                ))}
              </div>
            )
          })()}
          <Card title={`Complaints (${(complaints ?? []).length})`}>
            {!(complaints ?? []).length ? (
              <EmptyState icon="💬" title="No complaints logged" message="Log customer complaints to track trends and resolutions." />
            ) : (
              <Table<Row>
                columns={[
                  { key: 'created_at', header: 'Date', render: (r) => (r.created_at as string).slice(0, 10) },
                  { key: 'complaint_type', header: 'Type', render: (r) => (
                    <Badge variant={COMPLAINT_BADGE[r.complaint_type as string] ?? 'grey'}>
                      {(r.complaint_type as string).replace('_', ' ')}
                    </Badge>
                  )},
                  { key: 'order_ref', header: 'Order Ref', render: (r) => (r.order_ref as string) || '—' },
                  { key: 'description', header: 'Description', render: (r) => (r.description as string) || '—' },
                  { key: 'resolution', header: 'Resolution', render: (r) => (r.resolution as string) || (
                    <Badge variant="amber">Pending</Badge>
                  )},
                ]}
                data={(complaints ?? []) as unknown as Row[]}
              />
            )}
          </Card>
        </div>
      ) : activeTab === 'segments' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(segments).map(([seg, count]) => (
            <Card key={seg} title="">
              <div className="text-center py-2">
                <Badge variant={SEGMENT_BADGE[seg] ?? 'grey'}>{seg}</Badge>
                <p className="font-mono font-semibold text-dark text-2xl mt-2">{count}</p>
                <p className="font-body text-xs text-muted">customers</p>
              </div>
            </Card>
          ))}
          {!Object.keys(segments).length && (
            <div className="col-span-3">
              <EmptyState icon="👥" title="No segment data yet" message="Customer segments are assigned automatically from order history." />
            </div>
          )}
        </div>
      ) : (
        <Card title={activeTab === 'vip' ? 'VIP Customers' : activeTab === 'churn' ? 'Churn Risk' : 'All Customers'}>
          <div className="space-y-3">
            <Input
              label=""
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isLoading ? (
              <div className="animate-pulse h-48 bg-surface rounded-xl" />
            ) : !filtered.length ? (
              <EmptyState icon="👤" title="No customers found" message="Customer data is populated from app orders." />
            ) : (
              <Table<Row>
                columns={[
                  { key: 'name', header: 'Customer', render: (r) => (r.name as string) || <span className="text-muted">Anonymous</span> },
                  { key: 'phone', header: 'Phone', render: (r) => (r.phone as string) || '—' },
                  { key: 'segment', header: 'Segment', render: (r) => r.segment
                    ? <Badge variant={SEGMENT_BADGE[r.segment as string] ?? 'grey'}>{r.segment as string}</Badge>
                    : <span className="text-muted">—</span>
                  },
                  { key: 'total_orders', header: 'Orders', render: (r) => String(r.total_orders) },
                  { key: 'lifetime_value', header: 'Lifetime Value', render: (r) => (
                    <span className="font-mono font-medium">{formatGBP(r.lifetime_value as number)}</span>
                  )},
                  { key: 'avg_order_value', header: 'AOV', render: (r) => formatGBP(r.avg_order_value as number) },
                  { key: 'last_order_date', header: 'Last Order', render: (r) => (r.last_order_date as string) || '—' },
                  { key: 'loyalty_points', header: 'Points', render: (r) => String(r.loyalty_points) },
                ]}
                data={filtered as unknown as Row[]}
              />
            )}
          </div>
        </Card>
      )}

      <Modal isOpen={complaintFormOpen} onClose={() => setComplaintFormOpen(false)} title="Log Complaint" size="sm">
        <div className="space-y-4">
          <Select label="Complaint Type" options={COMPLAINT_TYPES} value={cType} onChange={(e) => setCType(e.target.value)} />
          <Input label="Order Reference" placeholder="Optional" value={cOrderRef} onChange={(e) => setCOrderRef(e.target.value)} />
          <div>
            <label className="block font-body text-sm font-medium text-dark mb-1.5">Description</label>
            <textarea
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-body text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={3}
              placeholder="Describe the complaint..."
              value={cDesc}
              onChange={(e) => setCDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setComplaintFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addComplaint.mutate()} loading={addComplaint.isPending}>Log Complaint</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
