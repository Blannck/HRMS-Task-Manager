<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_progression_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_progression_id')->constrained('task_progressions')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('sort_order');
            $table->timestamps();

            $table->unique(['task_progression_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_progression_steps');
    }
};
