export const formatPrice = (price: number): string => {
  if (price >= 1_000_000_000) {
    const m = price / 1_000_000_000
    return `Rp ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace('.', ',')} M`
  }
  return `Rp ${(price / 1_000_000).toFixed(0)} Jt`
}

export const formatPriceFull = (price: number): string => {
  return 'Rp ' + price.toLocaleString('id-ID')
}

export interface SpkStatusUi {
  color: string
  bgColor: string
  label: string
  barWidth: string
}

export const getSpkStatus = (days: number): SpkStatusUi => {
  if (days < 0)  return { color: 'text-status-error', bgColor: 'bg-status-error', label: `SPK Terlewat ${Math.abs(days)} Hari`, barWidth: '100%' }
  if (days === 0) return { color: 'text-status-error', bgColor: 'bg-status-error', label: 'SPK Berakhir Hari Ini', barWidth: '100%' }
  if (days <= 14) return { color: 'text-status-error', bgColor: 'bg-status-error', label: `Kritis — ${days} Hari Tersisa`, barWidth: `${Math.min(100, (days / 14) * 30 + 70)}%` }
  if (days <= 30) return { color: 'text-status-warning', bgColor: 'bg-status-warning', label: `${days} Hari Tersisa`, barWidth: '60%' }
  return { color: 'text-status-success', bgColor: 'bg-status-success', label: `Aktif (${days} Hari)`, barWidth: `${Math.max(5, 100 - days / 3)}%` }
}
