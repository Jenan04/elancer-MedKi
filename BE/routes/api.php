<?php

use App\Http\Controllers\Api\DeckController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\auth\RegisterController;
use App\Http\Controllers\auth\VerificationController;
use App\Http\Controllers\OauthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user/navbar', [UserController::class, 'navbarData'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/navbar', [UserController::class, 'navbarData']);
    // راوتس الـ CRUD الكاملة للـ Decks
    Route::post('decks/{deck}/cards', [DeckController::class, 'addCard']);
    Route::post('decks/{deck}/cards/import', [DeckController::class, 'importCsv']);
    
    Route::apiResource('decks', DeckController::class);
    
    // راوت مخصص للاشتراك في ديسك مشترك من يوزر آخر
    Route::post('decks/{deck}/subscribe', [DeckController::class, 'subscribe']);
});


Route::prefix('auth')->group(function () {
    
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);
   
    Route::post('/verify-otp', [VerificationController::class, 'verifyOtp']);
    Route::post('/resend-otp', [VerificationController::class, 'resendOtp']);

    Route::get('/google/redirect', [OauthController::class, 'redirectUrl']);
    Route::post('/google/callback', [OauthController::class, 'callback']);
});