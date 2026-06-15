import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useAppStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types'

interface TopBarProps {
  healthScore?: number
  healthColour?: 'green' | 'amber' | 'red'
  alertCount?: number
}

export function TopBar({ healthScore, healthColour = 'green', alertCount = 0 }: TopBarProps) {
  const { toggleSidebar } = useAppStore()
  const [now, setNow] = useState(new Date())
  const [userName, setUserName] = useState('')
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('name, role')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setUserName(profile.name as string)
            setRole(profile.role as Role)
          }
        })
    })
  }, [])

  const scoreColourClass = {
    green: 'bg-green text-white',
    amber: 'bg-yellow text-dark',
    red: 'bg-red text-white',
  }[healthColour]

  return (
    <header className="bg-white border-b border-border h-14 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-muted hover:text-mid transition-colors p-1 rounded"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1" />
            <rect y="9" width="20" height="2" rx="1" />
            <rect y="15" width="20" height="2" rx="1" />
          </svg>
        </button>

        <p className="font-mono text-xs text-muted hidden sm:block">
          {format(now, 'EEE dd MMM · HH:mm')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Alert count */}
        {alertCount > 0 && (
          <div className="relative">
            <span className="absolute -top-1 -right-1 bg-red text-white font-mono text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
            <span className="text-xl" aria-label={`${alertCount} alerts`}>🔔</span>
          </div>
        )}

        {/* Health Score chip */}
        {healthScore !== undefined && (
          <div
            className={`font-mono text-xs font-medium px-2.5 py-1 rounded-full ${scoreColourClass}`}
            title="CoopOS Health Score"
          >
            {Math.round(healthScore)}
          </div>
        )}

        {/* User */}
        {userName && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red flex items-center justify-center">
              <span className="font-display text-white text-sm">{userName[0]}</span>
            </div>
            <div className="hidden md:block">
              <p className="font-body text-xs font-medium text-dark leading-none">{userName}</p>
              <p className="font-mono text-xs text-muted capitalize">{role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
