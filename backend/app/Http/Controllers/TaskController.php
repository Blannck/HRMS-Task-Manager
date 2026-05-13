<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskProgression;
use App\Models\TaskProgressionStep;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Create a new task and assign to users
     */
    public function create(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'task_progression_id' => 'nullable|exists:task_progressions,id',
        ]);

        $userIds = $validated['user_ids'];
        unset($validated['user_ids']);

        $progression = null;
        $firstStep = null;
        if (!empty($validated['task_progression_id'])) {
            $progression = TaskProgression::with('steps')->find($validated['task_progression_id']);
            $firstStep = $progression?->steps->sortBy('sort_order')->first();
        }

        if ($firstStep) {
            $validated['task_progression_step_id'] = $firstStep->id;
            $validated['status'] = $this->mapStepToLegacyStatus($firstStep, $progression->steps);
        } else {
            // Default status if no progression
            $validated['status'] = 'pending';
        }

        $task = Task::create($validated);
        $task->users()->sync($userIds);
        $task->load(['users', 'progression.steps', 'progressionStep']);

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $this->formatTaskResponse($task),
        ], 201);
    }

    /**
     * Get all tasks (admin only)
     */
    public function getAll()
    {
        $tasks = Task::with(['users', 'progression.steps', 'progressionStep'])->get();

        return response()->json([
            'tasks' => $tasks->map(fn($task) => $this->formatTaskResponse($task)),
        ]);
    }

    /**
     * Get tasks assigned to a specific user
     */
    public function getUserTasks($userId)
    {
        $tasks = Task::whereHas('users', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->with(['users', 'progression.steps', 'progressionStep'])->get();

        return response()->json([
            'tasks' => $tasks->map(fn($task) => $this->formatTaskResponse($task)),
        ]);
    }

    /**
     * Update task status
     */
    public function updateStatus(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        // Check if user is assigned to this task or is admin
        if (!$request->user()->hasRole('admin') && !$task->users->contains($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'nullable|in:pending,in_progress,completed',
            'task_progression_step_id' => 'nullable|exists:task_progression_steps,id',
        ]);

        if (!empty($validated['task_progression_step_id'])) {
            if (!$task->task_progression_id) {
                return response()->json(['message' => 'Task progression not set'], 422);
            }

            $step = TaskProgressionStep::where('task_progression_id', $task->task_progression_id)
                ->where('id', $validated['task_progression_step_id'])
                ->first();

            if (!$step) {
                return response()->json(['message' => 'Invalid progression step'], 422);
            }

            $steps = $task->progression?->steps ?? collect();

            $task->update([
                'task_progression_step_id' => $step->id,
                'status' => $this->mapStepToLegacyStatus($step, $steps),
            ]);
        } elseif (!empty($validated['status'])) {
            $task->update([
                'status' => $validated['status'],
            ]);
        } else {
            return response()->json(['message' => 'Status or progression step is required'], 422);
        }

        $task->load(['users', 'progression.steps', 'progressionStep']);

        return response()->json([
            'message' => 'Task status updated successfully',
            'task' => $this->formatTaskResponse($task),
        ]);
    }

    /**
     * Format task response
     */
    private function formatTaskResponse(Task $task)
    {
        $progression = $task->progression;
        $steps = $progression?->steps ?? collect();
        $currentStep = $task->progressionStep;
        $statusLabel = $currentStep?->name ?? $this->formatLegacyStatus($task->status);

        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'status_label' => $statusLabel,
            'progression' => $progression ? [
                'id' => $progression->id,
                'name' => $progression->name,
                'description' => $progression->description,
            ] : null,
            'progression_step' => $currentStep ? [
                'id' => $currentStep->id,
                'name' => $currentStep->name,
                'sort_order' => $currentStep->sort_order,
            ] : null,
            'progression_steps' => $steps->isNotEmpty()
                ? $steps->sortBy('sort_order')->map(function ($step) {
                    return [
                        'id' => $step->id,
                        'name' => $step->name,
                        'sort_order' => $step->sort_order,
                    ];
                })->values()
                : $this->defaultProgressionSteps(),
            'assigned_users' => $task->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_photo' => $user->getProfilePhotoUrl(),
                ];
            }),
            'created_at' => $task->created_at,
            'updated_at' => $task->updated_at,
        ];
    }

    private function mapStepToLegacyStatus(TaskProgressionStep $step, $steps)
    {
        if ($steps->isEmpty()) {
            return Task::STATUS_PENDING;
        }

        $sorted = $steps->sortBy('sort_order');
        $index = $sorted->search(fn($item) => $item->id === $step->id);

        if ($index === 0) {
            return Task::STATUS_PENDING;
        }

        if ($index === $sorted->count() - 1) {
            return Task::STATUS_COMPLETED;
        }

        return Task::STATUS_IN_PROGRESS;
    }

    private function formatLegacyStatus($status)
    {
        return match($status) {
            'pending' => 'To Do',
            'in_progress' => 'In Progress',
            'completed' => 'Done',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    private function defaultProgressionSteps()
    {
        return collect([
            ['id' => null, 'name' => 'To Do', 'sort_order' => 1, 'key' => 'pending'],
            ['id' => null, 'name' => 'In Progress', 'sort_order' => 2, 'key' => 'in_progress'],
            ['id' => null, 'name' => 'Done', 'sort_order' => 3, 'key' => 'completed'],
        ]);
    }
}
