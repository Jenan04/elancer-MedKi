<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterService 
{
    public function register(array $data): User    
    {
        $user = User::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            // if the pass is exist make hash for it ,if doesn't have (user sign with google, google id) = null
            'password' => isset($data['password']) ? Hash::make($data['password']) : null,
            'google_id' => $data['google_id'] ?? null,
        ]);

    }
}