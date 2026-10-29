import React, { useState, useEffect } from 'react';
import { CURATED_PUZZLES } from '../../data/puzzles';
import { Puzzle, UserSettings, PuzzleAttempt } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { StorageService } from '../../services/storage';
import { Square, PieceType } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { ConfettiEffect } from '../common/ConfettiEffect';
import { Zap, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Clock } from 'lucide-react';

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
    setMoveStep(0);
    setStatus('solving');
    setHintTier(0);
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
        }, 300);
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
      setHintTier((h) => h + 1);
    }
  };

  return (
    <div className="flex-1 flex overflow-y-auto overflow-x-hidden p-3 md:p-4 gap-4 max-w-7xl mx-auto w-full min-h-0 items-start">
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
          showCoordinates={settings.showCoordinates}
          showLegalDots={settings.showLegalDots}
          onSquareClick={handleSquareClick}
          onMovePiece={handleMovePiece}
          interactive={status === 'solving'}
          maxBoardHeightOffset={160}
        />

        <div className="flex items-center justify-between w-full px-2 text-xs text-charcoal-400">
          <span>{currentPuzzle.sideToMove === 'w' ? 'White to move and win' : 'Black to move and win'}</span>
          <button onClick={handleRetry} className="text-emerald-400 hover:underline flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Position</span>
          </button>
        </div>
      </div>

      {/* Details & Hint Engine */}
      <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-lg p-5 flex flex-col justify-between overflow-y-auto text-xs">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              Tactical Exercise #{puzzleIndex + 1}
            </span>
            <span className="px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700 font-mono text-[11px] font-bold text-amber-400">
              {currentPuzzle.rating} Elo
            </span>
          </div>

          <div>
            <h1 className="text-lg font-bold text-charcoal-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{currentPuzzle.theme}</span>
            </h1>
            <p className="text-xs text-charcoal-400 mt-1">{currentPuzzle.description}</p>
          </div>

          {/* Status Banners */}
          {status === 'solved' && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Puzzle Solved Accurately!</div>
                <div className="text-[11px] text-emerald-200/90 mt-0.5">
                  Master calculation confirmed. Solution: {currentPuzzle.moves.join(' ')}
                </div>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Suboptimal Move — That is not the best line</div>
                <div className="text-[11px] text-rose-200/90 mt-0.5">
                  Click "Try Again" or request a progressive hint to recalculate.
                </div>
              </div>
            </div>
          )}

          {/* 3-Tier Progressive Hint System */}
          <div className="bg-charcoal-850 border border-charcoal-800 rounded p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Intelligent 3-Tier Hints</span>
              </span>
              <button
                onClick={revealNextHint}
                disabled={hintTier >= 3}
                className="text-[11px] font-semibold text-emerald-400 hover:underline disabled:opacity-40"
              >
                {hintTier === 0 ? 'Reveal Hint 1' : hintTier === 1 ? 'Reveal Hint 2' : hintTier === 2 ? 'Reveal Final Hint' : 'All Hints Revealed'}
              </button>
            </div>

            {hintTier >= 1 && (
              <div className="p-2 bg-charcoal-800/60 rounded border border-charcoal-750 text-[11px] text-charcoal-300">
                <span className="font-semibold text-amber-300">Hint 1 (Motif): </span>
                {currentPuzzle.hints[0]}
              </div>
            )}
            {hintTier >= 2 && (
              <div className="p-2 bg-charcoal-800/60 rounded border border-charcoal-750 text-[11px] text-charcoal-300">
                <span className="font-semibold text-sky-300">Hint 2 (Target): </span>
                {currentPuzzle.hints[1]}
              </div>
            )}
            {hintTier >= 3 && (
              <div className="p-2 bg-charcoal-800/60 rounded border border-charcoal-750 text-[11px] text-charcoal-300">
                <span className="font-semibold text-emerald-300">Hint 3 (Action): </span>
                {currentPuzzle.hints[2]}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-charcoal-800 flex gap-2 justify-end">
          {status === 'failed' && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 font-semibold rounded flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}

          <button
            onClick={handleNextPuzzle}
            className="px-5 py-2 bg-chess-green hover:bg-chess-greenLight text-white font-semibold rounded shadow flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <span>Next Puzzle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
