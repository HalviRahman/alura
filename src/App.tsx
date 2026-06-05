import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import MarketplacePage from './pages/MarketplacePage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AgentDashboardPage from './pages/AgentDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import type { ReactNode } from 'react'

// ─── Route guard untuk halaman yang butuh auth ──────────────────────────────

function ProtectedRoute({ children, role }: { children: ReactNode; role?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (role && (!user.role || !role.includes(user.role))) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Marketplace */}
        <Route path="/" element={<MarketplacePage />} />
        <Route path="/property/:uuid" element={<PropertyDetailPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Legacy redirect */}
        <Route path="/marketplace" element={<Navigate to="/" replace />} />

        {/* Agent + Manajemen Dashboard (Protected) */}
        <Route path="/agent/dashboard" element={
          <ProtectedRoute role={['agent', 'manajemen']}>
            <AgentDashboardPage />
          </ProtectedRoute>
        } />

        {/* Manajemen Only Dashboard (Protected) */}
        <Route path="/admin" element={
          <ProtectedRoute role={['manajemen']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
