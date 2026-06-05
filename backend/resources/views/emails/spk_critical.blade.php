<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f7f9fb;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fb;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e3e5;">
  <!-- Header -->
  <tr><td style="background:#000;padding:24px 32px;">
    <span style="color:#fff;font-size:22px;font-weight:bold;letter-spacing:2px;">ALURA</span><br>
    <span style="color:rgba(255,255,255,0.6);font-size:9px;letter-spacing:3px;text-transform:uppercase;">Institutional Property Marketplace</span>
  </td></tr>
  <!-- Critical Banner -->
  <tr><td style="background:#FEE2E2;border-left:4px solid #EF4444;padding:16px 32px;">
    <span style="font-size:14px;font-weight:bold;color:#7F1D1D;">🚨 SPK KRITIS — Segera Ambil Tindakan!</span>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#191c1e;line-height:1.6;">Tim Manajemen ALURA yang terhormat,</p>
    <p style="color:#45464d;line-height:1.7;">
      SPK untuk properti berikut akan <strong style="color:#DC2626;">berakhir dalam kurang dari 14 hari</strong>. Properti ini akan <strong>otomatis di-takedown</strong> dari marketplace pada saat tanggal jatuh tempo.
    </p>
    <!-- Property Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF5F5;border:2px solid #FECACA;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:20px;">
        <div style="font-size:10px;color:#76777d;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Properti Kritis</div>
        <div style="font-size:18px;font-weight:bold;color:#000;">{{ $property->title }}</div>
        <div style="font-size:12px;color:#45464d;margin-top:4px;">{{ $property->listing_id }} · {{ $property->city }}, {{ $property->province }}</div>
        <table width="100%" style="margin-top:16px;">
          <tr>
            <td style="font-size:12px;color:#45464d;">Nomor SPK</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;">{{ $agreement->spk_number }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#45464d;">Tanggal Berakhir</td>
            <td style="font-size:14px;font-weight:bold;text-align:right;color:#DC2626;">{{ $agreement->end_date?->format('d M Y') }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#45464d;">Sisa Waktu</td>
            <td style="font-size:16px;font-weight:bold;text-align:right;color:#DC2626;">{{ $agreement->daysRemaining() }} HARI</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="color:#DC2626;font-weight:bold;font-size:13px;">⚠ Jika tidak diperpanjang, properti akan otomatis dihapus dari marketplace pada tanggal {{ $agreement->end_date?->format('d M Y') }}.</p>
    <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/admin" style="display:inline-block;background:#DC2626;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:8px;">Perpanjang SPK Sekarang →</a>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f7f9fb;padding:20px 32px;border-top:1px solid #e0e3e5;">
    <p style="font-size:10px;color:#76777d;margin:0;">© {{ date('Y') }} ALURA Institutional Assets. Email ini dikirim otomatis oleh sistem ALURA.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
