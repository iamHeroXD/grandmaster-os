import React, { useState } from 'react';
import { THEORETICAL_ENDGAMES, TheoreticalEndgame } from '../../data/endgames';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { UserSettings } from '../../types/database';
import { Square, PieceType } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { Target, Sparkles, CheckCircle2, RotateCcw, Award } from 'lucide-react';

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
    <div className="flex-1 flex overflow-hidden p-4 gap-4 max-w-7xl mx-auto w-full">
      {/* Endgames menu */}
      <div className="w-80 bg-charcoal-900 border border-charcoal-800 rounded-lg flex flex-col overflow-hidden text-xs">
        <div className="p-3 border-b border-charcoal-800">
          <div className="flex items-center gap-2 font-bold text-charcoal-100">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Endgame Laboratory</span>
          </div>
          <p className="text-[10px] text-charcoal-400 mt-0.5">
            Essential theoretical endgames: Lucena, Philidor, Opposition, Fortresses.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-charcoal-800/50 p-1">
          {THEORETICAL_ENDGAMES.map((eg) => {
            const isSelected = selectedEndgame.id === eg.id;

            return (
              <button
                key={eg.id}
                onClick={() => selectEndgame(eg)}
                className={`w-full p-2.5 text-left rounded transition-colors flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-chess-green/20 border-l-2 border-chess-green text-emerald-200'
                    : 'hover:bg-charcoal-800/60 text-charcoal-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal-100">{eg.title}</span>
                  <span className="font-mono text-[10px] text-charcoal-400 uppercase">
                    {eg.objective === 'win' ? 'Win' : 'Draw'}
                  </span>
                </div>
                <div className="text-[10px] text-charcoal-400">{eg.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Board & Drill area */}
      <div className="flex-1 flex overflow-hidden gap-4">
        <div className="max-w-[560px] w-full flex flex-col items-center justify-center gap-3">
          <ChessBoard
            board={board}
            turn={turn}
            orientation={selectedEndgame.sideToMove}
            theme={settings.boardTheme}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            showCoordinates={settings.showCoordinates}
            showLegalDots={settings.showLegalDots}
            onSquareClick={handleSquareClick}
            onMovePiece={handleMovePiece}
            interactive={!isCompleted}
          />

          <div className="flex items-center justify-between w-full px-2 text-xs text-charcoal-400">
            <span>
              Target: {selectedEndgame.objective === 'win' ? 'Play to win' : 'Hold the draw'}
            </span>
            <button onClick={handleReset} className="text-emerald-400 hover:underline flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Position</span>
            </button>
          </div>
        </div>

        {/* Instructions & Theory */}
        <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-lg p-5 flex flex-col justify-between overflow-y-auto text-xs">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                {selectedEndgame.category}
              </span>
              <h1 className="text-lg font-bold text-charcoal-100 mt-0.5">
                {selectedEndgame.title}
              </h1>
              <p className="text-xs text-charcoal-400 mt-1">{selectedEndgame.concept}</p>
            </div>

            {isCompleted && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Endgame Technique Mastered!</div>
                  <div className="text-[11px] text-emerald-200/90 mt-0.5">
                    You executed the exact master winning/drawing method.
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-charcoal-850 border border-charcoal-800 rounded leading-relaxed text-charcoal-200">
              <span className="font-semibold text-sky-400 block mb-1">Winning Technique</span>
              <p className="text-[11px]">{selectedEndgame.technique}</p>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded text-amber-200">
              <span className="font-semibold text-amber-300 block mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Grandmaster Tip</span>
              </span>
              <p className="text-[11px]">{selectedEndgame.grandmasterTip}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-800 flex justify-end">
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-chess-green hover:bg-chess-greenLight text-white font-semibold rounded shadow flex items-center gap-1.5 transition-all"
            >
              <span>Practice Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
