<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login dan kembalikan Sanctum API token.
     * Rate limit: 5 percobaan per menit (anti brute-force).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Bypass captcha during automated testing
        if (!$request->hasHeader('X-Alura-Test')) {
            $captchaToken = $request->input('cf-turnstile-response');

            if (empty($captchaToken)) {
                return response()->json([
                    'message' => 'Silakan selesaikan verifikasi Captcha terlebih dahulu.',
                ], 422);
            }

            $secret   = env('TURNSTILE_SECRET_KEY', '0x4AAAAAADuX5VNuCH2kbwYeQcl7woiVGus');
            // $secret   = env('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA');
            $response = \Illuminate\Support\Facades\Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret'   => $secret,
                'response' => $captchaToken,
                'remoteip' => $request->ip(),
            ]);

            if (!$response->successful() || !$response->json('success')) {
                return response()->json([
                    'message' => 'Verifikasi Captcha gagal. Silakan coba lagi.',
                ], 422);
            }
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        // Hapus semua token lama (satu sesi aktif per user)
        $user->tokens()->delete();

        $token = $user->createToken(
            name: 'alura-api-token',
            expiresAt: now()->addDays(7)
        )->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => new UserResource($user),
        ]);
    }

    /**
     * Logout — hapus token aktif.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Kembalikan data user yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }
}
