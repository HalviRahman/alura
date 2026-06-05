import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

// Redirect target per role
const ROLE_REDIRECT: Record<UserRole, string> = {
  manajemen: '/admin',
  agent: '/agent/dashboard',
  user: '/',
}

export default function LoginPage() {
  const navigate      = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Kalau sudah login, redirect langsung secara aman via useEffect
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = ROLE_REDIRECT[user.role]
      if (target) {
        navigate(target, { replace: true })
      } else {
        // Proteksi kokoh terhadap sesi usang/korup di browser
        localStorage.removeItem('alura_token')
        localStorage.removeItem('alura_user')
        window.location.reload()
      }
    }
  }, [isAuthenticated, user, navigate])

  if (isAuthenticated && user && ROLE_REDIRECT[user.role]) {
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setError(null)

    try {
      const { user: loggedUser } = await login(email, password)
      navigate(ROLE_REDIRECT[loggedUser.role], { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Login gagal. Periksa email dan password Anda.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-surface border-b border-outline-variant h-16 flex items-center px-6">
        <div className="max-w-container-max mx-auto w-full flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                home_work
              </span>
            </div>
            <span className="font-headline font-bold text-2xl text-primary tracking-tight">ALURA</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-bold">Institutional Property Marketplace</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-headline font-bold text-4xl text-primary mb-2 text-center leading-tight tracking-tight">
            Selamat Datang di<br />ALURA
          </h1>
          <p className="font-body text-sm text-on-surface-variant text-center mb-8">
            Masuk untuk mengakses platform properti institusional.
          </p>

          {/* Form card */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} noValidate>
              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <p className="font-body text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" className="block font-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@alura.id"
                  required
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 font-body text-sm bg-background text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label htmlFor="password" className="block font-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 pr-12 font-body text-sm bg-background text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="btn-login"
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-primary text-on-primary font-body font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Masuk...
                  </>
                ) : (
                  <>
                    Masuk
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo accounts hint */}
          <div className="mt-6 p-4 bg-surface-container-highest border border-outline-variant rounded-xl">
            <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest text-center mb-3">Akun Demo</p>
            <div className="space-y-1.5">
              {[
                { role: 'Manajemen', email: 'admin@alura.id', pass: 'Admin@12345' },
                { role: 'Agent', email: 'agent@alura.id', pass: 'Agent@12345' },
                { role: 'User Publik', email: 'user@alura.id', pass: 'User@12345' },
              ].map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.pass); setError(null) }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors group"
                >
                  <span className="font-mono text-[10px] text-on-surface-variant group-hover:text-primary transition-colors">{acc.role}</span>
                  <span className="font-mono text-[10px] text-on-surface-variant/60">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {[
              { icon: 'lock', label: 'SSL 256-bit' },
              { icon: 'verified_user', label: 'Terverifikasi OJK' },
              { icon: 'gpp_good', label: 'Data Terlindungi' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-outline-variant py-5">
        <div className="max-w-container-max mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-on-surface-variant">
            © 2024 ALURA Institutional Assets. All Rights Reserved.
          </p>
          <div className="flex gap-5">
            {['Legal Disclaimer', 'Privacy Policy', 'Contact Support'].map(link => (
              <a key={link} href="#" className="font-mono text-[10px] text-on-surface-variant hover:text-primary transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
