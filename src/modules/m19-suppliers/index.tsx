import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SupplierList } from './SupplierList'
import { SupplierForm } from './SupplierForm'
import { SupplierProfile } from './SupplierProfile'
import { PriceHistory } from './PriceHistory'
import { PurchaseOrders } from './PurchaseOrders'
import type { Supplier } from '@/types/stock'

const TABS = [
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'prices', label: 'Price History' },
  { key: 'orders', label: 'Purchase Orders' },
]

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState('suppliers')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [editing, setEditing] = useState<Supplier | null>(null)

  if (selected) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Suppliers" subtitle={selected.name} colour="green" />
        <SupplierProfile
          supplier={selected}
          onEdit={() => { setEditing(selected); setFormOpen(true) }}
          onBack={() => setSelected(null)}
        />
        <SupplierForm isOpen={formOpen} onClose={() => setFormOpen(false)} existing={editing} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Supplier Management"
        subtitle="Manage suppliers, track price changes, and create purchase orders"
        colour="green"
        action={
          activeTab === 'suppliers'
            ? <Button onClick={() => { setEditing(null); setFormOpen(true) }}>+ Add Supplier</Button>
            : undefined
        }
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'suppliers' && (
        <Card title="All Suppliers">
          <SupplierList onSelect={setSelected} />
        </Card>
      )}

      {activeTab === 'prices' && (
        <Card title="Price Change History">
          <PriceHistory />
        </Card>
      )}

      {activeTab === 'orders' && <PurchaseOrders />}

      <SupplierForm isOpen={formOpen} onClose={() => setFormOpen(false)} existing={editing} />
    </div>
  )
}
