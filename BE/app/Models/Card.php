<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['deck_id',
        'front',
        'back',]) ]
class Card extends Model
{
    use HasUuids;

    public function deck(): BelongsTo
    {
        return $this->belongsTo(Deck::class);
    }


    public function usersProgress(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'card_user')
        //     ->withPivot(['due_at', 'is_completed', 'box_level', 'ease_factor'])
        //     ->withTimestamps()
        //     ->using(new class extends Pivot {
        //     protected $casts = [
        //         'due_at' => 'datetime',
        //         'is_completed' => 'boolean',
        //         'ease_factor' => 'decimal:2'
        //     ];
        // });
        ->using(CardUser::class) 
                ->withPivot(['due_at', 'is_completed', 'box_level', 'ease_factor'])
                ->withTimestamps();

    }

    public function progress(): HasOne
    {
        return $this->hasOne(CardUser::class, 'card_id')
            ->where('user_id', auth()->id());
    }
}
