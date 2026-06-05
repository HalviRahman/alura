import { useState, useEffect, useCallback } from 'react'
import TopNavBar from '../components/layout/TopNavBar'
import Footer from '../components/layout/Footer'
import PropertyCard from '../components/marketplace/PropertyCard'
import SearchBar from '../components/marketplace/SearchBar'
import { propertiesApi } from '../services/api'
import type { Property, PropertyFilters } from '../types'

export default function MarketplacePage() {
  const [properties, setProperties]   = useState<Property[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [filters, setFilters]         = useState<PropertyFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [total, setTotal]             = useState(0)
  const [sort, setSort]               = useState<'newest' | 'price_asc' | 'price_desc'>('newest')

  const fetchProperties = useCallback(async (page: number, f: PropertyFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await propertiesApi.list({ ...f, page })
      setProperties(res.data.data)
      setTotalPages(res.data.meta.last_page)
      setTotal(res.data.meta.total)
    } catch {
      setError('Gagal memuat properti. Coba refresh halaman.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties(currentPage, { ...filters, sort })
  }, [fetchProperties, currentPage, filters, sort])

  const handleSearch = (newFilters: PropertyFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <main className="max-w-container-max mx-auto px-6 py-8 min-h-screen">
        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-headline font-bold text-5xl text-primary leading-tight tracking-tight">
              Marketplace Properti
            </h1>
            <p className="font-body text-base text-on-surface-variant max-w-2xl">
              Temukan aset properti institusional dengan transparansi penuh dan proses yang aman.
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </section>

        {/* Stats */}
        {!isLoading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs text-on-surface-variant">
              Menampilkan <span className="font-bold text-primary">{total}</span> properti
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-on-surface-variant">Urutkan:</span>
              <select
                value={sort}
                onChange={e => {
                  setSort(e.target.value as typeof sort)
                  setCurrentPage(1)
                }}
                className="font-mono text-xs border border-outline-variant rounded-lg px-3 py-1.5 bg-surface text-on-surface focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface border border-outline-variant rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-surface-container-high" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-surface-container-high rounded w-3/4" />
                  <div className="h-5 bg-surface-container-high rounded w-full" />
                  <div className="h-4 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-red-300 mb-4">wifi_off</span>
            <h3 className="font-headline font-semibold text-2xl text-primary mb-2">Gagal memuat data</h3>
            <p className="font-body text-sm text-on-surface-variant mb-6">{error}</p>
            <button
              onClick={() => fetchProperties(currentPage, filters)}
              className="bg-primary text-on-primary font-body font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && properties.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </section>
        )}

        {/* Empty state */}
        {!isLoading && !error && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">search_off</span>
            <h3 className="font-headline font-semibold text-2xl text-primary mb-2">Tidak ada properti ditemukan</h3>
            <p className="font-body text-sm text-on-surface-variant">Coba ubah filter pencarian Anda.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="mt-10 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center font-mono text-xs rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant hover:bg-surface-container-high'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
