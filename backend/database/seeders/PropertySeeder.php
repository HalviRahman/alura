<?php
declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Agreement;
use App\Models\AssetDetail;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    private array $sampleProperties = [
        [
            'title'       => 'Pondok Indah Residence',
            'city'        => 'Jakarta Selatan',
            'province'    => 'DKI Jakarta',
            'type'        => 'Rumah',
            'price'       => 12500000000,
            'risk'        => 'LOW',
            'certificate' => 'SHM / IMB',
            'beds'        => 4,
            'baths'       => 3,
            'build_area'  => 350,
            'badge'       => 'Baru',
            'spk_days'    => 90,
            'lat'         => -6.2607, 'lng' => 106.7844,
            'address'     => 'Jl. Pondok Indah No. 42, Jakarta Selatan',
            'images'      => [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
            ],
        ],
        [
            'title'       => 'Apartemen Pakuwon City',
            'city'        => 'Surabaya',
            'province'    => 'Jawa Timur',
            'type'        => 'Apartemen',
            'price'       => 2150000000,
            'risk'        => 'MEDIUM',
            'certificate' => 'SHMSRS',
            'beds'        => 2,
            'baths'       => 1,
            'build_area'  => 85,
            'badge'       => 'Lelang Segera',
            'spk_days'    => 12,
            'lat'         => -7.2575, 'lng' => 112.7521,
            'address'     => 'Pakuwon City, Surabaya',
            'images'      => [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
            ],
        ],
        [
            'title'       => 'Kawasan Industri Cimahi',
            'city'        => 'Cimahi',
            'province'    => 'Jawa Barat',
            'type'        => 'Gudang',
            'price'       => 45000000000,
            'risk'        => 'LOW',
            'certificate' => 'HGB',
            'build_area'  => 2400,
            'land_area'   => 3200,
            'badge'       => 'Gudang',
            'spk_days'    => 180,
            'lat'         => -6.8845, 'lng' => 107.5420,
            'address'     => 'Kawasan Industri Cimahi, Jawa Barat',
            'images'      => [
                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80'
            ],
        ],
        [
            'title'       => 'Bumi Serpong Damai',
            'city'        => 'Tangerang',
            'province'    => 'Banten',
            'type'        => 'Rumah',
            'price'       => 4800000000,
            'risk'        => 'LOW',
            'certificate' => 'SHM / IMB',
            'beds'        => 3,
            'baths'       => 2,
            'build_area'  => 180,
            'land_area'   => 240,
            'badge'       => 'Harga Spesial',
            'spk_days'    => 60,
            'lat'         => -6.3015, 'lng' => 106.6527,
            'address'     => 'BSD City, Tangerang, Banten',
            'images'      => [
                'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
            ],
        ],
        [
            'title'       => 'Sudirman Office Tower',
            'city'        => 'Jakarta Pusat',
            'province'    => 'DKI Jakarta',
            'type'        => 'Perkantoran',
            'price'       => 82000000000,
            'risk'        => 'LOW',
            'certificate' => 'HGB',
            'build_area'  => 1200,
            'badge'       => 'Perkantoran',
            'spk_days'    => 300,
            'lat'         => -6.2088, 'lng' => 106.8226,
            'address'     => 'Jl. Jenderal Sudirman, SCBD, Jakarta Pusat',
            'images'      => [
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
            ],
        ],
        [
            'title'       => 'Rumah Minimalis di Bandung',
            'city'        => 'Bandung Utara',
            'province'    => 'Jawa Barat',
            'type'        => 'Rumah',
            'price'       => 2450000000,
            'risk'        => 'LOW',
            'certificate' => 'SHM / IMB',
            'beds'        => 4,
            'baths'       => 3,
            'build_area'  => 180,
            'land_area'   => 240,
            'badge'       => 'TERSEDIA',
            'spk_days'    => 45,
            'lat'         => -6.9073, 'lng' => 107.6458,
            'address'     => 'Bandung Utara, Jawa Barat',
            'images'      => [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
            ],
        ],
    ];

    public function run(): void
    {
        $admin = User::where('role', 'manajemen')->first();

        foreach ($this->sampleProperties as $idx => $data) {
            $listingId = 'ALURA-2024-' . str_pad((string)($idx + 1), 3, '0', STR_PAD_LEFT);

            $property = Property::firstOrCreate(
                ['listing_id' => $listingId],
                [
                    'title'            => $data['title'],
                    'description'      => "Properti institusional pilihan ALURA di {$data['city']}. Aset telah melewati verifikasi legalitas menyeluruh.",
                    'harga_penawaran'  => $data['price'],
                    'harga_jual'       => (int) round($data['price'] * 0.85),
                    'nilai_liquidasi'  => (int) round($data['price'] * 0.65),
                    'city'             => $data['city'],
                    'province'         => $data['province'],
                    'type'             => $data['type'],
                    'risk'             => $data['risk'],
                    'certificate'      => $data['certificate'],
                    'beds'             => $data['beds'] ?? null,
                    'baths'            => $data['baths'] ?? null,
                    'build_area'       => $data['build_area'] ?? null,
                    'land_area'        => $data['land_area'] ?? null,
                    'badge'            => $data['badge'],
                    'is_published'     => true,
                    'created_by'       => $admin?->id,
                ]
            );

            // SPK Agreement
            if (!$property->agreement) {
                $property->agreement()->create([
                    'spk_number' => 'SPK-ALURA-2024-' . str_pad((string)($idx + 1), 3, '0', STR_PAD_LEFT),
                    'start_date' => now()->subDays(30),
                    'end_date'   => now()->addDays($data['spk_days']),
                    'bank_name'  => 'Bank ALURA',
                ]);
            }

            // Asset Detail (lat/lng — PROTEKSI)
            if (!$property->assetDetail) {
                $property->assetDetail()->create([
                    'latitude'     => $data['lat'],
                    'longitude'    => $data['lng'],
                    'full_address' => $data['address'],
                ]);
            }

            // Images (external URLs stored as paths for demo)
            if ($property->images()->count() === 0 && !empty($data['images'])) {
                foreach ($data['images'] as $order => $url) {
                    PropertyImage::create([
                        'property_id' => $property->id,
                        'path'        => $url,
                        'order'       => $order,
                    ]);
                }
            }
        }

        $this->command->info('✅ Properties seeded: ' . count($this->sampleProperties) . ' properti.');
    }
}
