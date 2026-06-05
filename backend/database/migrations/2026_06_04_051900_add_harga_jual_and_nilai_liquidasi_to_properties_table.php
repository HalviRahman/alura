<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Rename price -> harga_penawaran
            $table->renameColumn('price', 'harga_penawaran');
        });

        Schema::table('properties', function (Blueprint $table) {
            // Add new columns after harga_penawaran
            $table->bigInteger('harga_jual')->unsigned()->nullable()->after('harga_penawaran');
            $table->bigInteger('nilai_liquidasi')->unsigned()->nullable()->after('harga_jual');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['harga_jual', 'nilai_liquidasi']);
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->renameColumn('harga_penawaran', 'price');
        });
    }
};
