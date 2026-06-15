import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-muted text-sm tracking-widest uppercase mb-2">404</p>
        <h1 className="font-display text-6xl text-dark mb-4">Page Not Found</h1>
        <p className="font-body text-muted mb-8">This page doesn't exist in CoopOS.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red text-white font-body font-medium px-6 py-3 rounded-lg hover:bg-red-dark transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
