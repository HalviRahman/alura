import React, { useState, useRef } from 'react'
import { propertiesApi } from '../../services/api'
import type { Property, PropertyType, RiskLevel } from '../../types'
import PropertyForm from './PropertyForm'

interface EditPropertyDrawerProps {
  property: Property
  onClose: () => void
  onSuccess: (msg: string) => void
}

export default function EditPropertyDrawer({
  property,
  onClose,
  onSuccess,
}: EditPropertyDrawerProps) {
  const [form, setForm] = useState({
    title: property.title,
    description: property.description || '',
    harga_penawaran: String(property.harga_penawaran),
    harga_jual: String(property.harga_jual ?? ''),
    nilai_liquidasi: String(property.nilai_liquidasi ?? ''),
    city: property.city,
    province: property.province,
    type: property.type,
    risk: property.risk,
    certificate: property.certificate,
    beds: String(property.beds ?? ''),
    baths: String(property.baths ?? ''),
    land_area: String(property.land_area ?? ''),
    build_area: String(property.build_area ?? ''),
    badge: property.badge || '',
    is_published: property.is_published,
    spk_end_date: property.spk?.end_date?.slice(0, 10) || '',
    bank_name: property.spk?.bank_name || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload: Record<string, any> = {
        title: form.title,
        description: form.description || null,
        harga_penawaran: parseInt(form.harga_penawaran, 10),
        harga_jual: form.harga_jual ? parseInt(form.harga_jual, 10) : null,
        nilai_liquidasi: form.nilai_liquidasi ? parseInt(form.nilai_liquidasi, 10) : null,
        city: form.city,
        province: form.province,
        type: form.type,
        risk: form.risk,
        certificate: form.certificate,
        beds: form.beds ? parseInt(form.beds, 10) : null,
        baths: form.baths ? parseInt(form.baths, 10) : null,
        land_area: form.land_area ? parseInt(form.land_area, 10) : null,
        build_area: form.build_area ? parseInt(form.build_area, 10) : null,
        badge: form.badge || null,
        is_published: form.is_published,
      }
      if (form.spk_end_date) payload.spk_end_date = form.spk_end_date
      if (form.bank_name) payload.bank_name = form.bank_name

      await propertiesApi.update(property.id, payload)
      onSuccess(`Properti "${form.title}" berhasil diperbarui.`)
      onClose()
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Gagal memperbarui properti.'
      if (err.response?.data?.errors) {
        const details = Object.values(err.response.data.errors).flat().join(', ')
        if (details) {
          errorMsg += ` (${details})`
        }
      }
      setError(errorMsg)
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: string, val: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'type' && val === 'Tanah') {
        next.build_area = '0'
        next.beds = '0'
        next.baths = '0'
      }
      return next
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-surface w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant bg-surface-container-low">
          <div>
            <h2 className="font-headline font-bold text-xl text-primary">Edit Aset Properti</h2>
            <p className="font-mono text-[10px] text-on-surface-variant">{property.listing_id}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}

          {/* Published toggle */}
          <div className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-xl">
            <div>
              <p className="font-body text-sm font-bold text-on-surface">Status Tayang</p>
              <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">Properti yang tidak tayang tidak muncul di marketplace publik</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, is_published: !prev.is_published }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_published ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <PropertyForm
            mode="edit"
            form={form}
            onChange={handleFieldChange}
          />

          <div className="pt-4 flex gap-4 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="flex-1 border border-outline text-primary font-body font-bold py-3 rounded-lg hover:bg-surface-container transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
