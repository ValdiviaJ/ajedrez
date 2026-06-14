<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Move;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GameController extends Controller
{
    // Crear una nueva sala de ajedrez
    public function createRoom(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'color' => 'required|in:white,black,random'
        ]);

        $user = User::find($request->user_id);
        $color = $request->color;
        if ($color === 'random') {
            $color = rand(0, 1) ? 'white' : 'black';
        }

        $roomCode = strtoupper(Str::random(6));

        $game = Game::create([
            'room_code' => $roomCode,
            'white_player_id' => $color === 'white' ? $user->id : null,
            'black_player_id' => $color === 'black' ? $user->id : null,
            'status' => 'waiting',
            'fen' => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'turn' => 'w'
        ]);

        return response()->json([
            'message' => 'Sala creada exitosamente',
            'game' => $game->load(['whitePlayer', 'blackPlayer'])
        ], 201);
    }

    // Unirse a una sala existente
    public function joinRoom(Request $request)
    {
        $request->validate([
            'room_code' => 'required|string',
            'user_id' => 'required|exists:users,id'
        ]);

        $game = Game::where('room_code', strtoupper($request->room_code))
            ->whereIn('status', ['waiting', 'playing'])
            ->first();

        if (!$game) {
            return response()->json(['message' => 'Sala no encontrada o inactiva'], 404);
        }

        $userId = $request->user_id;

        // Si ya está en la sala, simplemente devolver el estado de la partida
        if ($game->white_player_id == $userId || $game->black_player_id == $userId) {
            return response()->json([
                'message' => 'Ya eres parte de esta sala',
                'game' => $game->load(['whitePlayer', 'blackPlayer', 'moves'])
            ]);
        }

        // Asignar el asiento libre
        if (!$game->white_player_id) {
            $game->white_player_id = $userId;
        } elseif (!$game->black_player_id) {
            $game->black_player_id = $userId;
        } else {
            return response()->json(['message' => 'La sala ya está llena'], 400);
        }

        $game->status = 'playing';
        $game->save();

        return response()->json([
            'message' => 'Te has unido a la sala',
            'game' => $game->load(['whitePlayer', 'blackPlayer', 'moves'])
        ]);
    }

    // Consultar el estado de la partida en tiempo real (Polled from Frontend)
    public function show($roomCode)
    {
        $game = Game::where('room_code', strtoupper($roomCode))->first();

        if (!$game) {
            return response()->json(['message' => 'Partida no encontrada'], 404);
        }

        return response()->json([
            'game' => $game->load(['whitePlayer', 'blackPlayer', 'moves'])
        ]);
    }

    // Registrar un movimiento
    public function makeMove(Request $request, $roomCode)
    {
        $request->validate([
            'player_id' => 'required|exists:users,id',
            'from' => 'required|string|size:2',
            'to' => 'required|string|size:2',
            'fen_after' => 'required|string',
            'san' => 'nullable|string',
            'turn_after' => 'required|string|in:w,b'
        ]);

        $game = Game::where('room_code', strtoupper($roomCode))
            ->where('status', 'playing')
            ->first();

        if (!$game) {
            return response()->json(['message' => 'Partida no activa'], 404);
        }

        // Validar que sea el turno del jugador correcto
        $isWhite = $game->white_player_id == $request->player_id;
        $isBlack = $game->black_player_id == $request->player_id;

        if (!$isWhite && !$isBlack) {
            return response()->json(['message' => 'No perteneces a esta partida'], 403);
        }

        if (($game->turn === 'w' && !$isWhite) || ($game->turn === 'b' && !$isBlack)) {
            return response()->json(['message' => 'No es tu turno'], 400);
        }

        // Registrar jugada
        $moveNumber = $game->moves()->count() + 1;
        Move::create([
            'game_id' => $game->id,
            'player_id' => $request->player_id,
            'from' => $request->from,
            'to' => $request->to,
            'san' => $request->san,
            'fen_after' => $request->fen_after,
            'move_number' => $moveNumber
        ]);

        // Actualizar estado de la partida
        $game->fen = $request->fen_after;
        $game->turn = $request->turn_after;
        $game->save();

        return response()->json([
            'message' => 'Movimiento registrado',
            'game' => $game->load(['whitePlayer', 'blackPlayer', 'moves'])
        ]);
    }

    // Finalizar partida (Jaque Mate, Tablas o Abandono)
    public function finishGame(Request $request, $roomCode)
    {
        $request->validate([
            'status' => 'required|in:finished,draw,abandoned',
            'winner_id' => 'nullable|exists:users,id'
        ]);

        $game = Game::where('room_code', strtoupper($roomCode))->first();

        if (!$game) {
            return response()->json(['message' => 'Partida no encontrada'], 404);
        }

        $game->status = $request->status;
        if ($request->winner_id) {
            $game->winner_id = $request->winner_id;

            // Actualizar ELO
            $winner = User::find($request->winner_id);
            $loserId = ($game->white_player_id == $winner->id) ? $game->black_player_id : $game->white_player_id;

            if ($loserId) {
                $loser = User::find($loserId);
                $winner->elo_rating += 15;
                $loser->elo_rating = max(100, $loser->elo_rating - 15);
                $winner->save();
                $loser->save();
            }
        }
        $game->save();

        return response()->json([
            'message' => 'Partida finalizada',
            'game' => $game->load(['whitePlayer', 'blackPlayer', 'moves'])
        ]);
    }
}
