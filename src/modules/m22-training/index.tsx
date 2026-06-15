import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TrainingOverview } from './TrainingOverview'
import { TrainingRecords } from './TrainingRecords'
import { TrainingForm } from './TrainingForm'
import { SOPSignoffs } from './SOPSignoffs'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'records', label: 'Training Records' },
  { key: 'signoffs', label: 'SOP Sign-offs' },
]

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Training & Development"
        subtitle="Training records, certifications, and SOP sign-off compliance"
        colour="blue"
        action={
          activeTab === 'records'
            ? <Button onClick={() => setFormOpen(true)}>+ Log Training</Button>
            : undefined
        }
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <Card title="Training Compliance">
          <TrainingOverview />
        </Card>
      )}

      {activeTab === 'records' && (
        <Card title="Training Records">
          <TrainingRecords />
        </Card>
      )}

      {activeTab === 'signoffs' && (
        <Card title="SOP Sign-off Matrix">
          <SOPSignoffs />
        </Card>
      )}

      <TrainingForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
