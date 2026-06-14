<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('room_code')->unique(); // Código para unirse a la sala (ej. AB12CD)
            $table->foreignId('white_player_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('black_player_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['waiting', 'playing', 'finished', 'draw', 'abandoned'])->default('waiting');
            $table->foreignId('winner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('fen')->default('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // FEN con el estado actual
            $table->string('turn', 5)->default('w'); // 'w' o 'b'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
