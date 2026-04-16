<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RequestController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CaseDocumentationController;
use App\Http\Controllers\VolunteerController;





// بدون login
Route::middleware('throttle:5,1')->post('/login', [AuthController::class, 'login']);
Route::post('/requests', [RequestController::class, 'store']);
Route::get('/requests/track', [RequestController::class, 'track']);
Route::post('/requests/{requestId}/documents', [DocumentController::class, 'store']);

Route::post('/requests/{id}/documents/add', [DocumentController::class, 'addMore']);
Route::post('/volunteer', [VolunteerController::class, 'store']);

Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password',  [AuthController::class, 'resetPassword']);


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
    // المستخدمين
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::patch('/users/{id}', [UserController::class, 'update']);
    // أداء الموظفين
    Route::get('/users/performance', [UserController::class, 'performance']);
    // تغير كلمة المرور للموظف و حذف المستخدم (للمدير فقط)
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::patch('/users/{id}/password', [UserController::class, 'resetPassword']);

    // Documentation
    Route::post('/documentation', [CaseDocumentationController::class, 'store']);
    Route::get('/documentation', [CaseDocumentationController::class, 'index']);
    Route::get('/documentation/request/{requestId}', [CaseDocumentationController::class, 'show']);
    Route::patch('/documentation/{id}/follow-up', [CaseDocumentationController::class, 'updateFollowUp']);
    Route::delete('/documentation/files/{fileId}', [CaseDocumentationController::class, 'deleteFile']);

    Route::get('/documents/download/{documentId}', [DocumentController::class, 'download']);

    Route::patch('/requests/{id}/follow-up', [RequestController::class, 'updateFollowUp']);

    Route::get('/proxy-image', function(\Illuminate\Http\Request $request) {
        $path = storage_path('app/public/' . $request->query('path'));
        if (!file_exists($path)) abort(404);
        $mime = mime_content_type($path);
        return response()->file($path, ['Content-Type' => $mime]);
    });


});