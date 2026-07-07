<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tindak Lanjut Penawaran — ALURA Properti</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.08); }
    .header { background: #1a1a0e; padding: 32px 40px; }
    .header h1 { color: #c8b560; font-size: 22px; margin: 0; letter-spacing: .5px; }
    .header p { color: #9a8f6a; font-size: 13px; margin: 6px 0 0; }
    .body { padding: 32px 40px; }
    .greeting { font-size: 16px; color: #1a1a0e; font-weight: 600; margin-bottom: 12px; }
    .text { font-size: 14px; color: #444; line-height: 1.7; margin-bottom: 16px; }
    .info-box { background: #f9f7ee; border-left: 4px solid #c8b560; border-radius: 4px; padding: 16px 20px; margin: 20px 0; }
    .info-box table { width: 100%; border-collapse: collapse; }
    .info-box td { padding: 5px 0; font-size: 13px; color: #444; }
    .info-box td:first-child { color: #888; width: 150px; font-weight: 500; }
    .info-box td strong { color: #1a1a0e; }
    .attachment-note { background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #5d4037; }
    .attachment-note strong { color: #3e2723; }
    .footer { background: #f5f5f0; padding: 20px 40px; font-size: 12px; color: #888; border-top: 1px solid #e8e8de; }
    .footer a { color: #c8b560; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ALURA Properti Nusantara</h1>
      <p>Investasi Terpercaya, Layanan Terdepan</p>
    </div>
    <div class="body">
      <p class="greeting">Yth. {{ $offer->applicant_name }},</p>

      <p class="text">
        Terima kasih atas minat Anda terhadap properti yang dipasarkan oleh
        <strong>PT Alura Properti Nusantara</strong>.
      </p>
      <p class="text">
        Kami dengan senang hati menindaklanjuti penawaran Anda. Sebagai bukti resmi,
        <strong>Surat Minat Aset</strong> telah kami lampirkan pada email ini.
        Dokumen tersebut berisi detail penawaran yang Anda ajukan.
      </p>

      <div class="info-box">
        <table>
          <tr>
            <td>Properti</td>
            <td><strong>{{ $property->title }}</strong></td>
          </tr>
          <tr>
            <td>Nomor Listing</td>
            <td><strong>{{ $property->listing_id }}</strong></td>
          </tr>
          <tr>
            <td>Harga Penawaran</td>
            <td><strong>Rp {{ number_format($offer->offer_price, 0, ',', '.') }}</strong></td>
          </tr>
          <tr>
            <td>Status</td>
            <td><strong>{{ $offer->status }}</strong></td>
          </tr>
        </table>
      </div>

      <div class="attachment-note">
        📎 <strong>Lampiran:</strong> Surat Minat Aset (PDF) terlampir pada email ini.
        Harap simpan dokumen ini sebagai bukti penawaran resmi Anda.
      </div>

      <p class="text">
        Tim kami akan segera menghubungi Anda melalui nomor WhatsApp yang telah
        didaftarkan untuk membahas langkah selanjutnya. Apabila ada pertanyaan,
        jangan ragu untuk membalas email ini.
      </p>

      <p class="text">
        Terima kasih atas kepercayaan Anda kepada ALURA Properti Nusantara.
      </p>

      <p class="text" style="margin-top:24px;">
        Hormat kami,<br />
        <strong style="color:#1a1a0e;">Tim Manajemen ALURA</strong><br />
        <span style="color:#888;font-size:12px;">PT Alura Properti Nusantara</span>
      </p>
    </div>
    <div class="footer">
      <p>Email ini dikirim sebagai tindak lanjut resmi atas penawaran yang Anda ajukan.
      Jika Anda merasa tidak mengajukan penawaran ini, harap abaikan email ini atau
      <a href="mailto:{{ config('mail.from.address') }}">hubungi kami</a>.</p>
    </div>
  </div>
</body>
</html>
