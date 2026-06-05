import type { RiskLevel } from '../../types'

const RISK_STYLES: Record<RiskLevel, { bg: string; label: string }> = {
  LOW:    { bg: 'bg-risk-low', label: 'RISIKO RENDAH' },
  MEDIUM: { bg: 'bg-risk-medium', label: 'RISIKO SEDANG' },
  HIGH:   { bg: 'bg-risk-high', label: 'RISIKO TINGGI' },
}

interface RiskBadgeProps {
  risk: RiskLevel
  className?: string
}

export default function RiskBadge({ risk, className = '' }: RiskBadgeProps) {
  const style = RISK_STYLES[risk] || RISK_STYLES.LOW
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-white text-[10px] font-bold uppercase tracking-tight font-mono ${style.bg} ${className}`}>
      {style.label}
    </span>
  )
}
