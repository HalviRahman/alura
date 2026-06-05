<?php
declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * OptionalSanctumAuth
 *
 * Middleware ini memungkinkan route yang bersifat publik
 * untuk tetap mengenali user yang sudah login (via Bearer token).
 *
 * - Jika token ada dan valid → user di-set ke request (bisa pakai $request->user())
 * - Jika tidak ada token → request tetap jalan sebagai guest (tidak error)
 *
 * Digunakan pada route GET /api/properties dan GET /api/properties/{uuid}
 * agar manajemen dapat melihat properti unpublished/expired SPK.
 */
class OptionalSanctumAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $bearerToken = $request->bearerToken();

        if ($bearerToken) {
            $accessToken = PersonalAccessToken::findToken($bearerToken);

            if ($accessToken && $accessToken->tokenable) {
                $user = $accessToken->tokenable;
                // Set user ke dalam guard sanctum secara manual
                auth()->guard('sanctum')->setUser($user);
                $request->setUserResolver(fn () => $user);
            }
        }

        return $next($request);
    }
}
