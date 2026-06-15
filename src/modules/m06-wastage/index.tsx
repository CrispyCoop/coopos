import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConnectionTag } from '@/components/shared/ConnectionTag'
import { WasteStats } from './WasteStats'
import { WasteEntryForm } from './WasteEntryForm'
import { WasteLog } from './WasteLog'
import { WasteByReason } from './WasteByReason'
import { WasteTrend } from './WasteTrend'

const TABS = [
  { key: 'log', label: 'Waste Log' },
  { key: 'analytics', label: 'Analytics' },
]

export default function WastagePage() {
  const [activeTab, setActiveTab] = useState('log')
  const [logFormOpen, setLogFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Wastage"
        subtitle="Track and analyse food waste to protect your margins"
        colour="yellow"
        action={<Button onClick={() => setLogFormOpen(true)}>+ Log Waste</Button>}
      />

      <div className="flex gap-2">
        <ConnectionTag module="stock" />
        <ConnectionTag module="finance" />
      </div>

      <WasteStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'log' && <WasteLog />}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Waste by Reason">
            <WasteByReason />
          </Card>
          <Card title="14-Day Trend">
            <WasteTrend />
          </Card>
        </div>
      )}

      <WasteEntryForm isOpen={logFormOpen} onClose={() => setLogFormOpen(false)} />
    </div>
  )
}
