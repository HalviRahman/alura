import React, { useState, useEffect, useCallback, useRef } from 'react'
import { offersApi } from '../../services/api'
import PdfDownloadButton from './PdfDownloadButton'
import type { Offer, OfferStatus } from '../../types'
import { formatPriceFull } from '../../data/properties'
import StatusBadge from '../ui/StatusBadge'
import Pagination from '../ui/Pagination'

interface PenawaranTabProps {
  onOfferClick: (offer: Offer) => void
}

const STATUS_OPTIONS: Array<{ label: string; value: OfferStatus | '' }> = [
  { label: 'Semua',    value: '' },
  { label: 'Pending',  value: 'Pending' },
  { label: 'Follow Up', value: 'Follow Up' },
  { label: 'Reviewed', value: 'Reviewed' },
  { label: 'Final',    value: 'Final' },
  { label: 'Gugur',    value: 'Gugur' },
]

export default function PenawaranTab({ onOfferClick }: PenawaranTabProps) {
  const [offers, setOffers]           = useState<Offer[]>([])
  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [total, setTotal]             = useState(0)
  const [filterStatus, setFilterStatus] = useState<OfferStatus | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]           = useState('')       // debounced value
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce: tunggu 400ms setelah user berhenti mengetik
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(val)
      setPage(1)
    }, 400)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const fetchOffers = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await offersApi.list({
        status: filterStatus || undefined,
        page: p,
        type: 'offer',
        search: search || undefined,
      })
      setOffers(res.data.data)
      setTotalPages(res.data.meta.last_page)
      setTotal(res.data.meta.total)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search])

  useEffect(() => { fetchOffers(page) }, [page, fetchOffers])

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => { setPage(1) }, [filterStatus])

  return (
    <div className="space-y-4">

      {/* ── Toolbar: Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search box */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Cari nama, email, telepon, properti..."
            className="w-full pl-9 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface placeholder:text-on-surface-variant/50"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-on-surface-variant">Filter:</span>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => { setFilterStatus(s.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${
                filterStatus === s.value
                  ? 'bg-primary text-on-primary'
                  : 'border border-outline-variant hover:bg-surface-container-high'
              }`}
            >
              {s.label}
            </button>
          ))}
          <span className="font-mono text-xs text-on-surface-variant ml-1">
            Total: <span className="font-bold text-primary">{total}</span>
          </span>
        </div>
      </div>

      {/* Search result indicator */}
      {search && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg w-fit">
          <span className="material-symbols-outlined text-primary text-[14px]">filter_alt</span>
          <span className="font-mono text-xs text-primary">
            Hasil pencarian: <strong>"{search}"</strong>
          </span>
          <button onClick={clearSearch} className="text-primary/60 hover:text-primary ml-1">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Tanggal', 'Pemohon', 'Properti', 'Harga Penawaran', 'Agen Referral', 'Status', 'PDF'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-surface-container-high rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : offers.length > 0 ? (
                offers.map(offer => (
                  <tr
                    key={offer.id}
                    onClick={() => onOfferClick(offer)}
                    className="hover:bg-surface transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono text-[10px] text-on-surface-variant whitespace-nowrap">
                      {new Date(offer.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-body text-sm font-bold">
                        {/* Highlight matching text */}
                        {search
                          ? highlightMatch(offer.applicant_name, search)
                          : offer.applicant_name}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant">
                        {search
                          ? highlightMatch(offer.applicant_email, search)
                          : offer.applicant_email}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-on-surface-variant">
                      <div className="max-w-[160px] truncate">
                        {search
                          ? highlightMatch(offer.property?.title || '—', search)
                          : (offer.property?.title || '—')}
                      </div>
                      <div className="font-mono text-[10px]">{offer.property?.listing_id || ''}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm font-bold text-primary whitespace-nowrap">
                      {offer.offer_price > 0
                        ? formatPriceFull(offer.offer_price)
                        : <span className="text-amber-600 font-bold uppercase tracking-wider text-xs">Tanya Detail</span>}
                    </td>
                    <td className="px-5 py-3">
                      {offer.agent ? (
                        <div>
                          <div className="font-body text-sm">{offer.agent.name}</div>
                          <div className="font-mono text-[10px] text-on-surface-variant">{offer.referral_code}</div>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-on-surface-variant/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                      <PdfDownloadButton offer={offer} variant="compact" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] opacity-30">
                        {search ? 'search_off' : 'inbox'}
                      </span>
                      <p className="font-body text-sm">
                        {search
                          ? `Tidak ada hasil untuk "${search}"`
                          : 'Belum ada penawaran masuk.'}
                      </p>
                      {search && (
                        <button onClick={clearSearch} className="font-mono text-xs text-primary underline underline-offset-2 mt-1">
                          Hapus pencarian
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}

/** Highlight bagian teks yang cocok dengan query pencarian */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
