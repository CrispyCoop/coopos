import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types'

interface RoleGuardProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const [role, setRole] = useState<Role | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setRole(null); return }
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => setRole((profile?.role as Role) ?? null))
    })
  }, [])

  if (role === undefined) return null

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
