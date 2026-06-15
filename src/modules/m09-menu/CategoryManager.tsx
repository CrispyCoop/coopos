import { useState } from 'react'
import { useMenuCategories } from '@/lib/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { QUERY_KEYS } from '@/lib/queries'

type Row = Record<string, unknown>

export function CategoryManager() {
  const qc = useQueryClient()
  const { data, isLoading } = useMenuCategories()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createCategory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('menu_categories').insert({
        name: name.trim(),
        display_order: Number(displayOrder),
        active: true,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.menuCategories })
      setFormOpen(false)
      setName('')
      setDisplayOrder('0')
    },
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('menu_categories').update({ active, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.menuCategories }),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>+ Add Category</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 bg-surface rounded-xl" />
      ) : !data?.length ? (
        <EmptyState icon="📂" title="No categories" message="Add your first menu category." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'name', header: 'Category Name', render: (r) => (
              <span className="font-body font-medium text-dark">{r.name as string}</span>
            )},
            { key: 'display_order', header: 'Order', render: (r) => String(r.display_order) },
            { key: 'active', header: 'Status', render: (r) => (
              <Badge variant={r.active ? 'green' : 'grey'}>{r.active ? 'Active' : 'Hidden'}</Badge>
            )},
            { key: 'actions', header: '', render: (r) => (
              <button
                onClick={(e) => { e.stopPropagation(); toggleActive.mutate({ id: r.id as string, active: !r.active }) }}
                className="text-xs font-body text-primary hover:underline"
              >
                {r.active ? 'Deactivate' : 'Activate'}
              </button>
            )},
          ]}
          data={(data ?? []) as unknown as Row[]}
        />
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Add Category" size="sm">
        <div className="space-y-4">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Display Order" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => { setIsSubmitting(true); await createCategory.mutateAsync(); setIsSubmitting(false) }}
              loading={isSubmitting}
            >
              Add Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
