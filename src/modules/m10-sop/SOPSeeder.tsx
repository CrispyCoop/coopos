import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { SEED_SOPS } from './seed-sops'
import { useSOPs } from '@/lib/queries'
import toast from 'react-hot-toast'

export function SOPSeeder() {
  const [seeding, setSeeding] = useState(false)
  const { data: sops } = useSOPs()
  const qc = useQueryClient()

  const alreadySeeded = (sops?.length ?? 0) >= 50

  async function handleSeed() {
    setSeeding(true)
    try {
      const rows = SEED_SOPS.map((s) => ({ ...s, version: 1, is_active: true }))
      const { error } = await supabase.from('sops').insert(rows)
      if (error) throw error
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.sops] })
      toast.success(`${rows.length} SOPs seeded successfully`)
    } catch {
      toast.error('Seed failed — SOPs may already exist')
    } finally {
      setSeeding(false)
    }
  }

  if (alreadySeeded) return null

  return (
    <Card title="Seed SOPs">
      <Alert
        type="info"
        message={`${SEED_SOPS.length} Crispy Coop SOPs are ready to seed. This runs once — the button disappears when SOPs are loaded.`}
        className="mb-4"
      />
      <Button onClick={handleSeed} loading={seeding}>
        Seed {SEED_SOPS.length} SOPs
      </Button>
    </Card>
  )
}
