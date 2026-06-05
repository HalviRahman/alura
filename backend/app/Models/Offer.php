<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offer extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING    = 'Pending';
    public const STATUS_FOLLOW_UP  = 'Follow Up';
    public const STATUS_REVIEWED   = 'Reviewed';
    public const STATUS_FINAL      = 'Final';
    public const STATUS_GUGUR      = 'Gugur';

    protected $fillable = [
        'property_id',
        'agent_id',
        'applicant_name',
        'applicant_email',
        'applicant_phone',
        'offer_price',
        'referral_code',
        'pdf_path',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'offer_price' => 'integer',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
