<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #191c1e; margin: 0; padding: 0; }
  .header { background: #000000; color: #ffffff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
  .brand { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
  .doc-type { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7; margin-top: 4px; }
  .ref { font-size: 9px; text-align: right; opacity: 0.7; }
  .container { padding: 32px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: #76777d; border-bottom: 1px solid #e0e3e5; padding-bottom: 6px; margin-bottom: 12px; }
  .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .label { color: #45464d; width: 45%; }
  .value { font-weight: bold; width: 55%; text-align: right; }
  .price-box { background: #f7f9fb; border: 1px solid #c6c6cd; border-left: 4px solid #000; padding: 16px 20px; margin: 20px 0; border-radius: 2px; }
  .price-label { font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: #76777d; }
  .price-value { font-size: 20px; font-weight: bold; color: #000000; margin-top: 4px; }
  .referral-box { background: #eceef0; padding: 10px 16px; border-radius: 2px; margin-top: 12px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e3e5; font-size: 8px; color: #76777d; }
  .watermark { position: fixed; bottom: 60px; right: 40px; font-size: 60px; font-weight: bold; color: rgba(0,0,0,0.04); transform: rotate(-30deg); letter-spacing: 4px; }
  .status-badge { display: inline-block; background: #eceef0; padding: 4px 10px; border-radius: 2px; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; }
</style>
</head>
<body>

<div class="watermark">ALURA OFFICIAL</div>

<!-- Header -->
<div class="header">
  <div>
    <div class="brand">ALURA</div>
    <div class="doc-type">Institutional Property Marketplace</div>
  </div>
  <div class="ref">
    <div style="font-size:8px;opacity:0.6;">DOKUMEN PENAWARAN RESMI</div>
    <div style="font-size:11px;font-weight:bold;">REQ-{{ str_pad($offer->id, 4, '0', STR_PAD_LEFT) }}</div>
    <div style="font-size:8px;opacity:0.6;">{{ $offer->created_at?->format('d M Y') }}</div>
  </div>
</div>

<div class="container">

  <!-- Property Info -->
  <div class="section">
    <div class="section-title">Informasi Properti</div>
    <div class="row">
      <span class="label">Nama Properti</span>
      <span class="value">{{ $property->title }}</span>
    </div>
    <div class="row">
      <span class="label">Listing ID</span>
      <span class="value">{{ $property->listing_id }}</span>
    </div>
    <div class="row">
      <span class="label">Lokasi</span>
      <span class="value">{{ $property->city }}, {{ $property->province }}</span>
    </div>
    <div class="row">
      <span class="label">Tipe Properti</span>
      <span class="value">{{ $property->type }}</span>
    </div>
    <div class="row">
      <span class="label">Sertifikat</span>
      <span class="value">{{ $property->certificate }}</span>
    </div>
  </div>

  <!-- Harga Penawaran -->
  <div class="price-box">
    <div class="price-label">Harga Penawaran Pemohon</div>
    <div class="price-value">Rp {{ number_format($offer->offer_price, 0, ',', '.') }}</div>
    <div style="font-size:8px;color:#76777d;margin-top:4px;">
      Harga Limit ALURA: Rp {{ number_format($property->price, 0, ',', '.') }}
    </div>
  </div>

  <!-- Data Pemohon -->
  <div class="section">
    <div class="section-title">Data Pemohon</div>
    <div class="row">
      <span class="label">Nama Lengkap</span>
      <span class="value">{{ $offer->applicant_name }}</span>
    </div>
    <div class="row">
      <span class="label">Email</span>
      <span class="value">{{ $offer->applicant_email }}</span>
    </div>
    <div class="row">
      <span class="label">No. WhatsApp</span>
      <span class="value">{{ $offer->applicant_phone }}</span>
    </div>
    <div class="row">
      <span class="label">Status Penawaran</span>
      <span class="value"><span class="status-badge">{{ $offer->status }}</span></span>
    </div>
  </div>

  @if($agent)
  <!-- Referral Agen -->
  <div class="referral-box">
    <div style="font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#45464d;">Melalui Agen Referral</div>
    <div style="font-weight:bold;margin-top:4px;">{{ $agent->name }}</div>
    <div style="font-size:9px;color:#76777d;margin-top:2px;">Kode: {{ $offer->referral_code }}</div>
  </div>
  @endif

  <!-- Footer -->
  <div class="footer">
    <p>Dokumen ini merupakan konfirmasi penerimaan penawaran yang telah disampaikan melalui platform ALURA Institutional Property Marketplace. Penawaran ini bersifat non-binding dan akan ditindaklanjuti oleh tim ALURA dalam waktu maksimal 2x24 jam kerja setelah verifikasi dokumen pendukung.</p>
    <p>© {{ date('Y') }} ALURA Institutional Assets. Dokumen ini digenerate secara otomatis dan sah tanpa tanda tangan basah.</p>
  </div>

</div>
</body>
</html>
