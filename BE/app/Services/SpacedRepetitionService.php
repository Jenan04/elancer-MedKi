<?php

namespace App\Services;

use App\Models\Card;
use App\Models\CardUser;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SpacedRepetitionService
{
    public function rateCard(Card $card, User $user, string $rating): CardUser
    {

        $progress = DB::table('card_user')
        ->where('user_id', $user->id)
        ->where('card_id', $card->id)
        ->first();

    $quality = match ($rating) {
        'again' => 1,
        'hard'  => 3,
        'good'  => 4,
        'easy'  => 5,
    };

    $boxLevel = $progress ? (int)$progress->box_level : 1;
    $easeFactor = $progress ? (float)$progress->ease_factor : 2.50;
    $intervalDays = 1;

    if ($quality < 3) {
        $boxLevel = 1;
        $intervalDays = 1; 
    } else {
        if ($boxLevel === 1) {
            $intervalDays = 1;
        } elseif ($boxLevel === 2) {
            $intervalDays = 3;
        } else {
            $intervalDays = round(($boxLevel - 1) * 3 * $easeFactor);
        }
        $boxLevel++;
    }

    $easeFactor = $easeFactor + (0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02));
    if ($easeFactor < 1.3) {
        $easeFactor = 1.3;
    }

    $dueAt = Carbon::now()->addDays((int)$intervalDays);

    DB::table('card_user')->updateOrInsert(
        [
            'user_id' => $user->id,
            'card_id' => $card->id,
        ],
        [
            'box_level' => $boxLevel,
            'ease_factor' => $easeFactor,
            'due_at' => $dueAt,
            'is_completed' => $quality >= 3,
            'updated_at' => Carbon::now(),
        ]
    );

    return (object)[
        'due_at' => $dueAt
    ];
    }


    public function hasRemainingCards(string $deckId, string $userId): bool
    {
        $remainingCardsCount = Card::where('deck_id', $deckId)
            ->where(function ($query) use ($userId) {
                $query->whereDoesntHave('progress') // كروت لم تدرس بعد من هذا اليوزر
                ->orWhereHas('progress', function ($q) {
                    $q->where('due_at', '<=', Carbon::now()); // أو كروت حان موعد مراجعتها
                });
            })
            ->count();

        return $remainingCardsCount > 0;
    }


    public function updateUserStreak(User $user): bool
    {
        $today = Carbon::today();
        $lastStudied = $user->last_studied_at ? Carbon::parse($user->last_studied_at)->startOfDay() : null;

        if ($lastStudied && $lastStudied->equalTo($today)) {
            return false;
        }

        if ($lastStudied && $lastStudied->equalTo($today->copy()->subDay())) {
            $user->increment('streak_count');
        } else {
            $user->update(['streak_count' => 1]);
        }

        $user->update(['last_studied_at' => Carbon::now()]);

        return true;
    }
}
