import type { OfferStatus } from '../../types'

const STATUS_STYLES: Record<string, string> = {
  'Final':      'bg-green-50 text-green-800 border border-green-200',
  'FINAL':      'bg-green-50 text-green-800 border border-green-200',
  'Follow Up':  'bg-amber-50 text-amber-800 border border-amber-200',
  'FOLLOW UP':  'bg-amber-50 text-amber-800 border border-amber-200',
  'Reviewed':   'bg-blue-50 text-blue-800 border border-blue-200',
  'Pending':    'bg-blue-50 text-blue-800 border border-blue-200',
  'PENDING':    'bg-blue-50 text-blue-800 border border-blue-200',
  'Gugur':      'bg-red-50 text-red-800 border border-red-200',
  'GUGUR':      'bg-red-50 text-red-800 border border-red-200',
}

interface StatusBadgeProps {
  status: OfferStatus | string
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border border-gray-200'
  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold font-mono uppercase tracking-wide ${style} ${className}`}>
      {status}
    </span>
  )
}
