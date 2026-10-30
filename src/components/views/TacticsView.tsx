import React, { useState } from 'react';
import { CURATED_PUZZLES } from '../../data/puzzles';
import { Puzzle, UserSettings, PuzzleAttempt } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { StorageService } from '../../services/storage';
import { Square, PieceType } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { ConfettiEffect } from '../common/ConfettiEffect';
import {
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Lightbulb,
} from 'lucide-react';

interface TacticsViewProps {
  settings: UserSettings;
}

export const TacticsView: React.FC<TacticsViewProps> = ({ settings }) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const currentPuzzle: Puzzle = CURATED_PUZZLES[puzzleIndex % CURATED_PUZZLES.length];

  const [controller, setController] = useState<ChessGameController>(
    () => new ChessGameController(currentPuzzle.fen)
  );
  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState(() => controller.getTurn());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintArrow, setHintArrow] = useState<{ from: Square; to: Square } | null>(null);

  // Puzzle progress state
  const [moveStep, setMoveStep] = useState(0);
  const [status, setStatus] = useState<'solving' | 'solved' | 'failed'>('solving');
  const [hintTier, setHintTier] = useState<number>(0);
  const [startTime] = useState<number>(() => Date.now());
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Load new puzzle
  const loadPuzzle = (puz: Puzzle) => {
    const c = new ChessGameController(puz.fen);
    setController(c);
    setBoard(c.getBoard());
    setTurn(c.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setHintArrow(null);
    setMoveStep(0);
    setStatus('solving');
    setHintTier(0);
    setShowConfetti(false);
  };

  const handleSquareClick = (square: Square) => {
    if (status !== 'solving') return;

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
      setLegalMoves(controller.getLegalMovesForSquare(square));
      return;
    }

    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleMovePiece = (from: Square, to: Square, promotion: PieceType = 'q') => {
    if (status !== 'solving') return;

    const res = controller.makeMove(from, to, promotion);
    if (!res.success) {
      soundService.playMistake();
      return;
    }

    setBoard(controller.getBoard());
    setTurn(controller.getTurn());
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);
    setHintArrow(null);

    const expectedMove = currentPuzzle.moves[moveStep];
    const isCorrect =
      res.san === expectedMove ||
      res.uci === expectedMove ||
      res.san?.startsWith(expectedMove.replace('+', '').replace('#', ''));

    if (isCorrect) {
      const nextStep = moveStep + 1;
      setMoveStep(nextStep);

      // Check if puzzle is fully solved
      if (nextStep >= currentPuzzle.moves.length) {
        soundService.playVictory();
        setStatus('solved');
        setShowConfetti(true);
        const attempt: PuzzleAttempt = {
          puzzleId: currentPuzzle.id,
          timestamp: new Date().toISOString(),
          solved: true,
          timeSpentMs: Date.now() - startTime,
          hintsUsed: hintTier,
        };
        StorageService.recordPuzzleAttempt(attempt);
      } else {
        // Computer plays opponent reply in multi-move puzzle
        const opponentReply = currentPuzzle.moves[nextStep];
        setTimeout(() => {
          controller.makeSanMove(opponentReply);
          setBoard(controller.getBoard());
          setTurn(controller.getTurn());
          setMoveStep(nextStep + 1);
          soundService.playMove();
        }, 350);
      }
    } else {
      soundService.playMistake();
      setStatus('failed');
      const attempt: PuzzleAttempt = {
        puzzleId: currentPuzzle.id,
        timestamp: new Date().toISOString(),
        solved: false,
        timeSpentMs: Date.now() - startTime,
        hintsUsed: hintTier,
      };
      StorageService.recordPuzzleAttempt(attempt);
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (puzzleIndex + 1) % CURATED_PUZZLES.length;
    setPuzzleIndex(nextIdx);
    loadPuzzle(CURATED_PUZZLES[nextIdx]);
  };

  const handleRetry = () => {
    loadPuzzle(currentPuzzle);
  };

  const revealNextHint = () => {
    if (hintTier < 3) {
      const nextTier = hintTier + 1;
      setHintTier(nextTier);

      // If tier 3, show visual arrow
      if (nextTier >= 2) {
        const nextExpected = currentPuzzle.moves[moveStep];
        if (nextExpected && nextExpected.length >= 2) {
          const target = nextExpected.slice(-2) as Square;
          if (target.length === 2) {
            setHintArrow({
              from: (currentPuzzle.sideToMove === 'w' ? 'e2' : 'e7') as Square,
              to: target,
            });
          }
        }
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-y-auto overflow-x-hidden p-3 md:p-4 gap-5 max-w-7xl mx-auto w-full min-h-0 items-start text-xs">
      <ConfettiEffect active={showConfetti} onFinish={() => setShowConfetti(false)} />

      {/* Board Column */}
      <div style={{ maxWidth: 'min(100%, calc(100vh - 140px), 620px)' }} className="w-full flex flex-col items-center justify-center gap-2.5 mx-auto min-h-0">
        <ChessBoard
          board={board}
          turn={turn}
          orientation={currentPuzzle.sideToMove}
          theme={settings.boardTheme}
          pieceSet={settings.pieceSet}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          hintArrow={hintArrow}
          showCoordinates={settings.showCoordinates}
          showLegalDots={settings.showLegalDots}
          onSquareClick={handleSquareClick}
          onMovePiece={handleMovePiece}
          interactive={status === 'solving'}
          maxBoardHeightOffset={160}
        />

        <div className="flex items-center justify-between w-full px-2 text-xs text-charcoal-300 font-medium">
          <span>{currentPuzzle.sideToMove === 'w' ? 'White to move and win' : 'Black to move and win'}</span>
          <button
            onClick={handleRetry}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Position</span>
          </button>
        </div>
      </div>

      {/* Details & Hint Engine */}
      <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col justify-between gap-4 overflow-y-auto shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <span className="text-[11px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tactical Exercise #{puzzleIndex + 1} of {CURATED_PUZZLES.length}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-700/60 font-mono text-xs font-black text-amber-300">
              {currentPuzzle.rating} Elo
            </span>
          </div>

          <div>
            <h1 className="text-lg font-black text-charcoal-100 flex items-center gap-2 tracking-tight">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>{currentPuzzle.theme}</span>
            </h1>
            <p className="text-xs text-charcoal-300 mt-1 leading-relaxed">{currentPuzzle.description}</p>
          </div>

          {/* Status Feedback Banners */}
          {status === 'solved' && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-600/70 rounded-xl text-emerald-200 flex flex-col gap-2 shadow-md animate-fade-in">
              <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Tactical Solution Solved Accurately!</span>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-sans">
                Master calculation confirmed. Complete solution: <strong className="font-mono text-emerald-300">{currentPuzzle.moves.join(' ')}</strong>
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextPuzzle}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 text-xs"
                >
                  <span>Next Puzzle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="p-4 bg-rose-950/60 border border-rose-700/60 rounded-xl text-rose-200 flex flex-col gap-2 shadow-md animate-fade-in">
              <div className="flex items-center gap-2 font-black text-rose-300 text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Suboptimal Move — That is not the best line</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                The engine refutes that move. Look for forcing checks, captures, or unpinning ideas. Click "Try Again" or request a progressive hint.
              </p>
              <button
                onClick={handleRetry}
                className="self-start text-xs font-bold text-amber-300 hover:underline flex items-center gap-1 mt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* 3-Tier Progressive Hint System */}
          <div className="bg-charcoal-850 border border-charcoal-800 rounded-xl p-4 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-charcoal-200 text-xs flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Socratic 3-Tier Hint Engine</span>
              </span>
              <button
                onClick={revealNextHint}
                disabled={hintTier >= 3}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors"
              >
                {hintTier === 0 ? 'Reveal Hint 1' : hintTier === 1 ? 'Reveal Hint 2' : hintTier === 2 ? 'Reveal Final Move' : 'All Hints Revealed'}
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {hintTier >= 1 && (
                <div className="p-2.5 rounded-lg bg-charcoal-800 text-charcoal-200 border border-charcoal-750">
                  <span className="font-bold text-amber-400">Hint 1 (Tactical Theme): </span>
                  {currentPuzzle.theme} — Identify which opponent piece is overloaded or undefended.
                </div>
              )}
              {hintTier >= 2 && (
                <div className="p-2.5 rounded-lg bg-charcoal-800 text-charcoal-200 border border-charcoal-750">
                  <span className="font-bold text-amber-400">Hint 2 (Piece to Move): </span>
                  Focus your calculation on move: <strong className="font-mono text-emerald-300">{currentPuzzle.moves[0].slice(0, 1) || 'Pawn/Piece'}</strong>!
                </div>
              )}
              {hintTier >= 3 && (
                <div className="p-2.5 rounded-lg bg-charcoal-800 text-charcoal-200 border border-charcoal-750">
                  <span className="font-bold text-emerald-400">Final Hint (Key Move): </span>
                  The master move is <strong className="font-mono text-emerald-300">{currentPuzzle.moves[0]}</strong>.
                </div>
              )}
              {hintTier === 0 && (
                <p className="text-charcoal-400 text-xs italic">
                  Calculate first! If you get stuck, reveal hints progressively to train your pattern recognition without spoiling the solution.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-charcoal-800">
          <button
            onClick={handleRetry}
            className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 font-bold transition-all text-xs border border-charcoal-700"
          >
            Restart Puzzle
          </button>
          <button
            onClick={handleNextPuzzle}
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 font-bold rounded-xl flex items-center gap-1.5 transition-all text-xs border border-charcoal-700"
          >
            <span>Skip Puzzle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
