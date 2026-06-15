import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CashStats } from './CashStats'
import { TillCountForm } from './TillCountForm'
import { TillLog } from './TillLog'
import { PlatformPayouts } from './PlatformPayouts'

const TABS = [
  { key: 'till', label: 'Till Counts' },
  { key: 'payouts', label: 'Platform Payouts' },
]

export default function CashPage() {
  const [activeTab, setActiveTab] = useState('till')
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cash & Till"
        subtitle="Till counts, floats, variances, and platform payout reconciliation"
        colour="green"
        action={<Button onClick={() => setFormOpen(true)}>+ Till Count</Button>}
      />

      <CashStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'till' && (
        <Card title="Till Count History">
          <TillLog />
        </Card>
      )}

      {activeTab === 'payouts' && (
        <Card title="Platform Payouts">
          <PlatformPayouts />
        </Card>
      )}

      <TillCountForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
