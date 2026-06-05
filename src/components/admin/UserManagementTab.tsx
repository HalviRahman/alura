import { useState, useEffect, useCallback } from 'react'
import { userManagementApi, type AdminUser } from '../../services/api'

// ─── Toast Types (Prop-drilled or simple replacement) ─────────
type ToastType = 'success' | 'error' | 'info'

interface UserManagementTabProps {
  addToast: (type: ToastType, msg: string) => void
}

export default function UserManagementTab({ addToast }: UserManagementTabProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [roleFilter, setRoleFilter] = useState<'all' | 'agent' | 'manajemen'>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await userManagementApi.list({
        page: p,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: debouncedSearch || undefined,
      })
      setUsers(res.data.data)
      setTotalPages(res.data.meta.last_page)
      setTotal(res.data.meta.total)
    } catch {
      addToast('error', 'Gagal memuat data pengguna.')
    } finally {
      setLoading(false)
    }
  }, [roleFilter, debouncedSearch, addToast])

  useEffect(() => { load(page) }, [load, page])
  useEffect(() => { setPage(1) }, [roleFilter, debouncedSearch])

  const handleActionSuccess = (msg: string) => {
    addToast('success', msg)
    setIsAddOpen(false)
    setEditUser(null)
    setDeleteUser(null)
    load(page)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Cari nama, email, ref code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm font-body border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
          </div>
          <div className="flex bg-surface border border-outline-variant rounded-lg overflow-hidden">
            {(['all', 'agent', 'manajemen'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 font-mono text-xs font-bold transition-colors ${
                  roleFilter === role ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {role === 'all' ? 'Semua' : role === 'agent' ? 'Agen' : 'Manajemen'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-on-primary font-mono text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:opacity-95"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          TAMBAH USER
        </button>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="font-mono text-xs text-on-surface-variant">Menampilkan <strong className="text-primary">{total}</strong> pengguna</span>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['User', 'Role & Akses', 'Referral Code', 'Leads', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></td></tr>
              ) : users.length > 0 ? users.map(user => (
                <tr key={user.id} className="hover:bg-surface transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-body text-sm font-bold text-on-surface">{user.name}</div>
                    <div className="font-mono text-[10px] text-on-surface-variant">{user.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex font-mono text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      user.role === 'manajemen' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    {user.referral_code ? (
                      <span className="font-mono text-xs font-bold bg-surface-container px-2 py-1 rounded border border-outline-variant">
                        {user.referral_code}
                      </span>
                    ) : <span className="font-mono text-xs text-on-surface-variant/40">—</span>}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-primary">
                    {user.role === 'agent' ? user.total_leads || 0 : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex font-mono text-[10px] font-bold px-2 py-1 rounded-full ${
                      user.deleted_at ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.deleted_at ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => setEditUser(user)} className="w-8 h-8 rounded hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => setDeleteUser(user)} className="w-8 h-8 rounded hover:bg-red-50 flex items-center justify-center text-on-surface-variant hover:text-red-600 transition-colors" title="Nonaktifkan">
                        <span className="material-symbols-outlined text-[16px]">person_remove</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-12 text-center text-on-surface-variant font-body text-sm">Tidak ada pengguna ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant flex justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="font-mono text-xs flex items-center px-2">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddOpen && <UserFormModal onClose={() => setIsAddOpen(false)} onSuccess={handleActionSuccess} />}
      {editUser && <UserFormModal user={editUser} onClose={() => setEditUser(null)} onSuccess={handleActionSuccess} />}
      {deleteUser && <DeleteUserModal user={deleteUser} onClose={() => setDeleteUser(null)} onSuccess={handleActionSuccess} />}
    </div>
  )
}

// ─── User Form Modal (Add / Edit) ──────────────────────────────────────────

function UserFormModal({ user, onClose, onSuccess }: { user?: AdminUser; onClose: () => void; onSuccess: (msg: string) => void }) {
  const isEdit = !!user
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'agent',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        const payload: any = { name: form.name, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        await userManagementApi.update(user.id, payload)
        onSuccess('User berhasil diperbarui.')
      } else {
        await userManagementApi.create(form)
        onSuccess('User baru berhasil ditambahkan.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-headline font-semibold text-lg">{isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}
          
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider mb-1">Nama Lengkap</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-outline-variant rounded-lg p-2.5 text-sm font-body focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider mb-1">Alamat Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-outline-variant rounded-lg p-2.5 text-sm font-body focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider mb-1">
              Password {isEdit && <span className="lowercase normal-case opacity-60">(Kosongkan jika tidak ingin mengubah)</span>}
            </label>
            <input type="password" required={!isEdit} minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border border-outline-variant rounded-lg p-2.5 text-sm font-body focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider mb-1">Role Akses</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border border-outline-variant rounded-lg p-2.5 text-sm font-body focus:ring-1 focus:ring-primary outline-none">
              <option value="agent">Agen (Akses Dashboard Agen, Referral)</option>
              <option value="manajemen">Manajemen (Akses Admin Console, SPK)</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-outline-variant py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-high transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50">
              {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : (isEdit ? 'Simpan' : 'Tambah')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteUserModal({ user, onClose, onSuccess }: { user: AdminUser; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [loading, setLoading] = useState(false)
  const isDeleted = !!user.deleted_at

  const handleAction = async () => {
    setLoading(true)
    try {
      if (isDeleted) {
        await userManagementApi.restore(user.id)
        onSuccess('User berhasil diaktifkan kembali.')
      } else {
        await userManagementApi.delete(user.id)
        onSuccess('User berhasil dinonaktifkan.')
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status.')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-xl shadow-2xl p-6 text-center space-y-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${isDeleted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          <span className="material-symbols-outlined text-[28px]">{isDeleted ? 'person_check' : 'person_remove'}</span>
        </div>
        <h3 className="font-headline font-semibold text-lg">{isDeleted ? 'Aktifkan Pengguna?' : 'Nonaktifkan Pengguna?'}</h3>
        <p className="font-body text-sm text-on-surface-variant">
          Anda akan mengubah status <strong className="text-on-surface">{user.name}</strong>. {isDeleted ? 'Pengguna akan dapat login kembali.' : 'Pengguna tidak akan dapat mengakses sistem lagi.'}
        </p>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-outline-variant py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-high transition-colors">Batal</button>
          <button onClick={handleAction} disabled={loading} className={`flex-1 text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center ${isDeleted ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : (isDeleted ? 'Aktifkan' : 'Nonaktifkan')}
          </button>
        </div>
      </div>
    </div>
  )
}
