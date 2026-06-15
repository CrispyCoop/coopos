import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/queries'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { SOP } from './types'

interface Props {
  sop: SOP | null
  onClose: () => void
  onEdit: (sop: SOP) => void
}

export function SOPViewer({ sop, onClose, onEdit }: Props) {
  const [acknowledging, setAcknowledging] = useState(false)
  const qc = useQueryClient()

  async function handleAcknowledge() {
    if (!sop) return
    setAcknowledging(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      const { data: staffMember } = await supabase
        .from('staff_members')
        .select('id')
        .eq('email', user.email ?? '')
        .single()

      const staffId = staffMember?.id ?? profile?.id
      if (!staffId) throw new Error('Staff record not found')

      const { error } = await supabase.from('sop_acknowledgements').insert({
        sop_id: sop.id,
        staff_member_id: staffId,
        acknowledged_at: new Date().toISOString(),
      })
      if (error) throw error
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.sops] })
      toast.success('SOP acknowledged')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to acknowledge')
    } finally {
      setAcknowledging(false)
    }
  }

  return (
    <Drawer isOpen={!!sop} onClose={onClose} title={sop?.title ?? ''} width="lg">
      {sop && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="grey">{sop.category}</Badge>
            <Badge variant={sop.is_active ? 'green' : 'grey'}>{sop.is_active ? 'Active' : 'Draft'}</Badge>
            <span className="font-mono text-xs text-muted">v{sop.version}</span>
          </div>

          <div className="prose prose-sm max-w-none font-body text-dark">
            <div className="whitespace-pre-wrap leading-relaxed">{sop.content}</div>
          </div>

          <div className="text-xs text-muted font-mono space-y-0.5">
            <p>Updated: {formatDateTime(sop.updated_at)}</p>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <Button onClick={handleAcknowledge} loading={acknowledging}>
              Mark as Read & Acknowledged
            </Button>
            <Button variant="secondary" onClick={() => onEdit(sop)}>
              Edit SOP
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  )
}
