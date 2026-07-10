<?php

use App\Http\Controllers\auth\LoginController;
use App\Http\Controllers\auth\RegisterController;
use App\Http\Controllers\auth\VerificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);
   
    Route::post('/verify-otp', [VerificationController::class, 'verifyOtp']);
    Route::post('/resend-otp', [VerificationController::class, 'resendOtp']);
});