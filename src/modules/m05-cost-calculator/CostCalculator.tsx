import { useState } from 'react'
import { useIngredients } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatGBP } from '@/lib/utils'
import type { Ingredient } from '@/types/stock'

interface LineItem {
  ingredient: Ingredient
  quantity: number
}

export function CostCalculator() {
  const { data: ingredients } = useIngredients()
  const [items, setItems] = useState<LineItem[]>([])
  const [search, setSearch] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')

  const filteredIngredients = (ingredients ?? []).filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalCost = items.reduce((s, item) => {
    return s + item.ingredient.cost_per_unit * item.quantity
  }, 0)

  const price = Number(sellingPrice) || 0
  const margin = price > 0 ? ((price - totalCost) / price) * 100 : 0

  const addIngredient = (ing: Ingredient) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.ingredient.id === ing.id)
      if (existing) return prev.map((i) => i.ingredient.id === ing.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ingredient: ing, quantity: 1 }]
    })
    setSearch('')
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.ingredient.id !== id))
    } else {
      setItems((prev) => prev.map((i) => i.ingredient.id === id ? { ...i, quantity: qty } : i))
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="relative">
            <Input
              label="Search ingredients"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && filteredIngredients.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredIngredients.slice(0, 10).map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => addIngredient(ing)}
                    className="w-full text-left px-4 py-2 font-body text-sm text-dark hover:bg-surface transition-colors"
                  >
                    {ing.name} — {formatGBP(ing.cost_per_unit)}/{ing.unit}
                  </button>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.ingredient.id} className="flex items-center gap-3 p-2 bg-surface rounded-xl">
                  <div className="flex-1">
                    <p className="font-body text-sm font-medium text-dark">{item.ingredient.name}</p>
                    <p className="font-body text-xs text-muted">
                      {formatGBP(item.ingredient.cost_per_unit)}/{item.ingredient.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.ingredient.id, item.quantity - 0.1)}
                      className="w-6 h-6 rounded-full bg-border text-dark hover:bg-primary hover:text-white transition-colors text-sm"
                    >−</button>
                    <span className="font-mono text-sm w-10 text-center">{item.quantity.toFixed(1)}</span>
                    <button
                      onClick={() => updateQty(item.ingredient.id, item.quantity + 0.1)}
                      className="w-6 h-6 rounded-full bg-border text-dark hover:bg-primary hover:text-white transition-colors text-sm"
                    >+</button>
                    <span className="font-mono text-xs text-muted w-14 text-right">
                      = {formatGBP(item.ingredient.cost_per_unit * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Card title="Result">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-dark">Total Food Cost</span>
              <span className="font-mono font-semibold text-dark text-lg">{formatGBP(totalCost)}</span>
            </div>
            <Input
              label="Selling Price (£)"
              type="number"
              step="0.05"
              min="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
            {price > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-dark">Gross Margin</span>
                  <Badge variant={margin >= 65 ? 'green' : margin >= 55 ? 'amber' : 'red'}>
                    {margin.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-dark">Gross Profit</span>
                  <span className="font-mono font-medium text-dark">{formatGBP(price - totalCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-dark">Food Cost %</span>
                  <span className="font-mono text-sm text-muted">{(100 - margin).toFixed(1)}%</span>
                </div>
              </>
            )}
            {items.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { setItems([]); setSellingPrice('') }}>
                Clear
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
