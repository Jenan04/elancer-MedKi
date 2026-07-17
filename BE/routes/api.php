<?php

use App\Http\Controllers\Api\DeckController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\auth\RegisterController;
use App\Http\Controllers\auth\VerificationController;
use App\Http\Controllers\CardRatingController;
use App\Http\Controllers\OauthController;
use App\Http\Controllers\CloudinaryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/cloudinary/signature', [CloudinaryController::class, 'generateSignature']);

// Route::get('/user/navbar', [UserController::class, 'navbarData'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/navbar', [UserController::class, 'navbarData']);

    Route::post('/documents', [FileUploadController::class, 'registerDocument']);

    Route::post('/cards/{card}/rate', [CardRatingController::class, 'rate']);
    
    Route::post('decks/{deck}/cards', [DeckController::class, 'addCard']);
    Route::post('decks/{deck}/cards/import', [DeckController::class, 'importCsv']);
    Route::post('decks/{deck}/import-csv', [DeckController::class, 'importCsv']);
    Route::post('decks/{deck}/import-from-url', [DeckController::class, 'importFromUrl']);
    
    Route::post('/decks/{deck}/subscribe', [DeckController::class, 'subscribe']);
    
    Route::put('/decks/{deck}/deadline', [DeckController::class, 'updateDeadline']);
    
    Route::apiResource('decks', DeckController::class);
    
    // Route::post('decks/{deck}/subscribe', [DeckController::class, 'subscribe']);

    Route::post('/files/upload', [FileUploadController::class, 'uploadGeneric']);
    Route::get('/files', [FileUploadController::class, 'index']);
    Route::get('/user/files', [FileUploadController::class, 'userFiles']);
    
    Route::get('/files/{file}', [FileUploadController::class, 'show']);
    
    Route::post('/files/{file}/convert', [FileUploadController::class, 'convert']);


});


Route::prefix('auth')->group(function () {
    
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);
   
    Route::post('/verify-otp', [VerificationController::class, 'verifyOtp']);
    Route::post('/resend-otp', [VerificationController::class, 'resendOtp']);

    Route::get('/google/redirect', [OauthController::class, 'redirectUrl']);
    Route::post('/google/callback', [OauthController::class, 'callback']);
});

Route::get('/files/{file}/download', [FileUploadController::class, 'download']);