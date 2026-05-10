<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'employee']);

        // Create permissions
        $permissions = [
            'create tasks',
            'view all tasks',
            'view own tasks',
            'update task status',
            'manage users',
            'view profile',
            'update profile',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to admin role
        $adminRole = Role::findByName('admin');
        $adminRole->givePermissionTo([
            'create tasks',
            'view all tasks',
            'view own tasks',
            'update task status',
            'manage users',
            'view profile',
            'update profile',
        ]);

        // Assign permissions to employee role
        $employeeRole = Role::findByName('employee');
        $employeeRole->givePermissionTo([
            'view own tasks',
            'update task status',
            'view profile',
            'update profile',
        ]);

        // Create demo admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password123'),
            ]
        );
        $admin->assignRole('admin');

        // Create demo employee users
        $employees = [
            ['name' => 'John Doe', 'email' => 'john@example.com'],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com'],
            ['name' => 'Bob Johnson', 'email' => 'bob@example.com'],
        ];

        foreach ($employees as $employee) {
            $user = User::firstOrCreate(
                ['email' => $employee['email']],
                [
                    'name' => $employee['name'],
                    'password' => bcrypt('password123'),
                ]
            );
            $user->assignRole('employee');
        }
    }
}
