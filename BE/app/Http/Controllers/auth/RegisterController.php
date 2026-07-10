<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Services\RegisterService;
use App\Services\VerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegisterController extends Controller
{
    public function __construct(
        protected RegisterService $registerService,
        protected VerificationService $verificationService
    ) {}

    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $user = $this->registerService->register($request->validated());

        // $token = $user->createToken('auth_token')->plainTextToken;
        $this->verificationService->generateAndSendOtp($user);

        return response()->json([
            'message'      => 'User registered successfully',
            // 'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user
        ], 200);
    }

}
