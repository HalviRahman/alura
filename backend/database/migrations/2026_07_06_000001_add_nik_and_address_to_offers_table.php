<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            // Tambah setelah applicant_name
            $table->string('applicant_nik', 20)->nullable()->after('applicant_name');
            $table->text('applicant_address')->nullable()->after('applicant_nik');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['applicant_nik', 'applicant_address']);
        });
    }
};
