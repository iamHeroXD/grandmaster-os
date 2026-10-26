import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChessGameController } from '../../services/chessEngine';
import { UciEngineService } from '../../services/uciEngine';
import { soundService } from '../../services/soundService';
import { StorageService } from '../../services/storage';
import { GameAnalysisService } from '../../services/analysisPipeline';
import {
  Color,
  Square,
  PieceType,
  GameMode,
  OpponentStrength,
  TimeControlConfig,
  TIME_CONTROLS,
  GameSummary,
  GameTerminationReason,
} from '../../types/chess';
import { UserProfile, UserSettings } from '../../types/database';
import { ChessBoard } from '../board/ChessBoard';
import { CapturedTray } from '../board/CapturedTray';
import { MoveList } from '../board/MoveList';
import { ClockDisplay } from '../board/ClockDisplay';
import { GrandmasterCoachPanel } from '../coach/GrandmasterCoachPanel';
import { ConfettiEffect } from '../common/ConfettiEffect';
import { Play, RotateCcw, Flag, Undo2, Award, ArrowRight, Lightbulb, Volume2, VolumeX } from 'lucide-react';

interface PlayViewProps {
  profile: UserProfile | null;
  settings: UserSettings;
  onGameFinished: (game: GameSummary) => void;
  onNavigateToAnalysis: (game: GameSummary) => void;
  initialCustomFen?: string;
}

export const PlayView: React.FC<PlayViewProps> = ({
  profile,
  settings,
  onGameFinished,
  onNavigateToAnalysis,
  initialCustomFen,
}) => {
  const [controller] = useState<ChessGameController>(() => new ChessGameController(initialCustomFen));
  const engineRef = useRef<UciEngineService | null>(null);

  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState<Color>(() => controller.getTurn());
  const [fen, setFen] = useState<string>(() => controller.getFen());
  const [moves, setMoves] = useState(() => controller.getHistory());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [checkSquare, setCheckSquare] = useState<Square | null>(null);
  const [hintArrow, setHintArrow] = useState<{ from: Square; to: Square } | null>(null);

  // Settings & game mode
  const [gameMode, setGameMode] = useState<GameMode>('vs_computer');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [computerStrength, setComputerStrength] = useState<OpponentStrength>('beginner');
  const [timeControl, setTimeControl] = useState<TimeControlConfig>(TIME_CONTROLS[4]); // 10+0
  const [boardOrientation, setBoardOrientation] = useState<Color>('w');
  const [soundMuted, setSoundMuted] = useState(!settings.soundEnabled);

  // Clocks
  const [whiteClock, setWhiteClock] = useState<number>(10 * 60);
  const [blackClock, setBlackClock] = useState<number>(10 * 60);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);

  // Game state
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string>('*');
  const [terminationMessage, setTerminationMessage] = useState<string>('');
  const [savedGameRecord, setSavedGameRecord] = useState<GameSummary | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Initialize engine
  useEffect(() => {
    const engine = new UciEngineService();
    engineRef.current = engine;

    return () => {
      engine.terminate();
    };
  }, []);

  // Update sound settings
  useEffect(() => {
    soundService.setEnabled(!soundMuted);
    soundService.setVolume(settings.soundVolume);
  }, [soundMuted, settings.soundVolume]);

  // Clock tick timer
  useEffect(() => {
    if (!isClockRunning || gameOver || timeControl.baseMinutes === 0) return;

    const interval = setInterval(() => {
      if (turn === 'w') {
        setWhiteClock((prev) => {
          if (prev <= 1) {
            handleGameOver('timeout', '0-1', 'Black wins on time');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackClock((prev) => {
          if (prev <= 1) {
            handleGameOver('timeout', '1-0', 'White wins on time');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockRunning, turn, gameOver, timeControl]);

  // Handle Game Over
  const handleGameOver = useCallback((
    reason: GameTerminationReason,
    result: '1-0' | '0-1' | '1/2-1/2',
    msg: string
  ) => {
    setGameOver(true);
    setIsClockRunning(false);
    setGameResult(result);
    setTerminationMessage(msg);
    soundService.playVictory();

    // Trigger celebration if user won
    const userWon = (playerColor === 'w' && result === '1-0') || (playerColor === 'b' && result === '0-1');
    if (userWon) {
      setShowConfetti(true);
    }

    const record: GameSummary = {
      whiteName: gameMode === 'vs_computer' && playerColor === 'b' ? `Stockfish (${computerStrength})` : profile?.username || 'White',
      blackName: gameMode === 'vs_computer' && playerColor === 'w' ? `Stockfish (${computerStrength})` : profile?.username || 'Black',
      whiteColor: gameMode === 'vs_computer' && playerColor === 'b' ? 'computer' : 'user',
      blackColor: gameMode === 'vs_computer' && playerColor === 'w' ? 'computer' : 'user',
      result,
      terminationReason: reason,
      timeControl: timeControl.name,
      initialFen: initialCustomFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: controller.getPgn(),
      moves: controller.getHistory(),
      playedAt: new Date().toISOString(),
    };

    record.accuracyWhite = GameAnalysisService.calculateAccuracy(record.moves, 'w');
    record.accuracyBlack = GameAnalysisService.calculateAccuracy(record.moves, 'b');

    StorageService.saveGame(record);
    setSavedGameRecord(record);
    onGameFinished(record);
  }, [gameMode, playerColor, computerStrength, profile, timeControl, initialCustomFen, controller, onGameFinished]);

  // Check state after move
  const checkPostMoveState = useCallback(() => {
    const isCheck = controller.isCheck();
    const isCheckmate = controller.isCheckmate();
    const isStalemate = controller.isStalemate();
    const isDraw = controller.isDraw();
    const isRepetition = controller.isThreefoldRepetition();
    const isInsufficient = controller.isInsufficientMaterial();

    if (isCheckmate) {
      const winner = controller.getTurn() === 'w' ? '0-1' : '1-0';
      const msg = winner === '1-0' ? 'White wins by Checkmate!' : 'Black wins by Checkmate!';
      handleGameOver('checkmate', winner, msg);
    } else if (isStalemate) {
      handleGameOver('stalemate', '1/2-1/2', 'Draw by Stalemate.');
    } else if (isRepetition) {
      handleGameOver('threefold_repetition', '1/2-1/2', 'Draw by Threefold Repetition.');
    } else if (isInsufficient) {
      handleGameOver('insufficient_material', '1/2-1/2', 'Draw by Insufficient Material.');
    } else if (isDraw) {
      handleGameOver('fifty_moves', '1/2-1/2', 'Draw by 50-move rule.');
    } else if (isCheck) {
      soundService.playCheck();
      const currentBoard = controller.getBoard();
      const currentTurn = controller.getTurn();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = currentBoard[r][c];
          if (p && p.type === 'k' && p.color === currentTurn) {
            setCheckSquare(`${String.fromCharCode(97 + c)}${8 - r}` as Square);
          }
        }
      }
    } else {
      setCheckSquare(null);
    }
  }, [controller, handleGameOver]);

  // Trigger computer move
  const triggerComputerMove = useCallback(async () => {
    if (gameOver || !engineRef.current) return;
    const currentFen = controller.getFen();

    try {
      const bestMoveUci = await engineRef.current.findBestMove(currentFen, {
        strength: computerStrength,
      });

      if (bestMoveUci && bestMoveUci.length >= 4) {
        const from = bestMoveUci.substring(0, 2) as Square;
        const to = bestMoveUci.substring(2, 4) as Square;
        const promo = bestMoveUci.length > 4 ? (bestMoveUci[4] as PieceType) : undefined;

        const res = controller.makeMove(from, to, promo);
        if (res.success) {
          if (res.captured) {
            soundService.playCapture();
          } else {
            soundService.playMove();
          }

          setBoard(controller.getBoard());
          setTurn(controller.getTurn());
          setFen(controller.getFen());
          setMoves(controller.getHistory());
          setLastMove({ from, to });
          setHintArrow(null);

          if (turn === 'w') {
            setWhiteClock((c) => c + timeControl.incrementSeconds);
          } else {
            setBlackClock((c) => c + timeControl.incrementSeconds);
          }

          checkPostMoveState();
        }
      }
    } catch (e) {
      console.error('Computer move error:', e);
    }
  }, [gameOver, controller, computerStrength, turn, timeControl, checkPostMoveState]);

  // Trigger engine if it's computer's turn
  useEffect(() => {
    if (
      gameMode === 'vs_computer' &&
      !gameOver &&
      turn !== playerColor &&
      controller.getHistory().length > 0
    ) {
      const timer = setTimeout(() => {
        triggerComputerMove();
      }, 300);
      return () => clearTimeout(timer);
    } else if (
      gameMode === 'vs_computer' &&
      !gameOver &&
      playerColor === 'b' &&
      controller.getHistory().length === 0
    ) {
      const timer = setTimeout(() => {
        triggerComputerMove();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, playerColor, gameOver, controller, triggerComputerMove]);

  // Handle Square click
  const handleSquareClick = (square: Square) => {
    if (gameOver) return;
    if (gameMode === 'vs_computer' && turn !== playerColor) return;

    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const piece = board[rank]?.[file];

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === turn) {
      setSelectedSquare(square);
      const moves = controller.getLegalMovesForSquare(square);
      setLegalMoves(moves);
      return;
    }

    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // Execute Move
  const handleMovePiece = (from: Square, to: Square, promotion: PieceType = 'q') => {
    if (gameOver) return;
    if (gameMode === 'vs_computer' && turn !== playerColor) return;

    const res = controller.makeMove(from, to, promotion);
    if (!res.success) {
      soundService.playMistake();
      return;
    }

    if (res.captured) {
      soundService.playCapture();
    } else {
      soundService.playMove();
    }

    setBoard(controller.getBoard());
    setTurn(controller.getTurn());
    setFen(controller.getFen());
    setMoves(controller.getHistory());
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);
    setHintArrow(null);

    if (!isClockRunning && moves.length === 0) {
      setIsClockRunning(true);
    }

    if (turn === 'w') {
      setWhiteClock((c) => c + timeControl.incrementSeconds);
    } else {
      setBlackClock((c) => c + timeControl.incrementSeconds);
    }

    checkPostMoveState();
  };

  // Beginner Hint: Request Best Move Arrow
  const handleShowHint = async () => {
    if (gameOver || !engineRef.current) return;
    try {
      const bestMoveUci = await engineRef.current.findBestMove(controller.getFen(), { depth: 10 });
      if (bestMoveUci && bestMoveUci.length >= 4) {
        const from = bestMoveUci.substring(0, 2) as Square;
        const to = bestMoveUci.substring(2, 4) as Square;
        setHintArrow({ from, to });
      }
    } catch (e) {
      console.error('Hint error', e);
    }
  };

  // Start new game
  const handleNewGame = () => {
    controller.reset(initialCustomFen);
    setBoard(controller.getBoard());
    setTurn(controller.getTurn());
    setFen(controller.getFen());
    setMoves([]);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setCheckSquare(null);
    setHintArrow(null);
    setGameOver(false);
    setGameResult('*');
    setTerminationMessage('');
    setSavedGameRecord(null);
    setShowConfetti(false);

    const sec = timeControl.baseMinutes * 60;
    setWhiteClock(sec);
    setBlackClock(sec);
    setIsClockRunning(false);
  };

  // Resign
  const handleResign = () => {
    if (gameOver) return;
    const winner = playerColor === 'w' ? '0-1' : '1-0';
    handleGameOver('resignation', winner, `${profile?.username || 'Player'} resigned.`);
  };

  // Undo (practice mode)
  const handleUndo = () => {
    if (gameOver || gameMode !== 'practice') return;
    controller.undo();
    setBoard(controller.getBoard());
    setTurn(controller.getTurn());
    setFen(controller.getFen());
    setMoves(controller.getHistory());
    setLastMove(null);
    setHintArrow(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden p-4 gap-5 max-w-7xl mx-auto w-full">
      <ConfettiEffect active={showConfetti} onFinish={() => setShowConfetti(false)} />

      {/* Left Chessboard area */}
      <div className="flex flex-col items-center justify-between flex-1 max-w-[620px] gap-2">
        {/* Opponent clock & name */}
        <ClockDisplay
          whiteSeconds={whiteClock}
          blackSeconds={blackClock}
          activeColor={isClockRunning ? turn : null}
          whiteName={gameMode === 'vs_computer' && playerColor === 'b' ? `Stockfish (${computerStrength})` : profile?.username || 'White'}
          blackName={gameMode === 'vs_computer' && playerColor === 'w' ? `Stockfish (${computerStrength})` : profile?.username || 'Black'}
          isUntimed={timeControl.baseMinutes === 0}
        />

        {/* Captured Pieces Tray */}
        <CapturedTray board={board} playerColor={playerColor} />

        {/* Board */}
        <div className="relative w-full">
          <ChessBoard
            board={board}
            turn={turn}
            orientation={boardOrientation}
            theme={settings.boardTheme}
            pieceSet={settings.pieceSet}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            checkSquare={checkSquare}
            hintArrow={hintArrow}
            showCoordinates={settings.showCoordinates}
            showLegalDots={settings.showLegalDots}
            onSquareClick={handleSquareClick}
            onMovePiece={handleMovePiece}
            interactive={!gameOver}
          />

          {/* Game Over Celebration Overlay */}
          {gameOver && (
            <div className="absolute inset-0 z-40 bg-charcoal-950/85 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-2xl animate-fade-in">
              <Award className="w-14 h-14 text-amber-400 mb-2 drop-shadow-md animate-bounce" />
              <div className="text-2xl font-extrabold text-charcoal-100">{terminationMessage}</div>
              <div className="text-sm font-mono text-charcoal-300 mt-1 font-semibold">Result: {gameResult}</div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleNewGame}
                  className="px-5 py-2.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                {savedGameRecord && (
                  <button
                    onClick={() => onNavigateToAnalysis(savedGameRecord)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span>Analyze Game</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between w-full max-w-[620px] px-1 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBoardOrientation((o) => (o === 'w' ? 'b' : 'w'))}
              title="Flip Board"
              className="px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-300 border border-charcoal-750 transition-colors shadow-sm"
            >
              Flip ↺
            </button>
            <button
              onClick={handleShowHint}
              disabled={gameOver}
              title="Show Best Move Hint (Beginner Friendly)"
              className="px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-emerald-950/60 hover:text-emerald-300 text-charcoal-300 border border-charcoal-750 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint</span>
            </button>
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-400 hover:text-charcoal-200 border border-charcoal-750 transition-colors shadow-sm"
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            {gameMode === 'practice' && (
              <button
                onClick={handleUndo}
                title="Undo Move"
                className="px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-charcoal-300 border border-charcoal-750 flex items-center gap-1 transition-colors shadow-sm"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResign}
              disabled={gameOver || moves.length === 0}
              className="px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-rose-950/60 hover:text-rose-300 disabled:opacity-30 text-charcoal-400 border border-charcoal-750 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Resign</span>
            </button>
            <button
              onClick={handleNewGame}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right sidebars: Move list & Settings/Coach tabs */}
      <div className="flex flex-col flex-1 max-w-sm gap-3 h-full">
        {/* Game Mode / Configuration Strip */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-3.5 text-xs flex flex-col gap-2.5 shadow">
          <div className="flex items-center justify-between font-bold text-charcoal-100">
            <span>Match Setup</span>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-700/50 font-mono">
              Stockfish Offline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-charcoal-400 block mb-1 font-semibold">Mode</label>
              <select
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value as GameMode)}
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-charcoal-200"
              >
                <option value="vs_computer">Play Computer</option>
                <option value="local_two_player">2-Player (Local)</option>
                <option value="practice">Practice & Explore</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-charcoal-400 block mb-1 font-semibold">Time Control</label>
              <select
                value={timeControl.name}
                onChange={(e) => {
                  const tc = TIME_CONTROLS.find((t) => t.name === e.target.value) || TIME_CONTROLS[4];
                  setTimeControl(tc);
                  setWhiteClock(tc.baseMinutes * 60);
                  setBlackClock(tc.baseMinutes * 60);
                }}
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-charcoal-200"
              >
                {TIME_CONTROLS.map((tc) => (
                  <option key={tc.name} value={tc.name}>
                    {tc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {gameMode === 'vs_computer' && (
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-charcoal-800">
              <div>
                <label className="text-[10px] text-charcoal-400 block mb-1 font-semibold">Difficulty</label>
                <select
                  value={computerStrength}
                  onChange={(e) => setComputerStrength(e.target.value as OpponentStrength)}
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-charcoal-200 font-medium"
                >
                  <option value="beginner">Beginner (~1000)</option>
                  <option value="intermediate">Intermediate (~1400)</option>
                  <option value="advanced">Advanced (~1850)</option>
                  <option value="master">Master (Max UCI)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-charcoal-400 block mb-1 font-semibold">Play As</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setPlayerColor('w');
                      setBoardOrientation('w');
                    }}
                    className={`flex-1 py-1 rounded-lg border text-center font-bold transition-all ${
                      playerColor === 'w'
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm'
                        : 'border-charcoal-750 bg-charcoal-850 text-charcoal-400'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => {
                      setPlayerColor('b');
                      setBoardOrientation('b');
                    }}
                    className={`flex-1 py-1 rounded-lg border text-center font-bold transition-all ${
                      playerColor === 'b'
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm'
                        : 'border-charcoal-750 bg-charcoal-850 text-charcoal-400'
                    }`}
                  >
                    Black
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Move History */}
        <div className="flex-1 min-h-[220px]">
          <MoveList
            moves={moves}
            currentMoveIndex={moves.length - 1}
            onSelectMove={() => {}}
            onCopyPgn={() => navigator.clipboard.writeText(controller.getPgn())}
            onCopyFen={() => navigator.clipboard.writeText(controller.getFen())}
          />
        </div>

        {/* Coach Advice Panel */}
        <div className="h-64">
          <GrandmasterCoachPanel
            currentFen={fen}
            lastMove={moves[moves.length - 1]}
          />
        </div>
      </div>
    </div>
  );
};
