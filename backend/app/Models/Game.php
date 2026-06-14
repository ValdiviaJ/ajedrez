<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_code',
        'white_player_id',
        'black_player_id',
        'status',
        'winner_id',
        'fen',
        'turn',
    ];

    public function whitePlayer()
    {
        return $this->belongsTo(User::class, 'white_player_id');
    }

    public function blackPlayer()
    {
        return $this->belongsTo(User::class, 'black_player_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    public function moves()
    {
        return $this->hasMany(Move::class)->orderBy('move_number', 'asc');
    }
}
