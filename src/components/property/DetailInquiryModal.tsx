import { useState } from 'react'
import { offersApi } from '../../services/api'
import type { Property } from '../../types'

interface DetailInquiryModalProps {
  property: Property
  refCode: string | null
  onClose: () => void
}

export default function DetailInquiryModal({ property, refCode, onClose }: DetailInquiryModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Semua bidang wajib diisi.')
      setIsLoading(false)
      return
    }

    try {
      await offersApi.submit({
        property_id: property.id,
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        offer_price: 0, // 0 indicates Detail Inquiry / Tanya Detail Aset
        referral_code: refCode || undefined,
      })

      setSubmitted(true)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal mengirim permohonan. Pastikan semua data benar.'
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-outline-variant">
          <div className="space-y-1">
            <h2 className="font-headline font-semibold text-2xl text-primary">Tanya Detail Aset</h2>
            <p className="font-body text-xs text-on-surface-variant">Properti: {property.title}</p>
          </div>
          <button
            onClick={onClose}
            id="inquiry-modal-close-btn"
            className="w-9 h-9 flex items-center justify-center hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-status-success text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h3 className="font-headline font-semibold text-xl text-primary">Permohonan Terkirim!</h3>
            <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
              Permohonan informasi Anda telah terdaftar. Manajemen ALURA akan segera menghubungi Anda melalui WhatsApp, Telepon, atau Email untuk memberikan penjelasan detail aset ini.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full bg-primary text-on-primary font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Tutup Halaman
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-surface-container-low p-4 rounded-lg text-xs font-body text-on-surface-variant border border-outline-variant/60 leading-relaxed">
              <span className="font-bold text-primary block mb-1">Informasi Layanan:</span>
              Silakan lengkapi data kontak Anda. Tim verifikasi ALURA akan menggunakan data ini untuk menghubungi Anda guna memverifikasi minat Anda dan menjadwalkan panggilan penjelasan detail properti.
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-body">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Nama */}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-outline rounded-lg p-3 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-outline rounded-lg p-3 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* No WhatsApp */}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nomor HP / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-outline rounded-lg p-3 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <p className="mt-1 font-body text-[10px] text-on-surface-variant">
                  Gunakan nomor aktif yang terhubung dengan WhatsApp untuk respon lebih cepat.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-outline text-primary font-body font-bold py-3 rounded-lg hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-on-primary font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoading && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                )}
                Kirim Permohonan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
