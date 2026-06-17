import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DeleteConfirm } from '@/components/ui/DeleteConfirm'
import { SalesStats } from './SalesStats'
import { LiveSalesBoard } from './LiveSalesBoard'
import { SalesByChannel } from './SalesByChannel'
import { SalesHistory } from './SalesHistory'
import { SaleEntryForm } from './SaleEntryForm'
import { useDeleteSaleRecord } from '@/lib/queries'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'history', label: 'History' },
]

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('today')
  const [saleFormOpen, setSaleFormOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null)
  const deleteSale = useDeleteSaleRecord()

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Sales & Revenue"
        subtitle="Log sales, track channels, and monitor daily performance"
        colour="red"
        action={<Button onClick={() => setSaleFormOpen(true)}>+ Log Sale</Button>}
      />

      <SalesStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Today's Sales">
              <LiveSalesBoard />
            </Card>
          </div>
          <Card title="By Channel">
            <SalesByChannel />
          </Card>
        </div>
      )}

      {activeTab === 'history' && <SalesHistory onDelete={(id, label) => setPendingDelete({ id, label })} />}

      <SaleEntryForm isOpen={saleFormOpen} onClose={() => setSaleFormOpen(false)} />
      <DeleteConfirm
        isOpen={!!pendingDelete}
        label={pendingDelete?.label ?? ''}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          await deleteSale.mutateAsync(pendingDelete!.id)
          toast.success('Sale record deleted')
        }}
      />
    </div>
  )
}
