import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'

interface ChecklistItem {
  id: string
  label: string
  required?: boolean
}

interface ChecklistProps {
  items: ChecklistItem[]
  onComplete?: (completedIds: string[], timestamps: Record<string, string>) => void
  className?: string
}

export function Checklist({ items, onComplete, className }: ChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [timestamps, setTimestamps] = useState<Record<string, string>>({})

  function toggle(id: string) {
    const now = new Date().toISOString()
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      if (next[id]) {
        setTimestamps((t) => ({ ...t, [id]: now }))
      } else {
        setTimestamps((t) => { const n = { ...t }; delete n[id]; return n })
      }
      return next
    })
  }

  const allRequired = items.filter((i) => i.required !== false)
  const allChecked = allRequired.every((i) => checked[i.id])

  function handleComplete() {
    const completed = items.filter((i) => checked[i.id]).map((i) => i.id)
    onComplete?.(completed, timestamps)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={!!checked[item.id]}
            onChange={() => toggle(item.id)}
            className="mt-0.5 w-4 h-4 rounded border-border text-green focus:ring-green"
          />
          <div className="flex-1 min-w-0">
            <p className={cn('font-body text-sm', checked[item.id] ? 'line-through text-muted' : 'text-dark')}>
              {item.label}
            </p>
            {timestamps[item.id] && (
              <p className="font-mono text-xs text-muted mt-0.5">
                Completed at {formatTime(timestamps[item.id])}
              </p>
            )}
          </div>
        </label>
      ))}

      {onComplete && (
        <button
          onClick={handleComplete}
          disabled={!allChecked}
          className="w-full mt-4 bg-green text-white font-body font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Complete Checklist
        </button>
      )}
    </div>
  )
}
