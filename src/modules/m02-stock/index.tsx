import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { DeleteConfirm } from '@/components/ui/DeleteConfirm'
import { StockStats } from './StockStats'
import { IngredientList } from './IngredientList'
import { IngredientForm } from './IngredientForm'
import { StockAdjustmentForm } from './StockAdjustmentForm'
import { DeliveryForm } from './DeliveryForm'
import { StockMovementLog } from './StockMovementLog'
import { StockSeeder } from './StockSeeder'
import { useDeleteIngredient } from '@/lib/queries'
import toast from 'react-hot-toast'
import type { Ingredient } from '@/types/stock'

const TABS = [
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'movements', label: 'Movement Log' },
]

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('ingredients')
  const [ingredientFormOpen, setIngredientFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null)
  const deleteIngredient = useDeleteIngredient()

  function handleEditIngredient(i: Ingredient) {
    setEditingIngredient(i)
    setIngredientFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Stock & Inventory"
        subtitle="Ingredient tracking, deliveries, and stock adjustments"
        colour="green"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAdjustmentOpen(true)}>Adjust Stock</Button>
            <Button size="sm" variant="secondary" onClick={() => setDeliveryOpen(true)}>Record Delivery</Button>
            <Button size="sm" onClick={() => { setEditingIngredient(null); setIngredientFormOpen(true) }}>+ Ingredient</Button>
          </div>
        }
      />

      <StockSeeder />
      <StockStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'ingredients' && (
        <IngredientList onSelect={handleEditIngredient} onDelete={(id, label) => setPendingDelete({ id, label })} />
      )}
      {activeTab === 'movements' && (
        <StockMovementLog />
      )}

      <IngredientForm
        isOpen={ingredientFormOpen}
        onClose={() => { setIngredientFormOpen(false); setEditingIngredient(null) }}
        ingredient={editingIngredient}
      />
      <StockAdjustmentForm
        isOpen={adjustmentOpen}
        onClose={() => setAdjustmentOpen(false)}
      />
      <DeliveryForm
        isOpen={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
      />
      <DeleteConfirm
        isOpen={!!pendingDelete}
        label={pendingDelete?.label ?? ''}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          await deleteIngredient.mutateAsync(pendingDelete!.id)
          toast.success('Ingredient deleted')
        }}
      />
    </div>
  )
}
