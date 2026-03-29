<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RequestController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\DocumentController;



// بدون login
Route::post('/login', [AuthController::class, 'login']);
Route::post('/requests', [RequestController::class, 'store']);
Route::get('/requests/track', [RequestController::class, 'track']);
Route::post('/requests/{requestId}/documents', [DocumentController::class, 'store']);


// مع login
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    // حالة الطلبات
    Route::get('/requests', [RequestController::class, 'index']);
    Route::get('/requests/{id}', [RequestController::class, 'show']);
    Route::patch('/requests/{id}/status', [RequestController::class, 'updateStatus']);
    // الملاحظات 
    Route::get('/requests/{requestId}/notes', [NoteController::class, 'index']);
    Route::post('/requests/{requestId}/notes', [NoteController::class, 'store']);
    Route::delete('/requests/{requestId}/notes/{noteId}', [NoteController::class, 'destroy']);
    // المستندات
    Route::get('/requests/{requestId}/documents', [DocumentController::class, 'index']);
    Route::delete('/requests/{requestId}/documents/{documentId}', [DocumentController::class, 'destroy']);
});