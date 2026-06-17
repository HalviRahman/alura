<?php
declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * CookieToBearer
 *
 * Bridges the gap between httpOnly cookie-based token storage
 * and Sanctum's Bearer token authentication.
 *
 * When a request arrives WITHOUT an Authorization header but WITH
 * the encrypted 'alura_token' cookie, this middleware injects the
 * token as a Bearer header before Sanctum processes the request.
 *
 * This means:
 * - Tokens are stored in httpOnly cookies (JS cannot read them → XSS-safe)
 * - Sanctum continues to work with its standard Bearer token guard
 */
class CookieToBearer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken() && $request->cookie('alura_token')) {
            $request->headers->set(
                'Authorization',
                'Bearer ' . $request->cookie('alura_token')
            );
        }

        return $next($request);
    }
}
