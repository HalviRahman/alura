import { useState, useEffect, useCallback } from 'react'
import api, { adminApi } from '../../services/api'
import type { Offer } from '../../types'
import { formatPriceFull } from '../../data/properties'
import StatusBadge from '../ui/StatusBadge'

export default function ReportsTab() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalValue, setTotalValue] = useState(0)

  // Filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('')

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await adminApi.reports({
        page: p,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: status || undefined,
      })
      setOffers(res.data.data)
      setTotalPages(res.data.meta.last_page)
      setTotalItems(res.data.meta.total)
      setTotalValue(res.data.meta.total_value)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, status])

  useEffect(() => { load(page) }, [load, page])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [dateFrom, dateTo, status])

  const handleExport = async () => {
    try {
      const params: Record<string, string> = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (status) params.status = status
      
      const response = await api.get('/admin/reports', {
        params: { ...params, format: 'csv' },
        responseType: 'blob',
      })
      
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      let filename = `laporan-penawaran-${new Date().toISOString().slice(0, 10)}.csv`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Failed to export CSV:', err)
      alert('Gagal mengekspor CSV. Silakan coba lagi.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters & Export */}
      <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end shadow-sm">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider mb-1 text-on-surface-variant">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider mb-1 text-on-surface-variant">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider mb-1 text-on-surface-variant">Status Penawaran</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary outline-none bg-surface"
            >
              <option value="">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Final">Final</option>
              <option value="Gugur">Gugur</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-700 text-white font-mono text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-800 transition-colors h-[38px]"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          EXPORT CSV
        </button>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center bg-primary-container text-on-primary-container p-4 rounded-xl border border-outline-variant">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest block opacity-70">Total Penawaran (Filter Aktif)</span>
          <span className="font-headline font-bold text-xl">{totalItems} leads</span>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] uppercase tracking-widest block opacity-70">Nilai Valid (Non-Gugur)</span>
          <span className="font-mono text-xl font-bold">{formatPriceFull(totalValue)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Tgl Masuk', 'Pemohon', 'Kontak', 'Properti (Listing ID)', 'Nilai Penawaran', 'Agen/Referral', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></td></tr>
              ) : offers.length > 0 ? offers.map(offer => (
                <tr key={offer.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] whitespace-nowrap">
                    {new Date(offer.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-body text-xs font-bold text-on-surface">{offer.applicant_name}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-on-surface-variant">
                    <div className="truncate w-32" title={offer.applicant_email}>{offer.applicant_email}</div>
                    <div>{offer.applicant_phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-body text-xs font-semibold line-clamp-1">{offer.property?.title || '—'}</div>
                    <div className="font-mono text-[9px] text-on-surface-variant">{offer.property?.listing_id || '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{offer.offer_price > 0 ? formatPriceFull(offer.offer_price) : <span className="text-amber-600 font-bold uppercase tracking-wider text-[10px]">Tanya Detail</span>}</td>
                  <td className="px-4 py-3">
                    <div className="font-body text-xs">{offer.agent?.name || '—'}</div>
                    <div className="font-mono text-[9px] text-on-surface-variant">{offer.referral_code || 'Direct'}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={offer.status} /></td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="p-12 text-center text-on-surface-variant font-body text-sm">Tidak ada data penawaran.</td></tr>
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
    </div>
  )
}
