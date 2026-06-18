import React, { useState } from 'react'
import { offersApi } from '../../services/api'
import { formatPriceFull } from '../../data/properties'
import type { Offer, OfferStatus } from '../../types'

interface OfferStatusModalProps {
  offer: Offer
  onClose: () => void
  onSuccess: (msg: string) => void
}

export default function OfferStatusModal({ offer, onClose, onSuccess }: OfferStatusModalProps) {
  const [newStatus, setNewStatus] = useState<OfferStatus>(offer.status)
  const [notes, setNotes] = useState(offer.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant">
          <h2 className="font-headline font-semibold text-xl text-primary">Update Status Penawaran</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-surface-container-low rounded-lg">
            <p className="font-mono text-[10px] text-on-surface-variant uppercase">Pemohon</p>
            <p className="font-body text-sm font-bold text-on-surface">{offer.applicant_name}</p>
            <p className="font-mono text-[10px] text-primary mt-0.5">Penawaran: {formatPriceFull(offer.offer_price)}</p>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Pilih Status Baru</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as OfferStatus)}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="Pending">Pending (Menunggu Review)</option>
              <option value="Follow Up">Follow Up (Proses Negosiasi)</option>
              <option value="Reviewed">Reviewed (Dokumen Lengkap)</option>
              <option value="Final">Final (Transaksi Disetujui)</option>
              <option value="Gugur">Gugur (Gagal / Batal)</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Catatan Negosiasi</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="Detail follow-up, alasan penolakan, atau progres verifikasi..."
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-outline text-primary font-body font-bold py-2.5 rounded-lg hover:bg-surface-container transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary font-body font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50">
              {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
              Perbarui Status
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
