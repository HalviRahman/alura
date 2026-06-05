<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration — ALURA API
    |--------------------------------------------------------------------------
    | Izinkan akses dari Vite dev server (localhost:5173) dan production domain.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',    // Vite dev
        'http://127.0.0.1:5173',   // Vite dev (alternate)
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
