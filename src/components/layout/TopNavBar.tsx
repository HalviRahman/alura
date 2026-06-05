import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TopNavBar() {
  const location           = useLocation()
  const navigate           = useNavigate()
  const { user, logout, hasRole } = useAuth()

  const navLinks = [
    { href: '/', label: 'Marketplace', show: true },
    { 
      href: hasRole('manajemen') ? '/admin' : '/agent/dashboard', 
      label: 'Dashboard', 
      show: hasRole(['agent', 'manajemen']) 
    },
  ].filter(l => l.show)

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const roleLabel: Record<string, string> = {
    manajemen: 'Manajemen',
    agent: 'Agen',
    user: 'User',
  }

  return (
    <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant">
      <div className="flex justify-between items-center w-full px-6 max-w-container-max mx-auto h-16">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="font-headline font-bold text-2xl text-primary tracking-tight">
            ALURA
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = link.href === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(link.href)
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`font-mono text-xs tracking-widest uppercase transition-colors pb-1 ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* User info & Logout or Login Button */}
          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="font-body text-sm font-semibold text-on-surface leading-tight">{user.name}</span>
                <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
                  {roleLabel[user.role] ?? user.role}
                </span>
              </div>
              {/* Avatar + logout */}
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="w-9 h-9 rounded-full bg-primary-container overflow-hidden border-2 border-outline-variant ml-1 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-colors group"
                title="Logout"
              >
                <span className="material-symbols-outlined text-on-primary-container group-hover:text-primary text-[18px] transition-colors">
                  logout
                </span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-on-primary font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[14px]">login</span>
              Login Agen/Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
