<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Offer;
use App\Models\Property;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

// Ambil properti pertama beserta detail
$prop = Property::with(['assetDetail'])->first();
if (!$prop) {
    echo "ERROR: Tidak ada properti di database.\n";
    exit(1);
}

// Buat offer dummy
$offer = new Offer();
$offer->applicant_name    = 'Alfiyan Ilmi Ghani';
$offer->applicant_nik     = '3573050501910006';
$offer->applicant_address = 'Perumahan Graha Dewata Estate Blok Khusus, Desa Landungsari, Kecamatan Dau, Kabupaten Malang, Provinsi Jawa Timur';
$offer->applicant_phone   = '082216336600';
$offer->offer_price       = 200000000;
$offer->uuid              = 'preview-test-uuid';
$offer->created_at        = \Carbon\Carbon::now();

// Generate PDF
$pdf = Pdf::loadView('pdf.offer', [
    'offer'    => $offer,
    'property' => $prop,
    'agent'    => null,
]);
$pdf->setPaper('A4', 'portrait');

// Simpan ke storage/app/public/
Storage::disk('public')->put('preview-surat-minat.pdf', $pdf->output());

$path = storage_path('app/public/preview-surat-minat.pdf');
echo "PDF berhasil digenerate!\n";
echo "Path: {$path}\n";
echo "Size: " . number_format(filesize($path)) . " bytes\n";
