import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { BUSINESS_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white tracking-wider">{BUSINESS_NAME}</h1>
          <p className="font-mono text-muted text-sm mt-1 tracking-widest uppercase">CoopOS</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="font-display text-2xl text-dark mb-6">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-mid mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2 border border-border rounded-lg font-body text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                placeholder="owner@crispycoop.co.uk"
              />
              {errors.email && (
                <p className="text-xs text-red mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-mid mb-1">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-border rounded-lg font-body text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red text-white font-body font-medium py-2.5 rounded-lg hover:bg-red-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <button
              onClick={() => navigate('/pin')}
              className="text-sm text-muted hover:text-mid font-body transition-colors"
            >
              Staff PIN login →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
