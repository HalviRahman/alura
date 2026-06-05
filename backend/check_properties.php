<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Property;

foreach (Property::with('agreement')->get() as $p) {
    echo $p->id . ': ' . $p->title 
        . ' | Published: ' . ($p->is_published ? 'YES' : 'NO') 
        . ' | SPK End: ' . ($p->agreement?->end_date?->toDateString() ?? 'NULL') 
        . ' | Expired? ' . ($p->agreement?->isExpired() ? 'YES' : 'NO') . PHP_EOL;
}
