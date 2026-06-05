<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->unique()->after('id');
        });
        
        // Populate existing records with UUIDs
        $properties = DB::table('properties')->get();
        foreach ($properties as $property) {
            DB::table('properties')->where('id', $property->id)->update(['uuid' => (string) Str::uuid()]);
        }
        
        // Make it not nullable if you want, but for SQLite nullable is easier during addition, so we leave it nullable but populated.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
