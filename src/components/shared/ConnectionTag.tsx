import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const MODULE_PATHS: Record<string, string> = {
  M01: '/', M02: '/stock', M03: '/sales', M04: '/finance', M05: '/costs',
  M06: '/waste', M07: '/rota', M08: '/food-safety', M09: '/menu', M10: '/sops',
  M11: '/cash', M12: '/delivery', M13: '/overhead', M14: '/reporting',
  M15: '/hub', M16: '/settings', M17: '/customers', M18: '/market',
  M19: '/suppliers', M20: '/equipment', M21: '/campaigns', M22: '/training',
  M23: '/franchise', M24: '/comms', M25: '/reports',
}

interface ConnectionTagProps {
  module: string
  label?: string
  className?: string
}

export function ConnectionTag({ module, label, className }: ConnectionTagProps) {
  const path = MODULE_PATHS[module]
  const text = label ?? `→ ${module}`

  if (path) {
    return (
      <Link
        to={path}
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded font-mono text-xs bg-surface text-muted hover:text-mid hover:bg-border transition-colors',
          className
        )}
      >
        {text}
      </Link>
    )
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded font-mono text-xs bg-surface text-muted', className)}>
      {text}
    </span>
  )
}
