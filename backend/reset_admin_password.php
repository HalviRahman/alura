<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$password = $argv[1] ?? 'password';

$users = User::where('role', 'manajemen')->get();
foreach ($users as $u) {
    $u->update(['password' => Hash::make($password)]);
    echo "✅ Password user [{$u->email}] direset ke: {$password}\n";
}
echo "\nSelesai!\n";
