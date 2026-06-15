import { useMenuItems, useMenuCategories } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'

export function MenuStats() {
  const { data: items } = useMenuItems()
  const { data: categories } = useMenuCategories()

  const active = (items ?? []).filter((i) => i.status === 'active').length
  const unavailable = (items ?? []).filter((i) => i.status === 'unavailable').length
  const totalItems = (items ?? []).length
  const totalCategories = (categories ?? []).filter((c) => c.active).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Active Items" value={String(active)} accent="green" />
      <Stat label="Unavailable" value={String(unavailable)} accent="red" />
      <Stat label="Total Items" value={String(totalItems)} accent="blue" />
      <Stat label="Categories" value={String(totalCategories)} accent="blue" />
    </div>
  )
}
