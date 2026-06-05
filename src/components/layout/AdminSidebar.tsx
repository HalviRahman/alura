import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface AdminSidebarProps {
  onAddAsset?: () => void
}

type SidebarTab =
  | 'command'
  | 'analytics'
  | 'users'
  | 'spk'
  | 'reports'
  | 'map'
  | 'properties'
  | 'offers'

const navItems: Array<{ icon: string; label: string; tab: SidebarTab }> = [
  { icon: 'dashboard',     label: 'Command Center',  tab: 'command'    },
  { icon: 'insights',      label: 'Analytics',       tab: 'analytics'  },
  { icon: 'group',         label: 'User Management', tab: 'users'      },
  { icon: 'timer',         label: 'SPK Tracker',     tab: 'spk'        },
  { icon: 'description',   label: 'Reports',         tab: 'reports'    },
  { icon: 'map',           label: 'Peta Distribusi',  tab: 'map'        },
]

const assetItems: Array<{ icon: string; label: string; tab: SidebarTab }> = [
  { icon: 'home_work',     label: 'Aset Properti',  tab: 'properties' },
  { icon: 'receipt_long',  label: 'Penawaran',      tab: 'offers'     },
]

export default function AdminSidebar({ onAddAsset }: AdminSidebarProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const activeTab = (searchParams.get('tab') as SidebarTab) || 'command'

  // Close drawer on route/tab change (mobile UX)
  useEffect(() => { setOpen(false) }, [activeTab])

  // Close drawer on outside ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleNavClick = (tab: SidebarTab) => {
    setSearchParams({ tab })
    setOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const NavButton = ({ item }: { item: { icon: string; label: string; tab: SidebarTab } }) => {
    const isActive = activeTab === item.tab
    return (
      <button
        key={item.tab}
        onClick={() => handleNavClick(item.tab)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group text-left ${
          isActive
            ? 'bg-secondary-container text-on-secondary-container font-semibold'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform flex-shrink-0"
          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {item.icon}
        </span>
        <span className="font-mono text-xs tracking-widest uppercase">{item.label}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
        )}
      </button>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="mb-6 px-1 flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-primary">ALURA</h1>
          <p className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase mt-0.5">Admin Console</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      {/* Add New Asset CTA */}
      {onAddAsset && (
        <button
          onClick={() => { onAddAsset(); setOpen(false) }}
          className="mb-6 bg-primary text-on-primary font-body font-semibold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New Asset</span>
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map(item => <NavButton key={item.tab} item={item} />)}
      </nav>

      {/* Divider + Asset Views */}
      <div className="my-3 px-4">
        <p className="font-mono text-[9px] text-on-surface-variant/50 uppercase tracking-widest">Asset Views</p>
      </div>
      <nav className="space-y-0.5 mb-4">
        {assetItems.map(item => <NavButton key={item.tab} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-outline-variant pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-status-error hover:bg-red-50 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-mono text-xs tracking-widest uppercase">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] bg-surface-container-low border-r border-outline-variant flex-col p-4 z-50">
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger trigger (top-left, only < lg) ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-container-low border-b border-outline-variant px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div className="flex-1 min-w-0">
          <span className="font-headline font-black text-xl text-primary">ALURA</span>
          <span className="font-mono text-[10px] text-on-surface-variant ml-2 uppercase tracking-wider hidden sm:inline">Admin Console</span>
        </div>
        {onAddAsset && (
          <button
            onClick={onAddAsset}
            className="bg-primary text-on-primary text-xs font-mono font-bold px-3 py-2 rounded-lg flex items-center gap-1 hover:opacity-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">ASET BARU</span>
          </button>
        )}
      </div>

      {/* ── Mobile: backdrop overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: drawer ── */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-[280px] bg-surface-container-low border-r border-outline-variant flex flex-col p-4 z-50 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
