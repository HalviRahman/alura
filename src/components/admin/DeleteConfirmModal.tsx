import React, { useState } from 'react'
import { propertiesApi } from '../../services/api'
import type { Property } from '../../types'

interface DeleteConfirmModalProps {
  property: Property
  onClose: () => void
  onSuccess: (msg: string) => void
}

export default function DeleteConfirmModal({ property, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await propertiesApi.delete(property.id)
      onSuccess(`Properti "${property.title}" berhasil dihapus.`)
      onClose()
    } catch (err: any) {
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-red-600 text-[28px]">delete_forever</span>
          </div>
          <h3 className="font-headline font-semibold text-lg text-on-surface">Hapus Properti?</h3>
          <p className="font-body text-sm text-on-surface-variant">
            Tindakan ini akan menghapus <span className="font-bold text-on-surface">"{property.title}"</span>. Data tidak dapat dipulihkan.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-outline text-on-surface font-body font-bold py-2.5 rounded-lg hover:bg-surface-container transition-colors">Batal</button>
            <button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 text-white font-body font-bold py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
