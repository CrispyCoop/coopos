import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const EXPORTS = [
  { label: 'Sales Records', table: 'sales_records', cols: ['id','date','channel','gross_revenue','tip','transaction_fee','net_revenue','items_json','created_at'] },
  { label: 'Transactions / Expenses', table: 'transactions', cols: ['id','date','type','category','description','amount','reference','created_at'] },
  { label: 'Waste Log', table: 'waste_logs', cols: ['id','logged_at','ingredient_id','quantity','unit','reason','estimated_cost','shift','logged_by','created_at'] },
  { label: 'Stock Movements', table: 'stock_movements', cols: ['id','moved_at','ingredient_id','quantity','unit','movement_type','reference','created_at'] },
  { label: 'Deliveries', table: 'deliveries', cols: ['id','delivered_at','supplier_id','invoice_ref','total_cost','status','created_at'] },
  { label: 'Staff Members', table: 'staff_members', cols: ['id','name','role','email','phone','start_date','food_hygiene_expiry','status'] },
  { label: 'Rota Shifts', table: 'rota_shifts', cols: ['id','week_id','staff_member_id','date','start_time','end_time','location','confirmed'] },
  { label: 'Customer Orders', table: 'customer_orders', cols: ['id','customer_id','ordered_at','channel','total_spent','items_json','created_at'] },
  { label: 'Complaints', table: 'customer_complaints', cols: ['id','customer_id','received_at','category','description','status','resolved_at'] },
  { label: 'Equipment Items', table: 'equipment_items', cols: ['id','name','category','serial_number','purchased_at','warranty_expiry','status'] },
]

function toCSV(rows: Record<string, unknown>[], cols: string[]) {
  const header = cols.join(',')
  const body = rows.map((r) =>
    cols.map((c) => {
      const v = r[c]
      if (v === null || v === undefined) return ''
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  )
  return [header, ...body].join('\n')
}

export function DataExport() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleExport(table: string, cols: string[], label: string) {
    setLoading(table)
    try {
      const { data, error } = await supabase.from(table).select(cols.join(','))
      if (error) throw error
      const csv = toCSV((data ?? []) as unknown as Record<string, unknown>[], cols)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coopos_${table}_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${label} exported`)
    } catch {
      toast.error(`Failed to export ${label}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card title="Data Export">
      <p className="font-body text-sm text-muted mb-6">
        Download any module's data as CSV. All dates are ISO 8601 UTC.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPORTS.map((e) => (
          <div key={e.table} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
            <span className="font-body text-sm font-medium text-dark">{e.label}</span>
            <Button
              size="sm"
              variant="secondary"
              loading={loading === e.table}
              onClick={() => handleExport(e.table, e.cols, e.label)}
            >
              Export
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
