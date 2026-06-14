<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Rutas públicas
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/leaderboard', [AuthController::class, 'leaderboard']);

    // Rutas protegidas por Sanctum
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Rutas del Ajedrez
        Route::post('/games', [GameController::class, 'createRoom']);
        Route::post('/games/join', [GameController::class, 'joinRoom']);
        Route::get('/games/{room_code}', [GameController::class, 'show']);
        Route::post('/games/{room_code}/move', [GameController::class, 'makeMove']);
        Route::post('/games/{room_code}/finish', [GameController::class, 'finishGame']);
    });
});
