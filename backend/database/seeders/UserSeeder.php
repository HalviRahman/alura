<?php
declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Manajemen / Admin
        User::firstOrCreate(
            ['email' => 'admin@alura.id'],
            [
                'name'              => 'Admin ALURA',
                'password'          => Hash::make('Admin@12345'),
                'role'              => 'manajemen',
                'email_verified_at' => now(),
            ]
        );

        // Agen Level 1
        User::firstOrCreate(
            ['email' => 'agent@alura.id'],
            [
                'name'              => 'Andri Rayana',
                'password'          => Hash::make('Agent@12345'),
                'role'              => 'agent',
                'referral_code'     => 'ALURA-AGNT-2024-X9',
                'email_verified_at' => now(),
            ]
        );

        // User Publik
        User::firstOrCreate(
            ['email' => 'user@alura.id'],
            [
                'name'              => 'Budi Santoso',
                'password'          => Hash::make('User@12345'),
                'role'              => 'user',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Users seeded: admin@alura.id | agent@alura.id | user@alura.id');
    }
}
