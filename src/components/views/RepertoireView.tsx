import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { RepertoireLine, UserSettings } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { Color, Square, PieceType } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { Swords, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface RepertoireViewProps {
  settings: UserSettings;
}

const DEFAULT_REPERTOIRE_LINES: RepertoireLine[] = [
  {
    id: 'rep_italian',
    color: 'w',
    openingName: 'Italian Game (Mainline)',
    eco: 'C50',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4'],
    fens: [],
    notes: 'Primary attacking weapon as White. Seize the center with c3 and d4.',
  },
  {
    id: 'rep_sicilian_najdorf',
    color: 'b',
    openingName: 'Sicilian Najdorf (Response to 1.e4)',
    eco: 'B90',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    fens: [],
    notes: 'Aggressive and fighting response to 1.e4. Prepares queenside counterplay.',
  },
  {
    id: 'rep_kings_indian',
    color: 'b',
    openingName: 'King\'s Indian Defense (Response to 1.d4)',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    fens: [],
    notes: 'Dynamic defense against 1.d4. Counter-attack on the kingside with e5 and f5.',
  },
];

export const RepertoireView: React.FC<RepertoireViewProps> = ({ settings }) => {
  const [repertoire] = useState<RepertoireLine[]>(() => {
    const saved = StorageService.getRepertoireLines();
    return saved.length > 0 ? saved : DEFAULT_REPERTOIRE_LINES;
  });

  const [activeTab, setActiveTab] = useState<Color>('w');
  const [selectedLine, setSelectedLine] = useState<RepertoireLine>(repertoire[0]);
  const [controller, setController] = useState<ChessGameController>(() => new ChessGameController());
  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState(() => controller.getTurn());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Rehearsal state
  const [stepIndex, setStepIndex] = useState(0);
  const [rehearsalStatus, setRehearsalStatus] = useState<'playing' | 'completed' | 'deviation'>('playing');

  const startRehearsal = (line: RepertoireLine) => {
    setSelectedLine(line);
    const c = new ChessGameController();
    setController(c);
    setBoard(c.getBoard());
    setTurn(c.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setStepIndex(0);
    setRehearsalStatus('playing');
  };

  const handleSquareClick = (square: Square) => {
    if (rehearsalStatus !== 'playing') return;

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
    if (rehearsalStatus !== 'playing') return;

    const expectedSan = selectedLine.moves[stepIndex];
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
    const isCorrect =
      playedSan === expectedSan ||
      playedSan?.startsWith(expectedSan.replace('+', '').replace('#', ''));

    if (isCorrect) {
      const nextStep = stepIndex + 1;
      setStepIndex(nextStep);

      if (nextStep >= selectedLine.moves.length) {
        soundService.playVictory();
        setRehearsalStatus('completed');
      } else {
        soundService.playMove();
        // Opponent automatically plays next book move
        setTimeout(() => {
          const opponentMove = selectedLine.moves[nextStep];
          controller.makeSanMove(opponentMove);
          setBoard(controller.getBoard());
          setTurn(controller.getTurn());
          setStepIndex(nextStep + 1);
          soundService.playMove();

          if (nextStep + 1 >= selectedLine.moves.length) {
            soundService.playVictory();
            setRehearsalStatus('completed');
          }
        }, 350);
      }
    } else {
      soundService.playMistake();
      setRehearsalStatus('deviation');
    }
  };

  const filteredLines = repertoire.filter((l) => l.color === activeTab);

  return (
    <div className="flex-1 flex overflow-hidden p-3 md:p-5 gap-4 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* Repertoire Line Selector */}
      <div className="w-80 bg-[#111722] border border-[#1b2536] rounded-2xl flex flex-col overflow-hidden text-xs shrink-0 shadow-sm">
        <div className="p-4 border-b border-[#1b2536] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Swords className="w-4 h-4 text-emerald-400" />
            <span>My Opening Repertoire</span>
          </div>

          {/* White / Black filter tabs */}
          <div className="flex gap-1 bg-[#141c28] p-1 rounded-xl border border-[#202b3c]">
            <button
              onClick={() => setActiveTab('w')}
              className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                activeTab === 'w'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              White Lines
            </button>
            <button
              onClick={() => setActiveTab('b')}
              className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                activeTab === 'b'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Black Lines
            </button>
          </div>
        </div>

        {/* Lines list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#17202c] p-1.5">
          {filteredLines.map((line) => {
            const isSelected = selectedLine.id === line.id;

            return (
              <button
                key={line.id}
                onClick={() => startRehearsal(line)}
                className={`w-full p-3 text-left rounded-xl transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[#10241c] text-emerald-200 border border-emerald-800/60 shadow-sm'
                    : 'hover:bg-[#141c28] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">{line.openingName}</span>
                  <span className="font-mono text-[10px] text-amber-300 px-1.5 py-0.2 bg-[#182332] rounded font-bold">
                    {line.eco}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 truncate">
                  {line.moves.join(' ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rehearsal Board Area */}
      <div className="flex-1 flex overflow-y-auto overflow-x-hidden gap-5 min-h-0 items-start">
        <div style={{ maxWidth: 'min(100%, calc(100vh - 140px), 580px)' }} className="w-full flex flex-col items-center justify-center gap-2.5 mx-auto min-h-0">
          <ChessBoard
            board={board}
            turn={turn}
            orientation={selectedLine.color}
            theme={settings.boardTheme}
            pieceSet={settings.pieceSet}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            showCoordinates={settings.showCoordinates}
            showLegalDots={settings.showLegalDots}
            onSquareClick={handleSquareClick}
            onMovePiece={handleMovePiece}
            interactive={rehearsalStatus === 'playing'}
            maxBoardHeightOffset={160}
          />

          <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400 font-medium">
            <span>
              Target: Move {Math.floor(stepIndex / 2) + 1} ({selectedLine.color === 'w' ? 'White' : 'Black'})
            </span>
            <button
              onClick={() => startRehearsal(selectedLine)}
              className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restart Drill</span>
            </button>
          </div>
        </div>

        {/* Rehearsal Prompts & Deviation Feedback */}
        <div className="flex-1 bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col justify-between overflow-y-auto text-xs shadow-sm">
          <div className="flex flex-col gap-3.5">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Repertoire Memorization Mode
              </span>
              <h1 className="text-lg font-black text-slate-100 mt-0.5 tracking-tight">
                {selectedLine.openingName}
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedLine.notes}</p>
            </div>

            {/* Rehearsal Feedback */}
            {rehearsalStatus === 'completed' && (
              <div className="p-3.5 bg-emerald-950/70 border border-emerald-600 rounded-xl text-emerald-200 flex items-start gap-2 shadow-md animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-300">Repertoire Line Mastered!</div>
                  <div className="text-[11px] text-emerald-100/90 mt-0.5">
                    All moves played with 100% precision. You are ready to execute this opening in tournament play.
                  </div>
                </div>
              </div>
            )}

            {rehearsalStatus === 'deviation' && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-700/60 rounded-xl text-rose-200 flex items-start gap-2 shadow-md animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-300">Repertoire Deviation Detected</div>
                  <div className="text-[11px] text-rose-100/90 mt-0.5">
                    Your move deviated from your selected repertoire line. The scheduled book move was:{' '}
                    <span className="font-bold font-mono text-amber-300">
                      {selectedLine.moves[stepIndex]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Move Sequence Reference */}
            <div className="p-3.5 bg-[#141c28] border border-[#202b3c] rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Full Repertoire Line
              </span>
              <div className="font-mono text-[11px] text-slate-300 flex flex-wrap gap-1.5">
                {selectedLine.moves.map((m, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded ${
                      idx === stepIndex
                        ? 'bg-emerald-600 text-white font-bold'
                        : idx < stepIndex
                        ? 'text-emerald-400 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ''}
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1b2536] flex justify-end">
            <button
              onClick={() => startRehearsal(selectedLine)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 text-xs"
            >
              <span>Practice Rehearsal Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
