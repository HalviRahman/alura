import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminSidebar from '../components/layout/AdminSidebar'
import StatusBadge from '../components/ui/StatusBadge'
import RiskBadge from '../components/ui/RiskBadge'
import { formatPriceFull, formatPrice, getSpkStatus } from '../data/properties'
import {
  adminApi, offersApi, propertiesApi,
  type SpkAlert, type DashboardData,
} from '../services/api'
import type { Offer, OfferStatus, Property, PropertyType, RiskLevel } from '../types'

import PdfDownloadButton from '../components/admin/PdfDownloadButton'

import AnalyticsTab from '../components/admin/AnalyticsTab'
import UserManagementTab from '../components/admin/UserManagementTab'
import SpkTrackerTab from '../components/admin/SpkTrackerTab'
import ReportsTab from '../components/admin/ReportsTab'
import DistributionMapTab from '../components/admin/DistributionMapTab'
import TanyaDetailTab from '../components/admin/TanyaDetailTab'

// ─── Toast Notification ────────────────────────────────────────────────────

interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-body font-medium pointer-events-auto animate-in slide-in-from-right duration-300 max-w-sm ${
            t.type === 'success' ? 'bg-green-600 text-white'
            : t.type === 'error'   ? 'bg-red-600 text-white'
            :                        'bg-gray-800 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">
            {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100 flex-shrink-0">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  return { toasts, addToast, removeToast }
}

// ─── SPK Card Component ────────────────────────────────────────────────────

function SpkCard({ asset }: { asset: SpkAlert }) {
  const status = getSpkStatus(asset.days_remaining)
  const isCritical = asset.days_remaining <= 14
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isCritical) return
    const el = cardRef.current
    let visible = true
    const interval = setInterval(() => {
      visible = !visible
      if (el) el.style.opacity = visible ? '1' : '0.7'
    }, 900)
    return () => clearInterval(interval)
  }, [isCritical])

  const borderColor =
    asset.days_remaining <= 14 ? 'border-l-status-error'
    : asset.days_remaining <= 30 ? 'border-l-status-warning'
    : 'border-l-status-success'

  return (
    <div
      ref={cardRef}
      className={`bg-surface-container-low p-4 rounded-xl border-l-4 relative overflow-hidden group transition-opacity duration-500 ${borderColor}`}
    >
      <div className="absolute top-2 right-2 opacity-10 group-hover:scale-125 transition-transform duration-300">
        <span className="material-symbols-outlined text-[48px] text-on-surface">
          {asset.days_remaining <= 14 ? 'priority_high' : asset.days_remaining <= 30 ? 'pending_actions' : 'check_circle'}
        </span>
      </div>
      <p className="font-mono text-[10px] text-on-surface-variant">Nomor SPK: {asset.spk_number}</p>
      <h4 className="font-headline font-semibold text-base mt-1 text-on-surface truncate pr-6">{asset.title}</h4>
      <div className="mt-4">
        <span className={`font-mono text-xs font-bold ${status.color}`}>{status.label}</span>
        <div className="w-full bg-outline-variant h-1.5 rounded-full mt-2 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${status.bgColor}`} style={{ width: status.barWidth }} />
        </div>
      </div>
    </div>
  )
}

// ── Offer Detail Modal ──────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">{label}</span>
      <span className="font-body text-sm text-on-surface">{value || <span className="text-on-surface-variant/40 italic">—</span>}</span>
    </div>
  )
}

function OfferStatusModal({ offer, onClose, onSuccess }: { offer: Offer; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [newStatus, setNewStatus] = useState(offer.status)
  const [notes, setNotes]         = useState(offer.notes || '')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [tab, setTab]             = useState('detail')
  const [pdfLoading, setPdfLoading]     = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await offersApi.updateStatus(offer.uuid, newStatus, notes)
      onSuccess('Status penawaran berhasil diperbarui.')
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui status.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (pdfLoading) return
    setPdfLoading(true)
    try {
      const res = await offersApi.downloadPdf(offer.uuid)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `SuratMinat-${offer.applicant_name}-${offer.property?.listing_id ?? offer.uuid.slice(0,8)}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Gagal mengunduh PDF. Pastikan Microsoft Word terinstall di server.')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (emailLoading) return
    setEmailLoading(true)
    try {
      await offersApi.sendEmail(offer.uuid)
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim email. Coba lagi.')
    } finally {
      setEmailLoading(false)
    }
  }

  const tanggal = new Date(offer.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const statusColors = {
    'Pending':   'bg-amber-50 border-amber-200 text-amber-700',
    'Follow Up': 'bg-blue-50 border-blue-200 text-blue-700',
    'Reviewed':  'bg-emerald-50 border-emerald-200 text-emerald-700',
    'Final':     'bg-green-50 border-green-200 text-green-700',
    'Gugur':     'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <div className="flex items-start justify-between p-5 border-b border-outline-variant shrink-0">
          <div>
            <h2 className="font-headline font-bold text-xl text-primary">Detail Penawaran</h2>
            <p className="font-mono text-[11px] text-on-surface-variant mt-0.5">{tanggal}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant mt-0.5">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex border-b border-outline-variant shrink-0">
          {['detail', 'status'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${tab === t ? 'text-primary border-b-2 border-primary bg-surface-container-low' : 'text-on-surface-variant hover:text-primary'}`}>
              {t === 'detail' ? 'Data Pemohon' : 'Update Status'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {tab === 'detail' && (
            <div className="p-5 space-y-5">
              <div className="p-3 bg-surface-container-low border-l-4 border-primary rounded-r-lg">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">Properti</p>
                <p className="font-headline font-semibold text-base text-primary">{offer.property?.title ?? '—'}</p>
                <p className="font-mono text-[11px] text-on-surface-variant">{offer.property?.listing_id}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Data Pemohon</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2"><InfoRow label="Nama Lengkap Sesuai KTP" value={offer.applicant_name} /></div>
                  <InfoRow label="NIK" value={offer.applicant_nik ? <span className="font-mono tracking-widest text-xs">{offer.applicant_nik}</span> : null} />
                  <InfoRow label="No. WhatsApp" value={offer.applicant_phone ? <a href={`https://wa.me/${offer.applicant_phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{offer.applicant_phone}</a> : null} />
                  <div className="col-span-2"><InfoRow label="Alamat Sesuai KTP" value={offer.applicant_address} /></div>
                  <div className="col-span-2"><InfoRow label="Email" value={<a href={`mailto:${offer.applicant_email}`} className="text-primary underline underline-offset-2">{offer.applicant_email}</a>} /></div>
                </div>
              </div>

              <div className="border-t border-outline-variant" />

              <div>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Penawaran</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2">
                    <InfoRow label="Harga Penawaran" value={offer.offer_price > 0 ? <span className="font-mono font-bold text-primary text-base">{formatPriceFull(offer.offer_price)}</span> : <span className="font-mono text-on-surface-variant italic text-sm">Tanya Detail Aset</span>} />
                  </div>
                  <InfoRow label="Kode Referral" value={offer.referral_code} />
                  <InfoRow label="Agen" value={offer.agent?.name} />
                  <div>
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">Status</span>
                    <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${statusColors[offer.status as keyof typeof statusColors] ?? ''}`}>{offer.status}</span>
                  </div>
                </div>
              </div>

              {offer.notes && (
                <>
                  <div className="border-t border-outline-variant" />
                  <InfoRow label="Catatan Negosiasi" value={<p className="text-sm text-on-surface whitespace-pre-wrap mt-0.5">{offer.notes}</p>} />
                </>
              )}

              <div className="border-t border-outline-variant pt-4 flex flex-wrap gap-2">
                {offer.offer_price > 0 && (
                  <button onClick={handleDownloadPdf} disabled={pdfLoading} className="inline-flex items-center gap-2 bg-primary text-on-primary font-mono text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                    {pdfLoading ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>}
                    {pdfLoading ? 'Memproses...' : 'Unduh PDF'}
                  </button>
                )}
                {offer.offer_price > 0 && (
                  <button
                    onClick={handleSendEmail}
                    disabled={emailLoading || emailSent}
                    className={`inline-flex items-center gap-2 font-mono text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50 ${
                      emailSent
                        ? 'bg-status-success text-white'
                        : 'bg-surface-container border border-outline-variant text-on-surface hover:border-primary hover:text-primary'
                    }`}
                  >
                    {emailLoading
                      ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      : <span className="material-symbols-outlined text-[16px]">{emailSent ? 'check_circle' : 'forward_to_inbox'}</span>}
                    {emailLoading ? 'Mengirim...' : emailSent ? 'Terkirim!' : 'Kirim Email + PDF'}
                  </button>
                )}
                {offer.applicant_phone && (
                  <a href={`https://wa.me/${offer.applicant_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Halo ${offer.applicant_name}, kami dari tim ALURA Properti ingin menindaklanjuti penawaran Anda untuk properti ${offer.property?.title ?? ''}.`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white font-mono text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">chat</span>WhatsApp
                  </a>
                )}
                <button onClick={() => setTab('status')} className="inline-flex items-center gap-2 border border-primary text-primary font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">edit</span>Update Status
                </button>
              </div>
            </div>
          )}

          {tab === 'status' && (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-surface-container-low rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">person</span>
                <div>
                  <p className="font-body text-sm font-bold text-on-surface">{offer.applicant_name}</p>
                  <p className="font-mono text-[11px] text-primary">{offer.offer_price > 0 ? formatPriceFull(offer.offer_price) : 'Tanya Detail Aset'}</p>
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Pilih Status Baru</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value as OfferStatus)} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                  <option value="Pending">Pending — Menunggu Review</option>
                  <option value="Follow Up">Follow Up — Proses Negosiasi</option>
                  <option value="Reviewed">Reviewed — Dokumen Lengkap</option>
                  <option value="Final">Final — Transaksi Disetujui</option>
                  <option value="Gugur">Gugur — Gagal / Batal</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Catatan Negosiasi</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none" placeholder="Detail follow-up, alasan penolakan, atau progres verifikasi..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setTab('detail')} className="flex-1 border border-outline text-on-surface-variant font-body font-bold py-2.5 rounded-lg hover:bg-surface-container transition-colors">â† Kembali</button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary font-body font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  Perbarui Status
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────

function DeleteConfirmModal({
  property, onClose, onSuccess,
}: { property: Property; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await propertiesApi.delete(property.id)
      onSuccess(`Properti "${property.title}" berhasil dihapus.`)
      onClose()
    } catch (err: any) {
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-red-600 text-[28px]">delete_forever</span>
          </div>
          <h3 className="font-headline font-semibold text-lg text-on-surface">Hapus Properti?</h3>
          <p className="font-body text-sm text-on-surface-variant">
            Tindakan ini akan menghapus <span className="font-bold text-on-surface">"{property.title}"</span>. Data tidak dapat dipulihkan.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-outline text-on-surface font-body font-bold py-2.5 rounded-lg hover:bg-surface-container transition-colors">Batal</button>
            <button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 text-white font-body font-bold py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Property Drawer ─────────────────────────────────────────────────

function EditPropertyDrawer({
  property, onClose, onSuccess,
}: { property: Property; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [form, setForm] = useState({
    title: property.title,
    description: property.description || '',
    harga_penawaran: String(property.harga_penawaran),
    harga_jual: String(property.harga_jual ?? ''),
    nilai_liquidasi: String(property.nilai_liquidasi ?? ''),
    city: property.city,
    province: property.province,
    type: property.type,
    risk: property.risk,
    certificate: property.certificate,
    beds: String(property.beds ?? ''),
    baths: String(property.baths ?? ''),
    land_area: String(property.land_area ?? ''),
    build_area: String(property.build_area ?? ''),
    badge: property.badge || '',
    is_published: property.is_published,
    spk_end_date: property.spk?.end_date?.slice(0, 10) || '',
    bank_name: property.spk?.bank_name || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImages, setCurrentImages] = useState<string[]>(property.images || [])
  const [uploadingImages, setUploadingImages] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleDeleteImage = async (url: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto ini?')) return
    setError(null)
    try {
      await propertiesApi.deleteImage(property.id, url)
      setCurrentImages(prev => prev.filter(img => img !== url))
      onSuccess('Gambar properti berhasil dihapus.')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal menghapus gambar.'
      setError(errorMsg)
    }
  }

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploadingImages(true)
    setError(null)
    
    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('images[]', file)
    })

    try {
      const res = await propertiesApi.uploadImages(property.id, formData)
      setCurrentImages(res.data.images)
      onSuccess('Gambar baru berhasil ditambahkan.')
      if (e.target) {
        e.target.value = ''
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal mengunggah gambar.'
      setError(errorMsg)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload: Record<string, any> = {
        title: form.title,
        description: form.description || null,
        harga_penawaran: parseInt(form.harga_penawaran, 10),
        harga_jual: form.harga_jual ? parseInt(form.harga_jual, 10) : null,
        nilai_liquidasi: form.nilai_liquidasi ? parseInt(form.nilai_liquidasi, 10) : null,
        city: form.city,
        province: form.province,
        type: form.type,
        risk: form.risk,
        certificate: form.certificate,
        beds: form.beds ? parseInt(form.beds, 10) : null,
        baths: form.baths ? parseInt(form.baths, 10) : null,
        land_area: form.land_area ? parseInt(form.land_area, 10) : null,
        build_area: form.build_area ? parseInt(form.build_area, 10) : null,
        badge: form.badge || null,
        is_published: form.is_published,
      }
      if (form.spk_end_date) payload.spk_end_date = form.spk_end_date
      if (form.bank_name) payload.bank_name = form.bank_name

      await propertiesApi.update(property.id, payload)
      onSuccess(`Properti "${form.title}" berhasil diperbarui.`)
      onClose()
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Gagal memperbarui properti.'
      if (err.response?.data?.errors) {
        const details = Object.values(err.response.data.errors).flat().join(', ')
        if (details) {
          errorMsg += ` (${details})`
        }
      }
      setError(errorMsg)
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    } finally {
      setLoading(false)
    }
  }

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'type' && val === 'Tanah') {
        next.build_area = '0'
        next.beds = '0'
        next.baths = '0'
      }
      return next
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-surface w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant bg-surface-container-low">
          <div>
            <h2 className="font-headline font-bold text-xl text-primary">Edit Aset Properti</h2>
            <p className="font-mono text-[10px] text-on-surface-variant">{property.listing_id}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}

          {/* Published toggle */}
          <div className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-xl">
            <div>
              <p className="font-body text-sm font-bold text-on-surface">Status Tayang</p>
              <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">Properti yang tidak tayang tidak muncul di marketplace publik</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, is_published: !prev.is_published }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_published ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Section 1: Property Info */}
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">1. Informasi Properti</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Nama Properti *</label>
                <input type="text" required value={form.title} onChange={f('title')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={f('description')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Harga Penawaran (IDR) *</label>
                <input type="number" required value={form.harga_penawaran} onChange={f('harga_penawaran')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Harga Jual (IDR)</label>
                <input type="number" value={form.harga_jual} onChange={f('harga_jual')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Nilai Liquidasi (IDR)</label>
                <input type="number" value={form.nilai_liquidasi} onChange={f('nilai_liquidasi')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Tipe Aset *</label>
                <select value={form.type} onChange={f('type')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                  {['Rumah','Apartemen','Ruko','Tanah','Gudang','Perkantoran'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Kota *</label>
                <input type="text" required value={form.city} onChange={f('city')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Provinsi *</label>
                <input type="text" required value={form.province} onChange={f('province')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Risiko Legalitas *</label>
                <select value={form.risk} onChange={f('risk')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                  <option value="LOW">LOW (Risiko Rendah)</option>
                  <option value="MEDIUM">MEDIUM (Risiko Sedang)</option>
                  <option value="HIGH">HIGH (Risiko Tinggi)</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Sertifikat *</label>
                <input type="text" required value={form.certificate} onChange={f('certificate')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Luas Tanah (m²)</label>
                <input type="number" value={form.land_area} onChange={f('land_area')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Luas Bangunan (m²)</label>
                <input type="number" value={form.build_area} onChange={f('build_area')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Kamar Tidur</label>
                <input type="number" value={form.beds} onChange={f('beds')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Kamar Mandi</label>
                <input type="number" value={form.baths} onChange={f('baths')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Badge</label>
                <input type="text" value={form.badge} onChange={f('badge')} placeholder="TERSEDIA / HOT DEAL / dll" className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Section 2: SPK */}
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">2. Perjanjian Kerja Sama (SPK)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Nama Bank</label>
                <input type="text" value={form.bank_name} onChange={f('bank_name')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Tanggal Berakhir SPK</label>
                <input type="date" value={form.spk_end_date} onChange={f('spk_end_date')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Section 3: Foto Properti */}
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">3. Foto Properti</h3>
            
            {/* List of current images */}
            {currentImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {currentImages.map((url, index) => (
                  <div key={url} className="relative group aspect-video bg-surface-container rounded-lg overflow-hidden border border-outline-variant">
                    <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(url)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      title="Hapus foto ini"
                    >
                      <span className="material-symbols-outlined text-[20px] bg-red-600 p-1.5 rounded-full hover:bg-red-700 transition-colors">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">Belum ada foto properti.</p>
            )}

            {/* Upload new images */}
            <div className="p-4 bg-surface-container-low border border-dashed border-outline-variant rounded-xl">
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">Upload Foto Baru (Maks 10 file, @5MB)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUploadImages}
                disabled={uploadingImages}
                className="w-full bg-white border border-outline rounded-lg p-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:opacity-90 cursor-pointer"
              />
              {uploadingImages && (
                <div className="flex items-center gap-2 mt-2 text-xs text-primary font-mono">
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  <span>Mengunggah foto...</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-4 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="flex-1 border border-outline text-primary font-body font-bold py-3 rounded-lg hover:bg-surface-container transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add Asset Drawer ─────────────────────────────────────────────────────

function AddAssetDrawer({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [form, setForm] = useState({
    title: '', description: '', harga_penawaran: '', harga_jual: '', nilai_liquidasi: '',
    city: '', province: '',
    type: 'Rumah' as PropertyType, risk: 'LOW' as RiskLevel,
    certificate: 'SHM', beds: '', baths: '', land_area: '', build_area: '',
    badge: 'TERSEDIA', spk_number: '', spk_start_date: '', spk_end_date: '',
    bank_name: 'Bank ALURA', spk_notes: '', full_address: '', latitude: '', longitude: '',
  })
  const [images, setImages] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => { if (val !== '') formData.append(key, val) })
    if (images) Array.from(images).forEach(file => formData.append('images[]', file))
    try {
      await propertiesApi.create(formData)
      onSuccess('Aset properti baru berhasil ditambahkan!')
      onClose()
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Gagal menambahkan properti.'
      if (err.response?.data?.errors) {
        const details = Object.values(err.response.data.errors).flat().join(', ')
        if (details) {
          errorMsg += ` (${details})`
        }
      }
      setError(errorMsg)
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    } finally {
      setLoading(false)
    }
  }

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'type' && val === 'Tanah') {
        next.build_area = '0'
        next.beds = '0'
        next.baths = '0'
      }
      return next
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-surface w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant bg-surface-container-low">
          <div>
            <h2 className="font-headline font-bold text-xl text-primary">Tambah Aset Properti Baru</h2>
            <p className="font-body text-xs text-on-surface-variant">Masukkan rincian data aset dan dokumen legalitas SPK</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}

          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">1. Informasi Properti</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Nama Properti Aset *</label>
                <input type="text" required value={form.title} onChange={f('title')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Contoh: Ruko Central Business Park" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Deskripsi Lengkap *</label>
                <textarea rows={3} required value={form.description} onChange={f('description')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Jelaskan detail fisik properti..." />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Harga Penawaran (IDR) *</label>
                <input type="number" required value={form.harga_penawaran} onChange={f('harga_penawaran')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Rp (angka saja)" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Harga Jual (IDR)</label>
                <input type="number" value={form.harga_jual} onChange={f('harga_jual')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Rp (angka saja)" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Nilai Liquidasi (IDR)</label>
                <input type="number" value={form.nilai_liquidasi} onChange={f('nilai_liquidasi')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Rp (angka saja)" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Tipe Aset *</label>
                <select value={form.type} onChange={f('type')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                  {['Rumah','Apartemen','Ruko','Tanah','Gudang','Perkantoran'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Kota *</label>
                <input type="text" required value={form.city} onChange={f('city')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Contoh: Bandung" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Provinsi *</label>
                <input type="text" required value={form.province} onChange={f('province')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Contoh: Jawa Barat" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Risiko Legalitas *</label>
                <select value={form.risk} onChange={f('risk')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                  <option value="LOW">LOW (Risiko Rendah)</option>
                  <option value="MEDIUM">MEDIUM (Risiko Sedang)</option>
                  <option value="HIGH">HIGH (Risiko Tinggi)</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Sertifikat *</label>
                <input type="text" required value={form.certificate} onChange={f('certificate')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="SHM / SHGB / IMB" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Luas Tanah (m²)</label>
                <input type="number" value={form.land_area} onChange={f('land_area')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Luas Bangunan (m²)</label>
                <input type="number" value={form.build_area} onChange={f('build_area')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Kamar Tidur</label>
                <input type="number" value={form.beds} onChange={f('beds')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Kamar Mandi</label>
                <input type="number" value={form.baths} onChange={f('baths')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">2. Perjanjian Kerja Sama (SPK)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Nomor SPK *</label>
                <input type="text" required value={form.spk_number} onChange={f('spk_number')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="SPK-2026-X991" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Nama Bank *</label>
                <input type="text" required value={form.bank_name} onChange={f('bank_name')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Tanggal Mulai SPK *</label>
                <input type="date" required value={form.spk_start_date} onChange={f('spk_start_date')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Tanggal Berakhir SPK *</label>
                <input type="date" required value={form.spk_end_date} onChange={f('spk_end_date')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">3. Titik Lokasi (Terproteksi)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Alamat Lengkap</label>
                <input type="text" value={form.full_address} onChange={f('full_address')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={f('latitude')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="-6.12345" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={f('longitude')} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="106.12345" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">4. Upload Gambar Properti</h3>
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Pilih Foto (Maks 10 file, @5MB)</label>
              <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              {images && <p className="mt-1.5 font-mono text-xs text-status-success">✓ {images.length} file dipilih.</p>}
            </div>
          </div>

          <div className="pt-4 flex gap-4 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="flex-1 border border-outline text-primary font-body font-bold py-3 rounded-lg hover:bg-surface-container transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              {loading ? 'Menyimpan Aset...' : 'Simpan Aset Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Tab: Command Center ───────────────────────────────────────────────────

function CommandCenterTab({
  dashboardData, spkAlerts, onOfferClick, onRefresh,
}: {
  dashboardData: DashboardData
  spkAlerts: SpkAlert[]
  onOfferClick: (o: Offer) => void
  onRefresh: () => void
}) {
  const { summary, recent_offers: recentOffers, agent_stats: agentStats } = dashboardData

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
      {/* SPK Tracker */}
      <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">timer</span>
            <h3 className="font-headline font-semibold text-lg">SPK Status Tracker</h3>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-1 bg-error-container text-on-error-container rounded-full uppercase font-bold">
            {spkAlerts.length} Expiring Soon
          </span>
        </div>
        {spkAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spkAlerts.slice(0, 3).map(asset => <SpkCard key={asset.property_id} asset={asset} />)}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center font-body text-sm text-on-surface-variant">
            Tidak ada SPK kritis atau yang akan berakhir dalam 30 hari kedepan.
          </div>
        )}
      </section>

      {/* Quick Metrics */}
      <section className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
        <div className="bg-primary text-on-primary rounded-xl p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Total Nilai Penawaran</span>
          <div>
            <h2 className="font-headline font-bold text-3xl mt-2">{formatPriceFull(summary.total_value)}</h2>
            <div className="flex items-center gap-1 text-white/80 mt-2">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="font-mono text-xs">Total data terkumpul</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Status Leads</span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center bg-blue-50 p-2 rounded border border-blue-200">
              <span className="font-mono text-[9px] text-blue-700 uppercase block font-semibold">PENDING</span>
              <span className="font-headline font-bold text-lg text-blue-900">{summary.pending_count}</span>
            </div>
            <div className="text-center bg-green-50 p-2 rounded border border-green-200">
              <span className="font-mono text-[9px] text-green-700 uppercase block font-semibold">FINAL</span>
              <span className="font-headline font-bold text-lg text-green-900">{summary.final_count}</span>
            </div>
            <div className="text-center bg-gray-50 p-2 rounded border border-gray-200">
              <span className="font-mono text-[9px] text-gray-700 uppercase block font-semibold">TOTAL</span>
              <span className="font-headline font-bold text-lg text-gray-900">{summary.total_offers}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Offers */}
      <section className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-white">
          <h3 className="font-headline font-semibold text-lg">Recent Offers (Penawaran Terbaru)</h3>
          <span className="font-mono text-xs text-on-surface-variant italic">* Klik baris untuk update status</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Nama Pemohon','Aset Properti','Harga Penawaran','Agen Referral','Status','PDF'].map(h => (
                  <th key={h} className="px-6 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {recentOffers.length > 0 ? recentOffers.map((offer: Offer) => (
                <tr key={offer.id} onClick={() => onOfferClick(offer)} className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-body text-sm font-bold">{offer.applicant_name}</div>
                    <div className="font-mono text-[10px] text-on-surface-variant">{offer.applicant_email}</div>
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">
                    {offer.property?.title || '—'}
                    <div className="font-mono text-[10px]">ID: {offer.property?.listing_id || '—'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-primary">
                    {offer.offer_price > 0 ? formatPriceFull(offer.offer_price) : <span className="text-amber-600 font-bold uppercase tracking-wider text-xs">Tanya Detail</span>}
                  </td>
                  <td className="px-6 py-4">
                    {offer.agent ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center font-mono text-[10px] font-bold text-on-secondary-container flex-shrink-0">
                          {offer.referral_code?.slice(-2) || 'AG'}
                        </div>
                        <span className="font-body text-sm">{offer.agent.name}
                          <div className="font-mono text-[9px] text-on-surface-variant">{offer.referral_code}</div>
                        </span>
                      </div>
                    ) : <span className="font-mono text-xs text-on-surface-variant/40">— Tanpa Referral —</span>}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={offer.status} /></td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <PdfDownloadButton offer={offer} variant="compact" />
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-12 text-center text-on-surface-variant font-body text-sm">Belum ada penawaran masuk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Agent stats + Notice */}
      <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <h3 className="font-headline font-semibold text-lg mb-4">Statistik Agen Teratas</h3>
        <div className="space-y-4">
          {agentStats?.length > 0 ? agentStats.slice(0, 5).map(agent => (
            <div key={agent.id} className="flex justify-between items-center pb-3 border-b border-outline-variant last:border-0 last:pb-0">
              <div>
                <h4 className="font-body text-sm font-bold">{agent.name}</h4>
                <p className="font-mono text-[10px] text-on-surface-variant">{agent.referral_code}</p>
              </div>
              <span className="font-mono text-sm font-bold text-primary">{agent.total_leads} Leads</span>
            </div>
          )) : <p className="font-body text-xs text-on-surface-variant">Belum ada data agen.</p>}
        </div>
      </section>
      <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <h3 className="font-headline font-semibold text-lg mb-3">Notifikasi & Informasi SPK</h3>
        <div className="p-4 bg-surface-container-low border-l-4 border-primary rounded-r-lg">
          <p className="font-body text-sm text-on-surface-variant">
            <span className="font-bold text-on-surface">Daily Auto-check:</span> Sistem ALURA melakukan pemeriksaan validitas SPK setiap hari pada pukul 07:00 WIB. Properti dengan SPK berakhir akan otomatis diturunkan dari marketplace publik. Email notifikasi otomatis dikirimkan ke tim Manajemen jika SPK tersisa kurang dari 30 hari.
          </p>
        </div>
      </section>
    </div>
  )
}

// ─── Tab: Aset Properti ────────────────────────────────────────────────────

function AsetPropertiTab({
  onEdit, onDelete, onAdd, onRefresh,
  addToast,
}: {
  onEdit: (p: Property) => void
  onDelete: (p: Property) => void
  onAdd: () => void
  onRefresh: () => void
  addToast: (type: Toast['type'], msg: string) => void
}) {
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

  useEffect(() => { fetchProperties(page) }, [page, fetchProperties])
  useEffect(() => { setPage(1) }, [filterStatus, debouncedSearch])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
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
                  filterStatus === s ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high text-on-surface-variant'
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
        <span className="font-mono text-xs text-on-surface-variant">Menampilkan <strong className="text-primary">{total}</strong> properti</span>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Properti','Lokasi','Tipe','Harga Jual','Status','SPK','Aksi'].map(h => (
                  <th key={h} className="px-4 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-surface-container-high rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : properties.length > 0 ? properties.map(p => {
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
                            <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-outline-variant text-[20px]">image</span></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm font-semibold text-on-surface truncate max-w-[180px]">{p.title}</p>
                          <p className="font-mono text-[10px] text-on-surface-variant">{p.listing_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-on-surface-variant whitespace-nowrap">{p.city}, {p.province}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] px-2 py-1 bg-surface-container rounded-full text-on-surface-variant uppercase">{p.type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary whitespace-nowrap">{formatPrice(p.harga_jual ?? p.harga_penawaran)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-1 rounded-full ${
                          p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
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
                      ) : <span className="text-on-surface-variant/40 font-mono text-[10px]">—</span>}
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
              }) : (
                <tr><td colSpan={7} className="p-12 text-center text-on-surface-variant font-body text-sm">Tidak ada properti ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant flex justify-center items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), Math.min(totalPages, page + 2)
            ).map(pg => (
              <button key={pg} onClick={() => setPage(pg)}
                className={`w-8 h-8 flex items-center justify-center font-mono text-xs rounded-lg transition-colors ${
                  pg === page ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container-high'
                }`}>
                {pg}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Penawaran ────────────────────────────────────────────────────────

function PenawaranTab({
  onOfferClick,
}: { onOfferClick: (o: Offer) => void }) {
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

  useEffect(() => { fetchOffers(page) }, [page, fetchOffers])
  useEffect(() => { setPage(1) }, [filterStatus])

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
          <button key={s.value} onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${
              filterStatus === s.value ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container-high'
            }`}>
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
                {['Tanggal','Pemohon','Properti','Harga Penawaran','Agen Referral','Status','PDF'].map(h => (
                  <th key={h} className="px-5 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container-high rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : offers.length > 0 ? offers.map(offer => (
                <tr key={offer.id} onClick={() => onOfferClick(offer)} className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="px-5 py-3 font-mono text-[10px] text-on-surface-variant whitespace-nowrap">
                    {new Date(offer.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                    ) : <span className="font-mono text-xs text-on-surface-variant/40">—</span>}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={offer.status} /></td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <PdfDownloadButton offer={offer} variant="compact" />
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="p-12 text-center text-on-surface-variant font-body text-sm">Belum ada penawaran masuk.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant flex justify-center items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), Math.min(totalPages, page + 2)
            ).map(pg => (
              <button key={pg} onClick={() => setPage(pg)}
                className={`w-8 h-8 flex items-center justify-center font-mono text-xs rounded-lg transition-colors ${
                  pg === page ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container-high'
                }`}>
                {pg}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Admin Dashboard Page ─────────────────────────────────────────────

type TabId = 'command' | 'properties' | 'offers' | 'tanya_detail' | 'analytics' | 'users' | 'spk' | 'reports' | 'map'

export default function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabId) || 'command'

  const { toasts, addToast, removeToast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [spkAlerts, setSpkAlerts] = useState<SpkAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [editProperty, setEditProperty] = useState<Property | null>(null)
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null)
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)

  // Refresh triggers
  const [propertyRefreshKey, setPropertyRefreshKey] = useState(0)
  const [offerRefreshKey, setOfferRefreshKey] = useState(0)

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [dashRes, spkRes] = await Promise.all([
        adminApi.dashboard(),
        adminApi.spkAlerts(),
      ])
      setDashboardData(dashRes.data)
      setSpkAlerts([...spkRes.data.critical, ...spkRes.data.warning])
    } catch {
      setError('Gagal memuat data dashboard. Silakan refresh halaman.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboardData() }, [loadDashboardData])

  const handleOfferUpdateSuccess = async (msg: string) => {
    addToast('success', msg)
    setOfferRefreshKey(k => k + 1)
    await loadDashboardData()
  }

  const handlePropertySuccess = (msg: string) => {
    addToast('success', msg)
    setPropertyRefreshKey(k => k + 1)
    loadDashboardData()
  }



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 bg-surface border border-outline-variant rounded-xl max-w-md shadow-sm">
          <span className="material-symbols-outlined text-[80px] text-red-300 mb-4">gavel</span>
          <h2 className="font-headline font-semibold text-2xl text-primary mb-2">Command Center Error</h2>
          <p className="font-body text-sm text-on-surface-variant mb-6">{error}</p>
          <button onClick={loadDashboardData} className="bg-primary text-on-primary font-body font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <AdminSidebar onAddAsset={() => setIsAddAssetOpen(true)} />

      <main className="lg:ml-[280px] min-h-screen p-4 lg:p-6 pt-[68px] lg:pt-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-headline font-semibold text-2xl lg:text-3xl text-primary">Command Center</h2>
            <p className="font-body text-sm text-on-surface-variant mt-1 hidden sm:block">Monitoring aset institusional dan alur penawaran real-time.</p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setIsAddAssetOpen(true)}
              className="hidden lg:flex bg-primary text-on-primary text-xs font-mono font-bold px-4 py-2.5 rounded-lg items-center gap-1.5 hover:opacity-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              ASET BARU
            </button>
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-primary-container overflow-hidden bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container text-[18px] lg:text-[20px]">admin_panel_settings</span>
            </div>
          </div>
        </header>

        {/* Tab Content */}        {/* Tab Content */}
        {activeTab === 'command' && (
          <CommandCenterTab
            dashboardData={dashboardData}
            spkAlerts={spkAlerts}
            onOfferClick={offer => setSelectedOffer(offer)}
            onRefresh={loadDashboardData}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'users' && <UserManagementTab addToast={addToast} />}
        {activeTab === 'spk' && <SpkTrackerTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'map' && <DistributionMapTab />}
        {activeTab === 'properties' && (
          <AsetPropertiTab
            key={propertyRefreshKey}
            onEdit={setEditProperty}
            onDelete={setDeleteProperty}
            onAdd={() => setIsAddAssetOpen(true)}
            onRefresh={() => setPropertyRefreshKey(k => k + 1)}
            addToast={addToast}
          />
        )}
        {activeTab === 'offers' && (
          <PenawaranTab onOfferClick={offer => setSelectedOffer(offer)} />
        )}
        {activeTab === 'tanya_detail' && (
          <TanyaDetailTab
            onOfferClick={offer => setSelectedOffer(offer)}
            refreshKey={offerRefreshKey}
          />
        )}

        <footer className="mt-8 py-6 border-t border-outline-variant">
          <p className="font-body text-sm text-on-surface-variant">© 2024 ALURA Institutional Assets. All Rights Reserved.</p>
        </footer>
      </main>

      {/* Modals */}
      {selectedOffer && (
        <OfferStatusModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSuccess={handleOfferUpdateSuccess}
        />
      )}
      {editProperty && (
        <EditPropertyDrawer
          property={editProperty}
          onClose={() => setEditProperty(null)}
          onSuccess={handlePropertySuccess}
        />
      )}
      {deleteProperty && (
        <DeleteConfirmModal
          property={deleteProperty}
          onClose={() => setDeleteProperty(null)}
          onSuccess={handlePropertySuccess}
        />
      )}
      {isAddAssetOpen && (
        <AddAssetDrawer
          onClose={() => setIsAddAssetOpen(false)}
          onSuccess={handlePropertySuccess}
        />
      )}

      {/* Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
