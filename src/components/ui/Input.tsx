import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-body font-medium text-mid mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border rounded-lg font-body text-dark placeholder:text-muted bg-white text-sm',
            'focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent',
            'disabled:bg-surface disabled:text-muted disabled:cursor-not-allowed',
            error ? 'border-red' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red mt-1">{error}</p>}
        {helper && !error && <p className="text-xs text-muted mt-1">{helper}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
