<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Deck;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeckTest extends TestCase
{
    use RefreshDatabase;


    public function test_user_can_fetch_their_owned_and_subscribed_decks(): void
    {
        $user = User::factory()->create();
        
        // المالك الحقيقي للديكس
        $ownedDeck = Deck::factory()->create(['user_id' => $user->id]);
        $user->subscribedDecks()->attach($ownedDeck->id);
        
        $subscribedDeck = Deck::factory()->create();
        $user->subscribedDecks()->attach($subscribedDeck->id);

        $response = $this->actingAs($user)
                         ->getJson('/api/decks');

        $response->assertStatus(200);
        
        $responseData = $response->json('data') ?? $response->json();
        
        $deckIds = collect($responseData)->pluck('id')->toArray();

        $this->assertContains($ownedDeck->id, $deckIds);
        $this->assertContains($subscribedDeck->id, $deckIds);
    }


    public function test_user_cannot_update_a_deck_they_do_not_own(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        
        $deck = Deck::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($attacker)
                         ->putJson("/api/decks/{$deck->id}", [
                             'title' => 'Hacked Title'
                         ]);

        $this->assertDatabaseMissing('decks', [
            'id' => $deck->id,
            'title' => 'Hacked Title'
        ]);
    }


    public function test_owner_can_delete_the_deck_completely(): void
    {
        $owner = User::factory()->create();
        $deck = Deck::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($owner)
                         ->deleteJson("/api/decks/{$deck->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('decks', ['id' => $deck->id]);
    }


    public function test_subscriber_deleting_a_deck_only_detaches_relations(): void
    {
        $owner = User::factory()->create();
        $subscriber = User::factory()->create();
        
        $deck = Deck::factory()->create(['user_id' => $owner->id]);
        $subscriber->subscribedDecks()->attach($deck->id);

        $response = $this->actingAs($subscriber)
                         ->deleteJson("/api/decks/{$deck->id}");

        $response->assertStatus(200);
        $this->assertDatabaseHas('decks', ['id' => $deck->id]);
        $this->assertDatabaseMissing('deck_user', [
            'user_id' => $subscriber->id,
            'deck_id' => $deck->id
        ]);
    }
}