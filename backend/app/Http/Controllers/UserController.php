<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get all employees for assignment dropdown
     */
    public function getEmployees()
    {
        $employees = User::role('employee')->get();

        return response()->json([
            'employees' => $employees->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            }),
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
}
