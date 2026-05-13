<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get all employees and admins for user management
     */
    public function getEmployees()
    {
        $users = User::get();

        return response()->json([
            'employees' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first() ?? 'employee',
                    'is_active' => $user->is_active,
                    'profile_photo' => $user->getProfilePhotoUrl(),
                ];
            }),
        ]);
    }

    /**
     * Get only employees (exclude admins) for task assignment
     */
    public function getEmployeesForTaskAssignment()
    {
        $users = User::all();

        // Filter out admins
        $employees = $users->filter(function ($user) {
            return !$user->hasRole('admin');
        });

        return response()->json([
            'employees' => $employees->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first() ?? 'employee',
                    'is_active' => $user->is_active,
                    'profile_photo' => $user->getProfilePhotoUrl(),
                ];
            })->values(), // Reset array keys
        ]);
    }

    /**
     * Get user profile
     */
    public function getProfile($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'profile_photo' => $user->getProfilePhotoUrl(),
            ],
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Ensure user can only update their own profile
        if ($request->user()->id !== (int)$id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'profile_photo' => 'sometimes|image|max:2048',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            $user->clearMediaCollection('avatar');
            $user->addMediaFromRequest('profile_photo')
                ->toMediaCollection('avatar');
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'profile_photo' => $user->getProfilePhotoUrl(),
            ],
        ]);
    }

    /**
     * Delete a user (admin only)
     */
    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting the currently authenticated admin
        if ($request->user()->id === (int)$id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        // Delete user's media files
        $user->clearMediaCollection('avatar');

        // Delete the user
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Toggle user active status (admin only)
     */
    public function toggleUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent deactivating yourself
        if ($request->user()->id === (int)$id) {
            return response()->json(['message' => 'Cannot deactivate your own account'], 403);
        }

        // Toggle the is_active status
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'message' => $user->is_active ? 'User activated successfully' : 'User deactivated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'is_active' => $user->is_active,
                'profile_photo' => $user->getProfilePhotoUrl(),
            ],
        ]);
    }
}
