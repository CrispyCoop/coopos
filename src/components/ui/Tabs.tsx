import { cn } from '@/lib/utils'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-border', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-2.5 font-body text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
            active === tab.key
              ? 'border-red text-red'
              : 'border-transparent text-muted hover:text-mid hover:border-border'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
