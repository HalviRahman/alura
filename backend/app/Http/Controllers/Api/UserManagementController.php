<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * GET /api/admin/users
     * List semua user dengan pagination, filter by role.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::withCount(['offers as total_leads'])->withTrashed();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('referral_code', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->latest()->paginate(20);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * POST /api/admin/users
     * Buat user/agen baru.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', Rule::in(['agent', 'manajemen'])],
        ]);

        $referralCode = null;
        if ($data['role'] === 'agent') {
            // Generate unique referral code: ALURA-XXXX
            do {
                $referralCode = 'ALURA-' . strtoupper(Str::random(6));
            } while (User::where('referral_code', $referralCode)->exists());
        }

        $user = User::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
            'role'          => $data['role'],
            'referral_code' => $referralCode,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'user'    => $user,
        ], 201);
    }

    /**
     * PUT /api/admin/users/{id}
     * Update data user.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role'     => ['sometimes', Rule::in(['agent', 'manajemen', 'user'])],
        ]);

        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Jika diubah ke agent dan belum punya referral code, generate
        if (isset($data['role']) && $data['role'] === 'agent' && !$user->referral_code) {
            do {
                $data['referral_code'] = 'ALURA-' . strtoupper(Str::random(6));
            } while (User::where('referral_code', $data['referral_code'])->exists());
        }

        $user->update($data);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Soft delete (deactivate) user.
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Jangan hapus diri sendiri
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User berhasil dinonaktifkan.']);
    }

    /**
     * POST /api/admin/users/{id}/restore
     * Restore user yang sudah di-soft-delete.
     */
    public function restore(int $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['message' => 'User berhasil diaktifkan kembali.']);
    }
}
