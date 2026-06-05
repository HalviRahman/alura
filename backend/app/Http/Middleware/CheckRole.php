<?php
declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle role-based access control.
     * Usage: middleware('role:manajemen') or middleware('role:agent,manajemen')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!in_array($request->user()->role, $roles, true)) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.',
                'required_role' => implode(' atau ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
