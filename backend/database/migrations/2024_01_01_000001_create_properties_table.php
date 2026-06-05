<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->bigInteger('price')->unsigned();
            $table->string('city');
            $table->string('province');
            $table->enum('type', ['Rumah', 'Apartemen', 'Ruko', 'Tanah', 'Gudang', 'Perkantoran']);
            $table->enum('risk', ['LOW', 'MEDIUM', 'HIGH'])->default('LOW');
            $table->string('certificate')->nullable();
            $table->string('listing_id')->unique();
            $table->unsignedTinyInteger('beds')->nullable();
            $table->unsignedTinyInteger('baths')->nullable();
            $table->unsignedInteger('land_area')->nullable()->comment('m2');
            $table->unsignedInteger('build_area')->nullable()->comment('m2');
            $table->boolean('is_published')->default(false);
            $table->string('badge')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
