<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginService
{
    public function authenticate($email, $password)
    {
        $user = User::where("email", $email)->first();

        if(! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages(["email"=> "email is incorrect"]);
    }

    if(is_null($user->email_verified_at)){
        app(VerificationService::class)->generateAndSendOtp($user);
        return [
                'requires_verification' => true,
                'email' => $user->email
            ];
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return [
        'requires_verification' => false,
        'access_token' => $token,
        'user' => $user
    ];
}
}
