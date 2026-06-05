<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted()
    {
        static::creating(function ($property) {
            if (empty($property->uuid)) {
                $property->uuid = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'uuid',
        'title',
        'description',
        'harga_penawaran',
        'harga_jual',
        'nilai_liquidasi',
        'city',
        'province',
        'type',
        'risk',
        'certificate',
        'listing_id',
        'beds',
        'baths',
        'land_area',
        'build_area',
        'is_published',
        'badge',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'harga_penawaran' => 'integer',
            'harga_jual'      => 'integer',
            'nilai_liquidasi' => 'integer',
            'is_published'    => 'boolean',
            'beds'            => 'integer',
            'baths'           => 'integer',
            'land_area'       => 'integer',
            'build_area'      => 'integer',
        ];
    }

    // ── Scopes ─────────────────────────────────────────────────────────────

    /**
     * Only published properties with a valid (non-expired) SPK.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('is_published', true)
            ->whereHas('agreement', fn (Builder $q) =>
                $q->where('end_date', '>=', Carbon::today())
            );
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    /**
     * Check if the SPK is still active today.
     * Also auto-takedown if expired (redundancy check on access).
     */
    public function checkAndEnforceSpk(): bool
    {
        if (!$this->agreement) {
            return false;
        }

        if ($this->agreement->isExpired()) {
            $this->update(['is_published' => false]);
            return false;
        }

        return true;
    }

    public function isSpkActive(): bool
    {
        return $this->agreement?->isExpired() === false;
    }

    // ── Relationships ──────────────────────────────────────────────────────

    public function agreement(): HasOne
    {
        return $this->hasOne(Agreement::class);
    }

    /**
     * PROTEKSI KETAT: assetDetail contains lat/lng.
     * NEVER eager-load this in public API responses.
     */
    public function assetDetail(): HasOne
    {
        return $this->hasOne(AssetDetail::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('order');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
