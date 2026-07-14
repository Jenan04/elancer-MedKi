<?php

use App\Http\Controllers\Api\DeckController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\auth\RegisterController;
use App\Http\Controllers\auth\VerificationController;
use App\Http\Controllers\CardRatingController;
use App\Http\Controllers\OauthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user/navbar', [UserController::class, 'navbarData'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/navbar', [UserController::class, 'navbarData']);


    Route::post('/cards/{card}/rate', [CardRatingController::class, 'rate']);
    
    Route::post('decks/{deck}/cards', [DeckController::class, 'addCard']);
    Route::post('decks/{deck}/cards/import', [DeckController::class, 'importCsv']);
    
    Route::post('/decks/{deck}/subscribe', [DeckController::class, 'subscribe']);
    
    Route::put('/decks/{deck}/deadline', [DeckController::class, 'updateDeadline']);
    
    Route::apiResource('decks', DeckController::class);
    
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