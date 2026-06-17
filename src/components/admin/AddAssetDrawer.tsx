import React, { useState, useRef } from 'react'
import { propertiesApi } from '../../services/api'
import type { PropertyType, RiskLevel } from '../../types'
import PropertyForm from './PropertyForm'

interface AddAssetDrawerProps {
  onClose: () => void
  onSuccess: (msg: string) => void
}

export default function AddAssetDrawer({ onClose, onSuccess }: AddAssetDrawerProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    harga_penawaran: '',
    harga_jual: '',
    nilai_liquidasi: '',
    city: '',
    province: '',
    type: 'Rumah' as PropertyType,
    risk: 'LOW' as RiskLevel,
    certificate: 'SHM',
    beds: '',
    baths: '',
    land_area: '',
    build_area: '',
    badge: 'TERSEDIA',
    spk_number: '',
    spk_start_date: '',
    spk_end_date: '',
    bank_name: 'Bank ALURA',
    spk_notes: '',
    full_address: '',
    latitude: '',
    longitude: '',
  })
  const [images, setImages] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val !== '') formData.append(key, val)
    })
    if (images) {
      Array.from(images).forEach(file => formData.append('images[]', file))
    }
    try {
      await propertiesApi.create(formData)
      onSuccess('Aset properti baru berhasil ditambahkan!')
      onClose()
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Gagal menambahkan properti.'
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
            <h2 className="font-headline font-bold text-xl text-primary">Tambah Aset Properti Baru</h2>
            <p className="font-body text-xs text-on-surface-variant">Masukkan rincian data aset dan dokumen legalitas SPK</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}

          <PropertyForm
            mode="add"
            form={form}
            onChange={handleFieldChange}
            onFileChange={setImages}
            imagesSelected={images}
          />

          <div className="pt-4 flex gap-4 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="flex-1 border border-outline text-primary font-body font-bold py-3 rounded-lg hover:bg-surface-container transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              {loading ? 'Menyimpan Aset...' : 'Simpan Aset Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
