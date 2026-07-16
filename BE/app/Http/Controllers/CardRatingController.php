<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Services\SpacedRepetitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardRatingController extends Controller
{
    public function __construct(
        protected SpacedRepetitionService $spacedRepetitionService
    ) {}

    public function rate(Request $request, Card $card): JsonResponse
    {
        $request->validate([
            'rating' => 'required|in:again,hard,good,easy',
        ]);

        $user = auth()->user();
        $rating = $request->rating;

        $progress = $this->spacedRepetitionService->rateCard($card, $user, $rating);

        $hasCardsLeft = $this->spacedRepetitionService->hasRemainingCards($card->deck_id, $user->id);
        $deckCompleted = !$hasCardsLeft;

        $streakUpdated = false;
        if ($deckCompleted) {
            $streakUpdated = $this->spacedRepetitionService->updateUserStreak($user);
        }

        return response()->json([
            'success' => true,
            'message' => 'Rating saved successfully.',
            'due_at' => $progress->due_at->toIso8601String(),
            'deck_completed' => $deckCompleted,
            'streak_updated' => $streakUpdated,
            'current_streak' => $user->fresh()->streak_count,
        ]);
    }
}
