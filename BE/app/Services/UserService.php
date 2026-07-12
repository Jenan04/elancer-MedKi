<?php

namespace App\Services;

use App\Models\User;

class UserService
{
    public function getNavbarData(User $user): array
    {
        // $dueCardsCount = $user->cards()
        //     ->where('due_at', '<=', now())
        //     ->where('is_completed', false)
        //     ->count();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'stats' => [
                'streakCount' => $user->streak_count,
                'dueCardsCount' => 0,
            ]
        ];
    }
}
