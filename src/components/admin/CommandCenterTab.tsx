import React from 'react'
import type { Offer } from '../../types'
import type { DashboardData, SpkAlert } from '../../services/api'
import { getPdfUrl } from '../../services/api'
import { formatPriceFull } from '../../data/properties'
import StatusBadge from '../ui/StatusBadge'
import SpkCard from './SpkCard'

interface CommandCenterTabProps {
  dashboardData: DashboardData
  spkAlerts: SpkAlert[]
  onOfferClick: (offer: Offer) => void
  onRefresh: () => void
}

export default function CommandCenterTab({
  dashboardData,
  spkAlerts,
  onOfferClick,
  onRefresh,
}: CommandCenterTabProps) {
  const { summary, recent_offers: recentOffers, agent_stats: agentStats } = dashboardData

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
      {/* SPK Tracker */}
      <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">timer</span>
            <h3 className="font-headline font-semibold text-lg">SPK Status Tracker</h3>
          </div>
          <span className="font-mono text-[10px] px-2.5 py-1 bg-error-container text-on-error-container rounded-full uppercase font-bold">
            {spkAlerts.length} Expiring Soon
          </span>
        </div>
        {spkAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spkAlerts.slice(0, 3).map(asset => (
              <SpkCard key={asset.property_id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center font-body text-sm text-on-surface-variant">
            Tidak ada SPK kritis atau yang akan berakhir dalam 30 hari kedepan.
          </div>
        )}
      </section>

      {/* Quick Metrics */}
      <section className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
        <div className="bg-primary text-on-primary rounded-xl p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Total Nilai Penawaran</span>
          <div>
            <h2 className="font-headline font-bold text-3xl mt-2">{formatPriceFull(summary.total_value)}</h2>
            <div className="flex items-center gap-1 text-white/80 mt-2">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="font-mono text-xs">Total data terkumpul</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Status Leads</span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center bg-blue-50 p-2 rounded border border-blue-200">
              <span className="font-mono text-[9px] text-blue-700 uppercase block font-semibold">PENDING</span>
              <span className="font-headline font-bold text-lg text-blue-900">{summary.pending_count}</span>
            </div>
            <div className="text-center bg-green-50 p-2 rounded border border-green-200">
              <span className="font-mono text-[9px] text-green-700 uppercase block font-semibold">FINAL</span>
              <span className="font-headline font-bold text-lg text-green-900">{summary.final_count}</span>
            </div>
            <div className="text-center bg-gray-50 p-2 rounded border border-gray-200">
              <span className="font-mono text-[9px] text-gray-700 uppercase block font-semibold">TOTAL</span>
              <span className="font-headline font-bold text-lg text-gray-900">{summary.total_offers}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Offers */}
      <section className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-white">
          <h3 className="font-headline font-semibold text-lg">Recent Offers (Penawaran Terbaru)</h3>
          <span className="font-mono text-xs text-on-surface-variant italic">* Klik baris untuk update status</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Nama Pemohon', 'Aset Properti', 'Harga Penawaran', 'Agen Referral', 'Status', 'PDF'].map(h => (
                  <th key={h} className="px-6 py-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {recentOffers.length > 0 ? (
                recentOffers.map((offer: Offer) => (
                  <tr
                    key={offer.id}
                    onClick={() => onOfferClick(offer)}
                    className="hover:bg-surface transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-body text-sm font-bold">{offer.applicant_name}</div>
                      <div className="font-mono text-[10px] text-on-surface-variant">{offer.applicant_email}</div>
                    </td>
                    <td className="px-6 py-4 font-body text-sm text-on-surface-variant">
                      {offer.property?.title || '—'}
                      <div className="font-mono text-[10px]">ID: {offer.property?.listing_id || '—'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-primary">
                      {formatPriceFull(offer.offer_price)}
                    </td>
                    <td className="px-6 py-4">
                      {offer.agent ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center font-mono text-[10px] font-bold text-on-secondary-container flex-shrink-0">
                            {offer.referral_code?.slice(-2) || 'AG'}
                          </div>
                          <span className="font-body text-sm">
                            {offer.agent.name}
                            <div className="font-mono text-[9px] text-on-surface-variant">{offer.referral_code}</div>
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-on-surface-variant/40">— Tanpa Referral —</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      {offer.pdf_url && offer.offer_price > 0 ? (
                        <a
                          href={getPdfUrl(offer.pdf_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline font-mono text-xs font-bold"
                        >
                          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>Unduh
                        </a>
                      ) : (
                        <span className="text-on-surface-variant/40">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-on-surface-variant font-body text-sm">
                    Belum ada penawaran masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Agent stats + Notice */}
      <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <h3 className="font-headline font-semibold text-lg mb-4">Statistik Agen Teratas</h3>
        <div className="space-y-4">
          {agentStats?.length > 0 ? (
            agentStats.slice(0, 5).map(agent => (
              <div
                key={agent.id}
                className="flex justify-between items-center pb-3 border-b border-outline-variant last:border-0 last:pb-0"
              >
                <div>
                  <h4 className="font-body text-sm font-bold">{agent.name}</h4>
                  <p className="font-mono text-[10px] text-on-surface-variant">{agent.referral_code}</p>
                </div>
                <span className="font-mono text-sm font-bold text-primary">{agent.total_leads} Leads</span>
              </div>
            ))
          ) : (
            <p className="font-body text-xs text-on-surface-variant">Belum ada data agen.</p>
          )}
        </div>
      </section>
      <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <h3 className="font-headline font-semibold text-lg mb-3">Notifikasi & Informasi SPK</h3>
        <div className="p-4 bg-surface-container-low border-l-4 border-primary rounded-r-lg">
          <p className="font-body text-sm text-on-surface-variant">
            <span className="font-bold text-on-surface">Daily Auto-check:</span> Sistem ALURA melakukan pemeriksaan
            validitas SPK setiap hari pada pukul 07:00 WIB. Properti dengan SPK berakhir akan otomatis diturunkan dari
            marketplace publik. Email notifikasi otomatis dikirimkan ke tim Manajemen jika SPK tersisa kurang dari 30
            hari.
          </p>
        </div>
      </section>
    </div>
  )
}
