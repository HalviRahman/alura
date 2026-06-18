import { useState } from 'react'
import { formatPriceFull } from '../../data/properties'
import { offersApi, getPdfUrl } from '../../services/api'
import type { Property } from '../../types'

interface OfferModalProps {
  property: Property
  refCode: string | null
  onClose: () => void
}

export default function OfferModal({ property, refCode, onClose }: OfferModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [offerPriceRaw, setOfferPriceRaw] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '')
    setOfferPriceRaw(val)
  }

  const getFormattedDisplayPrice = () => {
    if (!offerPriceRaw) return ''
    const num = parseInt(offerPriceRaw, 10)
    return formatPriceFull(num)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const price = parseInt(offerPriceRaw, 10)
    if (isNaN(price) || price <= 0) {
      setError('Harga penawaran tidak valid.')
      setIsLoading(false)
      return
    }

    try {
      const res = await offersApi.submit({
        property_id: property.id,
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        offer_price: price,
        referral_code: refCode || undefined,
      })

      setPdfUrl(res.data.offer.pdf_url)
      setSubmitted(true)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal mengirim penawaran. Pastikan semua data benar.'
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
          <h2 className="font-headline font-semibold text-2xl text-primary">Formulir Penawaran</h2>
          <button
            onClick={onClose}
            id="modal-close-btn"
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
            <h3 className="font-headline font-semibold text-xl text-primary">Penawaran Terkirim!</h3>
            <p className="font-body text-sm text-on-surface-variant">
              Dokumen penawaran resmi Anda berhasil dibuat. Tim ALURA akan menghubungi Anda dalam waktu maksimal 2x24 jam kerja.
            </p>
            {pdfUrl && (
              <a
                href={getPdfUrl(pdfUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-mono text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-opacity-95 transition-all mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                Unduh PDF Penawaran
              </a>
            )}
            <div className="pt-4 border-t border-outline-variant">
              <button
                onClick={onClose}
                className="bg-primary text-on-primary font-body font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Tutup Halaman
              </button>
            </div>
          </div>
        ) : (
          <form className="p-5 space-y-4" onSubmit={handleSubmit}>
            {/* Property info banner */}
            <div className="p-4 bg-surface-container-low border-l-4 border-primary rounded-r-lg">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Properti</p>
              <p className="font-headline font-semibold text-lg text-primary mt-0.5">{property?.title}</p>
              <p className="font-mono text-xs text-primary mt-0.5">ID: {property?.listing_id}</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-body">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Full name */}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nama Lengkap Sesuai KTP
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-white border border-outline rounded-lg p-3 font-body text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-outline rounded-lg p-3 font-body text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface"
                  placeholder="contoh@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="w-full bg-white border border-outline rounded-lg p-3 font-body text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface"
                  placeholder="+62 812..."
                />
              </div>

              {/* Offer price */}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Harga Penawaran Anda (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-on-surface-variant">Rp</span>
                  <input
                    type="text"
                    value={offerPriceRaw}
                    onChange={handlePriceChange}
                    required
                    className="w-full bg-white border border-outline rounded-lg pl-9 pr-3 py-3 font-mono text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface font-bold"
                    placeholder="Masukkan angka penawaran"
                  />
                </div>
                {offerPriceRaw && (
                  <p className="mt-1 font-mono text-xs text-status-success font-semibold">
                    {getFormattedDisplayPrice()}
                  </p>
                )}
              </div>

              {/* Referral code — auto-fill + lock */}
              <div className="relative">
                <label className="flex items-center gap-1 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Kode Referral
                  <span
                    className="material-symbols-outlined text-[14px] text-outline cursor-help"
                    title="Diisi otomatis jika melalui link agen"
                  >
                    info
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={refCode || ''}
                    id="referral-code-input"
                    className={`w-full border rounded-lg p-3 pr-10 font-mono text-sm cursor-not-allowed ${
                      refCode
                        ? 'bg-surface-container-low border-outline-variant text-on-surface-variant font-semibold'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant/40'
                    }`}
                    placeholder="— Tidak ada kode referral —"
                  />
                  {refCode && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      lock
                    </span>
                  )}
                </div>
                {refCode && (
                  <p className="mt-1.5 font-body text-[11px] text-on-surface-variant italic">
                    * Kolom ini terisi otomatis karena Anda mengakses melalui tautan agen resmi.
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                id="submit-offer-btn"
                className="w-full bg-status-success text-white font-body font-bold py-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                )}
                {isLoading ? 'Memproses Penawaran...' : 'Kirim Penawaran Sekarang'}
              </button>
              <p className="mt-3 font-body text-[11px] text-center text-on-surface-variant">
                Dengan menekan tombol di atas, Anda menyatakan penawaran ini sah dan setuju untuk dihubungi tim verifikasi ALURA.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
