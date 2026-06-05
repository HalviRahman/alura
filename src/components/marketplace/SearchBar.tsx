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
  const [query, setQuery] = useState('')
  const [type, setType] = useState<PropertyType | ''>('')
  const [province, setProvince] = useState('')
  const [priceRange, setPriceRange] = useState('')

  const handleSubmit = () => {
    let price_min: number | undefined
    let price_max: number | undefined

    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-')
      if (minStr) price_min = parseInt(minStr, 10)
      if (maxStr) price_max = parseInt(maxStr, 10)
    }

    onSearch({
      city: query || undefined,
      type: type || undefined,
      province: province || undefined,
      price_min,
      price_max,
    })
  }

  return (
    <div className="mt-8 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search input */}
        <div className="md:col-span-4 space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
            Cari Kota atau Lokasi Properti
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg font-body text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface"
              placeholder="Contoh: Jakarta Selatan, Bandung Utara"
            />
          </div>
        </div>

        {/* Type select */}
        <div className="md:col-span-2 space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">Tipe Properti</label>
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

        {/* Province select */}
        <div className="md:col-span-2 space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">Provinsi</label>
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
        <div className="md:col-span-2 space-y-2">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">Rentang Harga</label>
          <select
            value={priceRange}
            onChange={e => setPriceRange(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg font-body text-sm focus:ring-1 focus:ring-primary outline-none text-on-surface"
          >
            <option value="">Semua Harga</option>
            <option value="0-1000000000">&lt; 1M</option>
            <option value="1000000000-5000000000">1M – 5M</option>
            <option value="5000000000-10000000000">5M – 10M</option>
            <option value="10000000000-999999999999">&gt; 10M</option>
          </select>
        </div>

        {/* Apply button */}
        <div className="md:col-span-2">
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
  )
}
