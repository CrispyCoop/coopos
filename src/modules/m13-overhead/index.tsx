import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OverheadList } from './OverheadList'
import { OverheadForm } from './OverheadForm'
import { OverheadSummary } from './OverheadSummary'
import { WagesManager } from './WagesManager'
import type { OverheadItem } from '@/types/finance'
import { useOverheadItems } from '@/lib/queries'

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'items', label: 'Overhead Items' },
  { key: 'wages', label: 'Wages' },
]

export default function OverheadPage() {
  const [activeTab, setActiveTab] = useState('summary')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OverheadItem | null>(null)
  const { data } = useOverheadItems()

  const handleSelect = (id: string) => {
    const item = (data ?? []).find((i) => i.id === id)
    if (item) { setEditingItem(item); setFormOpen(true) }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Overheads & Expenses"
        subtitle="Manage fixed costs, utilities, and staff wages"
        colour="yellow"
        action={
          activeTab === 'items'
            ? <Button onClick={() => { setEditingItem(null); setFormOpen(true) }}>+ Add Overhead</Button>
            : undefined
        }
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'summary' && (
        <Card title="Monthly Cost Summary">
          <OverheadSummary />
        </Card>
      )}

      {activeTab === 'items' && (
        <Card title="Overhead Items">
          <OverheadList onSelect={handleSelect} />
        </Card>
      )}

      {activeTab === 'wages' && (
        <Card title="Wages Overview">
          <WagesManager />
        </Card>
      )}

      <OverheadForm isOpen={formOpen} onClose={() => setFormOpen(false)} existing={editingItem} />
    </div>
  )
}
