<?php
declare(strict_types=1);

namespace App\Console\Commands;

use App\Mail\SpkCriticalMail;
use App\Mail\SpkWarningMail;
use App\Models\Agreement;
use App\Models\Property;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class CheckSpkExpiry extends Command
{
    protected $signature   = 'alura:spk-check';
    protected $description = 'Cek SPK yang expired/expiring dan kirim notifikasi ke manajemen.';

    public function handle(): int
    {
        $today    = Carbon::today();
        $admins   = User::where('role', 'manajemen')->get();
        $taken    = 0;
        $critical = 0;
        $warning  = 0;

        // 1. Auto-takedown properti yang SPK-nya sudah expired
        $expiredProperties = Property::with('agreement')
            ->where('is_published', true)
            ->whereHas('agreement', fn ($q) => $q->where('end_date', '<', $today))
            ->get();

        foreach ($expiredProperties as $property) {
            $property->update(['is_published' => false]);
            $taken++;
            $this->warn("  [TAKEDOWN] {$property->listing_id} — {$property->title}");
        }

        // 2. SPK kritis (≤14 hari) — kirim email CRITICAL
        $criticalAgreements = Agreement::with('property')
            ->whereHas('property', fn ($q) => $q->where('is_published', true))
            ->whereBetween('end_date', [$today, $today->copy()->addDays(14)])
            ->get();

        foreach ($criticalAgreements as $agr) {
            foreach ($admins as $admin) {
                Mail::to($admin->email)->queue(new SpkCriticalMail($agr->property, $agr));
            }
            $critical++;
            $this->error("  [CRITICAL] {$agr->property?->title} — {$agr->daysRemaining()} hari tersisa");
        }

        // 3. SPK warning (15–30 hari) — kirim email WARNING
        $warningAgreements = Agreement::with('property')
            ->whereHas('property', fn ($q) => $q->where('is_published', true))
            ->whereBetween('end_date', [$today->copy()->addDays(15), $today->copy()->addDays(30)])
            ->get();

        foreach ($warningAgreements as $agr) {
            foreach ($admins as $admin) {
                Mail::to($admin->email)->queue(new SpkWarningMail($agr->property, $agr));
            }
            $warning++;
            $this->line("  [WARNING]  {$agr->property?->title} — {$agr->daysRemaining()} hari tersisa");
        }

        $this->info("\n✅ SPK Check selesai: {$taken} takedown, {$critical} critical, {$warning} warning.");

        return self::SUCCESS;
    }
}
