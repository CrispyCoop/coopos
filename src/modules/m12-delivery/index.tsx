import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlatformOverview } from './PlatformOverview'
import { PlatformForm } from './PlatformForm'
import { DisputeList } from './DisputeList'
import { DisputeForm } from './DisputeForm'
import { PayoutReconciliation } from './PayoutReconciliation'
import { RatingHistory } from './RatingHistory'

const TABS = [
  { key: 'overview', label: 'Platforms' },
  { key: 'disputes', label: 'Disputes' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'ratings', label: 'Ratings' },
]

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [platformFormOpen, setPlatformFormOpen] = useState(false)
  const [disputeFormOpen, setDisputeFormOpen] = useState(false)

  const getAction = () => {
    if (activeTab === 'overview') return (
      <Button onClick={() => setPlatformFormOpen(true)}>+ Add Platform</Button>
    )
    if (activeTab === 'disputes') return (
      <Button onClick={() => setDisputeFormOpen(true)}>+ Log Dispute</Button>
    )
    return null
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Delivery Partner Hub"
        subtitle="Manage platforms, track disputes, and reconcile payouts"
        colour="blue"
        action={getAction()}
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && <PlatformOverview />}

      {activeTab === 'disputes' && (
        <Card title="Delivery Disputes">
          <DisputeList />
        </Card>
      )}

      {activeTab === 'payouts' && (
        <Card title="Payout Reconciliation">
          <PayoutReconciliation />
        </Card>
      )}

      {activeTab === 'ratings' && (
        <Card title="Rating History">
          <RatingHistory />
        </Card>
      )}

      <PlatformForm isOpen={platformFormOpen} onClose={() => setPlatformFormOpen(false)} />
      <DisputeForm isOpen={disputeFormOpen} onClose={() => setDisputeFormOpen(false)} />
    </div>
  )
}
