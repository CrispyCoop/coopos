import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { SOP_CATEGORIES } from './types'
import toast from 'react-hot-toast'
import type { SOP } from './types'

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  category: z.string().min(1, 'Category required'),
  content: z.string().min(10, 'Content required'),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  sop?: SOP | null
}

const CAT_OPTIONS = SOP_CATEGORIES.map((c) => ({ value: c, label: c }))

export function SOPForm({ isOpen, onClose, sop }: Props) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  })

  const isActive = watch('is_active')

  useEffect(() => {
    if (sop) {
      reset({ title: sop.title, category: sop.category, content: sop.content, is_active: sop.is_active })
    } else {
      reset({ title: '', category: '', content: '', is_active: true })
    }
  }, [sop, reset])

  async function onSubmit(data: FormData) {
    try {
      if (sop) {
        const { error } = await supabase
          .from('sops')
          .update({ ...data, version: sop.version + 1 })
          .eq('id', sop.id)
        if (error) throw error
        toast.success('SOP updated')
      } else {
        const { error } = await supabase.from('sops').insert({ ...data, version: 1 })
        if (error) throw error
        toast.success('SOP created')
      }
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.sops] })
      onClose()
    } catch {
      toast.error('Failed to save SOP')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={sop ? 'Edit SOP' : 'New SOP'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" {...register('title')} error={errors.title?.message} />
        <Select
          label="Category"
          options={CAT_OPTIONS}
          {...register('category')}
          error={errors.category?.message}
        />
        <div>
          <label className="font-body text-sm font-medium text-dark block mb-1.5">Content</label>
          <textarea
            {...register('content')}
            rows={14}
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 font-mono text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red/30 resize-y"
            placeholder="Write the SOP steps here…"
          />
          {errors.content && <p className="mt-1 font-body text-xs text-red">{errors.content.message}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Toggle checked={isActive} onChange={(v) => setValue('is_active', v)} />
          <span className="font-body text-sm text-dark">Active (visible to staff)</span>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>{sop ? 'Save Changes' : 'Create SOP'}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
