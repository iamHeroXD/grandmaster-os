import React, { useState } from 'react';
import { THEORETICAL_ENDGAMES, TheoreticalEndgame } from '../../data/endgames';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { UserSettings } from '../../types/database';
import { Square, PieceType } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { Target, CheckCircle2, RotateCcw, Award, Sparkles } from 'lucide-react';

interface EndgamesViewProps {
  settings: UserSettings;
}

export const EndgamesView: React.FC<EndgamesViewProps> = ({ settings }) => {
  const [selectedEndgame, setSelectedEndgame] = useState<TheoreticalEndgame>(THEORETICAL_ENDGAMES[0]);
  const [controller, setController] = useState<ChessGameController>(
    () => new ChessGameController(THEORETICAL_ENDGAMES[0].fen)
  );
  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState(() => controller.getTurn());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [drillStep, setDrillStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const selectEndgame = (eg: TheoreticalEndgame) => {
    setSelectedEndgame(eg);
    const c = new ChessGameController(eg.fen);
    setController(c);
    setBoard(c.getBoard());
    setTurn(c.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setDrillStep(0);
    setIsCompleted(false);
  };

  const handleSquareClick = (square: Square) => {
    if (isCompleted) return;

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
    if (isCompleted) return;

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

    const expectedSan = selectedEndgame.keyMoves[drillStep];
    const isCorrect =
      res.san === expectedSan ||
      (res.san && expectedSan && res.san.startsWith(expectedSan.replace('+', '').replace('#', '')));

    if (isCorrect) {
      const nextStep = drillStep + 1;
      setDrillStep(nextStep);

      if (nextStep >= selectedEndgame.keyMoves.length) {
        soundService.playVictory();
        setIsCompleted(true);
      } else {
        soundService.playMove();
        // Opponent reply in drill sequence
        setTimeout(() => {
          const reply = selectedEndgame.keyMoves[nextStep];
          controller.makeSanMove(reply);
          setBoard(controller.getBoard());
          setTurn(controller.getTurn());
          setDrillStep(nextStep + 1);
          soundService.playMove();

          if (nextStep + 1 >= selectedEndgame.keyMoves.length) {
            soundService.playVictory();
            setIsCompleted(true);
          }
        }, 350);
      }
    } else {
      soundService.playMistake();
    }
  };

  const handleReset = () => {
    selectEndgame(selectedEndgame);
  };

  return (
    <div className="flex-1 flex overflow-hidden p-3 md:p-5 gap-4 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* Endgames menu */}
      <div className="w-80 bg-[#111722] border border-[#1b2536] rounded-2xl flex flex-col overflow-hidden text-xs shrink-0 shadow-sm">
        <div className="p-4 border-b border-[#1b2536]">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Endgame Laboratory</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Essential theoretical endgames: Lucena, Philidor, Opposition, Fortresses.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#17202c] p-1.5">
          {THEORETICAL_ENDGAMES.map((eg) => {
            const isSelected = selectedEndgame.id === eg.id;

            return (
              <button
                key={eg.id}
                onClick={() => selectEndgame(eg)}
                className={`w-full p-3 text-left rounded-xl transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[#10241c] text-emerald-200 border border-emerald-800/60 shadow-sm'
                    : 'hover:bg-[#141c28] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">{eg.title}</span>
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold px-1.5 py-0.2 rounded bg-[#182332]">
                    {eg.objective === 'win' ? 'Win' : 'Draw'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{eg.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Board & Drill area */}
      <div className="flex-1 flex overflow-y-auto overflow-x-hidden gap-5 min-h-0 items-start">
        <div style={{ maxWidth: 'min(100%, calc(100vh - 140px), 580px)' }} className="w-full flex flex-col items-center justify-center gap-2.5 mx-auto min-h-0">
          <ChessBoard
            board={board}
            turn={turn}
            orientation={selectedEndgame.sideToMove}
            theme={settings.boardTheme}
            pieceSet={settings.pieceSet}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            showCoordinates={settings.showCoordinates}
            showLegalDots={settings.showLegalDots}
            onSquareClick={handleSquareClick}
            onMovePiece={handleMovePiece}
            interactive={!isCompleted}
            maxBoardHeightOffset={160}
          />

          <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400 font-medium">
            <span>
              Target: <strong className="text-emerald-400">{selectedEndgame.objective === 'win' ? 'Play to win' : 'Hold the draw'}</strong>
            </span>
            <button onClick={handleReset} className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-bold transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Position</span>
            </button>
          </div>
        </div>

        {/* Instructions & Theory */}
        <div className="flex-1 bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col justify-between overflow-y-auto text-xs shadow-sm">
          <div className="flex flex-col gap-3.5">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {selectedEndgame.category}
              </span>
              <h1 className="text-lg font-black text-slate-100 mt-0.5 tracking-tight">
                {selectedEndgame.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedEndgame.concept}</p>
            </div>

            {isCompleted && (
              <div className="p-3.5 bg-emerald-950/70 border border-emerald-600 rounded-xl text-emerald-200 flex items-start gap-2 shadow-md animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-300">Endgame Technique Mastered!</div>
                  <div className="text-[11px] text-emerald-100/90 mt-0.5">
                    You executed the exact master winning/drawing method with tablebase precision.
                  </div>
                </div>
              </div>
            )}

            <div className="p-3.5 bg-[#141c28] border border-[#202b3c] rounded-xl leading-relaxed text-slate-300">
              <span className="font-bold text-sky-400 block mb-1 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Winning Technique</span>
              </span>
              <p className="text-[11px] leading-relaxed">{selectedEndgame.technique}</p>
            </div>

            <div className="p-3.5 bg-[#1b1c16] border border-amber-800/40 rounded-xl text-amber-200">
              <span className="font-bold text-amber-300 block mb-1 flex items-center gap-1.5 text-xs">
                <Award className="w-3.5 h-3.5" />
                <span>Grandmaster Algorithm Rule</span>
              </span>
              <p className="text-[11px] leading-relaxed">{selectedEndgame.grandmasterTip}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1b2536] flex justify-end">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 text-xs"
            >
              <span>Practice Technique Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
