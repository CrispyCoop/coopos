import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { SOPStats } from './SOPStats'
import { SOPList } from './SOPList'
import { SOPViewer } from './SOPViewer'
import { SOPForm } from './SOPForm'
import { AcknowledgementLog } from './AcknowledgementLog'
import { SOPSeeder } from './SOPSeeder'
import type { SOP } from './types'

const TABS = [
  { key: 'sops', label: 'SOP Library' },
  { key: 'acknowledgements', label: 'Acknowledgements' },
]

export default function SOPPage() {
  const [activeTab, setActiveTab] = useState('sops')
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null)

  function handleEdit(sop: SOP) {
    setSelectedSOP(null)
    setEditingSOP(sop)
    setFormOpen(true)
  }

  function handleNewSOP() {
    setEditingSOP(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="SOP Library"
        subtitle="Standard Operating Procedures — training, compliance, and acknowledgements"
        colour="blue"
        action={<Button onClick={handleNewSOP}>+ New SOP</Button>}
      />

      <SOPSeeder />
      <SOPStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'sops' && (
        <SOPList onSelect={setSelectedSOP} />
      )}
      {activeTab === 'acknowledgements' && (
        <AcknowledgementLog />
      )}

      <SOPViewer
        sop={selectedSOP}
        onClose={() => setSelectedSOP(null)}
        onEdit={handleEdit}
      />

      <SOPForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingSOP(null) }}
        sop={editingSOP}
      />
    </div>
  )
}
