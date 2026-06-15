import { useIngredients } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'
import { formatGBP } from '@/lib/utils'

export function StockStats() {
  const { data } = useIngredients()
  const ingredients = data ?? []

  const totalValue = ingredients.reduce((s, i) => s + i.current_stock * i.cost_per_unit, 0)
  const lowStock = ingredients.filter((i) => i.current_stock <= i.minimum_stock).length
  const belowPar = ingredients.filter((i) => i.current_stock > i.minimum_stock && i.current_stock <= i.par_level).length
  const totalItems = ingredients.length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Total Items" value={String(totalItems)} accent="blue" />
      <Stat label="Stock Value" value={formatGBP(totalValue)} accent="green" />
      <Stat label="Below Par" value={String(belowPar)} accent="yellow" />
      <Stat label="Low / Critical" value={String(lowStock)} accent="red" />
    </div>
  )
}
