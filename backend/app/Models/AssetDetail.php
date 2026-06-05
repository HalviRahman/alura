<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PROTEKSI KETAT: Model ini menyimpan koordinat GPS aset.
 * TIDAK BOLEH di-serialize atau di-load dalam response publik.
 * Hanya boleh diakses oleh controller yang sudah melewati middleware 'role:manajemen'.
 */
class AssetDetail extends Model
{
    protected $fillable = [
        'property_id',
        'latitude',
        'longitude',
        'full_address',
    ];

    protected function casts(): array
    {
        return [
            'latitude'  => 'float',
            'longitude' => 'float',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
