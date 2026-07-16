<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\LoginService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function __construct(
        protected LoginService $loginService
    ) {}

    public function __invoke(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $result = $this->loginService->authenticate(
           $credentials['email'], 
            $credentials['password']        
        );

        if ($result['requires_verification']) {
            return response()->json([
                'message' => 'Account not verified. OTP sent.',
                'requires_verification' => true,
                'email' => $result['email']
            ], 403);
        }

        return response()->json([
            'message'      => 'Logged in successfully',
            'access_token' => $result['access_token'],
            'token_type'   => 'Bearer',
            'user'         => $result['user']
        ], 200);
    }
}
