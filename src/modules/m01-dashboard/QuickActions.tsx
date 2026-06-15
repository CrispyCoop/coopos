import { Link } from 'react-router-dom'

const ACTIONS = [
  { label: 'Log Sale', path: '/sales', colour: 'bg-red text-white' },
  { label: 'Log Waste', path: '/wastage', colour: 'bg-yellow text-dark' },
  { label: 'Receive Stock', path: '/stock', colour: 'bg-green text-white' },
  { label: 'Log Expense', path: '/finance', colour: 'bg-blue text-white' },
  { label: 'Record Cash', path: '/cash', colour: 'bg-purple text-white' },
  { label: 'New Dispute', path: '/delivery', colour: 'bg-amber-500 text-white' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ACTIONS.map((a) => (
        <Link
          key={a.path}
          to={a.path}
          className={`${a.colour} rounded-xl px-3 py-3 font-body text-xs font-semibold text-center hover:opacity-90 active:scale-95 transition-all`}
        >
          {a.label}
        </Link>
      ))}
    </div>
  )
}
