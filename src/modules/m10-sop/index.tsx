import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { DeleteConfirm } from '@/components/ui/DeleteConfirm'
import { SOPStats } from './SOPStats'
import { SOPList } from './SOPList'
import { SOPViewer } from './SOPViewer'
import { SOPForm } from './SOPForm'
import { AcknowledgementLog } from './AcknowledgementLog'
import { SOPSeeder } from './SOPSeeder'
import { useDeleteSOP } from '@/lib/queries'
import toast from 'react-hot-toast'
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
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null)
  const deleteSOP = useDeleteSOP()

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
        <SOPList onSelect={setSelectedSOP} onDelete={(id, label) => setPendingDelete({ id, label })} />
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
      <DeleteConfirm
        isOpen={!!pendingDelete}
        label={pendingDelete?.label ?? ''}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          await deleteSOP.mutateAsync(pendingDelete!.id)
          toast.success('SOP deleted')
        }}
      />
    </div>
  )
}
