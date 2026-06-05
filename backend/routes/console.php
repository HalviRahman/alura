<?php
declare(strict_types=1);

use App\Console\Commands\CheckSpkExpiry;
use Illuminate\Support\Facades\Schedule;

// SPK check — jalankan setiap hari jam 07:00 WIB
Schedule::command(CheckSpkExpiry::class)
    ->dailyAt('07:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/spk-check.log'));
