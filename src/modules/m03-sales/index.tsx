import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SalesStats } from './SalesStats'
import { LiveSalesBoard } from './LiveSalesBoard'
import { SalesByChannel } from './SalesByChannel'
import { SalesHistory } from './SalesHistory'
import { SaleEntryForm } from './SaleEntryForm'

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'history', label: 'History' },
]

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('today')
  const [saleFormOpen, setSaleFormOpen] = useState(false)

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

      {activeTab === 'history' && <SalesHistory />}

      <SaleEntryForm isOpen={saleFormOpen} onClose={() => setSaleFormOpen(false)} />
    </div>
  )
}
