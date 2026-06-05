<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    /**
     * GET /api/properties
     * Public — filter, paginate, SPK check built in scope.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user      = auth('sanctum')->user();
        $query     = Property::with(['images', 'agreement']);
        $isAdmin   = $user?->isManajemen();

        // Non-manajemen only sees published + active SPK
        if (!$isAdmin) {
            $query->published();
        }

        // Filters
        if ($request->filled('city'))       $query->where('city', 'like', '%' . $request->city . '%');
        if ($request->filled('province'))   $query->where('province', $request->province);
        if ($request->filled('type'))       $query->where('type', $request->type);
        if ($request->filled('price_min'))  $query->where('harga_penawaran', '>=', $request->price_min);
        if ($request->filled('price_max'))  $query->where('harga_penawaran', '<=', $request->price_max);
        if ($request->filled('risk'))       $query->where('risk', $request->risk);
        
        if ($request->filled('query')) {
            $searchTerm = $request->input('query');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('listing_id', 'like', '%' . $searchTerm . '%')
                  ->orWhere('city', 'like', '%' . $searchTerm . '%');
            });
        }

        if ($isAdmin && $request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        // Sorting
        match ($request->input('sort', 'newest')) {
            'price_asc'  => $query->orderBy('harga_penawaran', 'asc'),
            'price_desc' => $query->orderBy('harga_penawaran', 'desc'),
            default      => $query->latest(),
        };

        $properties = $query->paginate(12);


        return PropertyResource::collection($properties);
    }

    /**
     * GET /api/properties/{id}
     * Public — includes SPK redundancy check on every access.
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $user      = $request->user();
        $isAdmin   = $user?->isManajemen();

        $relations = ['images', 'agreement'];
        if ($isAdmin) $relations[] = 'assetDetail';

        $property = Property::with($relations)->where('uuid', $uuid)->first();

        if (!$property) {
            return response()->json([
                'message' => 'Properti tidak ditemukan atau telah dihapus.',
            ], 404);
        }

        // Redundansi check SPK setiap kali diakses publik
        if (!$isAdmin && !$property->checkAndEnforceSpk()) {
            return response()->json([
                'message' => 'Properti ini tidak tersedia karena SPK telah berakhir.',
            ], 404);
        }

        if (!$isAdmin && !$property->is_published) {
            return response()->json(['message' => 'Properti tidak ditemukan.'], 404);
        }

        return response()->json(new PropertyResource($property));
    }

    /**
     * POST /api/properties
     * Manajemen only — buat properti + SPK + foto + asset detail dalam satu transaksi.
     */
    public function store(StorePropertyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $property = DB::transaction(function () use ($request, $data) {
            // Generate listing ID
            $listingId = 'ALURA-' . date('Y') . '-' . strtoupper(Str::random(5));

            $property = Property::create([
                'title'            => $data['title'],
                'description'      => $data['description'] ?? null,
                'harga_penawaran'  => $data['harga_penawaran'],
                'harga_jual'       => $data['harga_jual'] ?? null,
                'nilai_liquidasi'  => $data['nilai_liquidasi'] ?? null,
                'city'             => $data['city'],
                'province'         => $data['province'],
                'type'             => $data['type'],
                'risk'             => $data['risk'],
                'certificate'      => $data['certificate'],
                'listing_id'       => $listingId,
                'beds'             => $data['beds'] ?? null,
                'baths'            => $data['baths'] ?? null,
                'land_area'        => $data['land_area'] ?? null,
                'build_area'       => $data['build_area'] ?? null,
                'badge'            => $data['badge'] ?? null,
                'is_published'     => true,
                'created_by'       => $request->user()->id,
            ]);

            // SPK / Agreement
            $property->agreement()->create([
                'spk_number'  => $data['spk_number'],
                'start_date'  => $data['spk_start_date'],
                'end_date'    => $data['spk_end_date'],
                'bank_name'   => $data['bank_name'] ?? 'Bank ALURA',
                'notes'       => $data['spk_notes'] ?? null,
            ]);

            // Asset Detail (koordinat — proteksi ketat)
            if (isset($data['latitude']) || isset($data['full_address'])) {
                $property->assetDetail()->create([
                    'latitude'     => $data['latitude'] ?? null,
                    'longitude'    => $data['longitude'] ?? null,
                    'full_address' => $data['full_address'] ?? null,
                ]);
            }

            // Images upload
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $order => $file) {
                    $path = $file->store("properties/{$property->id}", 'public');
                    $property->images()->create(['path' => $path, 'order' => $order]);
                }
            }

            return $property;
        });

        $property->load(['images', 'agreement']);

        return response()->json([
            'message'  => 'Properti berhasil ditambahkan.',
            'property' => new PropertyResource($property),
        ], 201);
    }

    /**
     * PUT /api/properties/{id}
     * Manajemen only.
     */
    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($property, $data) {
            $property->update(collect($data)->only([
                'title', 'description', 'harga_penawaran', 'harga_jual', 'nilai_liquidasi',
                'city', 'province', 'type', 'risk', 'certificate', 'beds', 'baths',
                'land_area', 'build_area', 'badge', 'is_published',
            ])->filter(fn ($v) => $v !== null)->toArray());

            if (isset($data['spk_end_date']) && $property->agreement) {
                $property->agreement->update([
                    'end_date'  => $data['spk_end_date'],
                    'bank_name' => $data['bank_name'] ?? $property->agreement->bank_name,
                ]);
            }
        });

        $property->load(['images', 'agreement', 'assetDetail']);

        return response()->json([
            'message'  => 'Properti berhasil diperbarui.',
            'property' => new PropertyResource($property),
        ]);
    }

    /**
     * DELETE /api/properties/{id}
     * Manajemen only — soft delete.
     */
    public function destroy(Property $property): JsonResponse
    {
        $property->delete();

        return response()->json([
            'message' => 'Properti berhasil dihapus.',
        ]);
    }

    /**
     * POST /api/properties/{id}/images
     * Manajemen only — tambah gambar ke properti yang sudah ada.
     */
    public function uploadImages(Request $request, Property $property): JsonResponse
    {
        $request->validate([
            'images'   => ['required', 'array', 'max:10'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);

        $lastOrder = $property->images()->max('order') ?? -1;

        foreach ($request->file('images') as $idx => $file) {
            $path = $file->store("properties/{$property->id}", 'public');
            $property->images()->create([
                'path'  => $path,
                'order' => $lastOrder + 1 + $idx,
            ]);
        }

        $property->load('images');

        return response()->json([
            'message' => 'Gambar berhasil diupload.',
            'images'  => $property->images->map(fn ($img) => $img->url)->values(),
        ]);
    }
}
