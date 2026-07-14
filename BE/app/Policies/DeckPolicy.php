<?php

namespace App\Policies;

use App\Models\Deck;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DeckPolicy
{
   

    public function update(User $user, Deck $deck): bool
    {
        return $user->id === $deck->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Deck $deck): bool
    {
        return $user->id === $deck->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Deck $deck): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Deck $deck): bool
    {
        return false;
    }
}
