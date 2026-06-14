import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessPieces } from './components/ChessPieces';
import { Play, LogIn, Award, UserPlus, LogOut, ArrowRight, RotateCcw, Clock, Trophy, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function App() {
  // Estados de Autenticación
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Estados del Juego
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameMode, setGameMode] = useState(null); // 'local', 'ai', 'multiplayer'
  const [playerColor, setPlayerColor] = useState('white'); // 'white' o 'black' en multiplayer/ai
  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [gameState, setGameState] = useState('setup'); // 'setup', 'waiting', 'playing', 'finished'
  const [gameId, setGameId] = useState(null);
  const [turn, setTurn] = useState('w');
  const [movesHistory, setMovesHistory] = useState([]);
  const [opponentName, setOpponentName] = useState('Oponente');
  const [aiDifficulty, setAiDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'

  // Reloj
  const [timers, setTimers] = useState({ w: 600, b: 600 });

  // ---------------------------------------------------------------------------
  // Autenticación e Información de Perfil
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (token) {
      fetchUser();
    }
    fetchLeaderboard();
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegister ? '/register' : '/login';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
      } else {
        setAuthError(data.message || 'Error en la autenticación');
      }
    } catch (err) {
      setAuthError('Error de red al conectar al servidor');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // ---------------------------------------------------------------------------
  // Temporizadores
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimers((prev) => {
        const activeColor = turn === 'w' ? 'w' : 'b';
        if (prev[activeColor] <= 1) {
          clearInterval(interval);
          handleTimeOut(activeColor === 'w' ? 'b' : 'w'); // Gana el otro color
          return { ...prev, [activeColor]: 0 };
        }
        return { ...prev, [activeColor]: prev[activeColor] - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, turn]);

  const handleTimeOut = (winnerColor) => {
    setGameState('finished');
    if (gameMode === 'multiplayer' && gameId) {
      const winnerId = winnerColor === 'white' ? user.id : null; // Simplificación
      fetch(`${API_URL}/games/${roomCode}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'finished', winner_id: winnerId })
      });
    }
    alert(`¡Tiempo agotado! Ganador: ${winnerColor === 'white' ? 'Blancas' : 'Negras'}`);
  };

  // ---------------------------------------------------------------------------
  // Long Polling para Multijugador
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (gameMode !== 'multiplayer' || !roomCode || gameState === 'finished') return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/games/${roomCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const { game } = await res.json();
          
          // Actualizar oponente
          if (playerColor === 'white' && game.black_player) {
            setOpponentName(game.black_player.name);
          } else if (playerColor === 'black' && game.white_player) {
            setOpponentName(game.white_player.name);
          }

          // Iniciar partida si se llena la sala
          if (game.status === 'playing' && gameState === 'waiting') {
            setGameState('playing');
          }

          // Sincronizar movimientos si el turno cambió
          if (game.fen !== chess.fen()) {
            chess.load(game.fen);
            setBoard(chess.board());
            setTurn(game.turn);
            setMovesHistory(game.moves || []);
            if (chess.isGameOver()) {
              setGameState('finished');
            }
          }
        }
      } catch (err) {
        console.error("Error sincronizando sala:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [gameMode, roomCode, gameState, turn]);

  // ---------------------------------------------------------------------------
  // Lógica del Tablero y Movimientos
  // ---------------------------------------------------------------------------
  const getSquareName = (row, col) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  };

  const handleSquareClick = (row, col) => {
    if (gameState !== 'playing') return;
    
    // En multijugador, evitar mover las piezas del oponente
    if (gameMode === 'multiplayer') {
      const activeTurnColor = turn === 'w' ? 'white' : 'black';
      if (activeTurnColor !== playerColor) return; // No es tu turno
    }

    const squareName = getSquareName(row, col);
    const piece = board[row][col];

    // Si ya hay una pieza seleccionada y hacemos clic en un movimiento posible
    if (selectedSquare && possibleMoves.includes(squareName)) {
      executeMove(selectedSquare, squareName);
      return;
    }

    // Seleccionar una pieza del turno activo
    if (piece && piece.color === turn) {
      setSelectedSquare(squareName);
      const moves = chess.moves({ square: squareName, verbose: true });
      setPossibleMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const executeMove = async (from, to) => {
    try {
      const move = chess.move({ from, to, promotion: 'q' });
      if (!move) return;

      // Actualizar visualmente de inmediato
      setBoard(chess.board());
      setSelectedSquare(null);
      setPossibleMoves([]);
      const newTurn = chess.turn();
      setTurn(newTurn);
      setMovesHistory(prev => [...prev, { from, to, san: move.san }]);

      // Verificar fin de partida local
      if (chess.isGameOver()) {
        setGameState('finished');
        let msg = 'Fin de la partida';
        if (chess.isCheckmate()) msg = '¡Jaque Mate!';
        else if (chess.isDraw()) msg = 'Tablas / Empate';
        alert(msg);
        return;
      }

      // 1. Modo Multijugador -> Mandar jugada al Servidor
      if (gameMode === 'multiplayer' && roomCode) {
        await fetch(`${API_URL}/games/${roomCode}/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            player_id: user.id,
            from,
            to,
            fen_after: chess.fen(),
            san: move.san,
            turn_after: newTurn
          })
        });
      }

      // 2. Modo IA -> Responder con algoritmo sencillo de ajedrez
      if (gameMode === 'ai' && newTurn === 'b') {
        setTimeout(makeAiMove, 600);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // Algoritmo de IA Básica (Movimiento aleatorio o captura sencilla)
  const makeAiMove = () => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return;

    let selectedMove = moves[0];
    if (aiDifficulty === 'easy') {
      // Movimiento aleatorio
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    } else {
      // Priorizar capturas
      const captures = moves.filter(m => m.flags.includes('c'));
      if (captures.length > 0) {
        selectedMove = captures[Math.floor(Math.random() * captures.length)];
      } else {
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
      }
    }

    chess.move({ from: selectedMove.from, to: selectedMove.to, promotion: 'q' });
    setBoard(chess.board());
    setTurn(chess.turn());
    setMovesHistory(prev => [...prev, { from: selectedMove.from, to: selectedMove.to, san: selectedMove.san }]);

    if (chess.isGameOver()) {
      setGameState('finished');
      alert(chess.isCheckmate() ? '¡La IA te ha ganado!' : 'Empate contra la IA');
    }
  };

  // ---------------------------------------------------------------------------
  // Creación y Unirse a Salas Multiplayer
  // ---------------------------------------------------------------------------
  const startMultiplayerGame = async (color) => {
    if (!token) {
      alert('Debes iniciar sesión para jugar en modo multijugador');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, color })
      });
      if (res.ok) {
        const data = await res.json();
        setRoomCode(data.game.room_code);
        setGameId(data.game.id);
        setPlayerColor(color === 'random' ? 'white' : color);
        setGameState('waiting');
        setTimers({ w: 600, b: 600 });
        chess.reset();
        setBoard(chess.board());
      }
    } catch (err) {
      alert('Error de conexión al servidor de juegos');
    }
  };

  const joinMultiplayerGame = async () => {
    if (!token) {
      alert('Debes iniciar sesión para unirte a una partida');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/games/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ room_code: inputRoomCode, user_id: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setRoomCode(data.game.room_code);
        setGameId(data.game.id);
        setPlayerColor(data.game.white_player_id == user.id ? 'white' : 'black');
        chess.load(data.game.fen);
        setBoard(chess.board());
        setTurn(data.game.turn);
        setGameState('playing');
        setTimers({ w: 600, b: 600 });
      } else {
        alert(data.message || 'No se pudo unir a la sala');
      }
    } catch (err) {
      alert('Error al conectar a la sala');
    }
  };

  // Iniciar Modo Local / IA
  const startLocalGame = (mode) => {
    setGameMode(mode);
    setGameState('playing');
    setTimers({ w: 600, b: 600 });
    chess.reset();
    setBoard(chess.board());
    setMovesHistory([]);
    setTurn('w');
  };

  const formatTime = (timeInSecs) => {
    const m = Math.floor(timeInSecs / 60);
    const s = timeInSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="app-container">
      {/* 1. Header/Navbar */}
      <header className="navbar">
        <div className="logo-section">
          <div className="neon-sphere"></div>
          <h1>CHESS<span className="neon-accent">NEON</span></h1>
        </div>
        
        <div className="user-control">
          {user ? (
            <div className="user-profile">
              <span className="user-name">{user.name}</span>
              <span className="user-elo">🏆 {user.elo_rating} ELO</span>
              <button onClick={logout} className="btn-logout"><LogOut size={16} /></button>
            </div>
          ) : (
            <button onClick={() => setIsRegister(prev => !prev)} className="btn-login-toggle">
              {isRegister ? <LogIn size={16} /> : <UserPlus size={16} />}
              {isRegister ? 'Ir a Login' : 'Registrarse'}
            </button>
          )}
        </div>
      </header>

      {/* Cuerpo principal */}
      <div className="main-content">
        
        {/* Panel Izquierdo: Formularios de Acceso o Ranking */}
        <aside className="sidebar-left">
          {!user ? (
            <div className="neon-card auth-card">
              <h3>{isRegister ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}</h3>
              <form onSubmit={handleAuth}>
                {isRegister && (
                  <div className="input-group">
                    <label>Nombre</label>
                    <input 
                      type="text" 
                      value={authForm.name} 
                      onChange={e => setAuthForm({...authForm, name: e.target.value})} 
                      required 
                    />
                  </div>
                )}
                <div className="input-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={authForm.email} 
                    onChange={e => setAuthForm({...authForm, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <input 
                    type="password" 
                    value={authForm.password} 
                    onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                    required 
                  />
                </div>
                {authError && <p className="error-text">{authError}</p>}
                <button type="submit" className="btn-submit">
                  {isRegister ? 'Registrarse' : 'Ingresar'}
                </button>
              </form>
            </div>
          ) : (
            <div className="neon-card ranking-card">
              <h3><Trophy size={18} className="icon-gold" /> MEJORES JUGADORES</h3>
              <ul className="leaderboard-list">
                {leaderboard.map((player, idx) => (
                  <li key={player.id} className={player.id === user.id ? 'current-user' : ''}>
                    <span className="rank-num">#{idx + 1}</span>
                    <span className="rank-name">{player.name}</span>
                    <span className="rank-elo">{player.elo_rating}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Selector de Modos de Juego */}
          <div className="neon-card modes-card">
            <h3>SELECCIONAR MODO</h3>
            <div className="modes-grid">
              <button className="btn-mode" onClick={() => startLocalGame('local')}>
                <Play size={16} /> Local Versus
              </button>
              
              <button className="btn-mode" onClick={() => {
                setGameMode('ai');
                startLocalGame('ai');
              }}>
                🤖 Jugar vs IA
              </button>

              {gameMode === 'ai' && (
                <div className="difficulty-selector">
                  <button className={aiDifficulty === 'easy' ? 'active' : ''} onClick={() => setAiDifficulty('easy')}>Fácil</button>
                  <button className={aiDifficulty === 'hard' ? 'active' : ''} onClick={() => setAiDifficulty('hard')}>Difícil</button>
                </div>
              )}

              {user && (
                <div className="multiplayer-controls">
                  <h4>SALA MULTIJUGADOR</h4>
                  <div className="btn-group-row">
                    <button className="btn-mini" onClick={() => { setGameMode('multiplayer'); startMultiplayerGame('white'); }}>Blancas</button>
                    <button className="btn-mini" onClick={() => { setGameMode('multiplayer'); startMultiplayerGame('black'); }}>Negras</button>
                  </div>
                  
                  <div className="join-group">
                    <input 
                      placeholder="CÓDIGO DE SALA" 
                      value={inputRoomCode} 
                      onChange={e => setInputRoomCode(e.target.value)} 
                    />
                    <button onClick={() => { setGameMode('multiplayer'); joinMultiplayerGame(); }}><ChevronRight size={18} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Panel Central: Tablero de Ajedrez */}
        <section className="board-container">
          
          {/* Reloj Oponente */}
          <div className={`player-bar top ${turn === 'b' ? 'active-turn' : ''}`}>
            <span className="player-title">
              {gameMode === 'multiplayer' ? opponentName : (gameMode === 'ai' ? '🤖 Inteligencia Artificial' : 'Jugador 2 (Negras)')}
            </span>
            <div className="reloj"><Clock size={16} /> {formatTime(timers.b)}</div>
          </div>

          {/* El Tablero */}
          <div className="chess-board-wrapper">
            <div className="chess-board">
              {board.map((row, rIdx) => 
                row.map((piece, cIdx) => {
                  const squareName = getSquareName(rIdx, cIdx);
                  const isDark = (rIdx + cIdx) % 2 === 1;
                  const isSelected = selectedSquare === squareName;
                  const isPossible = possibleMoves.includes(squareName);

                  return (
                    <div 
                      key={squareName} 
                      onClick={() => handleSquareClick(rIdx, cIdx)}
                      className={`board-cell ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isPossible ? 'possible-move' : ''}`}
                    >
                      {piece && ChessPieces[`${piece.color}${piece.type}`]}
                      {isPossible && <div className="move-dot"></div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reloj Jugador Principal */}
          <div className={`player-bar bottom ${turn === 'w' ? 'active-turn' : ''}`}>
            <span className="player-title">
              {user ? user.name : 'Jugador 1 (Blancas)'} {gameMode === 'multiplayer' && `(Tus Piezas: ${playerColor === 'white' ? 'Blancas' : 'Negras'})`}
            </span>
            <div className="reloj"><Clock size={16} /> {formatTime(timers.w)}</div>
          </div>

          {gameState === 'waiting' && (
            <div className="waiting-overlay">
              <div className="loader"></div>
              <p>Esperando oponente...</p>
              <h3>CÓDIGO: <span className="highlight-code">{roomCode}</span></h3>
            </div>
          )}
        </section>

        {/* Panel Derecho: Historial de jugadas */}
        <aside className="sidebar-right">
          <div className="neon-card history-card">
            <h3>JUGADAS</h3>
            <div className="history-list">
              {movesHistory.map((m, idx) => (
                <div key={idx} className="history-item">
                  <span className="move-num">{idx + 1}.</span>
                  <span className="move-san">{m.from} → {m.to} {m.san && `(${m.san})`}</span>
                </div>
              ))}
              {movesHistory.length === 0 && <p className="text-muted">Ningún movimiento realizado</p>}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
