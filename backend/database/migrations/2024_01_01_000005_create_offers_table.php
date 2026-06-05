<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('applicant_name');
            $table->string('applicant_email');
            $table->string('applicant_phone', 20);
            $table->bigInteger('offer_price')->unsigned();
            $table->string('referral_code', 60)->nullable();
            $table->string('pdf_path')->nullable();
            $table->enum('status', ['Pending', 'Follow Up', 'Reviewed', 'Final', 'Gugur'])->default('Pending');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['property_id', 'status']);
            $table->index('agent_id');
            $table->index('referral_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
