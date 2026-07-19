<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deck;
use App\Services\DeckService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class DeckController extends Controller
{
    public function __construct(
        protected DeckService $deckService
    ) {}

    public function index(): JsonResponse
    {
        $decks = $this->deckService->getUserDecks();
        return Response::json(['data' => $decks]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date|after:now',
        ]);

        $deck = $this->deckService->createDeck($validated);

        return Response::json([
            'message' => 'Deck created successfully',
            'data' => $deck
        ], 201);
    }

    public function show(Deck $deck): JsonResponse
    {

        $userId = auth()->id(); 
        $deck->loadCount('cards')->load([
            'creator', 
            'cards.usersProgress' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }
        ]);


    $cardsTransformed = $deck->cards->map(function ($card) {
        $progress = $card->usersProgress->first();

        return [
            'id' => $card->id,
            'front' => $card->front,
            'back' => $card->back,
            'userRating' => $progress ? $this->getRatingLabelFromBoxLevel($progress->pivot->box_level) : null,
            'due_at' => $progress ? $progress->pivot->due_at : null,
        ];
    });

    return Response::json([
        'data' => [
            'id' => $deck->id,
            'user_id' => $deck->user_id,
            'title' => $deck->title,
            'description' => $deck->description,
            'deadline' => $deck->deadline,
            'creator' => $deck->creator,
            'cards_count' => $deck->cards_count,
            'cards' => $cardsTransformed 
        ]
    ]);
    }

private function getRatingLabelFromBoxLevel(int $boxLevel): string
{
    return match ($boxLevel) {
        1 => 'again',
        2 => 'hard',
        3 => 'good',
        default => 'easy', 
    };
}

    public function update(Request $request, Deck $deck): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date|after:now',
        ]);

        $updatedDeck = $this->deckService->updateDeck($deck, $validated);

        return Response::json([
            'message' => 'Deck updated successfully',
            'data' => $updatedDeck
        ]);
    }

    public function destroy(Deck $deck): JsonResponse
    {
        $this->deckService->deleteDeck($deck);

        return Response::json([
            'message' => 'Deck removed successfully'
        ]);
    }


    public function subscribe(Request $request, Deck $deck): JsonResponse
    {
        $validated = $request->validate([
            'deadline' => 'nullable|date|after:now',
        ]);

        $this->deckService->subscribeToDeck($deck, $validated['deadline'] ?? null);

        return Response::json([
            'message' => 'Deck added to your space successfully'
        ]);
    }


    public function updateDeadline(Request $request, Deck $deck): JsonResponse
    {
        $validated = $request->validate([
            'deadline' => 'required|date|after:now',
        ]);

        $this->deckService->updateSubscriberDeadline($deck, $validated['deadline']);

        return Response::json([
            'message' => 'Deadline updated successfully for this deck.'
        ]);
    }
    public function addCard(Request $request, Deck $deck): JsonResponse
    {
        if ($request->user()->id !== $deck->user_id) {
            return Response::json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'front' => 'required|string',
            'back' => 'required|string',
        ]);

        $card = $this->deckService->addCardToDeck($deck, $validated);

        return Response::json([
            'message' => 'Card added successfully',
            'data' => $card
        ], 201);
    }


    public function importCsv(Request $request, Deck $deck): JsonResponse
    {
        if ($request->user()->id !== $deck->user_id) {
            return Response::json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $this->deckService->importCsvToDeck($deck, $request->file('file'));

        return Response::json([
            'message' => 'CSV imported successfully'
        ]);
    }

    public function importFromUrl(Request $request, Deck $deck): JsonResponse
    {
        if ($request->user()->id !== $deck->user_id) {
            return Response::json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file_url' => 'required_without:file_id|url',
            'file_id' => 'required_without:file_url|exists:upload_files,id'
        ]);

        $fileUrl = $request->input('file_url');

        if (!$fileUrl && $request->has('file_id')) {
            $uploadFile = \App\Models\UploadFile::find($request->input('file_id'));
            
            if ($uploadFile->user_id !== $request->user()->id) {
                return Response::json(['message' => 'Unauthorized access to file'], 403);
            }

            $fileUrl = $uploadFile->csv_file_url;

            if (!$fileUrl) {
                return Response::json(['message' => 'File is not ready for import.'], 400);
            }
        }

        try {
            $this->deckService->importFromUrlToDeck($deck, $fileUrl);
        } catch (\Exception $e) {
            return Response::json(['message' => $e->getMessage()], 500);
        }

        return Response::json([
            'message' => 'Flashcards imported successfully from Library'
        ]);
    }
}
