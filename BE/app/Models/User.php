<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


#[Fillable(['name', 'email', 'slug', 'password', 'google_id', 'email_verified_at', 'streak_count','last_studied_at',])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_studied_at' => 'datetime',
        ];
    }

    public function createdDecks(): HasMany
{
    return $this->hasMany(Deck::class, 'user_id');
}


public function subscribedDecks(): BelongsToMany
{
    return $this->belongsToMany(Deck::class, 'deck_user')
        ->withPivot('deadline')
        ->withTimestamps()
        // ->using(new class extends Pivot {
        //     protected $casts = ['deadline' => 'datetime'];
        // });
        ->using(DeckUser::class);
}
}
