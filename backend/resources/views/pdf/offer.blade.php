<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<style>
  @page {
    margin-top: 1.8cm;
    margin-right: 2.2cm;
    margin-bottom: 2cm;
    margin-left: 2.2cm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DejaVu Sans', Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a1a;
    line-height: 1.5;
  }

  /* ─── KOP SURAT ─────────────────────────────────────────── */
  .kop {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }
  .kop td {
    vertical-align: top;
    padding: 0;
  }
  .kop-logo {
    width: 38%;
  }
  /* Logo: A kuning italic bold + LURA hitam bold */
  .logo-a {
    font-size: 34pt;
    font-weight: 900;
    font-style: italic;
    color: #FDD200;
    letter-spacing: 0;
    line-height: 1;
  }
  .logo-lura {
    font-size: 34pt;
    font-weight: 900;
    color: #000000;
    letter-spacing: 0.5px;
    line-height: 1;
  }
  .kop-addr {
    width: 62%;
    text-align: right;
    font-size: 8pt;
    line-height: 1.6;
    color: #1a1a1a;
    padding-top: 2px;
  }

  /* ─── DIVIDER ──────────────────────────────────────────── */
  .divider {
    border: none;
    border-top: 1.5px solid #000;
    margin: 6px 0 0 0;
  }

  /* ─── JUDUL ─────────────────────────────────────────────── */
  .judul {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-decoration: underline;
    letter-spacing: 0.5px;
    margin: 20px 0 18px 0;
  }

  /* ─── TANGGAL KANAN ─────────────────────────────────────── */
  .tanggal-kanan {
    text-align: right;
    font-size: 11pt;
    margin-bottom: 14px;
  }

  /* ─── KEPADA ─────────────────────────────────────────────── */
  .kepada {
    font-size: 11pt;
    line-height: 1.55;
    margin-bottom: 14px;
  }

  /* ─── PEMBUKA ─────────────────────────────────────────────── */
  .pembuka {
    font-size: 11pt;
    margin-bottom: 8px;
  }

  /* ─── TABEL DATA PEMOHON ──────────────────────────────────── */
  .tbl-pemohon {
    border-collapse: collapse;
    margin-bottom: 14px;
    width: auto;
  }
  .tbl-pemohon td {
    font-size: 11pt;
    padding: 1.5px 0;
    vertical-align: top;
  }
  .p-label { width: 72px; }
  .p-sep   { width: 22px; }
  .p-val   { }

  /* ─── MENYATAKAN ─────────────────────────────────────────── */
  .menyatakan {
    font-size: 11pt;
    text-align: justify;
    margin-bottom: 8px;
  }

  /* ─── TABEL OBJEK ─────────────────────────────────────────── */
  .tbl-objek {
    border-collapse: collapse;
    margin-bottom: 16px;
    width: auto;
  }
  .tbl-objek td {
    font-size: 11pt;
    padding: 2px 0;
    vertical-align: top;
  }
  .o-label { width: 130px; }
  .o-sep   { width: 22px; }
  .o-val   { }

  /* ─── PENUTUP ─────────────────────────────────────────────── */
  .penutup {
    font-size: 11pt;
    text-align: justify;
    margin-bottom: 22px;
    line-height: 1.6;
  }

  /* ─── TTD ─────────────────────────────────────────────────── */
  .ttd-date {
    font-size: 11pt;
    margin-bottom: 56px;
  }
  .ttd-line {
    border-top: 1px solid #000;
    width: 165px;
  }
</style>
</head>
<body>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- KOP SURAT                                                   --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<table class="kop">
<tr>
  <td class="kop-logo">
    <span class="logo-a">A</span><span class="logo-lura">LURA</span>
  </td>
  <td class="kop-addr">
    Ruko Tlogomas Square Kav 25<br>
    Kota Malang – Jawa Timur<br>
    Website : aluranproperti.co.id<br>
    Email : aluranusantara@gmail.com<br>
    Contact : 0341-2316039 | 081717176600
  </td>
</tr>
</table>
<hr class="divider">

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- JUDUL                                                       --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<div class="judul">SURAT MINAT ASET</div>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- TANGGAL (kanan atas)                                        --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<div class="tanggal-kanan">
  Malang, {{ (function() use ($offer) {
    $bulan = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    $dt = $offer->created_at ?? \Carbon\Carbon::now();
    return $dt->format('d') . ' ' . $bulan[(int)$dt->format('n')] . ' ' . $dt->format('Y');
  })() }}
</div>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- KEPADA                                                      --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<div class="kepada">
  Kepada Yth.<br>
  Direksi PT Alura Properti Nusantara<br>
  di Tempat
</div>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- PEMBUKA                                                     --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<div class="pembuka">Yang bertandatangan di bawah ini :</div>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- DATA PEMOHON                                                --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<table class="tbl-pemohon">
  <tr>
    <td class="p-label">Nama</td>
    <td class="p-sep">:</td>
    <td class="p-val">{{ $offer->applicant_name }}</td>
  </tr>
  <tr>
    <td class="p-label">NIK</td>
    <td class="p-sep">:</td>
    <td class="p-val">{{ $offer->applicant_nik ?? '' }}</td>
  </tr>
  <tr>
    <td class="p-label">Alamat</td>
    <td class="p-sep">:</td>
    <td class="p-val">{{ $offer->applicant_address ?? '' }}</td>
  </tr>
  <tr>
    <td class="p-label">HP</td>
    <td class="p-sep">:</td>
    <td class="p-val">{{ $offer->applicant_phone }}</td>
  </tr>
</table>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- PERNYATAAN MINAT                                            --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<div class="menyatakan">
  Menyatakan berminat untuk melakukan penawaran Aset yang dipasarkan oleh PT Alura Properti Nusantara berupa :
</div>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- DATA OBJEK / ASET                                           --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<table class="tbl-objek">
  <tr>
    <td class="o-label">Objek</td>
    <td class="o-sep">:</td>
    <td class="o-val">{{ $property->type }}</td>
  </tr>
  <tr>
    <td class="o-label">Alamat</td>
    <td class="o-sep">:</td>
    <td class="o-val">
      {{-- Gunakan alamat lengkap dari asset_detail jika tersedia, fallback ke kota & provinsi --}}
      {{ $property->asset_detail?->full_address ?? ($property->city . ', ' . $property->province) }}
    </td>
  </tr>
  <tr>
    <td class="o-label">Listing No</td>
    <td class="o-sep">:</td>
    <td class="o-val">{{ $property->listing_id }}</td>
  </tr>
  @if($offer->offer_price > 0)
  <tr>
    <td class="o-label">Harga Penawaran</td>
    <td class="o-sep">:</td>
    <td class="o-val">
      Rp. {{ number_format($offer->offer_price, 0, ',', '.') }},- terbilang ({{ \App\Helpers\Terbilang::convert($offer->offer_price) }} Rupiah)
    </td>
  </tr>
  @endif
</table>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- PENUTUP                                                     --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<div class="penutup">
  Sebagai bukti keseriusan saya sertakan KTP sebagai lampiran surat pernyataan ini. Demikian surat pernyataan ini saya buat untuk digunakan sesuai dengan keperluannya.
</div>

{{-- ═══════════════════════════════════════════════════════════ --}}
{{-- TANGGAL BAWAH + TANDA TANGAN                                --}}
{{-- ═══════════════════════════════════════════════════════════ --}}
<div class="ttd-date">
  Malang, {{ (function() use ($offer) {
    $bulan = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    $dt = $offer->created_at ?? \Carbon\Carbon::now();
    return $dt->format('d') . ' ' . $bulan[(int)$dt->format('n')] . ' ' . $dt->format('Y');
  })() }}
</div>
<div class="ttd-line"></div>

</body>
</html>
