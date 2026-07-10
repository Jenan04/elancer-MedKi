<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\VerifyOtpRequest;
use App\Models\User;
use App\Services\VerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function __construct(
        protected VerificationService $verificationService
    ) {}

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->firstOrFail();

        $isVerified = $this->verificationService->verifyOtp($user, $request->otp);

        if (!$isVerified) {
            return response()->json([
                'message' => 'Invalid or expired OTP',
            ], 400);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'User verified and authenticated successfully',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 200);
    }

    public function resendOtp(Request $request): JsonResponse
{
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found.'], 404);
    }

    if ($user->email_verified_at) {
        return response()->json(['message' => 'Account is already verified.'], 400);
    }

    $this->verificationService->generateAndSendOtp($user);

    return response()->json([
        'message' => 'A new OTP has been sent to your email.'
    ], 200);
}
}
