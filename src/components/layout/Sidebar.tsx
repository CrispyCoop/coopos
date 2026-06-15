import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { BUSINESS_NAME } from '@/lib/constants'

const NAV_GROUPS = [
  {
    label: 'Core',
    colour: 'text-muted',
    items: [
      { path: '/', label: 'Dashboard', icon: '⬡', exact: true },
    ],
  },
  {
    label: 'Operations',
    colour: 'text-green',
    items: [
      { path: '/stock', label: 'Stock', icon: '📦' },
      { path: '/waste', label: 'Wastage', icon: '🗑' },
      { path: '/rota', label: 'ROTA', icon: '📅' },
      { path: '/food-safety', label: 'Food Safety', icon: '🛡' },
      { path: '/sops', label: 'SOPs', icon: '📋' },
    ],
  },
  {
    label: 'Financial',
    colour: 'text-red',
    items: [
      { path: '/sales', label: 'Sales', icon: '💷' },
      { path: '/finance', label: 'Finance', icon: '📊' },
      { path: '/costs', label: 'Cost & Margins', icon: '📐' },
      { path: '/cash', label: 'Cash & Card', icon: '🏦' },
      { path: '/overhead', label: 'Overhead', icon: '🔧' },
    ],
  },
  {
    label: 'Delivery',
    colour: 'text-yellow-dark',
    items: [
      { path: '/delivery', label: 'Delivery Hubs', icon: '🛵' },
      { path: '/menu', label: 'Menu Manager', icon: '🍗' },
    ],
  },
  {
    label: 'Marketing',
    colour: 'text-purple',
    items: [
      { path: '/customers', label: 'Customers', icon: '👥' },
      { path: '/campaigns', label: 'Campaigns', icon: '📢' },
      { path: '/comms', label: 'Comms', icon: '✉️' },
      { path: '/market', label: 'Market Intel', icon: '🔍' },
    ],
  },
  {
    label: 'System',
    colour: 'text-blue',
    items: [
      { path: '/reporting', label: 'Reporting', icon: '📈' },
      { path: '/reports', label: 'Report Gen', icon: '🖨' },
      { path: '/suppliers', label: 'Suppliers', icon: '🚚' },
      { path: '/equipment', label: 'Equipment', icon: '⚙️' },
      { path: '/training', label: 'Training', icon: '🎓' },
      { path: '/hub', label: 'System Hub', icon: '🔗' },
      { path: '/franchise', label: 'Franchise', icon: '🏪' },
      { path: '/settings', label: 'Settings', icon: '⚙' },
    ],
  },
]

export function Sidebar() {
  const { sidebarOpen } = useAppStore()

  return (
    <aside
      className={cn(
        'bg-dark flex-shrink-0 flex flex-col transition-all duration-200 overflow-y-auto',
        sidebarOpen ? 'w-56' : 'w-14'
      )}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex-shrink-0">
        {sidebarOpen ? (
          <div>
            <p className="font-display text-white text-xl tracking-widest leading-none">{BUSINESS_NAME}</p>
            <p className="font-mono text-muted text-xs tracking-wider mt-0.5">CoopOS</p>
          </div>
        ) : (
          <p className="font-display text-white text-xl text-center">CC</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-4" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {sidebarOpen && (
              <p className={cn('font-mono text-xs uppercase tracking-widest px-2 mb-1', group.colour)}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={'exact' in item ? item.exact : false}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-sm font-body',
                      isActive
                        ? 'bg-red text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    )
                  }
                  aria-label={item.label}
                >
                  <span className="text-base flex-shrink-0 w-5 text-center" aria-hidden="true">
                    {item.icon}
                  </span>
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
