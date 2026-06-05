<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    public const ROLE_MANAJEMEN = 'manajemen';
    public const ROLE_AGENT     = 'agent';
    public const ROLE_USER      = 'user';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'referral_code',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ── Role helpers ───────────────────────────────────────────────────────

    public function isManajemen(): bool
    {
        return $this->role === self::ROLE_MANAJEMEN;
    }

    public function isAgent(): bool
    {
        return $this->role === self::ROLE_AGENT;
    }

    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    // ── Relationships ──────────────────────────────────────────────────────

    /**
     * Offers submitted through this agent's referral code.
     */
    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'agent_id');
    }

    /**
     * Properties created/managed by this user.
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'created_by');
    }
}
