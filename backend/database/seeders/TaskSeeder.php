<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample tasks
        $tasks = [
            [
                'title' => 'Design new user interface',
                'description' => 'Create mockups and wireframes for the new dashboard redesign',
            ],
            [
                'title' => 'Fix authentication bugs',
                'description' => 'Debug and fix issues in the login and registration flow',
            ],
            [
                'title' => 'Write API documentation',
                'description' => 'Document all API endpoints with examples and usage',
            ],
            [
                'title' => 'Optimize database queries',
                'description' => 'Review and optimize slow-running database queries',
            ],
            [
                'title' => 'Implement caching layer',
                'description' => 'Add Redis caching for frequently accessed data',
            ],
        ];

        foreach ($tasks as $taskData) {
            $task = Task::create($taskData);
            
            // Assign to random employees
            $employeeIds = [2, 3, 4]; // john, jane, bob
            $assignedUsers = array_slice($employeeIds, 0, rand(1, 3));
            $task->users()->sync($assignedUsers);
        }
    }
}
