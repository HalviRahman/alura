import { useState } from 'react'
import { offersApi } from '../../services/api'
import type { Offer } from '../../types'

interface PdfDownloadButtonProps {
  offer: Offer
  /** Variant untuk tabel ringkas vs detail */
  variant?: 'compact' | 'full'
}

/**
 * Tombol unduh PDF Surat Minat Aset untuk panel manajemen.
 * Mengambil PDF via API (dengan Bearer token) dan men-trigger download.
 * Tidak mengekspos URL storage langsung ke browser.
 */
export default function PdfDownloadButton({ offer, variant = 'compact' }: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  // PDF hanya untuk penawaran resmi (bukan inquiry/tanya detail)
  if (offer.offer_price <= 0) {
    return <span className="text-on-surface-variant/40 font-mono text-xs">—</span>
  }

  const handleDownload = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await offersApi.downloadPdf(offer.uuid)
      // Buat blob URL sementara dan trigger download
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `SuratMinat-${offer.applicant_name}-${offer.property?.listing_id ?? offer.uuid.slice(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Gagal mengunduh PDF. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-primary text-on-primary font-mono text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
        )}
        {loading ? 'Mengunduh...' : 'Unduh Surat Minat (PDF)'}
      </button>
    )
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Unduh Surat Minat Aset"
      className="inline-flex items-center gap-1 text-primary hover:text-primary/70 font-mono text-xs font-bold transition-colors disabled:opacity-50"
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[15px]">progress_activity</span>
      ) : (
        <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
      )}
      {loading ? '...' : 'PDF'}
    </button>
  )
}
