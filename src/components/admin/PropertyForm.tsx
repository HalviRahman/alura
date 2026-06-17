import React from 'react'
import type { PropertyType, RiskLevel } from '../../types'

interface PropertyFormProps {
  mode: 'add' | 'edit'
  form: {
    title: string
    description: string
    harga_penawaran: string
    harga_jual: string
    nilai_liquidasi: string
    city: string
    province: string
    type: PropertyType
    risk: RiskLevel
    certificate: string
    beds: string
    baths: string
    land_area: string
    build_area: string
    badge: string
    is_published?: boolean
    // Add mode fields
    spk_number?: string
    spk_start_date?: string
    spk_end_date: string
    bank_name: string
    spk_notes?: string
    full_address?: string
    latitude?: string
    longitude?: string
  }
  onChange: (field: string, val: any) => void
  onFileChange?: (files: FileList | null) => void
  imagesSelected?: FileList | null
}

export default function PropertyForm({
  mode,
  form,
  onChange,
  onFileChange,
  imagesSelected,
}: PropertyFormProps) {
  const isAdd = mode === 'add'

  const handleFieldChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val = e.target.value
    onChange(field, val)
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Property Info */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">
          1. Informasi Properti
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Nama Properti {isAdd ? 'Aset *' : '*'}
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={handleFieldChange('title')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "Contoh: Ruko Central Business Park" : ""}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              {isAdd ? 'Deskripsi Lengkap *' : 'Deskripsi'}
            </label>
            <textarea
              rows={3}
              required={isAdd}
              value={form.description}
              onChange={handleFieldChange('description')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "Jelaskan detail fisik properti..." : ""}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Harga Penawaran (IDR) *
            </label>
            <input
              type="number"
              required
              value={form.harga_penawaran}
              onChange={handleFieldChange('harga_penawaran')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "Rp (angka saja)" : ""}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Harga Jual (IDR)
            </label>
            <input
              type="number"
              value={form.harga_jual}
              onChange={handleFieldChange('harga_jual')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "Rp (angka saja)" : ""}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Nilai Liquidasi (IDR)
            </label>
            <input
              type="number"
              value={form.nilai_liquidasi}
              onChange={handleFieldChange('nilai_liquidasi')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "Rp (angka saja)" : ""}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Tipe Aset *
            </label>
            <select
              value={form.type}
              onChange={handleFieldChange('type')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {['Rumah', 'Apartemen', 'Ruko', 'Tanah', 'Gudang', 'Perkantoran'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Kota *
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={handleFieldChange('city')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "Contoh: Bandung" : ""}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Provinsi *
            </label>
            <input
              type="text"
              required
              value={form.province}
              onChange={handleFieldChange('province')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "Contoh: Jawa Barat" : ""}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Risiko Legalitas *
            </label>
            <select
              value={form.risk}
              onChange={handleFieldChange('risk')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="LOW">LOW (Risiko Rendah)</option>
              <option value="MEDIUM">MEDIUM (Risiko Sedang)</option>
              <option value="HIGH">HIGH (Risiko Tinggi)</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Sertifikat *
            </label>
            <input
              type="text"
              required
              value={form.certificate}
              onChange={handleFieldChange('certificate')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder={isAdd ? "SHM / SHGB / IMB" : ""}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Luas Tanah (m²)
            </label>
            <input
              type="number"
              value={form.land_area}
              onChange={handleFieldChange('land_area')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Luas Bangunan (m²)
            </label>
            <input
              type="number"
              value={form.build_area}
              onChange={handleFieldChange('build_area')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Kamar Tidur
            </label>
            <input
              type="number"
              value={form.beds}
              onChange={handleFieldChange('beds')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Kamar Mandi
            </label>
            <input
              type="number"
              value={form.baths}
              onChange={handleFieldChange('baths')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          {(!isAdd) && (
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Badge
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={handleFieldChange('badge')}
                placeholder="TERSEDIA / HOT DEAL / dll"
                className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 2: SPK */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">
          2. Perjanjian Kerja Sama (SPK)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isAdd && (
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Nomor SPK *
              </label>
              <input
                type="text"
                required
                value={form.spk_number}
                onChange={handleFieldChange('spk_number')}
                className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="SPK-2026-X991"
              />
            </div>
          )}
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Nama Bank {isAdd ? '*' : ''}
            </label>
            <input
              type="text"
              required={isAdd}
              value={form.bank_name}
              onChange={handleFieldChange('bank_name')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          {isAdd && (
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Tanggal Mulai SPK *
              </label>
              <input
                type="date"
                required
                value={form.spk_start_date}
                onChange={handleFieldChange('spk_start_date')}
                className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Tanggal Berakhir SPK {isAdd ? '*' : ''}
            </label>
            <input
              type="date"
              required={isAdd}
              value={form.spk_end_date}
              onChange={handleFieldChange('spk_end_date')}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: GPS Locations (Add only) */}
      {isAdd && (
        <div className="space-y-4">
          <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">
            3. Titik Lokasi (Terproteksi)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={form.full_address}
                onChange={handleFieldChange('full_address')}
                className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleFieldChange('latitude')}
                className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="-6.12345"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleFieldChange('longitude')}
                className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="106.12345"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Image Upload (Add only) */}
      {isAdd && onFileChange && (
        <div className="space-y-4">
          <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-1">
            4. Upload Gambar Properti
          </h3>
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
              Pilih Foto (Maks 10 file, @5MB)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => onFileChange(e.target.files)}
              className="w-full bg-white border border-outline rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {imagesSelected && (
              <p className="mt-1.5 font-mono text-xs text-status-success">
                ✓ {imagesSelected.length} file dipilih.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
