import React, { useState } from 'react';
import { UserProfile, UserSettings } from '../../types/database';
import { GrandmasterCoachService, CoachPersona } from '../../services/coachService';
import { ChessGameController } from '../../services/chessEngine';
import { ChessBoard } from '../board/ChessBoard';
import { Square, PieceType } from '../../types/chess';
import { soundService } from '../../services/soundService';
import {
  GraduationCap,
  Sparkles,
  Award,
  Compass,
  Swords,
  ShieldAlert,
  Brain,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface CoachViewProps {
  profile: UserProfile | null;
  settings: UserSettings;
}

interface InstructiveStudy {
  id: string;
  title: string;
  theme: string;
  fen: string;
  description: string;
}

const INSTRUCTIVE_POSITIONS: InstructiveStudy[] = [
  {
    id: 'scholars_trap',
    title: "Scholar's Punishment",
    theme: 'Attacking King & Tactical Refutation',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    description: 'White has brought the Queen out early. Spot the direct tactical mate or defensive punishment.',
  },
  {
    id: 'greek_gift',
    title: 'The Classical Greek Gift',
    theme: 'Kingside Sacrifice (Bxh7+)',
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7',
    description: 'The prototypical bishop sacrifice against the castled king when knights are ready to follow up.',
  },
  {
    id: 'karpov_clamp',
    title: 'Positional Knight Clamp',
    theme: 'Outpost Control & Prophylaxis',
    fen: 'r1b2rk1/pp1n1ppp/2p1pn2/q2p4/2PP4/2N1PN2/PP1QBPPP/R4RK1 w - - 0 10',
    description: 'Notice how White controls central space and neutralizes Black\'s light-squared bishop.',
  },
  {
    id: 'lucena_endgame',
    title: 'Lucena Winning Bridge',
    theme: 'Theoretical Rook Endgame',
    fen: '1K1k4/1P6/8/8/8/8/7R/r7 w - - 0 1',
    description: 'Building the famous "bridge" with the rook on the 4th rank to shelter the king.',
  },
];

export const CoachView: React.FC<CoachViewProps> = ({ profile, settings }) => {
  const [selectedStudy, setSelectedStudy] = useState<InstructiveStudy>(INSTRUCTIVE_POSITIONS[0]);
  const [controller, setController] = useState<ChessGameController>(
    () => new ChessGameController(INSTRUCTIVE_POSITIONS[0].fen)
  );

  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState(() => controller.getTurn());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const [selectedPersona, setSelectedPersona] = useState<CoachPersona>(
    (profile?.coachingStyle as CoachPersona) || 'elena'
  );

  const [activeInsight, setActiveInsight] = useState<string>(
    'Welcome to the Grandmaster Academy Coaching Lab! Choose a Grandmaster persona above and select an instructive study or play any move on the board to receive master commentary.'
  );

  const personas = [
    {
      id: 'elena' as CoachPersona,
      title: 'Master Elena',
      role: 'Academy Master',
      desc: 'Structured, patient, explains first principles, piece coordination, and fundamental rules clearly.',
      color: 'border-emerald-600 bg-emerald-950/40 text-emerald-300',
    },
    {
      id: 'kasparov' as CoachPersona,
      title: 'Garry Kasparov',
      role: 'Dynamic Attacker',
      desc: 'Relentless focus on seizing the initiative, king assault, open lines, and energetic counter-attacks.',
      color: 'border-amber-600 bg-amber-950/40 text-amber-300',
    },
    {
      id: 'karpov' as CoachPersona,
      title: 'Anatoly Karpov',
      role: 'Positional Virtuoso',
      desc: 'Prophylaxis, clamping the opponent\'s counterplay, pawn structure squeeze, and surgical endgame conversion.',
      color: 'border-sky-600 bg-sky-950/40 text-sky-300',
    },
    {
      id: 'tal' as CoachPersona,
      title: 'Mikhail Tal',
      role: 'Tactical Magician',
      desc: 'Romantic sacrifices, calculated chaos, hunting the enemy king, and creating unstoppable tactical fireworks.',
      color: 'border-rose-600 bg-rose-950/40 text-rose-300',
    },
  ];

  const handleSelectStudy = (study: InstructiveStudy) => {
    setSelectedStudy(study);
    const newController = new ChessGameController(study.fen);
    setController(newController);
    setBoard(newController.getBoard());
    setTurn(newController.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);

    const initialAnswer = GrandmasterCoachService.answerQuestion(
      'what_plan',
      study.fen,
      undefined,
      undefined,
      undefined,
      selectedPersona
    );
    setActiveInsight(initialAnswer);
  };

  const handlePrompt = (
    key: 'why_mistake' | 'what_threat' | 'why_winning' | 'what_plan' | 'candidate_moves' | 'quiz_me'
  ) => {
    const res = GrandmasterCoachService.answerQuestion(
      key,
      controller.getFen(),
      controller.getHistory().slice(-1)[0],
      undefined,
      undefined,
      selectedPersona
    );
    setActiveInsight(res);
  };

  // Interactive board moves
  const handleSquareClick = (square: Square) => {
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
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);

    // Coach comments on the played move
    const advice = GrandmasterCoachService.answerQuestion(
      'what_threat',
      controller.getFen(),
      controller.getHistory().slice(-1)[0],
      undefined,
      undefined,
      selectedPersona
    );
    setActiveInsight(advice);
  };

  const handleReset = () => {
    handleSelectStudy(selectedStudy);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 max-w-6xl mx-auto w-full text-xs">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-charcoal-850 border border-charcoal-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-charcoal-100 tracking-tight">
              Grandmaster Mentor Laboratory
            </h1>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Deterministic, offline chess intellect providing Socratic calculation guidance and pedagogical breakdowns.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 border border-charcoal-700 flex items-center gap-1.5 transition-all text-xs font-semibold shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset Study</span>
        </button>
      </div>

      {/* Grandmaster Persona Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {personas.map((p) => {
          const isSelected = selectedPersona === p.id;

          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPersona(p.id);
                const res = GrandmasterCoachService.answerQuestion(
                  'what_plan',
                  controller.getFen(),
                  undefined,
                  undefined,
                  undefined,
                  p.id
                );
                setActiveInsight(res);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${p.color} shadow-lg ring-1 ring-emerald-500/40 scale-[1.02]`
                  : 'border-charcoal-800 bg-charcoal-900 text-charcoal-400 hover:bg-charcoal-850 hover:border-charcoal-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-charcoal-100 text-xs">{p.title}</span>
                <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 rounded bg-charcoal-800 text-charcoal-300">
                  {p.role}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-400 mt-1.5 leading-relaxed">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Coaching Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Board & Study Selector */}
        <div className="lg:col-span-6 flex flex-col items-center gap-3">
          {/* Study Selector Strip */}
          <div className="w-full grid grid-cols-2 gap-2">
            {INSTRUCTIVE_POSITIONS.map((pos) => {
              const isSelected = selectedStudy.id === pos.id;
              return (
                <button
                  key={pos.id}
                  onClick={() => handleSelectStudy(pos)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200 font-bold shadow-sm'
                      : 'bg-charcoal-900 border-charcoal-800 text-charcoal-400 hover:bg-charcoal-850'
                  }`}
                >
                  <div className="text-xs font-bold truncate text-charcoal-200">{pos.title}</div>
                  <div className="text-[10px] text-charcoal-400 truncate mt-0.5">{pos.theme}</div>
                </button>
              );
            })}
          </div>

          {/* Interactive Board */}
          <div className="w-full flex justify-center">
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
              interactive={true}
              maxBoardHeightOffset={230}
            />
          </div>

          <div className="text-xs text-charcoal-400 font-medium text-center">
            {selectedStudy.description} • <span className="text-emerald-400">Click & drag pieces to test moves!</span>
          </div>
        </div>

        {/* Right Column: Socratic Inquiry & Grandmaster Advice */}
        <div className="lg:col-span-6 flex flex-col gap-3 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-charcoal-100 text-sm">
                Socratic Inquiry & Deep Calculation
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Side to move: {turn === 'w' ? 'White' : 'Black'}
            </span>
          </div>

          {/* Quick Grandmaster Prompts */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handlePrompt('what_threat')}
              className="p-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-left text-charcoal-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <span className="font-semibold text-xs">What is the threat?</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => handlePrompt('what_plan')}
              className="p-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <span className="font-semibold text-xs">What is the strategic plan?</span>
              <Compass className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => handlePrompt('candidate_moves')}
              className="p-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <span className="font-semibold text-xs">Calculate 3 candidate moves</span>
              <Swords className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => handlePrompt('quiz_me')}
              className="p-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <span className="font-semibold text-xs">Give me a calculation quiz</span>
              <Brain className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Master Output Bubble */}
          <div className="p-4 bg-charcoal-850 border border-charcoal-750 rounded-xl text-charcoal-100 text-xs shadow-inner leading-relaxed">
            <div className="font-bold text-emerald-400 mb-2 flex items-center gap-2 text-xs border-b border-charcoal-750 pb-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Mentor Guidance — {personas.find((p) => p.id === selectedPersona)?.title}</span>
            </div>
            <p className="whitespace-pre-line text-xs text-charcoal-200 leading-normal font-sans">
              {activeInsight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
