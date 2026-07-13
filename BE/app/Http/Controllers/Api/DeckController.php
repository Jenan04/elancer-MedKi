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
        return Response::json([
            'data' => $deck->loadCount('cards')->load(['creator', 'cards'])
        ]);
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
}
