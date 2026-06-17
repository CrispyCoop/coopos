import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DeleteConfirm } from '@/components/ui/DeleteConfirm'
import { MenuStats } from './MenuStats'
import { MenuItemList } from './MenuItemList'
import { MenuItemForm } from './MenuItemForm'
import { MenuItemDetail } from './MenuItemDetail'
import { CategoryManager } from './CategoryManager'
import { AllergenPanel } from './AllergenPanel'
import { useDeleteMenuItem } from '@/lib/queries'
import toast from 'react-hot-toast'
import type { MenuItem } from '@/types/menu'

const TABS = [
  { key: 'items', label: 'Menu Items' },
  { key: 'categories', label: 'Categories' },
]

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('items')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [allergenItem, setAllergenItem] = useState<MenuItem | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null)
  const deleteMenuItem = useDeleteMenuItem()

  if (allergenItem) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Allergen Manager" subtitle={`Editing allergens for: ${allergenItem.name}`} colour="yellow" />
        <Card title="Allergen Information">
          <AllergenPanel item={allergenItem} />
        </Card>
        <Button variant="outline" onClick={() => setAllergenItem(null)}>← Back to Menu</Button>
      </div>
    )
  }

  if (selectedItem) {
    return (
      <div className="space-y-6">
        <ModuleHeader title="Menu Manager" subtitle="Menu item detail" colour="yellow" />
        <MenuItemDetail
          item={selectedItem}
          onEdit={() => { setFormOpen(true) }}
          onClose={() => setSelectedItem(null)}
        />
        <Button variant="outline" size="sm" onClick={() => setAllergenItem(selectedItem)}>
          Manage Allergens
        </Button>
        <MenuItemForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          existing={selectedItem}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Menu Manager"
        subtitle="Manage items, categories, allergens, and pricing"
        colour="yellow"
        action={<Button onClick={() => { setFormOpen(true) }}>+ Add Item</Button>}
      />

      <MenuStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'items' && (
        <Card title="Menu Items">
          <MenuItemList onSelect={setSelectedItem} onDelete={(id, label) => setPendingDelete({ id, label })} />
        </Card>
      )}

      {activeTab === 'categories' && (
        <Card title="Categories">
          <CategoryManager />
        </Card>
      )}

      <MenuItemForm isOpen={formOpen} onClose={() => setFormOpen(false)} existing={null} />
      <DeleteConfirm
        isOpen={!!pendingDelete}
        label={pendingDelete?.label ?? ''}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          await deleteMenuItem.mutateAsync(pendingDelete!.id)
          toast.success('Menu item deleted')
        }}
      />
    </div>
  )
}
