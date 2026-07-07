import React, { useState } from "react";
import { offersApi } from "../../services/api";
import { formatPriceFull } from "../../data/properties";
import type { Offer, OfferStatus } from "../../types";
import PdfDownloadButton from "./PdfDownloadButton";

interface OfferDetailModalProps {
  offer: Offer;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const STATUS_OPTIONS: { value: OfferStatus; label: string; color: string }[] = [
  {
    value: "Pending",
    label: "Pending — Menunggu Review",
    color: "text-status-warning",
  },
  {
    value: "Follow Up",
    label: "Follow Up — Proses Negosiasi",
    color: "text-status-info",
  },
  {
    value: "Reviewed",
    label: "Reviewed — Dokumen Lengkap",
    color: "text-status-success",
  },
  {
    value: "Final",
    label: "Final — Transaksi Disetujui",
    color: "text-status-success",
  },
  {
    value: "Gugur",
    label: "Gugur — Gagal / Batal",
    color: "text-status-error",
  },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
        {label}
      </span>
      <span className="font-body text-sm text-on-surface">
        {value || <span className="text-on-surface-variant/40 italic">—</span>}
      </span>
    </div>
  );
}

export default function OfferStatusModal({
  offer,
  onClose,
  onSuccess,
}: OfferDetailModalProps) {
  const [newStatus, setNewStatus] = useState<OfferStatus>(offer.status);
  const [notes, setNotes] = useState(offer.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"detail" | "status">("detail");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await offersApi.updateStatus(offer.uuid, newStatus, notes);
      onSuccess("Status penawaran berhasil diperbarui.");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memperbarui status.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === offer.status);
  const tanggal = new Date(offer.created_at).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-outline-variant shrink-0">
          <div>
            <h2 className="font-headline font-bold text-xl text-primary">
              Detail Penawaran
            </h2>
            <p className="font-mono text-[11px] text-on-surface-variant mt-0.5">
              {tanggal}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant mt-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ── Tab switcher ── */}
        <div className="flex border-b border-outline-variant shrink-0">
          {(["detail", "status"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                tab === t
                  ? "text-primary border-b-2 border-primary bg-surface-container-low"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {t === "detail" ? "📋 Data Pemohon" : "⚙️ Update Status"}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">
          {/* ═══ TAB: DETAIL ═══ */}
          {tab === "detail" && (
            <div className="p-5 space-y-5">
              {/* Properti */}
              <div className="p-3 bg-surface-container-low border-l-4 border-primary rounded-r-lg">
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">
                  Properti
                </p>
                <p className="font-headline font-semibold text-base text-primary">
                  {offer.property?.title ?? "—"}
                </p>
                <p className="font-mono text-[11px] text-on-surface-variant">
                  {offer.property?.listing_id}
                </p>
              </div>

              {/* Data Pemohon */}
              <div>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
                  Data Pemohon
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2">
                    <InfoRow
                      label="Nama Lengkap Sesuai KTP"
                      value={offer.applicant_name}
                    />
                  </div>
                  <InfoRow
                    label="NIK"
                    value={
                      offer.applicant_nik ? (
                        <span className="font-mono tracking-widest">
                          {offer.applicant_nik}
                        </span>
                      ) : null
                    }
                  />
                  <InfoRow
                    label="No. WhatsApp"
                    value={
                      offer.applicant_phone ? (
                        <a
                          href={`https://wa.me/${offer.applicant_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline underline-offset-2"
                        >
                          {offer.applicant_phone}
                        </a>
                      ) : null
                    }
                  />
                  <div className="col-span-2">
                    <InfoRow
                      label="Alamat Sesuai KTP"
                      value={offer.applicant_address}
                    />
                  </div>
                  <div className="col-span-2">
                    <InfoRow
                      label="Email"
                      value={
                        <a
                          href={`mailto:${offer.applicant_email}`}
                          className="text-primary underline underline-offset-2"
                        >
                          {offer.applicant_email}
                        </a>
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant" />

              {/* Penawaran */}
              <div>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
                  Penawaran
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2">
                    <InfoRow
                      label="Harga Penawaran"
                      value={
                        <span className="font-mono font-bold text-primary text-base">
                          {formatPriceFull(offer.offer_price)}
                        </span>
                      }
                    />
                  </div>
                  <InfoRow label="Kode Referral" value={offer.referral_code} />
                  <InfoRow label="Agen" value={offer.agent?.name} />
                  <div>
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                      Status
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-1 rounded border ${
                        offer.status === "Pending"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : offer.status === "Follow Up"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : offer.status === "Reviewed"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : offer.status === "Final"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>
                </div>
              </div>

              {offer.notes && (
                <>
                  <div className="border-t border-outline-variant" />
                  <InfoRow
                    label="Catatan Negosiasi"
                    value={
                      <p className="text-sm text-on-surface whitespace-pre-wrap">
                        {offer.notes}
                      </p>
                    }
                  />
                </>
              )}

              {/* ── Aksi ── */}
              <div className="border-t border-outline-variant pt-4 flex flex-wrap gap-2">
                {/* Kirim Surat Minat (PDF) ke email pemohon */}
                <PdfDownloadButton offer={offer} variant="full" />
                {/* Buka WhatsApp */}
                {offer.applicant_phone && (
                  <a
                    href={`https://wa.me/${offer.applicant_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo ${offer.applicant_name}, kami dari tim ALURA Properti ingin menindaklanjuti penawaran Anda untuk properti ${offer.property?.title ?? ""}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white font-mono text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      chat
                    </span>
                    WhatsApp
                  </a>
                )}
                <button
                  onClick={() => setTab("status")}
                  className="inline-flex items-center gap-2 border border-primary text-primary font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit
                  </span>
                  Update Status
                </button>
              </div>
            </div>
          )}

          {/* ═══ TAB: STATUS ═══ */}
          {tab === "status" && (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-surface-container-low rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  person
                </span>
                <div>
                  <p className="font-body text-sm font-bold text-on-surface">
                    {offer.applicant_name}
                  </p>
                  <p className="font-mono text-[11px] text-primary">
                    {formatPriceFull(offer.offer_price)}
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Pilih Status Baru
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OfferStatus)}
                  className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Catatan Negosiasi
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-outline rounded-lg p-2.5 font-body text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Detail follow-up, alasan penolakan, atau progres verifikasi..."
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTab("detail")}
                  className="flex-1 border border-outline text-on-surface-variant font-body font-bold py-2.5 rounded-lg hover:bg-surface-container transition-colors"
                >
                  ← Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-on-primary font-body font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading && (
                    <span className="material-symbols-outlined animate-spin text-[16px]">
                      progress_activity
                    </span>
                  )}
                  Perbarui Status
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
