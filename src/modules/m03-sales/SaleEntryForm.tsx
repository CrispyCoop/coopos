import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saleEntrySchema } from '@/lib/validators'
import { useLogSale, useMenuItems } from '@/lib/queries'
import { CHANNEL_LABELS } from '@/lib/constants'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatGBP } from '@/lib/utils'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type FormData = z.infer<typeof saleEntrySchema>

const CHANNEL_OPTIONS = Object.entries(CHANNEL_LABELS).map(([v, l]) => ({ value: v, label: l }))

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SaleEntryForm({ isOpen, onClose }: Props) {
  const { data: menuItems } = useMenuItems()
  const { mutateAsync: logSale } = useLogSale()
  const [items, setItems] = useState<{ menu_item_id: string; name: string; quantity: number; unit_price: number }[]>([])

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(saleEntrySchema) as never,
    defaultValues: { channel: 'instore_cash', discount: 0, total: 0 },
  })

  const discount = Number(watch('discount') ?? 0)
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const total = Math.max(0, subtotal - discount)

  function addItem(menuItemId: string) {
    const mi = (menuItems ?? []).find((m) => m.id === menuItemId)
    if (!mi) return
    setItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItemId)
      if (existing) return prev.map((i) => i.menu_item_id === menuItemId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { menu_item_id: mi.id, name: mi.name, quantity: 1, unit_price: Number(mi.instore_price) }]
    })
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) { setItems((p) => p.filter((i) => i.menu_item_id !== id)); return }
    setItems((p) => p.map((i) => i.menu_item_id === id ? { ...i, quantity: qty } : i))
  }

  async function onSubmit(data: FormData) {
    if (items.length === 0) { toast.error('Add at least one item'); return }
    try {
      await (logSale as (d: unknown) => Promise<unknown>)({
        channel: data.channel,
        order_ref: data.order_ref ?? null,
        items_json: items,
        subtotal,
        discount: discount,
        total,
        session_id: null,
        staff_id: null,
      })
      toast.success(`Sale logged: ${formatGBP(total)}`)
      setItems([])
      reset()
      onClose()
    } catch {
      toast.error('Failed to log sale')
    }
  }

  const menuOptions = (menuItems ?? []).map((m) => ({ value: m.id, label: `${m.name} — ${formatGBP(Number(m.instore_price))}` }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Sale" size="lg">
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Channel" options={CHANNEL_OPTIONS} {...register('channel')} />
          <Input label="Order Ref (optional)" {...register('order_ref')} placeholder="e.g. UB-12345" />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-dark block mb-2">Add Items</label>
          <Select
            options={[{ value: '', label: 'Select item to add…' }, ...menuOptions]}
            value=""
            onChange={(e) => { if (e.target.value) addItem(e.target.value) }}
          />
        </div>

        {items.length > 0 && (
          <div className="space-y-2 border border-border rounded-lg p-3">
            {items.map((item) => (
              <div key={item.menu_item_id} className="flex items-center justify-between gap-2">
                <span className="font-body text-sm text-dark flex-1">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateQty(item.menu_item_id, item.quantity - 1)} className="w-6 h-6 rounded bg-surface text-dark font-mono text-sm hover:bg-border">−</button>
                  <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item.menu_item_id, item.quantity + 1)} className="w-6 h-6 rounded bg-surface text-dark font-mono text-sm hover:bg-border">+</button>
                </div>
                <span className="font-mono text-sm text-dark w-16 text-right">{formatGBP(item.quantity * item.unit_price)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-body text-sm text-muted">Subtotal</span>
              <span className="font-mono text-sm font-medium">{formatGBP(subtotal)}</span>
            </div>
          </div>
        )}

        <Input label="Discount (£)" type="number" step="0.01" min="0" {...register('discount')} />

        <div className="flex items-center justify-between bg-surface rounded-lg px-4 py-3">
          <span className="font-body text-sm font-medium text-dark">Total</span>
          <span className="font-display text-2xl text-dark">{formatGBP(total)}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>Log Sale</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
