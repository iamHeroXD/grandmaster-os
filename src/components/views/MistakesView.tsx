import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { SpacedRepetitionService } from '../../services/spacedRepetition';
import { StoredMistake, UserSettings } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { Square, PieceType } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { AlertTriangle, CheckCircle2, RotateCcw, Shield, Brain } from 'lucide-react';

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
        <div className="w-16 h-16 rounded-2xl bg-[#14231b] border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4 shadow-sm">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-base font-bold text-slate-100">Personal Mistake Library Clean</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          No blunders recorded yet! When you finish and analyze games in the Analysis Lab, any critical inaccuracies and blunders will automatically appear here for spaced repetition training.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden p-3 md:p-5 gap-4 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* Mistake repository sidebar */}
      <div className="w-80 bg-[#111722] border border-[#1b2536] rounded-2xl flex flex-col overflow-hidden text-xs shrink-0 shadow-sm">
        <div className="p-4 border-b border-[#1b2536]">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>My Mistakes ({mistakes.length})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Real game errors turned into interactive replay drills with SM-2 spaced repetition.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#17202c] p-1.5">
          {mistakes.map((m) => {
            const isSelected = selectedMistake?.id === m.id;
            const isDue = SpacedRepetitionService.isDue(m.nextReviewDate);

            return (
              <button
                key={m.id}
                onClick={() => selectMistake(m)}
                className={`w-full p-3 text-left rounded-xl transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 shadow-sm'
                    : 'hover:bg-[#141c28] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">{m.motif}</span>
                  {isDue ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 font-bold border border-rose-700/50">
                      Due
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {m.intervalDays}d review
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
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
        <div className="flex-1 flex overflow-y-auto overflow-x-hidden gap-5 min-h-0 items-start">
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

            <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400 font-medium">
              <span>{turn === 'w' ? 'White to move' : 'Black to move'}</span>
              <button
                onClick={retryDrill}
                className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Position</span>
              </button>
            </div>
          </div>

          {/* Drill info & explanation */}
          <div className="flex-1 bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col justify-between overflow-y-auto text-xs shadow-sm">
            <div className="flex flex-col gap-3.5">
              <div>
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                  Stop Making This Mistake
                </span>
                <h1 className="text-lg font-black text-slate-100 mt-0.5 tracking-tight">
                  {selectedMistake.motif}
                </h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  In your actual game, you played{' '}
                  <span className="font-mono text-rose-300 font-bold">{selectedMistake.playerMoveSan}</span>,
                  dropping {(selectedMistake.deltaCp / 100).toFixed(1)} pawns. Can you find the master candidate move?
                </p>
              </div>

              {drillStatus === 'solved' && (
                <div className="p-3.5 bg-emerald-950/70 border border-emerald-600 rounded-xl text-emerald-200 flex items-start gap-2 shadow-md animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-300">Master Move Found!</div>
                    <div className="text-[11px] text-emerald-100/90 mt-0.5">
                      You found the refutation! Spaced repetition interval updated: Next review in {selectedMistake.intervalDays} days.
                    </div>
                  </div>
                </div>
              )}

              {drillStatus === 'failed' && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-700/60 rounded-xl text-rose-200 flex items-start gap-2 shadow-md animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-300">Not the Best Candidate Move</div>
                    <div className="text-[11px] text-rose-100/90 mt-0.5">
                      The position requires a more forcing or sound continuation. Click "Reset Position" and recalculate candidate moves.
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 bg-[#141c28] border border-[#202b3c] rounded-xl leading-relaxed text-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Grandmaster Pedagogical Note
                </span>
                <p className="text-[11px] leading-relaxed">{selectedMistake.explanation}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1b2536] flex justify-end">
              <button
                onClick={retryDrill}
                className="px-5 py-2.5 bg-[#141c28] hover:bg-[#1a2434] text-slate-200 font-bold rounded-xl border border-[#202b3c] transition-all text-xs"
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
