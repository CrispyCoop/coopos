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

interface Equipment {
  id: string
  name: string
  category: string
  serial_number: string | null
  purchase_date: string | null
  purchase_cost: number | null
  next_service_date: string | null
  warranty_expiry: string | null
  notes: string | null
}

const TABS = [
  { key: 'register', label: 'Equipment' },
  { key: 'services', label: 'Service History' },
  { key: 'repairs', label: 'Repairs' },
]

const CAT_OPTIONS = [
  { value: 'cooking', label: 'Cooking' },
  { value: 'refrigeration', label: 'Refrigeration' },
  { value: 'ventilation', label: 'Ventilation' },
  { value: 'pos', label: 'POS / IT' },
  { value: 'other', label: 'Other' },
]

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState('register')
  const [equipFormOpen, setEquipFormOpen] = useState(false)
  const [serviceFormOpen, setServiceFormOpen] = useState(false)
  const [repairFormOpen, setRepairFormOpen] = useState(false)
  const [selectedEquip, setSelectedEquip] = useState('')
  const qc = useQueryClient()
  const today = todayISO()
  const in14Days = new Date(); in14Days.setDate(in14Days.getDate() + 14)
  const in14ISO = in14Days.toISOString().split('T')[0]

  // Equipment state
  const [eName, setEName] = useState('')
  const [eCat, setECat] = useState('cooking')
  const [eSerial, setESerial] = useState('')
  const [ePurchaseDate, setEPurchaseDate] = useState('')
  const [eCost, setECost] = useState('')
  const [eNextService, setENextService] = useState('')
  const [eWarranty, setEWarranty] = useState('')

  // Service state
  const [sDate, setSDate] = useState(todayISO())
  const [sProvider, setSProvider] = useState('')
  const [sCost, setSCost] = useState('')
  const [sNotes, setSNotes] = useState('')

  // Repair state
  const [rDate, setRDate] = useState(todayISO())
  const [rIssue, setRIssue] = useState('')
  const [rCost, setRCost] = useState('')
  const [rNotes, setRNotes] = useState('')

  const { data: equipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('*').order('name')
      if (error) throw error
      return data as Equipment[]
    },
  })

  const { data: services } = useQuery({
    queryKey: ['equipment-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_services')
        .select('*, equipment(name)')
        .order('service_date', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
  })

  const { data: repairs } = useQuery({
    queryKey: ['equipment-repairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_repairs')
        .select('*, equipment(name)')
        .order('repair_date', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
  })

  const equipOptions = [
    { value: '', label: 'Select equipment...' },
    ...(equipment ?? []).map((e) => ({ value: e.id, label: e.name })),
  ]

  const addEquipment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('equipment').insert({
        name: eName, category: eCat, serial_number: eSerial || null,
        purchase_date: ePurchaseDate || null, purchase_cost: eCost ? Number(eCost) : null,
        next_service_date: eNextService || null, warranty_expiry: eWarranty || null,
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); setEquipFormOpen(false); setEName('') },
  })

  const addService = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('equipment_services').insert({
        equipment_id: selectedEquip, service_date: sDate, provider: sProvider || null,
        cost: sCost ? Number(sCost) : null, notes: sNotes || null,
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment-services'] }); setServiceFormOpen(false); setSProvider(''); setSCost(''); setSNotes('') },
  })

  const addRepair = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('equipment_repairs').insert({
        equipment_id: selectedEquip, repair_date: rDate, issue: rIssue,
        cost: rCost ? Number(rCost) : null, notes: rNotes || null,
      })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment-repairs'] }); setRepairFormOpen(false); setRIssue(''); setRCost('') },
  })

  const overdue = (equipment ?? []).filter((e) => e.next_service_date && e.next_service_date < today)
  const dueSoon = (equipment ?? []).filter((e) => e.next_service_date && e.next_service_date >= today && e.next_service_date <= in14ISO)

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Equipment & Maintenance"
        subtitle="Register equipment, log services and repairs, track warranties"
        colour="yellow"
        action={
          activeTab === 'register' ? <Button onClick={() => setEquipFormOpen(true)}>+ Add Equipment</Button> :
          activeTab === 'services' ? <Button onClick={() => setServiceFormOpen(true)}>+ Log Service</Button> :
          <Button onClick={() => setRepairFormOpen(true)}>+ Log Repair</Button>
        }
      />

      {(overdue.length > 0 || dueSoon.length > 0) && (
        <div className="space-y-2">
          {overdue.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span>⚠️</span>
              <p className="font-body text-sm text-red-700 font-medium">
                {e.name} — service overdue (was due {e.next_service_date})
              </p>
            </div>
          ))}
          {dueSoon.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span>🔧</span>
              <p className="font-body text-sm text-amber-700">
                {e.name} — service due {e.next_service_date}
              </p>
            </div>
          ))}
        </div>
      )}

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'register' && (
        <Card title="Equipment Register">
          {!(equipment ?? []).length ? (
            <EmptyState icon="🔧" title="No equipment logged" message="Add your kitchen and POS equipment." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'name', header: 'Equipment', render: (r) => <span className="font-medium">{r.name as string}</span> },
                { key: 'category', header: 'Category', render: (r) => <Badge variant="grey">{r.category as string}</Badge> },
                { key: 'serial_number', header: 'Serial', render: (r) => (r.serial_number as string) || '—' },
                { key: 'next_service_date', header: 'Next Service', render: (r) => {
                  const d = r.next_service_date as string | null
                  if (!d) return <span className="text-muted">—</span>
                  return <Badge variant={d < today ? 'red' : d <= in14ISO ? 'amber' : 'green'}>{d}</Badge>
                }},
                { key: 'purchase_cost', header: 'Purchase Cost', render: (r) =>
                  r.purchase_cost != null ? formatGBP(r.purchase_cost as number) : '—'
                },
                { key: 'warranty_expiry', header: 'Warranty', render: (r) => {
                  const w = r.warranty_expiry as string | null
                  if (!w) return <span className="text-muted">—</span>
                  return <Badge variant={w < today ? 'red' : 'green'}>{w}</Badge>
                }},
              ]}
              data={(equipment ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'services' && (
        <Card title="Service History">
          {!(services ?? []).length ? (
            <EmptyState icon="🔩" title="No services logged" message="Record equipment services and maintenance visits." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'service_date', header: 'Date', render: (r) => r.service_date as string },
                { key: 'equipment', header: 'Equipment', render: (r) => {
                  const e = r.equipment as { name: string } | null
                  return e?.name ?? '—'
                }},
                { key: 'provider', header: 'Provider', render: (r) => (r.provider as string) || '—' },
                { key: 'cost', header: 'Cost', render: (r) => r.cost != null ? formatGBP(r.cost as number) : '—' },
                { key: 'notes', header: 'Notes', render: (r) => (r.notes as string) || '—' },
              ]}
              data={(services ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'repairs' && (
        <Card title="Repair Log">
          {!(repairs ?? []).length ? (
            <EmptyState icon="🛠️" title="No repairs logged" message="Record breakdowns and repair costs." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'repair_date', header: 'Date', render: (r) => r.repair_date as string },
                { key: 'equipment', header: 'Equipment', render: (r) => {
                  const e = r.equipment as { name: string } | null
                  return e?.name ?? '—'
                }},
                { key: 'issue', header: 'Issue', render: (r) => r.issue as string },
                { key: 'cost', header: 'Cost', render: (r) => r.cost != null ? formatGBP(r.cost as number) : '—' },
                { key: 'notes', header: 'Notes', render: (r) => (r.notes as string) || '—' },
              ]}
              data={(repairs ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {/* Add Equipment */}
      <Modal isOpen={equipFormOpen} onClose={() => setEquipFormOpen(false)} title="Add Equipment" size="md">
        <div className="space-y-4">
          <Input label="Equipment Name" value={eName} onChange={(e) => setEName(e.target.value)} />
          <Select label="Category" options={CAT_OPTIONS} value={eCat} onChange={(e) => setECat(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Serial Number" value={eSerial} onChange={(e) => setESerial(e.target.value)} />
            <Input label="Purchase Cost (£)" type="number" step="0.01" value={eCost} onChange={(e) => setECost(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Purchase Date" type="date" value={ePurchaseDate} onChange={(e) => setEPurchaseDate(e.target.value)} />
            <Input label="Next Service Due" type="date" value={eNextService} onChange={(e) => setENextService(e.target.value)} />
          </div>
          <Input label="Warranty Expiry" type="date" value={eWarranty} onChange={(e) => setEWarranty(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setEquipFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addEquipment.mutate()} loading={addEquipment.isPending} disabled={!eName}>Add Equipment</Button>
          </div>
        </div>
      </Modal>

      {/* Log Service */}
      <Modal isOpen={serviceFormOpen} onClose={() => setServiceFormOpen(false)} title="Log Service" size="sm">
        <div className="space-y-4">
          <Select label="Equipment" options={equipOptions} value={selectedEquip} onChange={(e) => setSelectedEquip(e.target.value)} />
          <Input label="Service Date" type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} />
          <Input label="Provider / Engineer" value={sProvider} onChange={(e) => setSProvider(e.target.value)} />
          <Input label="Cost (£)" type="number" step="0.01" value={sCost} onChange={(e) => setSCost(e.target.value)} />
          <Input label="Notes" value={sNotes} onChange={(e) => setSNotes(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setServiceFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addService.mutate()} loading={addService.isPending} disabled={!selectedEquip}>Log Service</Button>
          </div>
        </div>
      </Modal>

      {/* Log Repair */}
      <Modal isOpen={repairFormOpen} onClose={() => setRepairFormOpen(false)} title="Log Repair" size="sm">
        <div className="space-y-4">
          <Select label="Equipment" options={equipOptions} value={selectedEquip} onChange={(e) => setSelectedEquip(e.target.value)} />
          <Input label="Repair Date" type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} />
          <Input label="Issue Description" value={rIssue} onChange={(e) => setRIssue(e.target.value)} />
          <Input label="Cost (£)" type="number" step="0.01" value={rCost} onChange={(e) => setRCost(e.target.value)} />
          <Input label="Notes" value={rNotes} onChange={(e) => setRNotes(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setRepairFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addRepair.mutate()} loading={addRepair.isPending} disabled={!selectedEquip || !rIssue}>Log Repair</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
