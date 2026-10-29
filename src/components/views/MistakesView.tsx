import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { SpacedRepetitionService } from '../../services/spacedRepetition';
import { StoredMistake, UserSettings } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { Square, PieceType } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { AlertTriangle, CheckCircle2, RotateCcw, Brain, Shield, ArrowRight } from 'lucide-react';

interface MistakesViewProps {
  settings: UserSettings;
}

export const MistakesView: React.FC<MistakesViewProps> = ({ settings }) => {
  const [mistakes, setMistakes] = useState<StoredMistake[]>(() => StorageService.getMistakes());
  const [selectedMistake, setSelectedMistake] = useState<StoredMistake | null>(mistakes[0] || null);

  const [controller, setController] = useState<ChessGameController>(
    () => new ChessGameController(selectedMistake?.fen)
  );
  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState(() => controller.getTurn());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Drill status
  const [drillStatus, setDrillStatus] = useState<'solving' | 'solved' | 'failed'>('solving');

  const selectMistake = (m: StoredMistake) => {
    setSelectedMistake(m);
    const c = new ChessGameController(m.fen);
    setController(c);
    setBoard(c.getBoard());
    setTurn(c.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setDrillStatus('solving');
  };

  const handleSquareClick = (square: Square) => {
    if (drillStatus !== 'solving') return;

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
    if (drillStatus !== 'solving' || !selectedMistake) return;

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

    const playedSan = res.san;
    const playedUci = res.uci;
    const targetMove = selectedMistake.bestMove;

    const isMatch =
      playedSan === targetMove ||
      playedUci === targetMove ||
      (playedSan && targetMove && playedSan.startsWith(targetMove.replace('+', '').replace('#', '')));

    if (isMatch) {
      soundService.playVictory();
      setDrillStatus('solved');

      // Update Spaced Repetition interval
      const updatedItem = SpacedRepetitionService.calculateNextReview(
        {
          easeFactor: selectedMistake.easeFactor || 2.5,
          intervalDays: selectedMistake.intervalDays || 1,
          consecutiveSuccesses: selectedMistake.consecutiveSuccesses || 0,
          nextReviewDate: selectedMistake.nextReviewDate,
        },
        5 // Perfect grade
      );

      const updatedMistake: StoredMistake = {
        ...selectedMistake,
        ...updatedItem,
        reviewStatus: updatedItem.consecutiveSuccesses >= 3 ? 'mastered' : 'learning',
      };

      StorageService.saveMistake(updatedMistake);
      setMistakes(StorageService.getMistakes());
      setSelectedMistake(updatedMistake);
    } else {
      soundService.playMistake();
      setDrillStatus('failed');

      // Downgrade Spaced Repetition item
      const updatedItem = SpacedRepetitionService.calculateNextReview(
        {
          easeFactor: selectedMistake.easeFactor || 2.5,
          intervalDays: selectedMistake.intervalDays || 1,
          consecutiveSuccesses: selectedMistake.consecutiveSuccesses || 0,
          nextReviewDate: selectedMistake.nextReviewDate,
        },
        1 // Failure
      );

      const updatedMistake: StoredMistake = {
        ...selectedMistake,
        ...updatedItem,
        reviewStatus: 'learning',
      };

      StorageService.saveMistake(updatedMistake);
      setMistakes(StorageService.getMistakes());
      setSelectedMistake(updatedMistake);
    }
  };

  const retryDrill = () => {
    if (!selectedMistake) return;
    const c = new ChessGameController(selectedMistake.fen);
    setController(c);
    setBoard(c.getBoard());
    setTurn(c.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setDrillStatus('solving');
  };

  if (mistakes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <Shield className="w-12 h-12 text-emerald-500 mb-3" />
        <h2 className="text-base font-bold text-charcoal-100">Personal Mistake Library Clean</h2>
        <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
          No blunders recorded yet! When you finish and analyze games in the Analysis Lab, any critical inaccuracies and blunders will automatically appear here for spaced repetition training.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden p-4 gap-4 max-w-7xl mx-auto w-full">
      {/* Mistake repository sidebar */}
      <div className="w-80 bg-charcoal-900 border border-charcoal-800 rounded-lg flex flex-col overflow-hidden text-xs">
        <div className="p-3 border-b border-charcoal-800">
          <div className="flex items-center gap-2 font-bold text-charcoal-100">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>My Mistakes ({mistakes.length})</span>
          </div>
          <p className="text-[10px] text-charcoal-400 mt-0.5">
            Real game errors turned into interactive replay drills.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-charcoal-800/50 p-1">
          {mistakes.map((m) => {
            const isSelected = selectedMistake?.id === m.id;
            const isDue = SpacedRepetitionService.isDue(m.nextReviewDate);

            return (
              <button
                key={m.id}
                onClick={() => selectMistake(m)}
                className={`w-full p-2.5 text-left rounded transition-colors flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-rose-950/40 border-l-2 border-rose-500 text-rose-200'
                    : 'hover:bg-charcoal-800/60 text-charcoal-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal-200">{m.motif}</span>
                  {isDue ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-bold border border-rose-700/50">
                      Due
                    </span>
                  ) : (
                    <span className="text-[10px] text-charcoal-500">
                      {m.intervalDays}d review
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-charcoal-400">
                  Played: <span className="font-mono text-rose-300 line-through">{m.playerMoveSan}</span>
                  {' '}&rarr; Delta: -{(m.deltaCp / 100).toFixed(1)} pawns
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Replay & Blind Solve Area */}
      {selectedMistake && (
        <div className="flex-1 flex overflow-y-auto overflow-x-hidden gap-4 min-h-0 items-start">
          <div style={{ maxWidth: 'min(100%, calc(100vh - 140px), 580px)' }} className="w-full flex flex-col items-center justify-center gap-2.5 mx-auto min-h-0">
            <ChessBoard
              board={board}
              turn={turn}
              theme={settings.boardTheme}
              pieceSet={settings.pieceSet}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              showCoordinates={settings.showCoordinates}
              showLegalDots={settings.showLegalDots}
              onSquareClick={handleSquareClick}
              onMovePiece={handleMovePiece}
              interactive={drillStatus === 'solving'}
              maxBoardHeightOffset={160}
            />

            <div className="flex items-center justify-between w-full px-2 text-xs text-charcoal-400">
              <span>{turn === 'w' ? 'White to move' : 'Black to move'}</span>
              <button
                onClick={retryDrill}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Position</span>
              </button>
            </div>
          </div>

          {/* Drill info & explanation */}
          <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-lg p-5 flex flex-col justify-between overflow-y-auto text-xs">
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase tracking-wider">
                  Stop Making This Mistake
                </span>
                <h1 className="text-lg font-bold text-charcoal-100 mt-0.5">
                  {selectedMistake.motif}
                </h1>
                <p className="text-xs text-charcoal-400 mt-1">
                  In your actual game, you played{' '}
                  <span className="font-mono text-rose-300 font-bold">{selectedMistake.playerMoveSan}</span>,
                  dropping {(selectedMistake.deltaCp / 100).toFixed(1)} pawns. Can you find the master candidate move?
                </p>
              </div>

              {drillStatus === 'solved' && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Master Move Found!</div>
                    <div className="text-[11px] text-emerald-200/90 mt-0.5">
                      You found the refutation! Spaced repetition interval updated: Next review in {selectedMistake.intervalDays} days.
                    </div>
                  </div>
                </div>
              )}

              {drillStatus === 'failed' && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Not the Best Candidate Move</div>
                    <div className="text-[11px] text-rose-200/90 mt-0.5">
                      The position requires a more forcing or sound continuation. Click "Reset Position" and recalculate candidate moves.
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-charcoal-850 border border-charcoal-800 rounded leading-relaxed text-charcoal-200">
                <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider block mb-1">
                  Grandmaster Pedagogical Note
                </span>
                <p className="text-[11px]">{selectedMistake.explanation}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-charcoal-800 flex justify-end">
              <button
                onClick={retryDrill}
                className="px-5 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 font-semibold rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
