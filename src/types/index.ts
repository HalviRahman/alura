// ─── Auth ─────────────────────────────────────────────────────────────────

export type UserRole = 'manajemen' | 'agent' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  referral_code?: string | null
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── Property ─────────────────────────────────────────────────────────────

export type PropertyType = 'Rumah' | 'Apartemen' | 'Ruko' | 'Tanah' | 'Gudang' | 'Perkantoran'
export type RiskLevel    = 'LOW' | 'MEDIUM' | 'HIGH'
export type SpkStatus    = 'active' | 'warning' | 'critical' | 'expired'

export interface SpkInfo {
  spk_number: string
  start_date: string
  end_date: string
  days_remaining: number
  status: SpkStatus
  bank_name?: string
}

export interface AssetDetail {
  latitude: number
  longitude: number
  full_address: string
}

export interface Property {
  id: number
  uuid: string
  title: string
  description: string | null
  harga_penawaran: number
  harga_jual: number | null
  nilai_liquidasi: number | null
  city: string
  province: string
  type: PropertyType
  risk: RiskLevel
  certificate: string
  listing_id: string
  beds: number | null
  baths: number | null
  land_area: number | null
  build_area: number | null
  badge: string | null
  is_published: boolean
  images: string[]
  spk: SpkInfo | null
  // Only available for manajemen
  asset_detail?: AssetDetail | null
  created_at: string
}

// ─── Offer ────────────────────────────────────────────────────────────────

export type OfferStatus = 'Pending' | 'Follow Up' | 'Reviewed' | 'Final' | 'Gugur'

export interface Offer {
  id: number
  property: {
    id: number
    title: string
    listing_id: string
    city: string
  } | null
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  offer_price: number
  referral_code: string | null
  status: OfferStatus
  notes: string | null
  pdf_url: string | null
  agent: { id: number; name: string } | null
  created_at: string
}

// ─── API Response wrappers ─────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ─── Search / Filter ──────────────────────────────────────────────────────

export interface PropertyFilters {
  query?: string
  type?: PropertyType | ''
  province?: string
  price_min?: number
  price_max?: number
  sort?: 'newest' | 'price_asc' | 'price_desc'
}
