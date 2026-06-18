import { useState, useEffect, useCallback } from 'react'
import TopNavBar from '../components/layout/TopNavBar'
import Footer from '../components/layout/Footer'
import RiskBadge from '../components/ui/RiskBadge'
import StatusBadge from '../components/ui/StatusBadge'
import { formatPriceFull } from '../data/properties'
import { agentApi, offersApi, type AgentStats } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Property, Offer } from '../types'

// ─── Agent Property Card ─────────────────────────────────────────────────

interface AgentPropertyCardProps {
  property: Property
  referralCode: string
}

function AgentPropertyCard({ property, referralCode }: AgentPropertyCardProps) {
  const [copied, setCopied] = useState(false)

  const generateLink = () => {
    const url = `${window.location.origin}/property/${property.uuid}?ref=${referralCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'

  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-48 relative overflow-hidden bg-surface-container">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <RiskBadge risk={property.risk} />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
          {property.city.toUpperCase()}, {property.province.toUpperCase()}
        </span>
        <h3 className="font-headline font-semibold text-lg text-on-surface mb-1 line-clamp-2">{property.title}</h3>
        <div className="flex justify-between items-end mt-auto pt-3">
          <div>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase block">Harga Jual</span>
            <span className="font-mono text-sm font-bold text-primary">{formatPriceFull(property.harga_jual ?? property.harga_penawaran)}</span>
          </div>
          <button
            onClick={generateLink}
            id={`generate-link-${property.id}`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              copied ? 'bg-status-success text-white' : 'bg-primary text-on-primary hover:opacity-90'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'link'}
            </span>
            {copied ? 'Tersalin!' : 'Generate Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Agent Dashboard Page ─────────────────────────────────────────────

export default function AgentDashboardPage() {
  const { user } = useAuth()
  const [statsData, setStatsData] = useState<AgentStats | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [propPage, setPropPage] = useState(1)
  const [propTotalPages, setPropTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Leads state (full paginated)
  const [leads, setLeads] = useState<Offer[]>([])
  const [leadsPage, setLeadsPage] = useState(1)
  const [leadsTotalPages, setLeadsTotalPages] = useState(1)
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [leadsLoading, setLeadsLoading] = useState(false)

  const referralCode = statsData?.referral_code || user?.referral_code || 'ALURA-AGNT'

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  // Load stats + properties
  const loadAgentData = useCallback(async (page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const [statsRes, propsRes] = await Promise.all([
        agentApi.stats(),
        agentApi.properties(page),
      ])
      setStatsData(statsRes.data)
      setProperties(propsRes.data.data)
      setPropTotalPages(propsRes.data.meta.last_page)
    } catch {
      setError('Gagal memuat data dashboard agen. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadAgentData(propPage) }, [loadAgentData, propPage])

  // Load leads (paginated, full list via offersApi)
  const loadLeads = useCallback(async (page: number) => {
    setLeadsLoading(true)
    try {
      const res = await offersApi.list({ page })
      setLeads(res.data.data)
      setLeadsTotalPages(res.data.meta.last_page)
      setLeadsTotal(res.data.meta.total)
    } catch {
      // silent fail
    } finally {
      setLeadsLoading(false)
    }
  }, [])

  useEffect(() => { loadLeads(leadsPage) }, [loadLeads, leadsPage])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 bg-surface border border-outline-variant rounded-xl max-w-md shadow-sm">
          <span className="material-symbols-outlined text-[80px] text-red-300 mb-4">error</span>
          <h2 className="font-headline font-semibold text-2xl text-primary mb-2">Error</h2>
          <p className="font-body text-sm text-on-surface-variant mb-6">{error}</p>
          <button onClick={() => loadAgentData(propPage)} className="bg-primary text-on-primary font-body font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const stats = statsData?.stats || { total_leads: 0, final: 0, follow_up: 0, pending: 0, gugur: 0 }
  const target = 20
  const progressPercent = Math.min(100, Math.round((stats.total_leads / target) * 100))

  // Pagination helper
  const Pagination = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) => {
    if (totalPages <= 1) return null
    return (
      <div className="flex justify-center items-center gap-2 mt-4">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
          Math.max(0, page - 3), Math.min(totalPages, page + 2)
        ).map(pg => (
          <button key={pg} onClick={() => onChange(pg)}
            className={`w-8 h-8 flex items-center justify-center font-mono text-xs rounded-lg transition-colors ${
              pg === page ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container-high'
            }`}>
            {pg}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <main className="max-w-container-max mx-auto px-6 py-8">
        {/* Header + Referral Code Box */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-headline font-semibold text-3xl text-on-surface mb-1">Monitoring Agen Dashboard</h1>
            <p className="font-body text-sm text-on-surface-variant">Selamat datang kembali, {user?.name}. Pantau properti dan leads Anda di sini.</p>
          </div>
          {/* Referral code widget */}
          <div className="bg-surface-container-low border border-outline-variant px-4 py-3 rounded-xl flex items-center gap-4 flex-shrink-0">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Kode Referral Anda</span>
              <span className="font-mono text-lg font-bold text-primary tracking-widest">{referralCode}</span>
            </div>
            <button
              onClick={copyReferral}
              id="copy-referral-btn"
              title="Salin kode referral"
              className={`p-2 rounded-lg transition-all ${isCopied ? 'bg-status-success text-white' : 'bg-primary text-on-primary hover:opacity-90'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{isCopied ? 'check' : 'content_copy'}</span>
            </button>
          </div>
        </section>

        {/* Main bento grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Available Properties — 8 cols */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-headline font-semibold text-xl text-on-surface">Daftar Properti Tersedia</h2>
              <span className="font-mono text-xs text-on-surface-variant">
                Menampilkan <span className="font-bold text-primary">{properties.length}</span> properti aktif
              </span>
            </div>
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map(p => (
                  <AgentPropertyCard key={p.id} property={p} referralCode={referralCode} />
                ))}
              </div>
            ) : (
              <div className="p-12 border border-outline-variant rounded-xl text-center bg-surface-container-low">
                <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">home_work</span>
                <p className="font-body text-sm text-on-surface-variant">Belum ada properti aktif yang tersedia.</p>
              </div>
            )}
            {/* Property Pagination */}
            <Pagination page={propPage} totalPages={propTotalPages} onChange={setPropPage} />
          </div>

          {/* Stats sidebar — 4 cols */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Performance summary */}
            <div className="bg-primary-container text-on-primary-container rounded-xl p-5 border border-outline-variant">
              <h3 className="font-headline font-semibold text-lg flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[20px]">insights</span>
                Ringkasan Performa
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'TOTAL LEADS', value: stats.total_leads },
                  { label: 'OFFER FINAL', value: stats.final },
                  { label: 'FOLLOW UP', value: stats.follow_up },
                  { label: 'PENDING', value: stats.pending },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/10 p-3 rounded-lg">
                    <span className="font-mono text-[10px] opacity-70 block mb-1 uppercase">{stat.label}</span>
                    <span className="font-headline font-bold text-2xl">{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div className="bg-status-success h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="font-mono text-[10px] opacity-70 italic">{progressPercent}% dari target kuartal ini ({target} leads) tercapai.</span>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-status-info text-[20px] mt-0.5 flex-shrink-0">lightbulb</span>
                <div>
                  <p className="font-headline font-semibold text-sm text-primary mb-1">Tips Referral</p>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    Bagikan link unik dari properti di atas ke calon pembeli. Setiap kali calon pembeli mengajukan penawaran, sistem otomatis merekam kode referral Anda dan mengamankan atribusi komisi Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* My Leads Table — full width, fully paginated */}
          <div className="col-span-12">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-headline font-semibold text-xl text-on-surface">My Leads (Penawaran Masuk)</h2>
                <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                  Total: <span className="font-bold text-primary">{leadsTotal}</span> penawaran via referral Anda
                </p>
              </div>
              <span className="font-mono text-xs text-on-surface-variant italic">
                Status diperbarui secara real-time oleh Manajemen.
              </span>
            </div>
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant">
                      {['Tanggal', 'Nama Calon Pembeli', 'Properti', 'Nilai Penawaran', 'Status Penawaran'].map(h => (
                        <th key={h} className="p-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {leadsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="p-4"><div className="h-4 bg-surface-container-high rounded w-full" /></td>
                          ))}
                        </tr>
                      ))
                    ) : leads.length > 0 ? (
                      leads.map((lead: Offer) => (
                        <tr key={lead.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-4 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4 font-body text-sm font-semibold text-on-surface">
                            {lead.applicant_name}
                            <div className="font-mono text-[10px] text-on-surface-variant font-normal">
                              {lead.applicant_email} | {lead.applicant_phone}
                            </div>
                          </td>
                          <td className="p-4 font-body text-sm text-on-surface-variant">
                            {lead.property?.title || '—'}
                            <div className="font-mono text-[10px]">ID: {lead.property?.listing_id || '—'}</div>
                          </td>
                          <td className="p-4 font-mono text-xs font-bold text-primary">{lead.offer_price > 0 ? formatPriceFull(lead.offer_price) : <span className="text-amber-600 font-bold uppercase tracking-wider text-[10px]">Tanya Detail</span>}</td>
                          <td className="p-4"><StatusBadge status={lead.status} /></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-on-surface-variant font-body text-sm bg-surface-container-lowest">
                          Belum ada leads penawaran yang tercatat melalui referral Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Leads Pagination */}
              {leadsTotalPages > 1 && (
                <div className="p-4 border-t border-outline-variant">
                  <Pagination page={leadsPage} totalPages={leadsTotalPages} onChange={setLeadsPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
