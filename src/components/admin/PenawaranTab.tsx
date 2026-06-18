import React, { useState, useEffect, useCallback } from 'react'
import { offersApi, getPdfUrl } from '../../services/api'
import type { Offer, OfferStatus } from '../../types'
import { formatPriceFull } from '../../data/properties'
import StatusBadge from '../ui/StatusBadge'
import Pagination from '../ui/Pagination'

interface PenawaranTabProps {
  onOfferClick: (offer: Offer) => void
}

export default function PenawaranTab({ onOfferClick }: PenawaranTabProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterStatus, setFilterStatus] = useState<OfferStatus | ''>('')

  const fetchOffers = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await offersApi.list({ status: filterStatus || undefined, page: p, type: 'offer' })
      setOffers(res.data.data)
      setTotalPages(res.data.meta.last_page)
      setTotal(res.data.meta.total)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchOffers(page)
  }, [page, fetchOffers])

  useEffect(() => {
    setPage(1)
  }, [filterStatus])

  const statusOptions: Array<{ label: string; value: OfferStatus | '' }> = [
    { label: 'Semua', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Follow Up', value: 'Follow Up' },
    { label: 'Reviewed', value: 'Reviewed' },
    { label: 'Final', value: 'Final' },
    { label: 'Gugur', value: 'Gugur' },
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-on-surface-variant">Filter:</span>
        {statusOptions.map(s => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${
              filterStatus === s.value
                ? 'bg-primary text-on-primary'
                : 'border border-outline-variant hover:bg-surface-container-high'
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="font-mono text-xs text-on-surface-variant ml-2">
          Total: <span className="font-bold text-primary">{total}</span>
        </span>
      </div>

      {/* Table */}
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
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-body text-sm font-bold">{offer.applicant_name}</div>
                      <div className="font-mono text-[10px] text-on-surface-variant">{offer.applicant_email}</div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-on-surface-variant">
                      <div className="max-w-[160px] truncate">{offer.property?.title || '—'}</div>
                      <div className="font-mono text-[10px]">{offer.property?.listing_id || ''}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-sm font-bold text-primary whitespace-nowrap">
                      {offer.offer_price > 0 ? formatPriceFull(offer.offer_price) : <span className="text-amber-600 font-bold uppercase tracking-wider text-xs">Tanya Detail</span>}
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
                      {offer.pdf_url ? (
                        <a
                          href={getPdfUrl(offer.pdf_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs font-bold"
                        >
                          <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>PDF
                        </a>
                      ) : (
                        <span className="text-on-surface-variant/40">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant font-body text-sm">
                    Belum ada penawaran masuk.
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
