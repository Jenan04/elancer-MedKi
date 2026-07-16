<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\SendOtpNotification;
use BcMath\Number;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class VerificationService 
{
    public function generateAndSendOtp(User $user): void
    {
        $cacheKey = "user_otp_" . $user->id;
        $requestLimitKey = "otp_request_limit_" . $user->id;

        if (RateLimiter::tooManyAttempts($requestLimitKey, 1)) {
            $seconds = RateLimiter::availableIn($requestLimitKey);
            throw ValidationException::withMessages([
                'otp' => "Please wait {$seconds} seconds before requesting a new code."
            ]);
        }

        $plainOtp = random_int(100000, 999999);

        Cache::put($cacheKey, $plainOtp, now()->addMinutes(2));

        RateLimiter::hit($requestLimitKey, 60);
        $user->notify(new SendOtpNotification($plainOtp));
    }
    public function verifyOtp(User $user, $submitedOtp): bool
    {
        $cacheKey = "user_otp_" . $user->id;
        $inputLimitKey = "otp_input_limit_" . $user->id;

        if (RateLimiter::tooManyAttempts($inputLimitKey, 5)) {
            $minutes = ceil(RateLimiter::availableIn($inputLimitKey) / 60);
            throw ValidationException::withMessages([
                'otp' => "Too many incorrect attempts. Please try again after {$minutes} minutes."
            ]);
        }

        $currentOtp = Cache::get($cacheKey);

        if (!$currentOtp) {
            throw ValidationException::withMessages([
                'otp' => "Your OTP has expired or is invalid. Please request a new one."
            ]);
        }

        if ($currentOtp != $submitedOtp) {
            RateLimiter::hit($inputLimitKey, 900); 

            $remaining = RateLimiter::remaining($inputLimitKey, 5);
            throw ValidationException::withMessages([
                'otp' => "Incorrect OTP code. You have {$remaining} attempts left."
            ]);
        }

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        $requestLimitKey = "otp_request_limit_" . $user->id;

        Cache::forget($cacheKey);
        RateLimiter::clear($inputLimitKey);
        RateLimiter::clear($requestLimitKey);

        return true;
    }
}