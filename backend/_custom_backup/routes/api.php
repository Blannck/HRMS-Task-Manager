<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TaskController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // User/Profile
    Route::get('/users', [UserController::class, 'getEmployees']);
    Route::get('/profile/{id}', [UserController::class, 'getProfile']);
    Route::patch('/profile/{id}', [UserController::class, 'updateProfile']);

    // Tasks
    Route::get('/my-tasks/{userId}', [TaskController::class, 'getUserTasks']);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::post('/tasks', [TaskController::class, 'create']);
        Route::get('/tasks', [TaskController::class, 'getAll']);
    });
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
