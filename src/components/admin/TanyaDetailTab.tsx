import React, { useState, useEffect, useCallback } from 'react'
import { offersApi, getPdfUrl } from '../../services/api'
import type { Offer, OfferStatus } from '../../types'
import { formatPriceFull } from '../../data/properties'
import StatusBadge from '../ui/StatusBadge'
import Pagination from '../ui/Pagination'

interface TanyaDetailTabProps {
  onOfferClick: (offer: Offer) => void
  refreshKey?: number
}

export default function TanyaDetailTab({ onOfferClick, refreshKey = 0 }: TanyaDetailTabProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterStatus, setFilterStatus] = useState<OfferStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchOffers = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await offersApi.list({
        status: filterStatus || undefined,
        search: debouncedSearch || undefined,
        page: p,
        type: 'inquiry',
      })
      setOffers(res.data.data)
      setTotalPages(res.data.meta.last_page)
      setTotal(res.data.meta.total)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filterStatus, debouncedSearch])

  useEffect(() => {
    fetchOffers(page)
  }, [page, fetchOffers, refreshKey])

  useEffect(() => {
    setPage(1)
  }, [filterStatus])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getWhatsAppUrl = (phone: string, applicantName: string, propertyTitle: string) => {
    let cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1)
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone
    }
    const message = encodeURIComponent(
      `Halo ${applicantName}, terima kasih telah menyatakan ketertarikan Anda pada aset "${propertyTitle}" di ALURA. Saya dari tim manajemen ALURA ingin menindaklanjuti detail aset tersebut.`
    )
    return `https://wa.me/${cleanPhone}?text=${message}`
  }

  const statusOptions: Array<{ label: string; value: OfferStatus | '' }> = [
    { label: 'Semua Leads', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Follow Up', value: 'Follow Up' },
    { label: 'Reviewed', value: 'Reviewed' },
    { label: 'Final', value: 'Final' },
    { label: 'Gugur', value: 'Gugur' },
  ]

  // Get color based on name hash for unique profile initials
  const getAvatarColor = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
      'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
      'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
    ]
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-surface border border-outline-variant p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-headline font-semibold text-lg text-primary">Daftar Tanya Detail Asset</h3>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">
            Daftar calon pembeli/leads yang tertarik dengan properti yang ditampilkan. Gunakan tombol hubungi untuk bernegosiasi secara langsung.
          </p>
        </div>
        <div className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-mono text-xs font-bold shadow-sm">
          Total Leads: {total}
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.map(s => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                filterStatus === s.value
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface border border-outline-variant hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-md w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama, kontak, atau aset..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface border border-outline rounded-lg font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-[18px] flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Leads CRM List */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton loader cards
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-outline-variant p-6 rounded-xl animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-surface-container-high rounded w-24" />
                <div className="h-6 bg-surface-container-high rounded-full w-20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-6 bg-surface-container-high rounded w-48" />
                  <div className="h-4 bg-surface-container-high rounded w-32" />
                  <div className="h-4 bg-surface-container-high rounded w-40" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-surface-container-high rounded w-full" />
                  <div className="h-4 bg-surface-container-high rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : offers.length > 0 ? (
          offers.map(offer => (
            <div
              key={offer.id}
              className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl hover:shadow-md transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-outline-variant/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">calendar_today</span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    {new Date(offer.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={offer.status} />
                </div>
              </div>

              {/* Card Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Col 1: Lead Profile */}
                <div className="md:col-span-5 flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-headline font-black text-lg ${getAvatarColor(
                      offer.applicant_name
                    )}`}
                  >
                    {offer.applicant_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h4 className="font-headline font-bold text-base text-on-surface truncate">
                      {offer.applicant_name}
                    </h4>

                    {/* Email Contact */}
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant group">
                      <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                      <a href={`mailto:${offer.applicant_email}`} className="hover:underline hover:text-primary truncate">
                        {offer.applicant_email}
                      </a>
                      <button
                        onClick={() => copyToClipboard(offer.applicant_email, `email-${offer.id}`)}
                        className="hover:text-primary p-0.5 rounded transition-colors flex items-center"
                        title="Salin Email"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === `email-${offer.id}` ? 'done' : 'content_copy'}
                        </span>
                      </button>
                    </div>

                    {/* Phone Contact */}
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-primary">phone</span>
                      <a href={`tel:${offer.applicant_phone}`} className="hover:underline hover:text-primary">
                        {offer.applicant_phone}
                      </a>
                      <button
                        onClick={() => copyToClipboard(offer.applicant_phone, `phone-${offer.id}`)}
                        className="hover:text-primary p-0.5 rounded transition-colors flex items-center"
                        title="Salin Nomor"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === `phone-${offer.id}` ? 'done' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Col 2: Property & Offer Info */}
                <div className="md:col-span-4 space-y-2">
                  <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/65">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant block">Aset Properti</span>
                    <h5 className="font-body text-sm font-bold text-on-surface line-clamp-1">
                      {offer.property?.title || '—'}
                    </h5>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        {offer.property?.listing_id || ''}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        {offer.offer_price > 0 ? formatPriceFull(offer.offer_price) : <span className="text-amber-600 font-bold uppercase tracking-wider text-[10px]">Tanya Detail</span>}
                      </span>
                    </div>
                  </div>

                  {offer.agent && (
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
                      <span className="material-symbols-outlined text-[16px]">person_pin_circle</span>
                      <span>Ref Agen: {offer.agent.name} ({offer.referral_code})</span>
                    </div>
                  )}
                </div>

                {/* Col 3: Follow Up & Negotiation Notes */}
                <div className="md:col-span-3 flex flex-col justify-between">
                  <div className="bg-surface-container-high/45 p-3 rounded-lg border border-dashed border-outline-variant text-xs space-y-1">
                    <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">
                      <span className="material-symbols-outlined text-[12px]">forum</span>
                      <span>Catatan Manajemen</span>
                    </div>
                    <p className="font-body italic text-on-surface line-clamp-3">
                      {offer.notes ? `"${offer.notes}"` : 'Belum ada catatan follow-up.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-wrap justify-between items-center gap-3 border-t border-outline-variant/30 pt-3 mt-1">
                {/* Instant WhatsApp Link */}
                <a
                  href={getWhatsAppUrl(offer.applicant_phone, offer.applicant_name, offer.property?.title || '')}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-body font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.774-4.342 9.777-9.679.002-2.586-1.002-5.02-2.828-6.848-1.827-1.826-4.26-2.83-6.848-2.831-5.407 0-9.778 4.341-9.78 9.68-.001 2.05.535 4.05 1.553 5.81l-.99 3.616 3.722-.973zm12.355-6.815c-.32-.16-1.89-.93-2.185-1.04-.294-.11-.51-.16-.72.16-.21.32-.82 1.04-1.005 1.25-.185.21-.37.24-.69.08-.32-.16-1.353-.5-2.578-1.593-.952-.85-1.595-1.9-1.782-2.22-.185-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.988-2.39-.26-.63-.53-.55-.72-.56-.185-.01-.397-.01-.61-.01-.21 0-.553.08-.843.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.246 3.43 5.44 4.81.76.33 1.35.53 1.81.67.76.24 1.46.21 2.01.13.61-.09 1.89-.77 2.155-1.48.265-.7.265-1.31.185-1.43-.08-.12-.294-.2-.615-.36z" />
                  </svg>
                  <span>Hubungi WhatsApp</span>
                </a>

                {/* Open Status Modal Trigger */}
                <button
                  onClick={() => onOfferClick(offer)}
                  className="bg-surface border border-primary text-primary hover:bg-primary/5 font-body font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Update Catatan / Status</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface border border-outline-variant p-16 text-center rounded-xl">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40 mb-3 block">
              chat_bubble
            </span>
            <h4 className="font-headline font-bold text-base text-on-surface">Tidak ada data Leads</h4>
            <p className="font-body text-xs text-on-surface-variant mt-1">
              {searchQuery
                ? 'Tidak ada data tanya detail asset yang cocok dengan kueri pencarian Anda.'
                : 'Belum ada data pemohon tanya detail asset masuk saat ini.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-surface border border-outline-variant p-4 rounded-xl">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  )
}
