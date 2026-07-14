<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
class DeckUser extends Pivot
{
    protected $table = 'deck_user';

    protected $casts = [
        'deadline' => 'datetime',
    ];
}
