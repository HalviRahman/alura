import { Link } from 'react-router-dom'
import { formatPriceFull } from '../../data/properties'
import { useAuth } from '../../context/AuthContext'
import RiskBadge from '../ui/RiskBadge'
import type { Property } from '../../types'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { hasRole } = useAuth()
  const isManajemen = hasRole('manajemen')
  const {
    id,
    uuid,
    title,
    city,
    province,
    badge,
    harga_penawaran,
    harga_jual,
    beds,
    baths,
    land_area,
    build_area,
    type,
    images
  } = property

  // Determine badge color class
  const getBadgeClass = (b: string | null) => {
    if (!b) return 'bg-primary'
    const val = b.toLowerCase()
    if (val.includes('baru') || val.includes('tersedia') || val.includes('spesial')) {
      return 'bg-status-success'
    }
    if (val.includes('lelang') || val.includes('segera') || val.includes('kritis')) {
      return 'bg-status-warning'
    }
    if (val.includes('terjual') || val.includes('expired') || val.includes('kritis')) {
      return 'bg-status-error'
    }
    return 'bg-primary'
  }

  const badgeBg = getBadgeClass(badge)
  const imageUrl = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'

  return (
    <Link
      to={`/property/${uuid}`}
      className="group bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 block"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-container">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {badge && (
            <span className={`${badgeBg} text-white font-mono text-[10px] font-bold px-2 py-1 rounded`}>
              {badge}
            </span>
          )}
          {isManajemen && (
            <RiskBadge risk={property.risk} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-headline font-semibold text-xl text-primary truncate leading-tight">{title}</h3>
          <div className="flex items-center text-on-surface-variant gap-1 mt-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="font-body text-sm">{city}, {province}</span>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Harga Jual</p>
          <p className="font-headline font-semibold text-2xl text-primary leading-tight">{formatPriceFull(harga_jual ?? harga_penawaran)}</p>
        </div>

        {/* Specs divider */}
        <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
          <div className="flex gap-3 text-on-surface-variant">
            {beds != null && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">bed</span>
                <span className="font-mono text-xs">{beds}</span>
              </div>
            )}
            {baths != null && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">bathtub</span>
                <span className="font-mono text-xs">{baths}</span>
              </div>
            )}
            {land_area != null && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">square_foot</span>
                <span className="font-mono text-xs">{land_area}m²</span>
              </div>
            )}
            {type === 'Perkantoran' && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">domain</span>
                <span className="font-mono text-xs">Komersial</span>
              </div>
            )}
          </div>
          <span className="text-primary font-mono text-xs hover:underline">Detail →</span>
        </div>
      </div>
    </Link>
  )
}
