import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { adminApi, type MapLocation } from '../../services/api'
import { formatPriceFull } from '../../data/properties'
import { Link } from 'react-router-dom'

// ─── Custom marker icons by property type ──────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Rumah: '#16a34a',
  Apartemen: '#2563eb',
  Gudang: '#d97706',
  Perkantoran: '#7c3aed',
  Ruko: '#dc2626',
  Tanah: '#854d0e',
}

function createIcon(type: string, isPublished: boolean, highlighted = false) {
  const color = TYPE_COLORS[type] || '#6b7280'
  const opacity = isPublished ? 1 : 0.45
  const scale = highlighted ? 1.35 : 1
  const size = Math.round(32 * scale)
  const height = Math.round(42 * scale)
  const ring = highlighted
    ? `<circle cx="18" cy="18" r="16" fill="none" stroke="${color}" stroke-width="3" opacity="0.5"/>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="${size}" height="${height}">${ring}<path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}" opacity="${opacity}" stroke="#fff" stroke-width="2"/><circle cx="18" cy="18" r="8" fill="#fff" opacity="0.9"/><text x="18" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">${type.charAt(0)}</text></svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height],
  })
}

// ─── Map controller: fit bounds on load + fly-to on search select ──────────

function MapController({
  locations,
  flyTo,
  onReady,
}: {
  locations: MapLocation[]
  flyTo: MapLocation | null
  onReady: (map: L.Map) => void
}) {
  const map = useMap()

  useEffect(() => { onReady(map) }, [map, onReady])

  useEffect(() => {
    if (locations.length === 0) return
    const bounds = L.latLngBounds(locations.map(l => [l.latitude, l.longitude]))
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
  }, [locations, map])

  useEffect(() => {
    if (!flyTo) return
    map.flyTo([flyTo.latitude, flyTo.longitude], 16, { animate: true, duration: 1.2 })
  }, [flyTo, map])

  return null
}

// ─── Legend ────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-surface/95 backdrop-blur border border-outline-variant rounded-xl p-4 shadow-lg">
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Tipe Properti</p>
      <div className="space-y-1.5">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="font-body text-xs text-on-surface">{type}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant mt-2 pt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0" />
          <span className="font-body text-[10px] text-on-surface-variant">Solid = Tayang</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" />
          <span className="font-body text-[10px] text-on-surface-variant">Pudar = Tidak Tayang</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function DistributionMapTab() {
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'unpublished'>('all')

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MapLocation[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [flyTo, setFlyTo] = useState<MapLocation | null>(null)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Search filter against loaded data
  useEffect(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    const results = locations
      .filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.listing_id.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.province.toLowerCase().includes(q)
      )
      .slice(0, 8)
    setSearchResults(results)
    setShowDropdown(results.length > 0)
  }, [debouncedQuery, locations])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelectResult = useCallback((loc: MapLocation) => {
    setSearchQuery(`${loc.title} — ${loc.city}`)
    setShowDropdown(false)
    setFlyTo({ ...loc }) // re-trigger flyTo even if same
    setHighlightedId(loc.id)
    // Open popup after fly completes
    setTimeout(() => {
      if (!mapRef.current) return
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          const pos = layer.getLatLng()
          if (
            Math.abs(pos.lat - loc.latitude) < 0.0001 &&
            Math.abs(pos.lng - loc.longitude) < 0.0001
          ) {
            layer.openPopup()
          }
        }
      })
    }, 1450)
  }, [])

  const handleClearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setSearchResults([])
    setShowDropdown(false)
    setFlyTo(null)
    setHighlightedId(null)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.mapLocations()
      setLocations(res.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filteredLocations = useMemo(() => {
    return locations.filter(l => {
      if (filterType !== 'all' && l.type !== filterType) return false
      if (filterStatus === 'published' && !l.is_published) return false
      if (filterStatus === 'unpublished' && l.is_published) return false
      return true
    })
  }, [locations, filterType, filterStatus])

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(locations.map(l => l.type))).sort()
  }, [locations])

  const stats = useMemo(() => {
    const byType: Record<string, number> = {}
    const byProvince: Record<string, number> = {}
    filteredLocations.forEach(l => {
      byType[l.type] = (byType[l.type] || 0) + 1
      byProvince[l.province] = (byProvince[l.province] || 0) + 1
    })
    const topProvince = Object.entries(byProvince).sort((a, b) => b[1] - a[1])[0]
    return { byType, topProvince, total: filteredLocations.length }
  }, [filteredLocations])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    )
  }

  const noSearchResults = debouncedQuery.trim() && !showDropdown

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-headline font-semibold text-xl">Peta Distribusi Aset</h2>
        <p className="font-mono text-xs text-on-surface-variant mt-1">
          Visualisasi titik lokasi {stats.total} properti berdasarkan koordinat GPS.
        </p>
      </div>

      {/* Toolbar: search + filters */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search input */}
        <div className="relative flex-1 min-w-0" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Cari nama properti, kota, atau provinsi..."
            className="w-full pl-10 pr-10 py-2.5 text-sm font-body border border-outline-variant rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}

          {/* Autocomplete dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-1.5 left-0 right-0 z-[2000] bg-surface border border-outline-variant rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-2 border-b border-outline-variant bg-surface-container-low">
                <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {searchResults.length} hasil ditemukan
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map(loc => (
                  <button
                    key={loc.id}
                    onMouseDown={e => { e.preventDefault(); handleSelectResult(loc) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left border-b border-outline-variant last:border-b-0 group"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                      style={{ backgroundColor: TYPE_COLORS[loc.type] || '#6b7280', opacity: loc.is_published ? 1 : 0.4 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold text-on-surface truncate">{loc.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[11px] text-on-surface-variant">location_on</span>
                        <p className="font-mono text-[10px] text-on-surface-variant">{loc.city}, {loc.province}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-[10px] font-bold text-primary">{loc.listing_id}</p>
                      <p className="font-mono text-[9px] px-1.5 py-0.5 rounded mt-0.5 inline-block"
                        style={{ background: (TYPE_COLORS[loc.type] || '#6b7280') + '20', color: TYPE_COLORS[loc.type] || '#6b7280' }}
                      >
                        {loc.type}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline-variant group-hover:text-primary transition-colors">
                      my_location
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {noSearchResults && (
            <div className="absolute top-full mt-1.5 left-0 right-0 z-[2000] bg-surface border border-outline-variant rounded-xl shadow-xl px-4 py-4 text-center">
              <span className="material-symbols-outlined text-outline-variant text-[28px] block mb-1">search_off</span>
              <p className="font-body text-sm text-on-surface-variant">
                Tidak ada properti untuk <strong className="text-on-surface">"{debouncedQuery}"</strong>
              </p>
            </div>
          )}
        </div>

        <div className="hidden lg:block w-px h-8 bg-outline-variant self-center flex-shrink-0" />

        {/* Type filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-outline-variant rounded-lg px-3 py-2.5 text-xs font-mono bg-surface focus:ring-1 focus:ring-primary outline-none flex-shrink-0"
        >
          <option value="all">Semua Tipe</option>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Status filter */}
        <div className="flex bg-surface border border-outline-variant rounded-lg overflow-hidden flex-shrink-0">
          {(['all', 'published', 'unpublished'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2.5 font-mono text-xs font-bold transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-on-primary'
                  : 'hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'published' ? 'Tayang' : 'Tidak Tayang'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-primary-container text-on-primary-container p-4 rounded-xl border border-outline-variant">
          <span className="font-mono text-[10px] uppercase tracking-widest block opacity-70">Total Titik</span>
          <span className="font-headline font-bold text-2xl">{stats.total}</span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <span className="font-mono text-[10px] uppercase tracking-widest block text-on-surface-variant">Tipe Terbanyak</span>
          <span className="font-headline font-bold text-lg text-on-surface">
            {Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <span className="font-mono text-[10px] uppercase tracking-widest block text-on-surface-variant">Provinsi Terbanyak</span>
          <span className="font-headline font-bold text-lg text-on-surface truncate block">
            {stats.topProvince?.[0] || '—'}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <span className="font-mono text-[10px] uppercase tracking-widest block text-on-surface-variant">Cakupan Provinsi</span>
          <span className="font-headline font-bold text-2xl text-on-surface">
            {new Set(filteredLocations.map(l => l.province)).size}
          </span>
        </div>
      </div>

      {/* Map */}
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm relative"
        style={{ height: '580px' }}
      >
        {filteredLocations.length > 0 ? (
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController
              locations={filteredLocations}
              flyTo={flyTo}
              onReady={m => { mapRef.current = m }}
            />
            {filteredLocations.map(loc => (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={createIcon(loc.type, loc.is_published, loc.id === highlightedId)}
              >
                <Popup maxWidth={320} minWidth={280}>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {loc.image && (
                      <div style={{ margin: '-13px -20px 10px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                        <img src={loc.image} alt={loc.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a', lineHeight: '1.3' }}>{loc.title}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', marginTop: '2px' }}>{loc.listing_id}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '6px' }}>📍 {loc.city}, {loc.province}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0d3b66', marginBottom: '8px' }}>{formatPriceFull(loc.price)}</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ background: TYPE_COLORS[loc.type] || '#6b7280', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, fontFamily: 'monospace' }}>{loc.type}</span>
                      <span style={{ background: loc.is_published ? '#dcfce7' : '#f3f4f6', color: loc.is_published ? '#166534' : '#6b7280', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, fontFamily: 'monospace' }}>{loc.is_published ? 'Tayang' : 'Tidak Tayang'}</span>
                      {loc.spk_status && (
                        <span style={{ background: loc.spk_status === 'active' ? '#dbeafe' : loc.spk_status === 'warning' ? '#fef3c7' : '#fee2e2', color: loc.spk_status === 'active' ? '#1e40af' : loc.spk_status === 'warning' ? '#92400e' : '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, fontFamily: 'monospace' }}>
                          SPK: {loc.spk_status === 'active' ? `${loc.days_remaining}d` : loc.spk_status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Link to={`/property/${loc.uuid}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0d3b66', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', textDecoration: 'none', textTransform: 'uppercase' }}>
                      Lihat Detail →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">map</span>
            <p className="font-body text-sm">Tidak ada data lokasi properti.</p>
            <p className="font-mono text-xs text-on-surface-variant/60 mt-1">Pastikan properti memiliki data latitude &amp; longitude di Asset Detail.</p>
          </div>
        )}
        <Legend />
      </div>
    </div>
  )
}
