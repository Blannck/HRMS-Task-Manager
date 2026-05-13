<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'task_progression_id',
        'task_progression_step_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';

    /**
     * Get the users assigned to this task
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'task_user');
    }

    public function progression()
    {
        return $this->belongsTo(TaskProgression::class, 'task_progression_id');
    }

    public function progressionStep()
    {
        return $this->belongsTo(TaskProgressionStep::class, 'task_progression_step_id');
    }
}
