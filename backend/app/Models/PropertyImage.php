<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PropertyImage extends Model
{
    protected $fillable = ['property_id', 'path', 'order'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        // Support external URLs (e.g., seeded from remote) and local storage paths
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }
        return Storage::disk('public')->url($this->path);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
