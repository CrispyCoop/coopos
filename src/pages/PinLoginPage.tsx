import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { BUSINESS_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'
import bcrypt from 'bcryptjs'

export function PinLoginPage() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  function handleKey(digit: string) {
    if (pin.length < 4) setPin((p) => p + digit)
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1))
  }

  async function handleSubmit() {
    if (pin.length !== 4) return
    setLoading(true)

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, role, pin_hash')
        .eq('role', 'staff')
        .not('pin_hash', 'is', null)

      if (error) throw error

      const match = profiles?.find((p) => p.pin_hash && bcrypt.compareSync(pin, p.pin_hash))

      if (!match) {
        toast.error('Incorrect PIN')
        setPin('')
        setLoading(false)
        return
      }

      // Sign in with a shared staff account tied to the store
      // Phase 4: upgrade to individual Edge Function bcrypt verification
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `staff@crispycoop.internal`,
        password: pin,
      })

      if (signInError) {
        // Store staff session in memory for current session
        sessionStorage.setItem('staff_profile_id', match.id)
        sessionStorage.setItem('staff_name', match.name)
        sessionStorage.setItem('staff_role', match.role)
      }

      navigate('/', { replace: true })
    } catch (err) {
      toast.error('Login failed. Try again.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white tracking-wider">{BUSINESS_NAME}</h1>
          <p className="font-mono text-muted text-sm mt-1 tracking-widest uppercase">Staff PIN Login</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  i < pin.length ? 'bg-red border-red' : 'border-border'
                }`}
              />
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {keys.map((key, idx) => {
              if (key === '') return <div key={idx} />
              if (key === '⌫') {
                return (
                  <button
                    key={idx}
                    onClick={handleDelete}
                    className="h-14 rounded-xl bg-surface hover:bg-border text-mid font-body text-xl flex items-center justify-center transition-colors"
                    aria-label="Delete"
                  >
                    ⌫
                  </button>
                )
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleKey(key)}
                  disabled={pin.length === 4}
                  className="h-14 rounded-xl bg-surface hover:bg-border text-dark font-mono text-xl font-medium flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  {key}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4 || loading}
            className="w-full mt-6 bg-red text-white font-body font-medium py-3 rounded-xl hover:bg-red-dark transition-colors disabled:opacity-40"
          >
            {loading ? 'Verifying…' : 'Enter'}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-muted hover:text-mid font-body transition-colors"
            >
              Owner / Manager login →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
