<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(
    'user_id',
    'card_id',
    'due_at',
    'is_completed',
    'box_level',
    'ease_factor',
)]
class CardUser extends Pivot
{
    protected $table = 'card_user';

    protected $primaryKey = ['user_id', 'card_id'];
    public $incrementing = false;
    protected $casts = [
        'due_at' => 'datetime',
        'is_completed' => 'boolean',
        'ease_factor' => 'float'
    ];
}