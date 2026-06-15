import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, label, disabled = false, className }: ToggleProps) {
  const id = label?.toLowerCase().replace(/\s+/g, '-') ?? 'toggle'
  return (
    <label
      htmlFor={id}
      className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          aria-checked={checked}
        />
        <div
          className={cn(
            'w-10 h-6 rounded-full transition-colors',
            checked ? 'bg-green' : 'bg-border'
          )}
        />
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </div>
      {label && <span className="font-body text-sm text-mid">{label}</span>}
    </label>
  )
}
