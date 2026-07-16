<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['user_id',
        'title',
        'description',])]
class Deck extends Model
{
    use HasUuids;
    
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }


    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }


    public function subscribers(): BelongsToMany
    {
        return $table = $this->belongsToMany(User::class, 'deck_user')
            ->withPivot('deadline')
            ->withTimestamps()
            // when i need to return any timestimpe from pivot tbls i won't be able to read them only in string format so `using` that makes me able to make catsing
            // Using an anonymous Pivot class allows us to cast the custom 'deadline' pivot field 
            // into a native Carbon object instead of receiving it as a raw string.
        //     ->using(new class extends Pivot {
        //     protected $casts = ['deadline' => 'datetime'];
        // });
        ->using(DeckUser::class);
    }
}
