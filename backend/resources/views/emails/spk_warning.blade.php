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
  <!-- Warning Banner -->
  <tr><td style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:16px 32px;">
    <span style="font-size:13px;font-weight:bold;color:#92400E;">⚠️ SPK Warning — Tindakan Diperlukan</span>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#191c1e;line-height:1.6;">
      Tim Manajemen ALURA yang terhormat,
    </p>
    <p style="color:#45464d;line-height:1.7;">
      Properti berikut memiliki SPK yang akan <strong>berakhir dalam waktu dekat</strong>. Segera lakukan perpanjangan atau takedown sebelum tanggal jatuh tempo.
    </p>
    <!-- Property Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fb;border:1px solid #c6c6cd;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:20px;">
        <div style="font-size:10px;color:#76777d;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Properti</div>
        <div style="font-size:18px;font-weight:bold;color:#000;">{{ $property->title }}</div>
        <div style="font-size:12px;color:#45464d;margin-top:4px;">{{ $property->listing_id }} · {{ $property->city }}, {{ $property->province }}</div>
        <table width="100%" style="margin-top:16px;">
          <tr>
            <td style="font-size:12px;color:#45464d;">Nomor SPK</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;">{{ $agreement->spk_number }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#45464d;">Tanggal Berakhir</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;color:#D97706;">{{ $agreement->end_date?->format('d M Y') }}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#45464d;">Sisa Hari</td>
            <td style="font-size:12px;font-weight:bold;text-align:right;color:#D97706;">{{ $agreement->daysRemaining() }} Hari</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="color:#45464d;font-size:13px;">Silakan login ke Admin Console ALURA untuk melakukan perpanjangan SPK.</p>
    <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/admin" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:8px;">Buka Admin Console →</a>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f7f9fb;padding:20px 32px;border-top:1px solid #e0e3e5;">
    <p style="font-size:10px;color:#76777d;margin:0;">© {{ date('Y') }} ALURA Institutional Assets. Email ini dikirim secara otomatis, harap tidak dibalas.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
