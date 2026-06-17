import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

const DELETE_PIN = '258003'

interface Props {
  isOpen: boolean
  label: string
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export function DeleteConfirm({ isOpen, label, onClose, onConfirm }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleClose() {
    setPin('')
    setError('')
    onClose()
  }

  async function handleConfirm() {
    if (pin !== DELETE_PIN) {
      setError('Incorrect PIN')
      setPin('')
      return
    }
    setLoading(true)
    try {
      await onConfirm()
      setPin('')
      setError('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Delete" size="sm">
      <div className="space-y-4">
        <p className="font-body text-sm text-dark">
          Delete <span className="font-medium">{label}</span>? This cannot be undone.
        </p>
        <div>
          <label className="font-body text-sm font-medium text-dark block mb-1">Enter manager PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
            autoFocus
            className="w-full border border-border rounded-lg px-3 py-2 font-mono text-lg tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="••••••"
          />
          {error && <p className="font-body text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleConfirm} loading={loading}>Delete</Button>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
