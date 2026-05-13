<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('task_progression_id')->nullable()->after('description')->constrained('task_progressions')->nullOnDelete();
            $table->foreignId('task_progression_step_id')->nullable()->after('task_progression_id')->constrained('task_progression_steps')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('task_progression_step_id');
            $table->dropConstrainedForeignId('task_progression_id');
        });
    }
};
