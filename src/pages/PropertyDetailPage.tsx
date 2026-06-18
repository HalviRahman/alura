import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import TopNavBar from '../components/layout/TopNavBar'
import Footer from '../components/layout/Footer'
import OfferModal from '../components/property/OfferModal'
import DetailInquiryModal from '../components/property/DetailInquiryModal'
import RiskBadge from '../components/ui/RiskBadge'
import { formatPriceFull, getSpkStatus } from '../data/properties'
import { propertiesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Property } from '../types'

export default function PropertyDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref')
  const { hasRole } = useAuth()
  const isManajemen = hasRole('manajemen')

  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!uuid) return
      setIsLoading(true)
      setError(null)
      try {
        const res = await propertiesApi.show(uuid)
        setProperty(res.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Properti tidak ditemukan atau SPK telah berakhir.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProperty()
  }, [uuid])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 bg-surface border border-outline-variant rounded-xl max-w-md shadow-sm">
          <span className="material-symbols-outlined text-[80px] text-red-300 mb-4">home_work</span>
          <h2 className="font-headline font-semibold text-2xl text-primary mb-2">Tidak Dapat Memuat Aset</h2>
          <p className="font-body text-sm text-on-surface-variant mb-6">{error || 'Properti tidak ditemukan.'}</p>
          <Link
            to="/"
            className="bg-primary text-on-primary font-body font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity inline-block"
          >
            Kembali ke Marketplace
          </Link>
        </div>
      </div>
    )
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80']

  // SPK days remaining
  const daysLeft = property.spk?.days_remaining ?? 0
  const spkStatus = getSpkStatus(daysLeft)

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <main className="max-w-container-max mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-5 text-on-surface-variant font-mono text-xs">
          <Link to="/" className="hover:text-primary transition-colors">Marketplace</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface-variant">{property.province}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">{property.title}</span>
        </div>

        {/* Bento Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 h-auto md:h-[480px]">
          {/* Main image */}
          <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-xl group cursor-pointer" onClick={() => setActiveImg(0)}>
            <img
              src={images[activeImg] || images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 min-h-[300px]"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {property.badge && (
                <span className="bg-status-success text-white px-3 py-1 rounded text-[10px] font-bold font-mono uppercase">
                  {property.badge}
                </span>
              )}
              {isManajemen && property.spk && (
                <span className="bg-primary text-white px-3 py-1 rounded text-[10px] font-bold font-mono uppercase">
                  SPK {property.spk.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail grid */}
          {[1, 2, 3].map(idx => (
            <div key={idx} className={`overflow-hidden rounded-xl bg-surface-container ${idx === 3 ? 'relative' : ''}`}>
              {images[idx] ? (
                <>
                  <img
                    src={images[idx]}
                    alt={`${property.title} ${idx + 1}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer min-h-[120px]"
                    onClick={() => setActiveImg(idx)}
                  />
                  {idx === 3 && images.length > 4 && (
                    <button
                      onClick={() => setActiveImg(0)}
                      className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-sm border border-outline-variant px-3 py-1.5 rounded-lg font-mono text-xs hover:bg-surface transition-all flex items-center gap-1.5 text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_library</span>
                      Lihat {images.length} Foto
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-surface-container-high min-h-[120px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant text-[32px]">image</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail + Sticky CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <section>
              <h1 className="font-headline font-semibold text-3xl text-primary mb-3">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span>{property.city}, {property.province}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant hidden md:block"></div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>Listing ID: <span className="font-mono">{property.listing_id}</span></span>
                </div>
              </div>
            </section>

            {/* Spec grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-container-low border border-outline-variant rounded-xl">
              {property.land_area != null && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Luas Tanah</span>
                  <span className="font-mono text-xs font-bold text-primary">{property.land_area} m²</span>
                </div>
              )}
              {property.build_area != null && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Luas Bangunan</span>
                  <span className="font-mono text-xs font-bold text-primary">{property.build_area} m²</span>
                </div>
              )}
              {property.beds != null && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Kamar Tidur</span>
                  <span className="font-mono text-xs font-bold text-primary">{property.beds} KT</span>
                </div>
              )}
              {property.baths != null && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Kamar Mandi</span>
                  <span className="font-mono text-xs font-bold text-primary">{property.baths} KM</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Tipe</span>
                <span className="font-mono text-xs font-bold text-primary">{property.type}</span>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <section>
                <h2 className="font-headline font-semibold text-xl text-primary mb-3">Deskripsi Properti</h2>
                <p className="font-body text-base text-on-surface-variant leading-relaxed">{property.description}</p>
              </section>
            )}

            {/* Notice: No exact location */}
            <div className="flex items-start gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] mt-0.5 flex-shrink-0">info</span>
              <p className="font-body text-sm text-on-surface-variant">
                <span className="font-bold text-on-surface">Lokasi tidak ditampilkan secara spesifik.</span>{' '}
                Koordinat dan titik lokasi pasti aset ini akan disampaikan secara langsung oleh tim ALURA setelah proses penawaran terverifikasi, demi keamanan aset di lapangan.
              </p>
            </div>
          </div>

          {/* Right: Sticky Offer Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-surface border border-outline-variant rounded-xl shadow-sm">
              {/* Price */}
              <div className="mb-5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Harga Jual</span>
                <div className="font-headline font-semibold text-2xl text-primary mt-1 leading-tight">
                  {formatPriceFull(property.harga_jual ?? property.harga_penawaran)}
                </div>
              </div>

              {/* Details list */}
              <div className="space-y-0 mb-6 divide-y divide-outline-variant">
                <div className="flex justify-between items-center py-2.5">
                  <span className="font-body text-sm text-on-surface-variant">Sertifikat</span>
                  <span className="font-body text-sm font-bold text-primary">{property.certificate}</span>
                </div>
                {isManajemen && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="font-body text-sm text-on-surface-variant">Status Aset</span>
                    <RiskBadge risk={property.risk} />
                  </div>
                )}
                {isManajemen && property.spk && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="font-body text-sm text-on-surface-variant">SPK Expiry</span>
                    <span className={`font-mono text-xs font-bold ${spkStatus.color}`}>
                      {spkStatus.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Referral banner */}
              {refCode && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-secondary-container/30 border border-secondary-container rounded-lg">
                  <span className="material-symbols-outlined text-on-secondary-container text-[18px]">verified_user</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] text-on-surface-variant uppercase">Via Agen Referral</p>
                    <p className="font-mono text-xs font-bold text-primary truncate">{refCode}</p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                id="open-offer-modal-btn"
                onClick={() => setModalOpen(true)}
                className="w-full bg-primary text-on-primary font-body font-bold py-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Ajukan Penawaran
              </button>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full mt-3 bg-transparent border border-outline text-primary font-body font-bold py-3 rounded-lg hover:bg-surface-container-low transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                Tanya Detail Aset
              </button>
              <p className="mt-4 font-body text-[11px] text-center text-on-surface-variant leading-tight">
                Dengan menekan tombol di atas, Anda menyetujui syarat dan ketentuan Marketplace ALURA.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Offer Modal */}
      {modalOpen && (
        <OfferModal
          property={property}
          refCode={refCode}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Detail Inquiry Modal */}
      {inquiryModalOpen && (
        <DetailInquiryModal
          property={property}
          refCode={refCode}
          onClose={() => setInquiryModalOpen(false)}
        />
      )}
    </div>
  )
}
