<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('media')) {
            return;
        }

        Schema::table('media', function (Blueprint $table) {
            // Change responsive_images from unsignedBigInteger to json
            $table->json('responsive_images')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('media')) {
            Schema::table('media', function (Blueprint $table) {
                $table->unsignedBigInteger('responsive_images')->nullable()->change();
            });
        }
    }
};
