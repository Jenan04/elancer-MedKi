<?php

namespace App\Srevices;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
class OauthService
{
    public function getGoogleRedirectUrl(): string
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();
    }


// public function handleCallbackAndGetToken(string $code): array
// {
//     //     // Exchange the auth code for a Google user
// //     $googleUser = Socialite::driver('google')
// //         ->stateless()
// //         ->userFromCode($code); // ✅ correct method

//     $response = Http::post('https://oauth2.googleapis.com/token', [
//         'code'          => $code,
//         'client_id'     => config('services.google.client_id'),
//         'client_secret' => config('services.google.client_secret'),
//         'redirect_uri'  => config('services.google.redirect'),
//         'grant_type'    => 'authorization_code',
//     ]);

//     $accessToken = $response->json()['access_token'];

//     $googleUser = Socialite::driver('google')
//         ->stateless()
//         ->userFromToken($accessToken);

//     $user = User::firstOrCreate(
//         ['email' => $googleUser->getEmail()],
//         [
//             'name'              => $googleUser->getName(),
//             'google_id'         => $googleUser->getId(),
//             'slug'              => $this->generateSlug($googleUser->getName()),
//             // 'password'          => bcrypt(Str::random(24)),
//             'email_verified_at' => now(),
//         ]
//     );

//     return [
//         'user'  => $user,
//         'token' => $user->createToken('medki_auth_token')->plainTextToken,
//     ];
// }

public function handleCallbackAndGetToken(string $code): array
{
    request()->merge(['code' => $code]);

    $googleUser = Socialite::driver('google')
        ->stateless()
        ->user(); 

    $user = User::firstOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'name'              => $googleUser->getName(),
            'google_id'         => $googleUser->getId(),
            'slug'              => $this->generateSlug($googleUser->getName()),
            'email_verified_at' => now(),
        ]
    );

    return [
        'user'  => $user,
        'token' => $user->createToken('medki_auth_token')->plainTextToken,
    ];
}
private function generateSlug(string $name): string
{
    $slug = Str::slug($name);
    $count = User::where('slug', 'like', "{$slug}%")->count();
    
    return $count ? "{$slug}-{$count}" : $slug;
}

}
