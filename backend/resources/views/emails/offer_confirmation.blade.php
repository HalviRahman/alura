<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Konfirmasi Penawaran — ALURA</title>
</head>
<body style="margin:0;padding:0;background:#FFFDF0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF0;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #ccc799;max-width:600px;">

  {{-- ── Header ── --}}
  <tr><td style="background:#000000;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:24px 32px;">
          <span style="color:#FDD200;font-size:24px;font-weight:900;letter-spacing:3px;">ALURA</span><br>
          <span style="color:rgba(253,210,0,0.55);font-size:9px;letter-spacing:3px;text-transform:uppercase;">Institutional Property Marketplace</span>
        </td>
        <td align="right" style="padding:24px 32px;">
          <span style="background:#FDD200;color:#000;font-size:9px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:2px;">
            @if($offer->offer_price > 0) PENAWARAN @else TANYA DETAIL @endif
          </span>
        </td>
      </tr>
    </table>
  </td></tr>

  {{-- ── Success Banner ── --}}
  <tr><td style="background:#FFF8CC;border-left:4px solid #FDD200;padding:16px 32px;">
    <span style="font-size:13px;font-weight:bold;color:#1a1600;">✅ Pengajuan Anda berhasil diterima sistem ALURA</span>
  </td></tr>

  {{-- ── Body ── --}}
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#1a1600;line-height:1.6;margin-top:0;">
      Yth. <strong>{{ $offer->applicant_name }}</strong>,
    </p>
    <p style="color:#4d4900;line-height:1.7;font-size:14px;">
      @if($offer->offer_price > 0)
        Penawaran harga Anda untuk properti di bawah ini telah <strong>berhasil kami terima</strong>. Tim ALURA akan meninjau dan menghubungi Anda dalam waktu <strong>2×24 jam kerja</strong>.
      @else
        Permintaan informasi detail aset Anda telah <strong>berhasil kami terima</strong>. Tim ALURA akan menghubungi Anda dalam waktu <strong>1×24 jam kerja</strong>.
      @endif
    </p>

    {{-- Nomor Referensi --}}
    <div style="background:#000;color:#FDD200;padding:14px 20px;border-radius:4px;margin:20px 0;font-family:monospace;">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;opacity:0.7;margin-bottom:4px;">Nomor Referensi Pengajuan</div>
      <div style="font-size:20px;font-weight:bold;letter-spacing:4px;">REQ-{{ strtoupper(substr($offer->uuid, 0, 8)) }}</div>
      <div style="font-size:9px;opacity:0.5;margin-top:2px;">Simpan nomor ini untuk keperluan follow up</div>
    </div>

    {{-- Properti Card --}}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7E8;border:1px solid #ccc799;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:20px;">
        <div style="font-size:10px;color:#7a7200;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Properti yang Ditawarkan</div>
        <div style="font-size:17px;font-weight:bold;color:#1a1600;">{{ $property->title }}</div>
        <div style="font-size:12px;color:#4d4900;margin-top:4px;">{{ $property->listing_id }} &nbsp;·&nbsp; {{ $property->city }}, {{ $property->province }}</div>

        <hr style="border:none;border-top:1px solid #ccc799;margin:16px 0;">

        @if($offer->offer_price > 0)
        <table width="100%">
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Harga yang Anda Tawarkan</td>
            <td style="font-size:14px;font-weight:bold;text-align:right;color:#000;">Rp {{ number_format($offer->offer_price, 0, ',', '.') }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Harga Limit Properti</td>
            <td style="font-size:12px;text-align:right;color:#7a7200;">Rp {{ number_format($property->harga_penawaran, 0, ',', '.') }}</td>
          </tr>
        </table>
        @else
        <div style="font-size:12px;color:#4d4900;">Anda meminta informasi lebih lanjut mengenai aset ini. Agen kami akan segera menghubungi Anda.</div>
        @endif
      </td></tr>
    </table>

    {{-- Data Pemohon --}}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ccc799;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#7a7200;margin-bottom:10px;">Data yang Kami Terima</div>
        <table width="100%">
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Nama</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;color:#1a1600;">{{ $offer->applicant_name }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Email</td>
            <td style="font-size:12px;text-align:right;"><a href="mailto:{{ $offer->applicant_email }}" style="color:#000;">{{ $offer->applicant_email }}</a></td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">WhatsApp</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;color:#1a1600;">{{ $offer->applicant_phone }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Waktu Submit</td>
            <td style="font-size:12px;text-align:right;color:#1a1600;">{{ $offer->created_at?->format('d M Y, H:i') }} WIB</td>
          </tr>
          @if($agent)
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Agen Referral</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;color:#1a1600;">{{ $agent->name }} ({{ $offer->referral_code }})</td>
          </tr>
          @endif
        </table>
      </td></tr>
    </table>

    <p style="color:#4d4900;font-size:13px;line-height:1.7;">
      Jika ada pertanyaan, jangan ragu untuk menghubungi kami melalui email ini atau mengunjungi marketplace ALURA.
    </p>

    <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}"
       style="display:inline-block;background:#FDD200;color:#000;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:8px;letter-spacing:1px;">
      Kunjungi ALURA Marketplace →
    </a>
  </td></tr>

  {{-- ── Footer ── --}}
  <tr><td style="background:#FAF7E8;padding:20px 32px;border-top:1px solid #ccc799;">
    <p style="font-size:10px;color:#7a7200;margin:0;">
      © {{ date('Y') }} ALURA Institutional Assets. Email ini dikirim secara otomatis sebagai konfirmasi pengajuan Anda. Harap tidak membalas email ini langsung.
    </p>
    <p style="font-size:10px;color:#ccc799;margin:6px 0 0;">
      Jika Anda merasa tidak mengirimkan pengajuan ini, abaikan email ini.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
