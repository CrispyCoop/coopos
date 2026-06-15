import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/lib/utils'
import { formatGBP } from '@/lib/utils'

const DENOMINATIONS = [
  { key: 'p1', label: '1p', value: 0.01 },
  { key: 'p2', label: '2p', value: 0.02 },
  { key: 'p5', label: '5p', value: 0.05 },
  { key: 'p10', label: '10p', value: 0.10 },
  { key: 'p20', label: '20p', value: 0.20 },
  { key: 'p50', label: '50p', value: 0.50 },
  { key: '1', label: '£1', value: 1 },
  { key: '2', label: '£2', value: 2 },
  { key: '5', label: '£5', value: 5 },
  { key: '10', label: '£10', value: 10 },
  { key: '20', label: '£20', value: 20 },
  { key: '50', label: '£50', value: 50 },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function TillCountForm({ isOpen, onClose }: Props) {
  const qc = useQueryClient()
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(DENOMINATIONS.map((d) => [d.key, 0]))
  )
  const [openingFloat, setOpeningFloat] = useState('150')
  const [eposCashTotal, setEposCashTotal] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalCash = DENOMINATIONS.reduce((s, d) => s + (counts[d.key] || 0) * d.value, 0)
  const eposNum = Number(eposCashTotal) || 0
  const variance = totalCash - eposNum

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('till_counts').insert({
        date: todayISO(),
        opening_float: Number(openingFloat),
        denominations_json: counts,
        total_cash: totalCash,
        epos_cash_total: eposNum || null,
        variance: eposCashTotal ? variance : null,
        notes: notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['till-counts'] })
      onClose()
      setCounts(Object.fromEntries(DENOMINATIONS.map((d) => [d.key, 0])))
      setNotes('')
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Till Count" size="md">
      <div className="space-y-4">
        <Input
          label="Opening Float (£)"
          type="number"
          step="0.01"
          value={openingFloat}
          onChange={(e) => setOpeningFloat(e.target.value)}
        />
        <div>
          <p className="font-body text-sm text-dark font-medium mb-2">Coin & Note Counts</p>
          <div className="grid grid-cols-3 gap-2">
            {DENOMINATIONS.map((d) => (
              <div key={d.key} className="flex items-center gap-1">
                <label className="font-body text-xs text-muted w-8 shrink-0">{d.label}</label>
                <input
                  type="number"
                  min="0"
                  value={counts[d.key] || 0}
                  onChange={(e) => setCounts((prev) => ({ ...prev, [d.key]: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm font-mono border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface rounded-xl p-3 flex items-center justify-between">
          <span className="font-body text-sm text-dark">Total Cash Counted</span>
          <span className="font-mono font-semibold text-dark text-lg">{formatGBP(totalCash)}</span>
        </div>
        <Input
          label="EPOS Cash Total (£)"
          type="number"
          step="0.01"
          placeholder="From your EPOS system"
          value={eposCashTotal}
          onChange={(e) => setEposCashTotal(e.target.value)}
        />
        {eposCashTotal && (
          <div className={`rounded-xl border px-3 py-2 flex items-center justify-between ${
            Math.abs(variance) < 1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <span className="font-body text-sm font-medium">Variance</span>
            <span className={`font-mono font-semibold ${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {variance >= 0 ? '+' : ''}{formatGBP(variance)}
            </span>
          </div>
        )}
        <Input
          label="Notes"
          placeholder="Any discrepancies or comments..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button
            onClick={async () => { setIsSubmitting(true); await mutation.mutateAsync(); setIsSubmitting(false) }}
            loading={isSubmitting}
          >
            Save Count
          </Button>
        </div>
      </div>
    </Modal>
  )
}
