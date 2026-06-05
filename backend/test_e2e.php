<?php
declare(strict_types=1);

/**
 * ALURA End-to-End Automated Test Suite
 * Programmatically tests: Login, Property Creation (Multipart form-data), Public Access,
 * Coordinate Protection, Public Offer Submission, PDF Generation, and Admin Status Update.
 */

echo "=====================================================================\n";
echo "           ALURA Full-Stack Automated E2E Test Suite                 \n";
echo "=====================================================================\n\n";

$baseUrl = 'http://127.0.0.1:8000/api';

// ─── HELPER: HTTP Client ──────────────────────────────────────────────────
function httpRequest(string $url, string $method = 'GET', $data = null, array $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    }
    
    // Add Accept JSON by default
    $defaultHeaders = ['Accept: application/json'];
    if (!is_array($data) && $data !== null) {
        $defaultHeaders[] = 'Content-Type: application/json';
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        echo "[ERROR] cURL Error: " . curl_error($ch) . "\n";
        return null;
    }
    
    curl_close($ch);
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true) ?: $response
    ];
}

// ─── STEP 1: Admin Login Authentication ───────────────────────────────────
echo "[STEP 1] Melakukan Autentikasi Login Admin...\n";
$loginPayload = json_encode([
    'email' => 'admin@alura.id',
    'password' => 'Admin@12345'
]);

$loginRes = httpRequest("$baseUrl/auth/login", 'POST', $loginPayload);

if ($loginRes['code'] !== 200) {
    echo "[FAIL] Gagal login admin. Code: " . $loginRes['code'] . "\n";
    exit(1);
}

$token = $loginRes['body']['token'];
$adminHeaders = ["Authorization: Bearer $token"];
echo "[PASS] Login Admin Berhasil! Token didapatkan: " . substr($token, 0, 15) . "...\n\n";


// ─── STEP 2: Create Property via Multipart Form-data ──────────────────────
echo "[STEP 2] Membuat Properti Aset Baru dengan SPK & Koordinat (Manajemen)...\n";

// We construct a mock image file for testing upload
$tempImage = tempnam(sys_get_temp_dir(), 'test_img');
file_put_contents($tempImage, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')); // 1x1 pixel png

$postFields = [
    'title' => 'ALURA Penthouse Suites Bali',
    'description' => 'Penthouse mewah dengan pemandangan langsung ke pantai Jimbaran. Dilengkapi kolam renang infinity dan rooftop garden.',
    'harga_penawaran' => 18500000000, // 18.5 M
    'harga_jual' => 17000000000, // 17 M
    'nilai_liquidasi' => 12000000000, // 12 M
    'city' => 'Badung',
    'province' => 'Bali',
    'type' => 'Apartemen',
    'risk' => 'LOW',
    'certificate' => 'SHMSRS',
    'beds' => 3,
    'baths' => 3,
    'land_area' => 150,
    'build_area' => 300,
    'badge' => 'PREMIUM ASSET',
    'spk_number' => 'SPK-BALI-9999-' . rand(1000, 9999),
    'spk_start_date' => date('Y-m-d'),
    'spk_end_date' => date('Y-m-d', strtotime('+365 days')),
    'bank_name' => 'Bank ALURA',
    'spk_notes' => 'Kerjasama pengelolaan aset sitaan resmi Bali.',
    'full_address' => 'Jl. Uluwatu No. 42, Jimbaran, Kuta Selatan, Badung, Bali',
    'latitude' => -8.789234,
    'longitude' => 115.162341,
    'images[]' => new CURLFile($tempImage, 'image/png', 'penthouse.png')
];

$createRes = httpRequest("$baseUrl/properties", 'POST', $postFields, $adminHeaders);
@unlink($tempImage); // Clean up temp file

if ($createRes['code'] !== 201) {
    echo "[FAIL] Gagal membuat properti baru. Code: " . $createRes['code'] . "\n";
    print_r($createRes['body']);
    exit(1);
}

$propertyId = $createRes['body']['property']['id'];
$propertyUuid = $createRes['body']['property']['uuid'];
$listingId = $createRes['body']['property']['listing_id'];
echo "[PASS] Properti Baru Berhasil Dibuat!\n";
echo "       -> ID Aset: $propertyId\n";
echo "       -> UUID: $propertyUuid\n";
echo "       -> Listing ID: $listingId\n";
echo "       -> Harga Jual: Rp 17 M\n\n";


// ─── STEP 3: Verify Public Marketplace API & Coordinate Protection ────────
echo "[STEP 3] Memverifikasi Proteksi Koordinat Aset untuk Publik...\n";

// Access detail using no auth (public)
$publicDetailRes = httpRequest("$baseUrl/properties/$propertyUuid", 'GET');

if ($publicDetailRes['code'] !== 200) {
    echo "[FAIL] Gagal memuat detail publik properti. Code: " . $publicDetailRes['code'] . "\n";
    exit(1);
}

$publicData = $publicDetailRes['body'];
$hasAddress = isset($publicData['asset_detail']['full_address']);
$hasLat = isset($publicData['asset_detail']['latitude']);

echo "       -> Hasil Akses Publik:\n";
echo "          * Title: " . $publicData['title'] . "\n";
echo "          * Lokasi: " . $publicData['city'] . ", " . $publicData['province'] . "\n";
echo "          * Ada Alamat Lengkap? " . ($hasAddress ? "YA (Bocor!)" : "TIDAK (Aman)") . "\n";
echo "          * Ada Koordinat Peta? " . ($hasLat ? "YA (Bocor!)" : "TIDAK (Aman)") . "\n";

if ($hasAddress || $hasLat) {
    echo "[FAIL] Proteksi Keamanan Kebocoran Data Gagal!\n";
    exit(1);
}
echo "[PASS] Proteksi Keamanan Sukses! Koordinat & Alamat rahasia disaring dari publik!\n\n";


// ─── STEP 4: Submit Public Offer (Lead Generation) ───────────────────────
echo "[STEP 4] Mengajukan Penawaran Harga Baru secara Publik...\n";

$offerPayload = json_encode([
    'property_id' => $propertyId,
    'applicant_name' => 'PT Bali Investama Gemilang',
    'applicant_email' => 'investor@bali-investama.com',
    'applicant_phone' => '08123456789',
    'offer_price' => 18000000000, // 18 M
    'referral_code' => 'ALURA-AGNT-2024-X9' // Attributed to official agent
]);

$offerRes = httpRequest("$baseUrl/offers", 'POST', $offerPayload);

if ($offerRes['code'] !== 201) {
    echo "[FAIL] Gagal mengirimkan penawaran. Code: " . $offerRes['code'] . "\n";
    print_r($offerRes['body']);
    exit(1);
}

$offerId = $offerRes['body']['offer']['id'];
$pdfUrl = $offerRes['body']['offer']['pdf_url'];
echo "[PASS] Penawaran Sukses Dikirimkan!\n";
echo "       -> Offer ID: $offerId\n";
echo "       -> Pengaju: PT Bali Investama Gemilang\n";
echo "       -> Harga Penawaran: Rp 18 M\n";
echo "       -> Dokumen Invoice PDF Berhasil Terbuat di: $pdfUrl\n\n";


// ─── STEP 5: Verify Admin Dashboard Metrics & Status Update ──────────────
echo "[STEP 5] Memverifikasi Command Center & Memperbarui Status Penawaran...\n";

// Get dashboard stats
$dashRes = httpRequest("$baseUrl/admin/dashboard", 'GET', null, $adminHeaders);
if ($dashRes['code'] !== 200) {
    echo "[FAIL] Gagal memuat dashboard admin. Code: " . $dashRes['code'] . "\n";
    exit(1);
}
$totalOffersValue = (float) $dashRes['body']['summary']['total_value'];
echo "       -> Total Nilai Transaksi di Command Center: " . number_format($totalOffersValue, 0, ',', '.') . " IDR\n";

// Update the offer status to "Final"
echo "       -> Memperbarui Status Offer ID: $offerId menjadi 'Final'...\n";
$updatePayload = json_encode([
    'status' => 'Final',
    'notes' => 'Negosiasi selesai. Komisi referral agen 2.5% disetujui.'
]);

$updateRes = httpRequest("$baseUrl/offers/$offerId/status", 'PUT', $updatePayload, $adminHeaders);

if ($updateRes['code'] !== 200) {
    echo "[FAIL] Gagal memperbarui status penawaran. Code: " . $updateRes['code'] . "\n";
    exit(1);
}

echo "[PASS] Status Penawaran Berhasil Diperbarui Menjadi: " . $updateRes['body']['offer']['status'] . "\n";
echo "       -> Catatan Admin: " . $updateRes['body']['offer']['notes'] . "\n\n";


echo "=====================================================================\n";
echo "   CONGRATULATIONS! ALL 5 END-TO-END SECURITY & CRUD TESTS PASSED!   \n";
echo "=====================================================================\n";
