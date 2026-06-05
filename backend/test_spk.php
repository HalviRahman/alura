<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Property;
use App\Models\Agreement;
use Illuminate\Support\Carbon;

$action = $argv[1] ?? 'list';

if ($action === 'list') {
    echo "\n=== DAFTAR PROPERTI & STATUS SPK ===\n\n";
    $props = Property::withTrashed()->with('agreement')->get();
    foreach ($props as $p) {
        $agr      = $p->agreement;
        $endDate  = $agr?->end_date ?? 'NO SPK';
        $daysLeft = $agr ? Carbon::today()->diffInDays($agr->end_date, false) : '-';
        $status   = $agr ? ($agr->end_date < Carbon::today() ? '❌ EXPIRED' : "✅ AKTIF ($daysLeft hari)") : '⚠️  no SPK';
        $pub      = $p->is_published ? '[PUBLISHED]' : '[UNPUBLISHED]';
        echo "  {$pub} {$p->listing_id} | {$p->title}\n";
        echo "       end_date: {$endDate} | {$status}\n\n";
    }
}

if ($action === 'expire') {
    // Ubah SPK properti ke-1 (atau sesuai listing_id dari arg ke-2) menjadi kemarin
    $listingId = $argv[2] ?? null;
    if (!$listingId) {
        // Ambil properti pertama yang aktif
        $prop = Property::with('agreement')->where('is_published', true)->first();
    } else {
        $prop = Property::with('agreement')->where('listing_id', $listingId)->first();
    }
    if (!$prop || !$prop->agreement) {
        echo "❌ Properti tidak ditemukan atau tidak punya SPK.\n";
        exit(1);
    }
    $yesterday = Carbon::yesterday()->format('Y-m-d');
    $prop->agreement->update(['end_date' => $yesterday]);
    echo "\n✅ SPK properti [{$prop->listing_id}] '{$prop->title}' diubah menjadi EXPIRED (end_date: {$yesterday})\n";
    echo "   is_published saat ini: " . ($prop->is_published ? 'YES' : 'NO') . "\n";
    echo "\n   → Sekarang jalankan: php test_spk.php run-check\n";
    echo "   → Lalu jalankan:     php test_spk.php list\n\n";
}

if ($action === 'run-check') {
    echo "\n=== MENJALANKAN alura:spk-check ===\n\n";
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $exitCode = $kernel->call('alura:spk-check');
    echo "\nExit code: {$exitCode}\n";
}

if ($action === 'restore') {
    $listingId = $argv[2] ?? null;
    $days      = (int)($argv[3] ?? 90);
    if (!$listingId) {
        echo "Usage: php test_spk.php restore <listing_id> [days=90]\n";
        exit(1);
    }
    $prop = Property::withTrashed()->with('agreement')->where('listing_id', $listingId)->first();
    if (!$prop) {
        echo "❌ Properti tidak ditemukan.\n";
        exit(1);
    }
    $newEnd = Carbon::today()->addDays($days)->format('Y-m-d');
    $prop->agreement?->update(['end_date' => $newEnd]);
    $prop->update(['is_published' => true]);
    echo "\n✅ SPK & publikasi properti [{$listingId}] dipulihkan!\n";
    echo "   end_date baru: {$newEnd} (+{$days} hari)\n";
    echo "   is_published: YES\n\n";
}
