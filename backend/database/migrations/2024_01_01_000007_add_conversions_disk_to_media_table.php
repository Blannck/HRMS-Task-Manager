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
            if (!Schema::hasColumn('media', 'conversions_disk')) {
                $table->string('conversions_disk')->default('public')->after('disk');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('media') && Schema::hasColumn('media', 'conversions_disk')) {
            Schema::table('media', function (Blueprint $table) {
                $table->dropColumn('conversions_disk');
            });
        }
    }
};
