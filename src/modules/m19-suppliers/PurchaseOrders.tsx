import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSuppliers, useIngredients } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'

type Row = Record<string, unknown>
type POStatus = 'draft' | 'sent' | 'received' | 'partial' | 'cancelled'

const STATUS_BADGE: Record<POStatus, 'grey' | 'blue' | 'green' | 'amber' | 'red'> = {
  draft: 'grey', sent: 'blue', received: 'green', partial: 'amber', cancelled: 'red',
}

interface POLine { ingredient_id: string; quantity: number; unit: string; unit_cost: number }

export function PurchaseOrders() {
  const qc = useQueryClient()
  const { data: suppliers } = useSuppliers()
  const { data: ingredients } = useIngredients()
  const [formOpen, setFormOpen] = useState(false)
  const [supplierId, setSupplierId] = useState('')
  const [lines, setLines] = useState<POLine[]>([{ ingredient_id: '', quantity: 1, unit: '', unit_cost: 0 }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, suppliers(name)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
  })

  const supplierOptions = [
    { value: '', label: 'Select supplier...' },
    ...(suppliers ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  const ingredientOptions = [
    { value: '', label: 'Select ingredient...' },
    ...(ingredients ?? []).map((i) => ({ value: i.id, label: `${i.name} (${i.unit})` })),
  ]

  const addLine = () => setLines((prev) => [...prev, { ingredient_id: '', quantity: 1, unit: '', unit_cost: 0 }])
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx))
  const updateLine = (idx: number, field: keyof POLine, value: string | number) => {
    setLines((prev) => prev.map((l, i) => {
      if (i !== idx) return l
      if (field === 'ingredient_id') {
        const ing = (ingredients ?? []).find((x) => x.id === value)
        return { ...l, ingredient_id: value as string, unit: ing?.unit ?? '', unit_cost: ing?.cost_per_unit ?? 0 }
      }
      return { ...l, [field]: value }
    }))
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.unit_cost, 0)

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: po, error: poErr } = await supabase
        .from('purchase_orders')
        .insert({ supplier_id: supplierId, status: 'draft', total_value: total, order_date: todayISO() })
        .select().single()
      if (poErr) throw poErr

      const items = lines
        .filter((l) => l.ingredient_id)
        .map((l) => ({ purchase_order_id: po.id, ingredient_id: l.ingredient_id, quantity_ordered: l.quantity, unit: l.unit, unit_cost: l.unit_cost }))
      if (items.length) {
        const { error: itemErr } = await supabase.from('purchase_order_items').insert(items)
        if (itemErr) throw itemErr
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
      setFormOpen(false)
      setSupplierId('')
      setLines([{ ingredient_id: '', quantity: 1, unit: '', unit_cost: 0 }])
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>+ New Purchase Order</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-48 bg-surface rounded-xl" />
      ) : !data?.length ? (
        <EmptyState icon="📋" title="No purchase orders" message="Create your first PO to track supplier orders." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'order_date', header: 'Date', render: (r) => r.order_date as string },
            { key: 'supplier', header: 'Supplier', render: (r) => {
              const s = r.suppliers as { name: string } | null
              return s?.name ?? '—'
            }},
            { key: 'total_value', header: 'Value', render: (r) => formatGBP(r.total_value as number) },
            { key: 'status', header: 'Status', render: (r) => (
              <Badge variant={STATUS_BADGE[r.status as POStatus] ?? 'grey'}>{r.status as string}</Badge>
            )},
          ]}
          data={(data ?? []) as unknown as Row[]}
        />
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="New Purchase Order" size="lg">
        <div className="space-y-4">
          <Select label="Supplier" options={supplierOptions} value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />

          <div className="space-y-2">
            <p className="font-body text-sm font-medium text-dark">Order Lines</p>
            {lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Select
                    label=""
                    options={ingredientOptions}
                    value={line.ingredient_id}
                    onChange={(e) => updateLine(idx, 'ingredient_id', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label=""
                    type="number"
                    step="0.1"
                    placeholder="Qty"
                    value={String(line.quantity)}
                    onChange={(e) => updateLine(idx, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Input label="" placeholder="Unit" value={line.unit} onChange={(e) => updateLine(idx, 'unit', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input
                    label=""
                    type="number"
                    step="0.01"
                    placeholder="£/unit"
                    value={String(line.unit_cost)}
                    onChange={(e) => updateLine(idx, 'unit_cost', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-1">
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700 text-xl font-body">×</button>
                  )}
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addLine}>+ Add Line</Button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-body text-sm font-medium text-dark">Total</span>
            <span className="font-mono font-semibold text-dark">{formatGBP(total)}</span>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => { setIsSubmitting(true); await mutation.mutateAsync(); setIsSubmitting(false) }}
              loading={isSubmitting}
              disabled={!supplierId}
            >
              Create PO
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
