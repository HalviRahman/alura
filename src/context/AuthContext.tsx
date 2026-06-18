import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { authApi } from '../services/api'
import type { User, UserRole } from '../types'

// ─── Types ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, captchaToken?: string | null) => Promise<{ user: User; token: string }>
  logout: () => Promise<void>
  hasRole: (role: UserRole | UserRole[]) => boolean
}

// ─── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session dari localStorage saat app pertama load
  useEffect(() => {
    const savedToken = localStorage.getItem('alura_token')
    const savedUser  = localStorage.getItem('alura_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser) as User)
      } catch {
        localStorage.removeItem('alura_token')
        localStorage.removeItem('alura_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, captchaToken?: string | null) => {
    const res = await authApi.login({ email, password, 'g-recaptcha-response': captchaToken })
    const { token: newToken, user: newUser } = res.data

    localStorage.setItem('alura_token', newToken)
    localStorage.setItem('alura_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)

    return { user: newUser, token: newToken }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Tetap clear local state meski request gagal
    } finally {
      localStorage.removeItem('alura_token')
      localStorage.removeItem('alura_user')
      setToken(null)
      setUser(null)
    }
  }

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    return Array.isArray(role) ? role.includes(user.role) : user.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
