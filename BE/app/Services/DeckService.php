<?php

namespace App\Services;

use App\Models\Deck;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DeckService
{
    public function getUserDecks(): Collection
    {
        // return Auth::user()->subscribedDecks()->with('creator')->get();
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return $user->subscribedDecks()->with('creator')->withCount('cards')->get();
    }


    public function createDeck(array $data): Deck
    {
        return DB::transaction(function () use ($data) {
            $deck = Deck::create([
                'user_id' => Auth::id(),
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
            ]);

            $deck->subscribers()->attach(Auth::id(), [
                'deadline' => $data['deadline'] ?? null,
            ]);

            return $deck;
        });
    }


    public function updateDeck(Deck $deck, array $data): Deck
    {
        DB::transaction(function () use ($deck, $data) {
            if ($deck->user_id === Auth::id()) {
                $deck->update([
                    'title' => $data['title'],
                    'description' => $data['description'] ?? null,
                ]);
            }

            $deck->subscribers()->updateExistingPivot(Auth::id(), [
                'deadline' => $data['deadline'] ?? null,
            ]);
        });

        return $deck->load('creator');
    }


    public function deleteDeck(Deck $deck): bool
    {
        if ($deck->user_id !== Auth::id()) {
            $deck->subscribers()->detach(Auth::id());
            return true;
        }

        return $deck->delete();
    }

    public function subscribeToDeck(Deck $deck, ?string $deadline): void
    {
        $deck->subscribers()->syncWithoutDetaching([
            Auth::id() => ['deadline' => $deadline]
        ]);
    }

    public function addCardToDeck(Deck $deck, array $data)
    {
        $deck->increment('cards_count');

        return $deck->cards()->create([
            'front' => $data['front'],
            'back' => $data['back'],
        ]);
    }

    public function importCsvToDeck(Deck $deck, UploadedFile $file): void
    {
        if (($handle = fopen($file->getRealPath(), "r")) !== FALSE) {
            fgetcsv($handle, 1000, ",");
            
            $cardsData = [];
            
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                if (!empty($data[0]) && !empty($data[1])) {
                    $cardsData[] = [
                        'front' => $data[0],
                        'back' => $data[1],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            fclose($handle);

            if (!empty($cardsData)) {
                $deck->cards()->createMany($cardsData);

                $deck->increment('cards_count', count($cardsData));
            }
        }
    }
}
