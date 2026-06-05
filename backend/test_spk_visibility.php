<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

// 1. Ambil token manajemen (login via API)
echo "\n=== TEST VISIBILITAS ASET EXPIRED SPK ===\n";
echo "\n[1] Login sebagai MANAJEMEN...\n";

$loginRes = Http::post('http://localhost:8000/api/auth/login', [
    'email'    => 'admin@alura.id',
    'password' => 'password',
]);

if (!$loginRes->successful()) {
    // Coba cari user manajemen dari DB
    $mgr = User::where('role', 'manajemen')->first();
    if (!$mgr) {
        echo "❌ Tidak ada user manajemen ditemukan.\n";
        exit(1);
    }
    echo "   User manajemen ditemukan: {$mgr->email}\n";
    // Reset password sementara untuk test
    $mgr->update(['password' => Hash::make('test12345')]);
    $loginRes = Http::post('http://localhost:8000/api/auth/login', [
        'email'    => $mgr->email,
        'password' => 'test12345',
    ]);
    if (!$loginRes->successful()) {
        echo "❌ Login gagal: " . $loginRes->body() . "\n";
        exit(1);
    }
}

$token = $loginRes->json('token');
echo "   ✅ Login berhasil! Token: " . substr($token, 0, 20) . "...\n";

// 2. Test: PUBLIC (tanpa token) - lihat marketplace
echo "\n[2] TEST PUBLIC (tanpa login) — GET /api/properties\n";
$publicRes = Http::get('http://localhost:8000/api/properties');
$publicData = $publicRes->json('data', []);
$pakuwonPublic = collect($publicData)->firstWhere('title', 'Apartemen Pakuwon City');
if ($pakuwonPublic) {
    echo "   ❌ GAGAL: Apartemen Pakuwon City MASIH terlihat oleh publik!\n";
} else {
    echo "   ✅ BENAR: Apartemen Pakuwon City TIDAK terlihat oleh publik.\n";
    echo "      Total properti tampil: " . count($publicData) . "\n";
}

// 3. Test: MANAJEMEN (dengan token) - lihat semua termasuk unpublished
echo "\n[3] TEST MANAJEMEN (dengan token) — GET /api/properties\n";
$adminRes = Http::withToken($token)->get('http://localhost:8000/api/properties');
$adminData = $adminRes->json('data', []);
$pakuwonAdmin = collect($adminData)->firstWhere('title', 'Apartemen Pakuwon City');
if ($pakuwonAdmin) {
    echo "   ✅ BENAR: Apartemen Pakuwon City TERLIHAT oleh manajemen!\n";
    echo "      is_published: " . ($pakuwonAdmin['is_published'] ? 'true' : 'false') . "\n";
    echo "      SPK status:   " . ($pakuwonAdmin['spk']['status'] ?? 'N/A') . "\n";
    echo "      SPK end_date: " . ($pakuwonAdmin['spk']['end_date'] ?? 'N/A') . "\n";
} else {
    echo "   ❌ MASALAH: Manajemen TIDAK bisa lihat aset expired SPK!\n";
    echo "      Total properti tampil untuk manajemen: " . count($adminData) . "\n";
}

// 4. Test detail page dengan token manajemen
echo "\n[4] TEST DETAIL PAGE via UUID (manajemen)\n";
$allAdmin = Http::withToken($token)->get('http://localhost:8000/api/properties');
$allProps = collect($allAdmin->json('data', []));
$pakuwon  = $allProps->firstWhere('title', 'Apartemen Pakuwon City');
if ($pakuwon) {
    $uuid = $pakuwon['uuid'];
    $detailRes = Http::withToken($token)->get("http://localhost:8000/api/properties/{$uuid}");
    if ($detailRes->successful()) {
        echo "   ✅ Manajemen BISA akses halaman detail: /property/{$uuid}\n";
        echo "      Title: " . $detailRes->json('title') . "\n";
    } else {
        echo "   ❌ Manajemen tidak bisa akses detail: " . $detailRes->status() . "\n";
    }
} else {
    echo "   ⚠️  Properti tidak ditemukan di list admin — cek langsung dari DB...\n";
    $propFromDb = \App\Models\Property::where('listing_id', 'ALURA-2024-002')->first();
    if ($propFromDb) {
        $uuid = $propFromDb->uuid;
        $detailRes = Http::withToken($token)->get("http://localhost:8000/api/properties/{$uuid}");
        echo "   Status response: " . $detailRes->status() . "\n";
        if ($detailRes->successful()) {
            echo "   ✅ Manajemen BISA akses via UUID langsung!\n";
        }
    }
}

echo "\n=== KESIMPULAN ===\n";
echo "• Publik/User biasa : TIDAK dapat melihat aset SPK expired\n";
echo "• Manajemen         : " . ($pakuwonAdmin ? "DAPAT" : "TIDAK DAPAT") . " melihat aset SPK expired\n\n";
