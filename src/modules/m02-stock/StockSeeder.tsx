import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useIngredients } from '@/lib/queries'
import { SEED_INGREDIENTS, SEED_SUPPLIERS } from './seed-stock'
import toast from 'react-hot-toast'

export function StockSeeder() {
  const [seeding, setSeeding] = useState(false)
  const { data: ingredients } = useIngredients()
  const qc = useQueryClient()

  const alreadySeeded = (ingredients?.length ?? 0) >= 20

  async function handleSeed() {
    setSeeding(true)
    try {
      const { error: suppErr } = await supabase.from('suppliers').insert(SEED_SUPPLIERS)
      if (suppErr && !suppErr.message.includes('duplicate')) throw suppErr

      const { error: ingErr } = await supabase.from('ingredients').insert(SEED_INGREDIENTS)
      if (ingErr) throw ingErr

      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ingredients] })
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.suppliers] })
      toast.success(`${SEED_INGREDIENTS.length} ingredients + ${SEED_SUPPLIERS.length} suppliers seeded`)
    } catch {
      toast.error('Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  if (alreadySeeded) return null

  return (
    <Card title="Seed Stock Data">
      <Alert
        type="info"
        message={`Seed ${SEED_INGREDIENTS.length} ingredients and ${SEED_SUPPLIERS.length} suppliers for Crispy Coop. Runs once.`}
        className="mb-4"
      />
      <Button onClick={handleSeed} loading={seeding}>Seed Stock Data</Button>
    </Card>
  )
}
