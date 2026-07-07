<?php
/**
 * Test SuratMinatService menggunakan file Word asli.
 * Jalankan: php scripts/test_surat_minat.php
 */
require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\SuratMinatService;

$service = new SuratMinatService();

$data = [
    'tanggal'         => '06 Juli 2026',
    'nama'            => 'Alfiyan Ilmi Ghani',
    'nik'             => '3573050501910006',
    'alamat_pemohon'  => 'Perumahan Graha Dewata Estate, Kab. Malang, Jawa Timur',
    'hp'              => '082216336600',
    'objek'           => 'Rumah Tinggal',
    'alamat_properti' => 'Jl. Raya Sengkaling No. 10, Kota Malang, Jawa Timur',
    'listing_no'      => 'MLG-2024-001',
    'harga_penawaran' => 'Rp. 200.000.000,- terbilang (Dua Ratus Juta Rupiah)',
];

$outputDir = storage_path('app/public/offers');
$filename  = 'test-surat-minat-v2';

echo "Generating Surat Minat PDF...\n";
$pdfPath = $service->generate($data, $outputDir, $filename);

if ($pdfPath && file_exists($pdfPath)) {
    echo "✅ PDF berhasil!\n";
    echo "Path: $pdfPath\n";
    echo "Size: " . number_format(filesize($pdfPath)) . " bytes\n";
    exec('start "" "' . str_replace('/', '\\', $pdfPath) . '"');
} else {
    echo "❌ Gagal generate PDF. Cek log Laravel.\n";
}
