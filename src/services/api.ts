import axios, { type AxiosError, type AxiosResponse } from 'axios'
import type {
  Property,
  Offer,
  OfferStatus,
  PaginatedResponse,
  PropertyFilters,
  User,
} from '../types'

// ─── Axios instance ────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// Inject Bearer token dari localStorage ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('alura_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — token expired/invalid → redirect ke login
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('alura_token')
      localStorage.removeItem('alura_user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export function getPdfUrl(url: string | null | undefined): string {
  if (!url) return ''
  return url
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
  'g-recaptcha-response'?: string | null
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<User>('/auth/me'),
}

// ─── Properties ────────────────────────────────────────────────────────────

export const propertiesApi = {
  list: (filters?: PropertyFilters & { page?: number }) =>
    api.get<PaginatedResponse<Property>>('/properties', { params: filters }),

  show: (uuid: string) =>
    api.get<Property>(`/properties/${uuid}`),

  create: (formData: FormData) =>
    api.post<{ message: string; property: Property }>('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: Partial<Property>) =>
    api.put<{ message: string; property: Property }>(`/properties/${id}`, data),

  delete: (id: number) =>
    api.delete(`/properties/${id}`),

  uploadImages: (id: number, formData: FormData) =>
    api.post<{ message: string; images: string[] }>(
      `/properties/${id}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),
}

// ─── Offers ────────────────────────────────────────────────────────────────

export interface SubmitOfferPayload {
  property_id: number
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  offer_price: number
  referral_code?: string | null
}

export const offersApi = {
  submit: (payload: SubmitOfferPayload) =>
    api.post<{ message: string; offer: Offer }>('/offers', payload),

  list: (params?: { status?: OfferStatus; page?: number; search?: string; type?: 'offer' | 'inquiry' }) =>
    api.get<PaginatedResponse<Offer>>('/offers', { params }),

  updateStatus: (uuid: string, status: OfferStatus, notes?: string) =>
    api.put<{ message: string; offer: Offer }>(`/offers/${uuid}/status`, { status, notes }),

  downloadPdf: (uuid: string) =>
    api.get(`/offers/${uuid}/pdf`, { responseType: 'blob' }),
}

// ─── Agent ─────────────────────────────────────────────────────────────────

export interface AgentStats {
  referral_code: string
  stats: {
    total_leads: number
    final: number
    follow_up: number
    pending: number
    gugur: number
  }
  recent_leads: Offer[]
}

export const agentApi = {
  properties: (page = 1) =>
    api.get<PaginatedResponse<Property>>('/agent/properties', { params: { page } }),

  stats: () =>
    api.get<AgentStats>('/agent/stats'),
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export interface DashboardData {
  summary: {
    total_offers: number
    total_value: number
    pending_count: number
    final_count: number
  }
  recent_offers: Offer[]
  agent_stats: Array<{
    id: number
    name: string
    referral_code: string
    total_leads: number
  }>
}

export interface SpkAlert {
  property_id: number
  property_uuid: string
  title: string
  listing_id: string
  spk_number: string
  end_date: string
  days_remaining: number
  spk_status: string
  image: string | null
}


// ─── Analytics ─────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total_properties: number
  published_properties: number
  total_offers: number
  total_offer_value: number
  conversion_rate: number
  total_agents: number
  spk_expiring_soon: number
}

export interface MonthlyOffer {
  month: string
  total: number
  total_value: number
}

export interface TopAgent {
  id: number
  name: string
  referral_code: string
  total_leads: number
  final_leads: number
  conversion: number
}

export interface AnalyticsData {
  summary: AnalyticsSummary
  monthly_offers: MonthlyOffer[]
  offers_by_status: Record<string, number>
  properties_by_type: Record<string, number>
  properties_by_risk: Array<{ risk: string; total: number; avg_price: number }>
  top_agents: TopAgent[]
}

// ─── User Management ───────────────────────────────────────────────────────

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  referral_code: string | null
  total_leads?: number
  created_at: string
  deleted_at: string | null
}

export interface MapLocation {
  id: number
  uuid: string
  title: string
  listing_id: string
  city: string
  province: string
  type: string
  risk: string
  price: number
  is_published: boolean
  latitude: number
  longitude: number
  image: string | null
  spk_status: string | null
  days_remaining: number | null
}

export const adminApi = {
  dashboard: () =>
    api.get<DashboardData>('/admin/dashboard'),

  spkAlerts: () =>
    api.get<{
      critical: SpkAlert[]
      warning: SpkAlert[]
      active: SpkAlert[]
      expired: SpkAlert[]
    }>('/admin/spk-alerts'),

  analytics: () =>
    api.get<AnalyticsData>('/admin/analytics'),

  reports: (params?: {
    date_from?: string
    date_to?: string
    status?: string
    page?: number
    format?: 'json' | 'csv'
  }) => api.get('/admin/reports', { params }),

  reportsExportUrl: (params: Record<string, string>) => {
    const token = localStorage.getItem('alura_token')
    const qs = new URLSearchParams({ ...params, format: 'csv' }).toString()
    return `http://localhost:8000/api/admin/reports?${qs}`
  },

  mapLocations: () =>
    api.get<MapLocation[]>('/admin/map-locations'),
}

export const userManagementApi = {
  list: (params?: { role?: string; search?: string; page?: number }) =>
    api.get<{ data: AdminUser[]; meta: { current_page: number; last_page: number; total: number; per_page: number } }>(
      '/admin/users', { params }
    ),

  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<{ message: string; user: AdminUser }>('/admin/users', data),

  update: (id: number, data: Partial<{ name: string; email: string; password: string; role: string }>) =>
    api.put<{ message: string; user: AdminUser }>(`/admin/users/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/admin/users/${id}`),

  restore: (id: number) =>
    api.post<{ message: string }>(`/admin/users/${id}/restore`),
}

export default api
