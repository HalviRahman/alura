import React, { useRef, useEffect } from 'react'
import { getSpkStatus } from '../../data/properties'
import type { SpkAlert } from '../../services/api'

interface SpkCardProps {
  asset: SpkAlert
}

export default function SpkCard({ asset }: SpkCardProps) {
  const status = getSpkStatus(asset.days_remaining)
  const isCritical = asset.days_remaining <= 14
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isCritical) return
    const el = cardRef.current
    let visible = true
    const interval = setInterval(() => {
      visible = !visible
      if (el) el.style.opacity = visible ? '1' : '0.7'
    }, 900)
    return () => clearInterval(interval)
  }, [isCritical])

  const borderColor =
    asset.days_remaining <= 14 ? 'border-l-status-error'
    : asset.days_remaining <= 30 ? 'border-l-status-warning'
    : 'border-l-status-success'

  return (
    <div
      ref={cardRef}
      className={`bg-surface-container-low p-4 rounded-xl border-l-4 relative overflow-hidden group transition-opacity duration-500 ${borderColor}`}
    >
      <div className="absolute top-2 right-2 opacity-10 group-hover:scale-125 transition-transform duration-300">
        <span className="material-symbols-outlined text-[48px] text-on-surface">
          {asset.days_remaining <= 14 ? 'priority_high' : asset.days_remaining <= 30 ? 'pending_actions' : 'check_circle'}
        </span>
      </div>
      <p className="font-mono text-[10px] text-on-surface-variant">Nomor SPK: {asset.spk_number}</p>
      <h4 className="font-headline font-semibold text-base mt-1 text-on-surface truncate pr-6">{asset.title}</h4>
      <div className="mt-4">
        <span className={`font-mono text-xs font-bold ${status.color}`}>{status.label}</span>
        <div className="w-full bg-outline-variant h-1.5 rounded-full mt-2 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${status.bgColor}`} style={{ width: status.barWidth }} />
        </div>
      </div>
    </div>
  )
}
