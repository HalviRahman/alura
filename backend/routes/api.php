<?php
declare(strict_types=1);

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — ALURA Backend
|--------------------------------------------------------------------------
| Rate limits:
|   - login: 5/menit (anti brute-force)
|   - public API: 60/menit
|   - authenticated: 120/menit
*/

// ── Auth (Public) ──────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    // Brute-force protection: maks 5 percobaan per menit
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// ── Public Routes (throttle 60/menit) ─────────────────────────────────────
Route::middleware('throttle:60,1')->group(function () {
    // Submit offer — public, no auth
    Route::post('offers', [OfferController::class, 'store']);
});

// ── Property listing: public tapi optional auth (manajemen bisa lihat unpublished) ─
// Jika ada Bearer token manajemen → bisa lihat semua properti termasuk unpublished.
// Jika tidak ada token (publik) → hanya lihat properti published + SPK aktif.
Route::middleware(['throttle:60,1', \App\Http\Middleware\OptionalSanctumAuth::class])->group(function () {
    Route::get('properties', [PropertyController::class, 'index']);
    Route::get('properties/{property}', [PropertyController::class, 'show']);
});


// ── Authenticated Routes ───────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {

    // ── Agent + Manajemen ──────────────────────────────────────────────────
    Route::middleware('role:agent,manajemen')->prefix('agent')->group(function () {
        Route::get('properties', [AgentController::class, 'properties']);
        Route::get('stats', [AgentController::class, 'stats']);
    });

    // Offer list + PDF — agent sees only their own referral offers
    Route::middleware('role:agent,manajemen')->group(function () {
        Route::get('offers', [OfferController::class, 'index']);
        Route::get('offers/{offer}/pdf', [OfferController::class, 'downloadPdf']);
    });

    // ── Manajemen Only ─────────────────────────────────────────────────────
    Route::middleware('role:manajemen')->group(function () {
        // Property management
        Route::post('properties', [PropertyController::class, 'store']);
        Route::put('properties/{property}', [PropertyController::class, 'update']);
        Route::delete('properties/{property}', [PropertyController::class, 'destroy']);
        Route::post('properties/{property}/images', [PropertyController::class, 'uploadImages']);

        // Offer status management
        Route::put('offers/{offer}/status', [OfferController::class, 'updateStatus']);

        // Admin dashboard
        Route::prefix('admin')->group(function () {
            Route::get('dashboard',  [AdminController::class, 'dashboard']);
            Route::get('spk-alerts', [AdminController::class, 'spkAlerts']);
            Route::get('stats',      [AdminController::class, 'stats']);
            Route::get('analytics',      [AdminController::class, 'analytics']);
            Route::get('reports',        [AdminController::class, 'reports']);
            Route::get('map-locations',  [AdminController::class, 'mapLocations']);
        });

        // User management
        Route::prefix('admin/users')->group(function () {
            Route::get('/',              [UserManagementController::class, 'index']);
            Route::post('/',             [UserManagementController::class, 'store']);
            Route::put('/{id}',          [UserManagementController::class, 'update']);
            Route::delete('/{id}',       [UserManagementController::class, 'destroy']);
            Route::post('/{id}/restore', [UserManagementController::class, 'restore']);
        });
    });
});
