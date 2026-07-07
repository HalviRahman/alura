<?php
/**
 * Test simulasi downloadPdf on-demand menggunakan offer dari database.
 * Jalankan: php scripts/test_download_pdf.php
 */
require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Offer;
use App\Services\SuratMinatService;
use App\Helpers\Terbilang;

// Ambil offer pertama dari DB
$offer = Offer::with(['property.assetDetail', 'agent'])->latest()->first();

if (!$offer) {
    die("Tidak ada offer di database.\n");
}

$property = $offer->property;
if (!$property) {
    die("Offer tidak punya properti.\n");
}

echo "Offer    : #{$offer->id} — {$offer->applicant_name}\n";
echo "Properti : {$property->title} ({$property->listing_id})\n";
echo "Harga    : Rp " . number_format($offer->offer_price, 0, ',', '.') . "\n\n";

$bulan   = ['','Januari','Februari','Maret','April','Mei','Juni',
            'Juli','Agustus','September','Oktober','November','Desember'];
$dt      = $offer->created_at ?? now();
$tanggal = $dt->format('d') . ' ' . $bulan[(int)$dt->format('n')] . ' ' . $dt->format('Y');

$hargaStr = $offer->offer_price > 0
    ? 'Rp. ' . number_format($offer->offer_price, 0, ',', '.') . ',- terbilang ('
      . Terbilang::convert($offer->offer_price) . ' Rupiah)'
    : '';

$data = [
    'tanggal'         => $tanggal,
    'nama'            => $offer->applicant_name,
    'nik'             => $offer->applicant_nik ?? '',
    'alamat_pemohon'  => $offer->applicant_address ?? '',
    'hp'              => $offer->applicant_phone,
    'objek'           => $property->type,
    'alamat_properti' => $property->assetDetail?->full_address
                            ?? ($property->city . ', ' . $property->province),
    'listing_no'      => $property->listing_id,
    'harga_penawaran' => $hargaStr,
];

echo "Data yang akan diisi:\n";
foreach ($data as $k => $v) {
    echo "  {$k}: {$v}\n";
}
echo "\n";

$tmpDir  = storage_path('app/tmp/offers');
$tmpName = 'test-download-' . $offer->uuid;

$service    = new SuratMinatService();
$pdfAbsPath = $service->generate($data, $tmpDir, $tmpName);

if ($pdfAbsPath && file_exists($pdfAbsPath)) {
    echo "✅ PDF berhasil digenerate!\n";
    echo "Path : {$pdfAbsPath}\n";
    echo "Size : " . number_format(filesize($pdfAbsPath)) . " bytes\n";
    // Buka otomatis
    exec('start "" "' . str_replace('/', '\\', $pdfAbsPath) . '"');
} else {
    echo "❌ Generate gagal!\n";
    echo "Cek log: storage/logs/laravel.log\n";
}
