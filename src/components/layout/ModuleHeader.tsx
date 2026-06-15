import { cn } from '@/lib/utils'

type ModuleColour = 'green' | 'red' | 'yellow' | 'blue' | 'purple'

interface ModuleHeaderProps {
  title: string
  subtitle?: string
  colour?: ModuleColour
  action?: React.ReactNode
  className?: string
}

export function ModuleHeader({ title, subtitle, colour = 'red', action, className }: ModuleHeaderProps) {
  const colourClass: Record<ModuleColour, string> = {
    green: 'text-green border-green',
    red: 'text-red border-red',
    yellow: 'text-yellow-dark border-yellow',
    blue: 'text-blue border-blue',
    purple: 'text-purple border-purple',
  }

  return (
    <div className={cn('flex items-center justify-between pb-4 mb-6 border-b border-border', className)}>
      <div className={cn('border-l-4 pl-4', colourClass[colour])}>
        <h1 className={cn('font-display text-3xl leading-none', colourClass[colour])}>{title}</h1>
        {subtitle && <p className="font-body text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
