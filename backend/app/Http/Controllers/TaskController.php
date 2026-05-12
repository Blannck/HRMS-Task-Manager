<?php

namespace App\Http\Controllers;

use App\Models\Task;
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
        ]);

        $userIds = $validated['user_ids'];
        unset($validated['user_ids']);

        $task = Task::create($validated);
        $task->users()->sync($userIds);

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
        $tasks = Task::with('users')->get();

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
        })->with('users')->get();

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
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task->update($validated);

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
        $appUrl = config('app.url');

        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'assigned_users' => $task->users->map(function ($user) use ($appUrl) {
                $photoUrl = $user->getFirstMediaUrl('avatar');
                $fullPhotoUrl = $photoUrl ? $appUrl . $photoUrl : null;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_photo' => $fullPhotoUrl,
                ];
            }),
            'created_at' => $task->created_at,
            'updated_at' => $task->updated_at,
        ];
    }
}
