<?php

namespace App\Http\Controllers;

use App\Http\Requests\OauthRequest;
use App\Srevices\OauthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OauthController extends Controller
{
     public function __construct(
        private readonly OauthService $oauthService
    ) {}

    public function redirectUrl(): JsonResponse
    {
        return response()->json([
            'url' => $this->oauthService->getGoogleRedirectUrl(),
        ]);
    }

    public function callback(OauthRequest $request): JsonResponse
    {
        try {
            $result = $this->oauthService->handleCallbackAndGetToken(
                $request->validated('code')
            );

            return response()->json([
                'token' => $result['token'],
                'user'  => $result['user'],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'OAuth authentication failed.',
            ], 401);
        }
    }
}
