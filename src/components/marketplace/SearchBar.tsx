import { useState } from 'react'
import type { PropertyType } from '../../types'

interface SearchBarProps {
  onSearch: (filters: {
    city?: string
    type?: PropertyType | ''
    province?: string
    price_min?: number
    price_max?: number
  }) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery]           = useState('')
  const [type, setType]             = useState<PropertyType | ''>('')
  const [province, setProvince]     = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [expanded, setExpanded]     = useState(false)

  const handleSubmit = () => {
    let price_min: number | undefined
    let price_max: number | undefined

    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-')
      if (minStr) price_min = parseInt(minStr, 10)
      if (maxStr) price_max = parseInt(maxStr, 10)
    }

    onSearch({
      city:      query    || undefined,
      type:      type     || undefined,
      province:  province || undefined,
      price_min,
      price_max,
    })
    setExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const hasFilters = type || province || priceRange

  return (
    <div className="mt-6 sm:mt-8 bg-surface-container-lowest border border-outline-variant p-3 sm:p-4 rounded-xl shadow-sm">

      {/* Search input — always visible */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg font-body text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface"
            placeholder="Cari kota atau lokasi..."
          />
        </div>

        {/* Filter toggle — mobile only */}
        <button
          onClick={() => setExpanded(v => !v)}
          className={`sm:hidden flex items-center gap-1 px-3 py-2.5 rounded-lg border font-mono text-xs font-bold transition-colors ${
            hasFilters
              ? 'bg-primary text-on-primary border-primary'
              : 'border-outline-variant text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          {hasFilters ? 'Filter ●' : 'Filter'}
        </button>

        {/* Apply — desktop only */}
        <button
          onClick={handleSubmit}
          id="search-apply-btn"
          className="hidden sm:flex h-[42px] bg-primary text-on-primary font-body font-bold text-sm rounded-lg px-5 items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Terapkan
        </button>
      </div>

      {/* Advanced filters — always visible on desktop, collapsible on mobile */}
      <div className={`${expanded ? 'block' : 'hidden'} sm:block`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-outline-variant">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
              Tipe Properti
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as PropertyType | '')}
              className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg font-body text-sm focus:ring-1 focus:ring-primary outline-none text-on-surface"
            >
              <option value="">Semua Tipe</option>
              <option value="Rumah">Rumah</option>
              <option value="Apartemen">Apartemen</option>
              <option value="Ruko">Ruko</option>
              <option value="Tanah">Tanah</option>
              <option value="Gudang">Gudang</option>
              <option value="Perkantoran">Perkantoran</option>
            </select>
          </div>

          {/* Province */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
              Provinsi
            </label>
            <select
              value={province}
              onChange={e => setProvince(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg font-body text-sm focus:ring-1 focus:ring-primary outline-none text-on-surface"
            >
              <option value="">Semua Provinsi</option>
              <option>DKI Jakarta</option>
              <option>Jawa Barat</option>
              <option>Jawa Tengah</option>
              <option>Jawa Timur</option>
              <option>Bali</option>
              <option>Banten</option>
            </select>
          </div>

          {/* Price range */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
              Rentang Harga
            </label>
            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg font-body text-sm focus:ring-1 focus:ring-primary outline-none text-on-surface"
            >
              <option value="">Semua Harga</option>
              <option value="0-1000000000">&lt; 1 Miliar</option>
              <option value="1000000000-5000000000">1M – 5 Miliar</option>
              <option value="5000000000-10000000000">5M – 10 Miliar</option>
              <option value="10000000000-999999999999">&gt; 10 Miliar</option>
            </select>
          </div>

          {/* Apply — mobile only (inside expanded panel) */}
          <div className="space-y-1.5 sm:hidden">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block invisible">
              &nbsp;
            </label>
            <button
              onClick={handleSubmit}
              id="search-apply-btn"
              className="w-full h-[42px] bg-primary text-on-primary font-body font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
