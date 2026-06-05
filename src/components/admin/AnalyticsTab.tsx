import { useState, useEffect, useCallback } from 'react'
import { adminApi, type AnalyticsData, type TopAgent, type MonthlyOffer } from '../../services/api'
import { formatPriceFull, formatPrice } from '../../data/properties'

// ─── SVG Mini Chart Helpers ──────────────────────────────────────────────

function DonutChart({ data, colors }: {
  data: Array<{ label: string; value: number }>
  colors: string[]
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div className="w-40 h-40 rounded-full bg-surface-container flex items-center justify-center font-mono text-xs text-on-surface-variant">No data</div>

  let offset = 0
  const r = 60
  const cx = 80
  const cy = 80
  const circumference = 2 * Math.PI * r

  const slices = data.map((d, i) => {
    const pct   = d.value / total
    const dash  = pct * circumference
    const gap   = circumference - dash
    const slice = { dash, gap, offset, color: colors[i % colors.length], label: d.label, value: d.value, pct }
    offset += dash
    return slice
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e3e5" strokeWidth={20} />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={20}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" className="font-mono" style={{ fontSize: 22, fontWeight: 800, fill: '#000' }}>{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 9, fill: '#76777d', letterSpacing: 2, textTransform: 'uppercase' }}>TOTAL</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="font-mono text-[10px] text-on-surface-variant">{s.label}: <strong>{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data, valueKey = 'total', labelKey = 'month', color = '#000', formatVal }: {
  data: any[]
  valueKey?: string
  labelKey?: string
  color?: string
  formatVal?: (v: number) => string
}) {
  const max = Math.max(...data.map(d => Number(d[valueKey])), 1)
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const val = Number(d[valueKey])
        const h   = (val / max) * 100
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
            <div
              className="w-full rounded-t-sm transition-all duration-500 cursor-pointer relative"
              style={{ height: `${Math.max(4, h)}%`, background: color }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex bg-gray-900 text-white font-mono text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                {formatVal ? formatVal(val) : val.toLocaleString('id-ID')}
              </div>
            </div>
            <span className="font-mono text-[8px] text-on-surface-variant truncate w-full text-center">
              {String(d[labelKey]).slice(-5)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-body text-sm text-on-surface">{label}</span>
        <span className="font-mono text-xs font-bold text-on-surface">{value}</span>
      </div>
      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string; sub?: string; accent?: boolean
}) {
  return (
    <div className={`p-5 rounded-xl border flex flex-col gap-3 ${
      accent ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        accent ? 'bg-white/10' : 'bg-surface-container-high'
      }`}>
        <span className={`material-symbols-outlined text-[22px] ${accent ? 'text-on-primary' : 'text-primary'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <p className={`font-mono text-[10px] uppercase tracking-widest mb-1 ${accent ? 'opacity-70' : 'text-on-surface-variant'}`}>{label}</p>
        <p className={`font-headline font-bold text-2xl ${accent ? '' : 'text-on-surface'}`}>{value}</p>
        {sub && <p className={`font-mono text-[10px] mt-1 ${accent ? 'opacity-60' : 'text-on-surface-variant'}`}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Analytics Tab Component ──────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Pending:    '#3b82f6',
  'Follow Up': '#f59e0b',
  Reviewed:   '#8b5cf6',
  Final:      '#10b981',
  Gugur:      '#ef4444',
}

const TYPE_COLORS = ['#000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']
const RISK_COLORS: Record<string, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' }

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.analytics()
      setData(res.data)
    } catch {
      setError('Gagal memuat data analytics.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
    </div>
  )

  if (error || !data) return (
    <div className="p-8 text-center text-on-surface-variant font-body text-sm">{error || 'Tidak ada data.'}</div>
  )

  const { summary, monthly_offers, offers_by_status, properties_by_type, properties_by_risk, top_agents } = data

  const statusDonut = Object.entries(offers_by_status).map(([k, v]) => ({ label: k, value: v }))
  const statusColors = statusDonut.map(d => STATUS_COLORS[d.label] || '#9ca3af')

  const typeDonut = Object.entries(properties_by_type).map(([k, v]) => ({ label: k, value: v }))

  const maxLeads = Math.max(...top_agents.map(a => a.total_leads), 1)

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard accent icon="home_work" label="Total Properti" value={String(summary.total_properties)} sub={`${summary.published_properties} tayang`} />
        <MetricCard icon="description" label="Total Penawaran" value={String(summary.total_offers)} sub={`${summary.conversion_rate}% konversi`} />
        <MetricCard icon="payments" label="Total Nilai" value={formatPrice(summary.total_offer_value)} sub="Penawaran non-Gugur" />
        <MetricCard icon="timer" label="SPK Expiring" value={String(summary.spk_expiring_soon)} sub="Dalam 30 hari" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Monthly Trend */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline font-semibold text-lg">Tren Penawaran Masuk</h3>
              <p className="font-mono text-[10px] text-on-surface-variant">6 bulan terakhir</p>
            </div>
            <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>show_chart</span>
          </div>
          {monthly_offers.length > 0 ? (
            <BarChart
              data={monthly_offers}
              valueKey="total"
              labelKey="month"
              color="#000"
            />
          ) : (
            <div className="h-32 flex items-center justify-center font-mono text-xs text-on-surface-variant">Belum ada data penawaran.</div>
          )}
          {monthly_offers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-outline-variant">
              <p className="font-mono text-[10px] text-on-surface-variant mb-2">Total Nilai Penawaran per Bulan</p>
              <BarChart
                data={monthly_offers}
                valueKey="total_value"
                labelKey="month"
                color="#374151"
                formatVal={v => formatPrice(v)}
              />
            </div>
          )}
        </div>

        {/* Offers by Status Donut */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-headline font-semibold text-lg mb-4">Penawaran per Status</h3>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart data={statusDonut} colors={statusColors} />
          </div>
        </div>

        {/* Properties by Type */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-headline font-semibold text-lg mb-4">Distribusi Tipe Properti</h3>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart data={typeDonut} colors={TYPE_COLORS} />
          </div>
        </div>

        {/* Properties by Risk */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-headline font-semibold text-lg mb-5">Properti per Tingkat Risiko Legalitas</h3>
          <div className="space-y-5">
            {properties_by_risk.map(r => (
              <div key={r.risk} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: RISK_COLORS[r.risk] || '#9ca3af' }} />
                    <span className="font-mono text-xs font-bold">{r.risk}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-on-surface">{r.total} properti</span>
                    <span className="font-mono text-[10px] text-on-surface-variant ml-3">Avg: {formatPrice(r.avg_price)}</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(4, (r.total / (data.summary.total_properties || 1)) * 100)}%`,
                      background: RISK_COLORS[r.risk] || '#9ca3af'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Agents Leaderboard */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-outline-variant bg-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <h3 className="font-headline font-semibold text-lg">Leaderboard Agen — Top 10</h3>
        </div>
        <div className="p-5 space-y-4">
          {top_agents.length > 0 ? top_agents.map((agent: TopAgent, i) => (
            <div key={agent.id} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold flex-shrink-0 ${
                i === 0 ? 'bg-yellow-400 text-yellow-900' :
                i === 1 ? 'bg-gray-300 text-gray-700' :
                i === 2 ? 'bg-amber-600 text-white' :
                'bg-surface-container text-on-surface-variant'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="font-body text-sm font-bold">{agent.name}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant ml-2">{agent.referral_code}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="font-mono text-sm font-bold text-primary">{agent.total_leads} leads</span>
                    <span className={`ml-2 font-mono text-[10px] px-2 py-0.5 rounded-full ${
                      agent.conversion >= 50 ? 'bg-green-100 text-green-700' :
                      agent.conversion >= 20 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{agent.conversion}% conv.</span>
                  </div>
                </div>
                <HorizontalBar label="" value={agent.total_leads} max={maxLeads} color={i < 3 ? '#000' : '#6b7280'} />
              </div>
            </div>
          )) : (
            <p className="font-body text-sm text-on-surface-variant text-center py-8">Belum ada data agen.</p>
          )}
        </div>
      </div>
    </div>
  )
}
