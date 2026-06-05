<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Agreement extends Model
{
    protected $fillable = [
        'property_id',
        'spk_number',
        'start_date',
        'end_date',
        'bank_name',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->end_date->isPast();
    }

    /**
     * Days remaining until SPK expires (negative if already expired).
     */
    public function daysRemaining(): int
    {
        return (int) Carbon::today()->diffInDays($this->end_date, false);
    }

    /**
     * True if expiring within the given number of days.
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        return !$this->isExpired() && $this->daysRemaining() <= $days;
    }

    public function getSpkStatusAttribute(): string
    {
        if ($this->isExpired()) return 'expired';
        if ($this->isExpiringSoon(14)) return 'critical';
        if ($this->isExpiringSoon(30)) return 'warning';
        return 'active';
    }

    // ── Relationships ──────────────────────────────────────────────────────

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
