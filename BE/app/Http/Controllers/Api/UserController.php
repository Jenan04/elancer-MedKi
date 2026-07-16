<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    protected UserService $userService;
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function navbarData(Request $request): JsonResponse
    {
        $user = Auth::user();

        $userData = $this->userService->getNavbarData($user);

        return response()->json([
            'status' => 'success',
            'data' => $userData
        ], 200);
    }
}
