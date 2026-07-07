
$file = "d:\PROJECT\ALURA\src\pages\AdminDashboardPage.tsx"
$lines = Get-Content $file -Encoding UTF8
$total = $lines.Count

$before = $lines[0..112]
$after  = $lines[193..($total-1)]

$newBlock = @'
// ─── Offer Detail Modal ────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">{label}</span>
      <span className="font-body text-sm text-on-surface">{value || <span className="text-on-surface-variant/40 italic">—</span>}</span>
    </div>
  )
}

function OfferStatusModal({ offer, onClose, onSuccess }) {
  const [newStatus, setNewStatus] = useState(offer.status)
  const [notes, setNotes]         = useState(offer.notes || '')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [tab, setTab]             = useState('detail')
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await offersApi.updateStatus(offer.uuid, newStatus, notes)
      onSuccess('Status penawaran berhasil diperbarui.')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui status.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (pdfLoading) return
    setPdfLoading(true)
    try {
      const res = await offersApi.downloadPdf(offer.uuid)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `SuratMinat-${offer.applicant_name}-${offer.property?.listing_id ?? offer.uuid.slice(0,8)}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Gagal mengunduh PDF. Pastikan Microsoft Word terinstall di server.')
    } finally {
      setPdfLoading(false)
    }
  }

  const tanggal = new Date(offer.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const statusColors = {
    'Pending':   'bg-amber-50 border-amber-200 text-amber-700',
    'Follow Up': 'bg-blue-50 border-blue-200 text-blue-700',
    'Reviewed':  'bg-emerald-50 border-emerald-200 text-emerald-700',
    'Final':     'bg-green-50 border-green-200 text-green-700',
    'Gugur':     'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <div className="flex items-start justify-between p-5 border-b border-outline-variant shrink-0">
          <div>
            <h2 className="font-headline font-bold text-xl text-primary">Detail Penawaran</h2>
            <p className="font-mono text-[11px] text-on-surface-variant mt-0.5">{tanggal}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant mt-0.5">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex border-b border-outline-variant shrink-0">
          {['detail', 'status'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${tab === t ? 'text-primary border-b-2 border-primary bg-surface-container-low' : 'text-on-surface-variant hover:text-primary'}`}>
              {t === 'detail' ? '📋 Data Pemohon' : '⚙️ Update Status'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {tab === 'detail' && (
            <div className="p-5 space-y-5">
              <div className="p-3 bg-surface-container-low border-l-4 border-primary rounded-r-lg">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">Properti</p>
                <p className="font-headline font-semibold text-base text-primary">{offer.property?.title ?? '—'}</p>
                <p className="font-mono text-[11px] text-on-surface-variant">{offer.property?.listing_id}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Data Pemohon</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2"><InfoRow label="Nama Lengkap Sesuai KTP" value={offer.applicant_name} /></div>
                  <InfoRow label="NIK" value={offer.applicant_nik ? <span className="font-mono tracking-widest text-xs">{offer.applicant_nik}</span> : null} />
                  <InfoRow label="No. WhatsApp" value={offer.applicant_phone ? <a href={`https://wa.me/${offer.applicant_phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{offer.applicant_phone}</a> : null} />
                  <div className="col-span-2"><InfoRow label="Alamat Sesuai KTP" value={offer.applicant_address} /></div>
                  <div className="col-span-2"><InfoRow label="Email" value={<a href={`mailto:${offer.applicant_email}`} className="text-primary underline underline-offset-2">{offer.applicant_email}</a>} /></div>
                </div>
              </div>

              <div className="border-t border-outline-variant" />

              <div>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Penawaran</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2">
                    <InfoRow label="Harga Penawaran" value={offer.offer_price > 0 ? <span className="font-mono font-bold text-primary text-base">{formatPriceFull(offer.offer_price)}</span> : <span className="font-mono text-on-surface-variant italic text-sm">Tanya Detail Aset</span>} />
                  </div>
                  <InfoRow label="Kode Referral" value={offer.referral_code} />
                  <InfoRow label="Agen" value={offer.agent?.name} />
                  <div>
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">Status</span>
                    <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${statusColors[offer.status] ?? ''}`}>{offer.status}</span>
                  </div>
                </div>
              </div>

              {offer.notes && (
                <>
                  <div className="border-t border-outline-variant" />
                  <InfoRow label="Catatan Negosiasi" value={<p className="text-sm text-on-surface whitespace-pre-wrap mt-0.5">{offer.notes}</p>} />
                </>
              )}

              <div className="border-t border-outline-variant pt-4 flex flex-wrap gap-2">
                {offer.offer_price > 0 && (
                  <button onClick={handleDownloadPdf} disabled={pdfLoading} className="inline-flex items-center gap-2 bg-primary text-on-primary font-mono text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                    {pdfLoading ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>}
                    {pdfLoading ? 'Memproses...' : 'Unduh Surat Minat (PDF)'}
                  </button>
                )}
                {offer.applicant_phone && (
                  <a href={`https://wa.me/${offer.applicant_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Halo ${offer.applicant_name}, kami dari tim ALURA Properti ingin menindaklanjuti penawaran Anda untuk properti ${offer.property?.title ?? ''}.`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white font-mono text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">chat</span>WhatsApp
                  </a>
                )}
                <button onClick={() => setTab('status')} className="inline-flex items-center gap-2 border border-primary text-primary font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">edit</span>Update Status
                </button>
              </div>
            </div>
          )}

          {tab === 'status' && (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-surface-container-low rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">person</span>
                <div>
                  <p className="font-body text-sm font-bold text-on-surface">{offer.applicant_name}</p>
                  <p className="font-mono text-[11px] text-primary">{offer.offer_price > 0 ? formatPriceFull(offer.offer_price) : 'Tanya Detail Aset'}</p>
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{error}</div>}
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Pilih Status Baru</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                  <option value="Pending">Pending — Menunggu Review</option>
                  <option value="Follow Up">Follow Up — Proses Negosiasi</option>
                  <option value="Reviewed">Reviewed — Dokumen Lengkap</option>
                  <option value="Final">Final — Transaksi Disetujui</option>
                  <option value="Gugur">Gugur — Gagal / Batal</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">Catatan Negosiasi</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none" placeholder="Detail follow-up, alasan penolakan, atau progres verifikasi..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setTab('detail')} className="flex-1 border border-outline text-on-surface-variant font-body font-bold py-2.5 rounded-lg hover:bg-surface-container transition-colors">← Kembali</button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-on-primary font-body font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {loading && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  Perbarui Status
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

'@

$newLines = $newBlock -split "`n"
$result = $before + $newLines + $after
Set-Content $file -Value $result -Encoding UTF8
Write-Host "Done. Written $($result.Count) lines."
