import React, { useState, useEffect, useCallback } from 'react'
import { propertiesApi } from '../../services/api'
import { getSpkStatus, formatPrice } from '../../data/properties'
import type { Property } from '../../types'
import Pagination from '../ui/Pagination'

interface AsetPropertiTabProps {
  onEdit: (p: Property) => void
  onDelete: (p: Property) => void
  onAdd: () => void
  onRefresh: () => void
  addToast: (type: 'success' | 'error' | 'info', msg: string) => void
}

export default function AsetPropertiTab({
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  addToast,
}: AsetPropertiTabProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'unpublished'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchProperties = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page: p, per_page: 15 }
      if (filterStatus === 'published') params.is_published = 1
      if (filterStatus === 'unpublished') params.is_published = 0
      if (debouncedSearch) params.query = debouncedSearch

      const res = await propertiesApi.list(params)
      setProperties(res.data.data)
      setTotalPages(res.data.meta.last_page)
      setTotal(res.data.meta.total)
    } catch {
      addToast('error', 'Gagal memuat data properti.')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, debouncedSearch, addToast])

  useEffect(() => {
    fetchProperties(page)
  }, [page, fetchProperties])

  useEffect(() => {
    setPage(1)
  }, [filterStatus, debouncedSearch])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari properti..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm font-body border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
          </div>
          <div className="flex bg-surface border border-outline-variant rounded-lg overflow-hidden">
            {(['all', 'published', 'unpublished'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 font-mono text-xs font-bold transition-colors ${
                  filterStatus === s
                    ? 'bg-primary text-on-primary'
                    : 'hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {s === 'all' ? 'Semua' : s === 'published' ? 'Tayang' : 'Tidak Tayang'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onAdd}
          className="bg-primary text-on-primary text-xs font-mono font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:opacity-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          ASET BARU
        </button>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="font-mono text-xs text-on-surface-variant">
          Menampilkan <strong className="text-primary">{total}</strong> properti
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Properti', 'Lokasi', 'Tipe', 'Harga Jual', 'Status', 'SPK', 'Aksi'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-surface-container-high rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : properties.length > 0 ? (
                properties.map(p => {
                  const daysLeft = p.spk?.days_remaining ?? 0
                  const spkUi = getSpkStatus(daysLeft)
                  const thumb = p.images?.[0]
                  return (
                    <tr key={p.id} className="hover:bg-surface transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                            {thumb ? (
                              <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-outline-variant text-[20px]">image</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-body text-sm font-semibold text-on-surface truncate max-w-[180px]">
                              {p.title}
                            </p>
                            <p className="font-mono text-[10px] text-on-surface-variant">{p.listing_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-on-surface-variant whitespace-nowrap font-medium">
                        {p.city}, {p.province}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] px-2 py-1 bg-surface-container rounded-full text-on-surface-variant uppercase">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-primary whitespace-nowrap">
                        {formatPrice(p.harga_jual ?? p.harga_penawaran)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-1 rounded-full ${
                              p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {p.is_published ? 'Tayang' : 'Tidak Tayang'}
                          </span>
                          {p.badge === 'Terjual' && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                              <span className="material-symbols-outlined text-[10px]">sell</span>
                              TERJUAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.spk ? (
                          <span className={`font-mono text-[10px] font-bold ${spkUi.color}`}>{spkUi.label}</span>
                        ) : (
                          <span className="text-on-surface-variant/40 font-mono text-[10px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEdit(p)}
                            title="Edit properti"
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => onDelete(p)}
                            title="Hapus properti"
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-on-surface-variant hover:text-red-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant font-body text-sm">
                    Tidak ada properti ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Unified Shared Pagination */}
        <div className="p-4 border-t border-outline-variant">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
