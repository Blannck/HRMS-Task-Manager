<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskProgressionStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_progression_id',
        'name',
        'sort_order',
    ];

    public function progression()
    {
        return $this->belongsTo(TaskProgression::class, 'task_progression_id');
    }
}
