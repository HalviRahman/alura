<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f7f9fb;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fb;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e3e5;">
  <!-- Header -->
  <tr><td style="background:#000000;padding:24px 32px;">
    <span style="color:#fff;font-size:22px;font-weight:bold;letter-spacing:2px;">ALURA</span><br>
    <span style="color:rgba(255,255,255,0.6);font-size:9px;letter-spacing:3px;text-transform:uppercase;">Institutional Property Marketplace</span>
  </td></tr>
  <!-- Alert Banner -->
  <tr><td style="background:#DCFCE7;border-left:4px solid #16A34A;padding:16px 32px;">
    <span style="font-size:13px;font-weight:bold;color:#14532D;">📥 Penawaran Baru Masuk — Tindak Lanjut Diperlukan</span>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#191c1e;line-height:1.6;">
      Tim Manajemen ALURA yang terhormat,
    </p>
    <p style="color:#45464d;line-height:1.7;">
      Telah masuk <strong>penawaran baru</strong> melalui platform ALURA. Berikut adalah ringkasan detail penawaran yang perlu ditindaklanjuti:
    </p>

    <!-- Offer Summary Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fb;border:1px solid #c6c6cd;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:20px;">
        <div style="font-size:10px;color:#76777d;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Properti Ditawarkan</div>
        <div style="font-size:18px;font-weight:bold;color:#000;">{{ $property->title }}</div>
        <div style="font-size:12px;color:#45464d;margin-top:4px;">{{ $property->listing_id }} · {{ $property->city }}, {{ $property->province }}</div>

        <!-- Divider -->
        <hr style="border:none;border-top:1px solid #e0e3e5;margin:16px 0;">

        <!-- Price Box -->
        <div style="background:#000;color:#fff;padding:12px 16px;border-radius:4px;margin-bottom:16px;">
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;opacity:0.7;">Harga Penawaran Pemohon</div>
          <div style="font-size:20px;font-weight:bold;margin-top:4px;">Rp {{ number_format($offer->offer_price, 0, ',', '.') }}</div>
          <div style="font-size:9px;opacity:0.6;margin-top:2px;">Harga Limit: Rp {{ number_format($property->price, 0, ',', '.') }}</div>
        </div>

        <table width="100%">
          <tr>
            <td style="font-size:12px;color:#45464d;padding:4px 0;">Nomor Referensi</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;font-family:monospace;">REQ-{{ str_pad($offer->id, 4, '0', STR_PAD_LEFT) }}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Applicant Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e3e5;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e0e3e5;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#76777d;margin-bottom:8px;">Data Pemohon</div>
        <table width="100%">
          <tr>
            <td style="font-size:12px;color:#45464d;padding:3px 0;">Nama Lengkap</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;">{{ $offer->applicant_name }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#45464d;padding:3px 0;">Email</td>
            <td style="font-size:12px;text-align:right;"><a href="mailto:{{ $offer->applicant_email }}" style="color:#000;">{{ $offer->applicant_email }}</a></td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#45464d;padding:3px 0;">No. WhatsApp</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;">{{ $offer->applicant_phone }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#45464d;padding:3px 0;">Waktu Submit</td>
            <td style="font-size:12px;text-align:right;">{{ $offer->created_at?->format('d M Y, H:i') }} WIB</td>
          </tr>
        </table>
      </td></tr>
      @if($agent)
      <tr><td style="padding:12px 20px;background:#f7f9fb;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#76777d;margin-bottom:4px;">Melalui Agen Referral</div>
        <div style="font-size:13px;font-weight:bold;color:#000;">{{ $agent->name }}</div>
        <div style="font-size:11px;color:#45464d;font-family:monospace;">Kode: {{ $offer->referral_code }}</div>
      </td></tr>
      @else
      <tr><td style="padding:12px 20px;background:#f7f9fb;">
        <div style="font-size:11px;color:#76777d;font-style:italic;">— Tanpa kode referral agen —</div>
      </td></tr>
      @endif
    </table>

    <p style="color:#45464d;font-size:13px;">Segera login ke Admin Console ALURA untuk meninjau dan memperbarui status penawaran ini.</p>
    <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/admin" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:8px;">Buka Admin Console →</a>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f7f9fb;padding:20px 32px;border-top:1px solid #e0e3e5;">
    <p style="font-size:10px;color:#76777d;margin:0;">© {{ date('Y') }} ALURA Institutional Assets. Email ini dikirim secara otomatis, harap tidak dibalas langsung.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
