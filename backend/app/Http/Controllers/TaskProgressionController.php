<?php

namespace App\Http\Controllers;

use App\Models\TaskProgression;
use App\Models\TaskProgressionStep;
use Illuminate\Http\Request;

class TaskProgressionController extends Controller
{
    public function index()
    {
        $progressions = TaskProgression::with('steps')->orderBy('sort_order')->get();

        return response()->json([
            'progressions' => $progressions->map(function ($progression) {
                return $this->formatProgression($progression);
            }),
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:task_progressions,name',
            'description' => 'nullable|string',
            'steps' => 'nullable|array',
            'steps.*.name' => 'required|string|max:255',
        ]);

        // Get the next sort_order
        $nextOrder = TaskProgression::max('sort_order') + 1 ?? 1;

        $progression = TaskProgression::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'sort_order' => $nextOrder,
        ]);

        // Create single step with progression name (or use provided steps)
        $steps = collect($validated['steps'] ?? [
            ['name' => $validated['name']],
        ]);

        $steps->values()->each(function ($step, $index) use ($progression) {
            TaskProgressionStep::create([
                'task_progression_id' => $progression->id,
                'name' => trim($step['name']),
                'sort_order' => $index + 1,
            ]);
        });

        $progression->load('steps');

        return response()->json([
            'message' => 'Task progression created successfully',
            'progression' => $this->formatProgression($progression),
        ], 201);
    }

    public function reorder(Request $request)
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'progressions' => 'required|array',
            'progressions.*.id' => 'required|exists:task_progressions,id',
            'progressions.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['progressions'] as $prog) {
            TaskProgression::where('id', $prog['id'])->update(['sort_order' => $prog['sort_order']]);
        }

        return response()->json([
            'message' => 'Progressions reordered successfully',
        ]);
    }

    private function formatProgression(TaskProgression $progression)
    {
        return [
            'id' => $progression->id,
            'name' => $progression->name,
            'description' => $progression->description,
            'steps' => $progression->steps->map(function ($step) {
                return [
                    'id' => $step->id,
                    'name' => $step->name,
                    'sort_order' => $step->sort_order,
                ];
            }),
        ];
    }
}
