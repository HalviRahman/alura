<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#FFFDF0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF0;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #ccc799;max-width:600px;">
  <!-- Header -->
  <tr><td style="background:#000000;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="padding:24px 32px;">
        <span style="color:#FDD200;font-size:24px;font-weight:900;letter-spacing:3px;">ALURA</span><br>
        <span style="color:rgba(253,210,0,0.55);font-size:9px;letter-spacing:3px;text-transform:uppercase;">Institutional Property Marketplace</span>
      </td>
      <td align="right" style="padding:24px 32px;">
        <span style="background:#FDD200;color:#000;font-size:9px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:2px;">PENAWARAN BARU</span>
      </td>
    </tr></table>
  </td></tr>
  <!-- Alert Banner -->
  <tr><td style="background:#FFF8CC;border-left:4px solid #FDD200;padding:16px 32px;">
    <span style="font-size:13px;font-weight:bold;color:#1a1600;">📥 Penawaran Baru Masuk — Tindak Lanjut Diperlukan</span>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#1a1600;line-height:1.6;">
      Tim Manajemen ALURA yang terhormat,
    </p>
    <p style="color:#4d4900;line-height:1.7;">
      Telah masuk <strong>penawaran baru</strong> melalui platform ALURA. Berikut adalah ringkasan detail penawaran yang perlu ditindaklanjuti:
    </p>

    <!-- Offer Summary Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7E8;border:1px solid #ccc799;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:20px;">
        <div style="font-size:10px;color:#7a7200;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Properti Ditawarkan</div>
        <div style="font-size:18px;font-weight:bold;color:#000;">{{ $property->title }}</div>
        <div style="font-size:12px;color:#4d4900;margin-top:4px;">{{ $property->listing_id }} · {{ $property->city }}, {{ $property->province }}</div>

        <!-- Divider -->
        <hr style="border:none;border-top:1px solid #ccc799;margin:16px 0;">

        <!-- Price Box -->
        @if($offer->offer_price > 0)
        <div style="background:#000;color:#fff;padding:12px 16px;border-radius:4px;margin-bottom:16px;">
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;opacity:0.7;">Harga Penawaran Pemohon</div>
          <div style="font-size:20px;font-weight:bold;margin-top:4px;">Rp {{ number_format($offer->offer_price, 0, ',', '.') }}</div>
          <div style="font-size:9px;opacity:0.6;margin-top:2px;">Harga Limit: Rp {{ number_format($property->harga_penawaran, 0, ',', '.') }}</div>
        </div>
        @else
        <div style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;padding:12px 16px;border-radius:4px;margin-bottom:16px;">
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;">Tipe Permohonan</div>
          <div style="font-size:18px;font-weight:bold;margin-top:4px;">Tanya Detail Aset</div>
          <div style="font-size:9px;opacity:0.8;margin-top:2px;">Calon pembeli meminta dihubungi oleh manajemen untuk informasi lebih lanjut.</div>
        </div>
        @endif

        <table width="100%">
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:4px 0;">Nomor Referensi</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;font-family:monospace;color:#000;">REQ-{{ strtoupper(substr($offer->uuid, 0, 8)) }}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Applicant Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ccc799;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #ccc799;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#7a7200;margin-bottom:8px;">Data Pemohon</div>
        <table width="100%">
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Nama Lengkap</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;color:#1a1600;">{{ $offer->applicant_name }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Email</td>
            <td style="font-size:12px;text-align:right;"><a href="mailto:{{ $offer->applicant_email }}" style="color:#000;">{{ $offer->applicant_email }}</a></td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">No. WhatsApp</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;color:#1a1600;">{{ $offer->applicant_phone }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#4d4900;padding:3px 0;">Waktu Submit</td>
            <td style="font-size:12px;text-align:right;color:#1a1600;">{{ $offer->created_at?->format('d M Y, H:i') }} WIB</td>
          </tr>
        </table>
      </td></tr>
      @if($agent)
      <tr><td style="padding:12px 20px;background:#FFF8CC;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#7a7200;margin-bottom:4px;">Melalui Agen Referral</div>
        <div style="font-size:13px;font-weight:bold;color:#000;">{{ $agent->name }}</div>
        <div style="font-size:11px;color:#4d4900;font-family:monospace;">Kode: {{ $offer->referral_code }}</div>
      </td></tr>
      @else
      <tr><td style="padding:12px 20px;background:#FAF7E8;">
        <div style="font-size:11px;color:#7a7200;font-style:italic;">— Tanpa kode referral agen —</div>
      </td></tr>
      @endif
    </table>

    <p style="color:#4d4900;font-size:13px;">Segera login ke Admin Console ALURA untuk meninjau dan memperbarui status penawaran ini.</p>
    <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/admin" style="display:inline-block;background:#FDD200;color:#000;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:8px;letter-spacing:1px;">Buka Admin Console →</a>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#FAF7E8;padding:20px 32px;border-top:1px solid #ccc799;">
    <p style="font-size:10px;color:#7a7200;margin:0;">© {{ date('Y') }} ALURA Institutional Assets. Email ini dikirim secara otomatis, harap tidak dibalas langsung.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
