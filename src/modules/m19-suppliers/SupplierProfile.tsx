import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useIngredients } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { Supplier, Delivery } from '@/types/stock'

interface Props {
  supplier: Supplier
  onEdit: () => void
  onBack: () => void
}

export function SupplierProfile({ supplier, onEdit, onBack }: Props) {
  const { data: deliveries } = useQuery({
    queryKey: ['supplier-deliveries', supplier.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('supplier_id', supplier.id)
        .order('delivered_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return data as Delivery[]
    },
  })

  const { data: ingredients } = useIngredients()
  const suppliedIngredients = (ingredients ?? []).filter((i) => i.supplier_id === supplier.id)

  const totalSpend = (deliveries ?? []).reduce((s, d) => s + (d.total_cost ?? 0), 0)
  const lastDelivery = deliveries?.[0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-2xl text-dark">{supplier.name}</h2>
          {supplier.contact_name && (
            <p className="font-body text-sm text-muted mt-0.5">Contact: {supplier.contact_name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="outline" onClick={onBack}>← Back</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card title=""><div className="text-center py-1">
          <p className="font-body text-xs text-muted">Payment Terms</p>
          <p className="font-mono font-semibold text-dark">{supplier.payment_terms_days} days</p>
        </div></Card>
        <Card title=""><div className="text-center py-1">
          <p className="font-body text-xs text-muted">Total Spend</p>
          <p className="font-mono font-semibold text-dark">{formatGBP(totalSpend)}</p>
        </div></Card>
        <Card title=""><div className="text-center py-1">
          <p className="font-body text-xs text-muted">Deliveries</p>
          <p className="font-mono font-semibold text-dark">{deliveries?.length ?? 0}</p>
        </div></Card>
        <Card title=""><div className="text-center py-1">
          <p className="font-body text-xs text-muted">Last Delivery</p>
          <p className="font-mono font-semibold text-dark text-sm">
            {lastDelivery ? lastDelivery.delivered_at.slice(0, 10) : '—'}
          </p>
        </div></Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-body text-sm">
        {supplier.phone && <div><span className="text-muted">Phone: </span>{supplier.phone}</div>}
        {supplier.email && <div><span className="text-muted">Email: </span>{supplier.email}</div>}
        {supplier.account_number && <div><span className="text-muted">Account: </span>{supplier.account_number}</div>}
        {supplier.minimum_order_value && (
          <div><span className="text-muted">Min Order: </span>{formatGBP(supplier.minimum_order_value)}</div>
        )}
        {supplier.website && (
          <div><span className="text-muted">Website: </span>
            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {supplier.website}
            </a>
          </div>
        )}
      </div>

      {suppliedIngredients.length > 0 && (
        <Card title="Supplied Ingredients">
          <div className="flex flex-wrap gap-2">
            {suppliedIngredients.map((i) => (
              <Badge key={i.id} variant="grey">{i.name}</Badge>
            ))}
          </div>
        </Card>
      )}

      <Card title="Recent Deliveries">
        {!deliveries?.length ? (
          <EmptyState icon="📦" title="No deliveries yet" message="Deliveries from this supplier will appear here." />
        ) : (
          <div className="space-y-2">
            {deliveries.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2 bg-surface rounded-xl">
                <span className="font-body text-sm text-dark">{d.delivered_at.slice(0, 10)}</span>
                {d.delivery_note_ref && (
                  <span className="font-body text-xs text-muted">Ref: {d.delivery_note_ref}</span>
                )}
                <span className="font-mono text-sm font-medium">{formatGBP(d.total_cost ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {supplier.notes && (
        <Card title="Notes">
          <p className="font-body text-sm text-dark">{supplier.notes}</p>
        </Card>
      )}
    </div>
  )
}
