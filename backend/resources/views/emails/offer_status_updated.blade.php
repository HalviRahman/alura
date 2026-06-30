<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Update Status Penawaran — ALURA</title>
</head>
<body style="margin:0;padding:0;background:#FFFDF0;font-family:Arial,sans-serif;">

{{--
  Status color map:
  Follow Up → gold/amber  (#FDD200 accent)
  Reviewed  → blue        (#3B82F6)
  Final     → green       (#10B981)
  Gugur     → red         (#EF4444)
  Pending   → gray        (#6B7280)
--}}

@php
  $statusConfig = match($offer->status) {
    'Follow Up' => ['bg' => '#FFF8CC', 'border' => '#FDD200', 'text' => '#1a1600',   'badge_bg' => '#FDD200', 'badge_text' => '#000',    'icon' => '📞'],
    'Reviewed'  => ['bg' => '#EFF6FF', 'border' => '#3B82F6', 'text' => '#1e3a5f',   'badge_bg' => '#3B82F6', 'badge_text' => '#fff',    'icon' => '🔍'],
    'Final'     => ['bg' => '#DCFCE7', 'border' => '#10B981', 'text' => '#14532D',   'badge_bg' => '#10B981', 'badge_text' => '#fff',    'icon' => '🎉'],
    'Gugur'     => ['bg' => '#FEF2F2', 'border' => '#EF4444', 'text' => '#7f1d1d',   'badge_bg' => '#EF4444', 'badge_text' => '#fff',    'icon' => '❌'],
    default     => ['bg' => '#F9FAFB', 'border' => '#6B7280', 'text' => '#374151',   'badge_bg' => '#6B7280', 'badge_text' => '#fff',    'icon' => '🕐'],
  };

  $statusMessage = match($offer->status) {
    'Follow Up' => 'Tim ALURA akan segera menghubungi Anda untuk diskusi lebih lanjut mengenai penawaran ini.',
    'Reviewed'  => 'Penawaran Anda telah ditinjau oleh tim kami. Kami akan memberikan keputusan dalam waktu dekat.',
    'Final'     => 'Selamat! Penawaran Anda telah disetujui dan mencapai status final. Tim kami akan menghubungi Anda untuk proses selanjutnya.',
    'Gugur'     => 'Mohon maaf, penawaran Anda tidak dapat dilanjutkan pada saat ini. Anda tetap dapat mengajukan penawaran untuk properti lain di platform kami.',
    default     => 'Status penawaran Anda telah diperbarui oleh tim ALURA.',
  };
@endphp

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
          <span style="background:{{ $statusConfig['badge_bg'] }};color:{{ $statusConfig['badge_text'] }};font-size:9px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:2px;">
            {{ $offer->status }}
          </span>
        </td>
      </tr>
    </table>
  </td></tr>

  {{-- ── Status Banner ── --}}
  <tr><td style="background:{{ $statusConfig['bg'] }};border-left:4px solid {{ $statusConfig['border'] }};padding:16px 32px;">
    <span style="font-size:14px;font-weight:bold;color:{{ $statusConfig['text'] }};">
      {{ $statusConfig['icon'] }}&nbsp; Status Penawaran Anda Telah Diperbarui
    </span>
  </td></tr>

  {{-- ── Body ── --}}
  <tr><td style="padding:32px;">
    <p style="font-size:14px;color:#1a1600;line-height:1.6;margin-top:0;">
      Yth. <strong>{{ $offer->applicant_name }}</strong>,
    </p>
    <p style="color:#4d4900;line-height:1.7;font-size:14px;">
      {{ $statusMessage }}
    </p>

    {{-- Nomor Referensi + Status --}}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;border-radius:4px;margin:20px 0;">
      <tr>
        <td style="padding:16px 20px;">
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:rgba(253,210,0,0.6);margin-bottom:4px;">Nomor Referensi</div>
          <div style="font-size:18px;font-weight:bold;letter-spacing:4px;color:#FDD200;font-family:monospace;">REQ-{{ strtoupper(substr($offer->uuid, 0, 8)) }}</div>
        </td>
        <td align="right" style="padding:16px 20px;">
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:rgba(253,210,0,0.6);margin-bottom:4px;">Status Sebelumnya</div>
          <div style="font-size:12px;color:#ccc799;font-family:monospace;text-decoration:line-through;">{{ $oldStatus }}</div>
          <div style="font-size:9px;color:rgba(253,210,0,0.4);margin:2px 0;">↓</div>
          <div style="font-size:14px;font-weight:bold;color:#FDD200;font-family:monospace;">{{ $offer->status }}</div>
        </td>
      </tr>
    </table>

    {{-- Properti --}}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7E8;border:1px solid #ccc799;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:20px;">
        <div style="font-size:10px;color:#7a7200;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Properti</div>
        <div style="font-size:16px;font-weight:bold;color:#1a1600;">{{ $property->title }}</div>
        <div style="font-size:12px;color:#4d4900;margin-top:4px;">{{ $property->listing_id }} &nbsp;·&nbsp; {{ $property->city }}, {{ $property->province }}</div>
        @if($offer->offer_price > 0)
        <hr style="border:none;border-top:1px solid #ccc799;margin:12px 0;">
        <div style="font-size:12px;color:#4d4900;">Harga Penawaran Anda: <strong style="color:#000;">Rp {{ number_format($offer->offer_price, 0, ',', '.') }}</strong></div>
        @endif
      </td></tr>
    </table>

    {{-- Catatan dari Manajemen --}}
    @if($offer->notes)
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8CC;border:1px solid #FDD200;border-radius:4px;margin:20px 0;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#7a7200;margin-bottom:8px;">📝 Catatan dari Tim ALURA</div>
        <div style="font-size:13px;color:#1a1600;line-height:1.7;font-style:italic;">"{{ $offer->notes }}"</div>
      </td></tr>
    </table>
    @endif

    {{-- CTA --}}
    @if($offer->status === 'Final')
    <p style="color:#4d4900;font-size:13px;">Tim kami akan segera menghubungi Anda di nomor <strong>{{ $offer->applicant_phone }}</strong> untuk membahas proses transaksi selanjutnya.</p>
    @elseif($offer->status === 'Gugur')
    <p style="color:#4d4900;font-size:13px;">Jangan khawatir — masih banyak aset berkualitas di marketplace kami yang menanti Anda.</p>
    @else
    <p style="color:#4d4900;font-size:13px;">Pantau terus marketplace kami dan pastikan nomor WhatsApp <strong>{{ $offer->applicant_phone }}</strong> dapat dihubungi.</p>
    @endif

    <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}"
       style="display:inline-block;background:#FDD200;color:#000;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;margin-top:8px;letter-spacing:1px;">
      Lihat Properti Lainnya →
    </a>
  </td></tr>

  {{-- ── Footer ── --}}
  <tr><td style="background:#FAF7E8;padding:20px 32px;border-top:1px solid #ccc799;">
    <p style="font-size:10px;color:#7a7200;margin:0;">
      © {{ date('Y') }} ALURA Institutional Assets. Email ini dikirim secara otomatis. Harap tidak membalas email ini langsung.
    </p>
    <p style="font-size:10px;color:#ccc799;margin:6px 0 0;">
      Anda menerima email ini karena pernah mengajukan penawaran properti melalui platform ALURA.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
