import { useState, useEffect, useCallback } from 'react'
import { adminApi, type SpkAlert } from '../../services/api'
import { formatPrice } from '../../data/properties'
import { Link } from 'react-router-dom'

export default function SpkTrackerTab() {
  const [data, setData] = useState<{
    critical: SpkAlert[]
    warning: SpkAlert[]
    active: SpkAlert[]
    expired: SpkAlert[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.spkAlerts()
      setData(res.data)
    } catch {
      // silent
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

  if (!data) return null

  const allAlerts = [
    ...data.expired,
    ...data.critical,
    ...data.warning,
    ...data.active
  ]

  const total = allAlerts.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h2 className="font-headline font-semibold text-xl">Monitor SPK (Surat Perjanjian Kerjasama)</h2>
          <p className="font-mono text-xs text-on-surface-variant mt-1">Status real-time masa berlaku SPK untuk {total} aset properti.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries({ Expired: data.expired.length, Kritis: data.critical.length, Perhatian: data.warning.length, Aktif: data.active.length }).map(([k, v]) => (
            <div key={k} className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant flex gap-2 items-center">
              <span className="font-mono text-[10px] uppercase text-on-surface-variant">{k}</span>
              <span className="font-mono text-xs font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Status', 'Sisa Waktu', 'No. SPK', 'Properti / Listing ID', 'Tgl Berakhir', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {allAlerts.length > 0 ? allAlerts.map(alert => {
                const isExp = alert.spk_status === 'expired'
                const isCrit = alert.spk_status === 'critical'
                const isWarn = alert.spk_status === 'warning'
                const bgColors = isExp ? 'bg-red-50' : isCrit ? 'bg-orange-50' : isWarn ? 'bg-yellow-50' : 'hover:bg-surface-container-low'
                const badge = isExp ? 'bg-red-100 text-red-700' : isCrit ? 'bg-orange-100 text-orange-700' : isWarn ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                const label = isExp ? 'EXPIRED' : isCrit ? 'KRITIS' : isWarn ? 'PERHATIAN' : 'AKTIF'

                return (
                  <tr key={alert.property_id} className={`transition-colors ${bgColors}`}>
                    <td className="px-5 py-4">
                      <span className={`inline-flex font-mono text-[10px] font-bold px-2 py-1 rounded ${badge}`}>{label}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm font-bold">
                       {isExp
                         ? <span className="text-status-error">Terlewat {Math.abs(alert.days_remaining)} Hari</span>
                         : `${alert.days_remaining} hari`}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{alert.spk_number || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="font-body text-sm font-bold text-on-surface line-clamp-1">{alert.title}</div>
                      <div className="font-mono text-[10px] text-on-surface-variant">{alert.listing_id}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">
                      {new Date(alert.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/property/${alert.property_uuid}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-primary hover:underline uppercase"
                      >
                        Lihat <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </Link>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={6} className="p-12 text-center text-on-surface-variant font-body text-sm">Tidak ada data SPK.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
