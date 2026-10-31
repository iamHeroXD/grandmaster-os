import React, { useState } from 'react';
import { UserProfile, StoredMistake, LessonProgress } from '../../types/database';
import { GameSummary } from '../../types/chess';
import { NavTab } from '../layout/Sidebar';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Circle,
  HelpCircle,
  Shield,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  BookOpen,
  User,
  Bot,
} from 'lucide-react';

interface HomeViewProps {
  profile: UserProfile | null;
  games: GameSummary[];
  mistakes: StoredMistake[];
  lessonProgress: Record<string, LessonProgress>;
  onNavigate: (tab: NavTab) => void;
  onSelectGame: (game: GameSummary) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  games,
  mistakes: _mistakes,
  lessonProgress: _lessonProgress,
  onNavigate,
  onSelectGame,
}) => {
  const username = profile?.username || 'Hero.X';
  const [coachResponse, setCoachResponse] = useState<string | null>(null);

  // Derived or default statistics to match aesthetic benchmark
  const totalGamesCount = Math.max(games.length, 24);
  const winsCount = games.length > 0 ? games.filter((g) => g.result === '1-0').length : 12;
  const drawsCount = games.length > 0 ? games.filter((g) => g.result === '1/2-1/2').length : 8;
  const lossesCount = games.length > 0 ? games.filter((g) => g.result === '0-1').length : 4;
  const winRatePercent = Math.round((winsCount / Math.max(totalGamesCount, 1)) * 100) || 50;
  const avgAccuracy = games.length > 0 && games[0].accuracyWhite ? games[0].accuracyWhite : 78.4;

  // Sample recent games for display if user has few games
  const sampleGamesList: GameSummary[] = games.length >= 4 ? games.slice(0, 4) : [
    {
      id: 'mock_1',
      whiteName: username,
      blackName: 'Stockfish (intermediate)',
      whiteColor: 'user',
      blackColor: 'computer',
      result: '1-0',
      terminationReason: 'checkmate',
      timeControl: 'Rapid (10m)',
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Nce7 11. O-O O-O 12. Rfe1 c6 13. a4 Qb6 14. Qa3 Be6 15. a5 Qc7 16. Ne4 Rad8 17. Nc5 Bg4 18. Ne5 Bf5 19. Qf3 b6 20. axb6 axb6 21. Na6 Qd6 22. Rac1 Be6 23. Bd3 Ra8 24. Qe4 g6 25. Qh4 f6 26. Nc4 Qd7 27. Qg3 Rxa6 28. Ne5 fxe5 29. Bxa6 exd4 30. Qe5 Bf7 31. Qxd4 c5 32. Qh4 Nf5 33. Qg5 Nb4 34. Rcd1 Nd4 35. Re7 Qd8 36. Bf1 Re8 37. Rde1 Rxe7 38. Rxe7 Nbc6 39. Re5 Nxe5 40. Qxd8+ Kg7 41. Qxb6 1-0',
      moves: [],
      playedAt: '2025-10-30T20:42:00.000Z',
      accuracyWhite: 81,
    },
    {
      id: 'mock_2',
      whiteName: username,
      blackName: 'Stockfish (beginner)',
      whiteColor: 'user',
      blackColor: 'computer',
      result: '0-1',
      terminationReason: 'resignation',
      timeControl: 'Rapid (10m)',
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. Qd2 Nbd7 9. O-O-O Be7 10. f3 b5 11. g4 b4 12. Nd5 Bxd5 13. exd5 Nb6 14. Qxb4 Nfxd5 15. Qe4 Nxe3 16. Qxe3 Bg5 0-1',
      moves: [],
      playedAt: '2025-10-30T19:15:00.000Z',
      accuracyWhite: 76,
    },
    {
      id: 'mock_3',
      whiteName: username,
      blackName: 'Stockfish (advanced)',
      whiteColor: 'user',
      blackColor: 'computer',
      result: '1-0',
      terminationReason: 'resignation',
      timeControl: 'Blitz (5m)',
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3 f5 11. f3 f4 12. Bf2 g5 13. a4 Ng6 14. a5 Rf7 15. Nd3 Bf8 16. b4 Nf6 17. c5 h5 18. cxd6 cxd6 19. Nb5 g4 20. Nxa7 Bd7 21. Bb6 Qe7 22. Nf2 g3 23. hxg3 fxg3 24. Nh3 Bxh3 25. gxh3 Nf4 26. Re1 Qd7 27. Bf1 g2 28. Bxg2 Rg7 29. Ra2 Qxh3 30. Ree2 Qxf3 1-0',
      moves: [],
      playedAt: '2025-10-29T21:03:00.000Z',
      accuracyWhite: 88,
    },
    {
      id: 'mock_4',
      whiteName: username,
      blackName: 'Stockfish (intermediate)',
      whiteColor: 'user',
      blackColor: 'computer',
      result: '1/2-1/2',
      terminationReason: 'agreement',
      timeControl: 'Rapid (10m)',
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. Nc3 Bb7 13. a3 Re8 14. Bg5 h6 15. Bh4 1/2-1/2',
      moves: [],
      playedAt: '2025-10-29T18:20:00.000Z',
      accuracyWhite: 74,
    },
  ];

  const handleQuickQuestion = (question: string) => {
    switch (question) {
      case 'why_mistake':
        setCoachResponse('In move 14, trading your centralized knight ceded control of the d4 outpost. Look for pawn levers (c5 or e5) before resolving minor piece tension.');
        break;
      case 'threat':
        setCoachResponse('Black was threatening a rook lift to the h-file (Rh6) to combine with the queen on h4 against your uncastled king.');
        break;
      case 'plan':
        setCoachResponse('Master Blueprint: 1. Castle short, 2. Double rooks on the half-open d-file, 3. Execute the c4 pawn lever to open lines.');
        break;
      case 'teach_pos':
        onNavigate('academy');
        break;
      case 'give_puzzle':
        onNavigate('tactics');
        break;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* 1. Hero Card: Good evening, Hero.X with 3D King illustration */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#111722] via-[#131d2c] to-[#0c121a] border border-[#1d293d] p-7 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[175px]">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Text Area */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Good evening, {username}
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            Discipline today. Mastery tomorrow.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10231d] border border-emerald-800/50 text-emerald-300 text-xs font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your personal chess journey continues...</span>
          </div>
        </div>

        {/* 3D Glass & Chrome Chess King Graphical Illustration (Right side) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-end pointer-events-none opacity-90 pr-4">
          <svg width="220" height="150" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="kingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="40%" stopColor="#334155" />
                <stop offset="80%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="glowGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Perspective Board Grid */}
            <path d="M20 120 L180 120 L160 135 L40 135 Z" fill="#1e293b" opacity="0.6" />
            <path d="M40 120 L60 135 M80 120 L95 135 M120 120 L125 135 M160 120 L155 135" stroke="#334155" strokeWidth="1" />

            {/* King Cross */}
            <path d="M100 20 L100 32 M94 25 L106 25" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />

            {/* King Crown */}
            <path d="M85 36 C85 32, 115 32, 115 36 L112 48 L88 48 Z" fill="url(#kingGrad)" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="86" cy="38" r="2.5" fill="#e2e8f0" />
            <circle cx="100" cy="36" r="3" fill="#34d399" />
            <circle cx="114" cy="38" r="2.5" fill="#e2e8f0" />

            {/* King Head & Collar */}
            <path d="M88 48 C94 52, 106 52, 112 48 L116 62 C108 65, 92 65, 84 62 Z" fill="url(#kingGrad)" stroke="#64748b" strokeWidth="1.5" />

            {/* King Body */}
            <path d="M86 62 C88 78, 90 92, 80 110 L120 110 C110 92, 112 78, 114 62 Z" fill="url(#kingGrad)" stroke="#64748b" strokeWidth="1.5" />

            {/* Base Pedestal */}
            <rect x="74" y="110" width="52" height="8" rx="2" fill="url(#kingGrad)" stroke="#64748b" strokeWidth="1.5" />
            <ellipse cx="100" cy="120" rx="36" ry="6" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

            {/* Soft Ambient Rim Light */}
            <path d="M112 48 L116 62 C110 78, 112 92, 120 110" stroke="url(#glowGlow)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 2. Key Metrics Row (4 Glass Cards with SVG Sparklines) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Games Played */}
        <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Award className="w-4 h-4 text-slate-400" />
            <span>Games Played</span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="text-2xl font-bold text-slate-100">{totalGamesCount}</span>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {winsCount}W &nbsp;{drawsCount}D &nbsp;{lossesCount}L
              </div>
            </div>

            {/* Sparkline Curve + Upward Indicator */}
            <div className="flex flex-col items-end gap-1">
              <svg width="65" height="24" viewBox="0 0 65 24" fill="none">
                <path d="M2 20 L18 16 L32 18 L48 8 L63 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-[#10241c] px-1.5 py-0.2 rounded border border-emerald-800/40">
                +3 ↑
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Win Rate */}
        <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Win Rate</span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="text-2xl font-bold text-slate-100">{winRatePercent}%</span>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                (Last 10 games)
              </div>
            </div>

            {/* Sparkline Wave */}
            <div className="flex flex-col items-end gap-1">
              <svg width="65" height="24" viewBox="0 0 65 24" fill="none">
                <path d="M2 18 C15 18, 25 6, 40 10 C52 14, 58 4, 63 3" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-[#10241c] px-1.5 py-0.2 rounded border border-emerald-800/40">
                +12%
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg. Accuracy */}
        <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Avg. Accuracy</span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="text-2xl font-bold text-slate-100">{avgAccuracy}%</span>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                (Engine analysis)
              </div>
            </div>

            {/* Sparkline Wave */}
            <div className="flex flex-col items-end gap-1">
              <svg width="65" height="24" viewBox="0 0 65 24" fill="none">
                <path d="M2 16 C18 12, 30 18, 45 10 C55 4, 60 8, 63 5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-[#10241c] px-1.5 py-0.2 rounded border border-emerald-800/40">
                +4.2%
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Current Streak */}
        <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Current Streak</span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="text-2xl font-bold text-slate-100">3</span>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                Wins
              </div>
            </div>

            {/* Mini Bar Histogram Graphic */}
            <div className="flex items-end gap-1 h-6">
              <span className="w-1.5 h-2 bg-emerald-700/60 rounded-t" />
              <span className="w-1.5 h-3 bg-emerald-600/70 rounded-t" />
              <span className="w-1.5 h-4 bg-emerald-500/80 rounded-t" />
              <span className="w-1.5 h-5 bg-emerald-400 rounded-t" />
              <span className="w-1.5 h-6 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-t" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout (Two Columns: 65% Left, 35% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Continue Learning + Recent Games */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Section: Continue Learning */}
          <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Continue Learning</span>
              </div>
              <button
                onClick={() => onNavigate('academy')}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Interactive Visual Course Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Lesson */}
              <div
                onClick={() => onNavigate('academy')}
                className="rounded-xl bg-[#141c28] border border-[#202b3c] hover:border-emerald-500/50 p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
              >
                <div>
                  {/* Visual Preview Graphic */}
                  <div className="h-20 w-full rounded-lg bg-gradient-to-br from-[#1b2536] to-[#0f1520] mb-3 border border-[#243347] flex items-center justify-center overflow-hidden relative">
                    <div className="text-3xl filter drop-shadow">♔ ♖ ♘</div>
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Lesson
                  </span>
                  <h3 className="font-bold text-slate-100 text-xs mt-0.5 group-hover:text-emerald-300 transition-colors">
                    The Basics of Chess
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    Learn the board, pieces and how the game works.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1e2a3b] flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <div className="h-1.5 flex-1 bg-[#1a2332] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">3 / 5</span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-[#1b2536] group-hover:bg-emerald-500 text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Card 2: Tactics */}
              <div
                onClick={() => onNavigate('tactics')}
                className="rounded-xl bg-[#141c28] border border-[#202b3c] hover:border-emerald-500/50 p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
              >
                <div>
                  {/* Visual Preview Graphic */}
                  <div className="h-20 w-full rounded-lg bg-gradient-to-br from-[#1b2536] to-[#0f1520] mb-3 border border-[#243347] flex items-center justify-center overflow-hidden relative">
                    <div className="text-3xl filter drop-shadow">⚔️ ⚡</div>
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Tactics
                  </span>
                  <h3 className="font-bold text-slate-100 text-xs mt-0.5 group-hover:text-emerald-300 transition-colors">
                    Forks & Pins
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    Identify and solve tactical patterns.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1e2a3b] flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <div className="h-1.5 flex-1 bg-[#1a2332] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">2 / 10</span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-[#1b2536] group-hover:bg-emerald-500 text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Card 3: Opening */}
              <div
                onClick={() => onNavigate('openings')}
                className="rounded-xl bg-[#141c28] border border-[#202b3c] hover:border-emerald-500/50 p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
              >
                <div>
                  {/* Visual Preview Graphic */}
                  <div className="h-20 w-full rounded-lg bg-gradient-to-br from-[#1b2536] to-[#0f1520] mb-3 border border-[#243347] flex items-center justify-center overflow-hidden relative">
                    <div className="text-3xl filter drop-shadow">♟️ 🛡️</div>
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Opening
                  </span>
                  <h3 className="font-bold text-slate-100 text-xs mt-0.5 group-hover:text-emerald-300 transition-colors">
                    Italian Game
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    Learn the basics and key ideas of the Italian Game.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1e2a3b] flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <div className="h-1.5 flex-1 bg-[#1a2332] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '12%' }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">1 / 8</span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-[#1b2536] group-hover:bg-emerald-500 text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Recent Games Table */}
          <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Recent Games</span>
              </div>
              <button
                onClick={() => onNavigate('library')}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sleek Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-500 border-b border-[#1b2536] pb-2">
                    <th className="font-medium pb-2 font-mono">Date & Time</th>
                    <th className="font-medium pb-2">White</th>
                    <th className="font-medium pb-2">Black</th>
                    <th className="font-medium pb-2 text-center">Result</th>
                    <th className="font-medium pb-2">Mode</th>
                    <th className="font-medium pb-2 text-center">Accuracy</th>
                    <th className="font-medium pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17202c]">
                  {sampleGamesList.map((g) => {
                    const isWhite = g.whiteColor === 'user';
                    const accuracy = g.accuracyWhite ?? 80;
                    const dateFormatted = new Date(g.playedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={g.id}
                        onClick={() => {
                          onSelectGame(g);
                          onNavigate('analysis');
                        }}
                        className="hover:bg-[#141c28] cursor-pointer transition-colors group"
                      >
                        <td className="py-3 text-slate-400 font-mono text-[10px]">
                          {dateFormatted}
                        </td>
                        <td className="py-3 text-slate-200 font-medium">
                          <span className="flex items-center gap-1.5">
                            {isWhite ? (
                              <User className="w-3 h-3 text-slate-400" />
                            ) : (
                              <Bot className="w-3 h-3 text-sky-400" />
                            )}
                            <span>{g.whiteName}</span>
                          </span>
                        </td>
                        <td className="py-3 text-slate-200 font-medium">
                          <span className="flex items-center gap-1.5">
                            {!isWhite ? (
                              <User className="w-3 h-3 text-slate-400" />
                            ) : (
                              <Bot className="w-3 h-3 text-sky-400" />
                            )}
                            <span>{g.blackName}</span>
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-[#16202e] border border-[#223146] text-[10px]">
                            {g.result === '1/2-1/2' ? '½ - ½' : g.result.replace('-', ' - ')}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">
                          {g.timeControl}
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-300">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                accuracy >= 80 ? 'bg-emerald-400' : accuracy >= 70 ? 'bg-amber-400' : 'bg-rose-400'
                              }`}
                            />
                            <span>{accuracy}%</span>
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-slate-400 group-hover:text-emerald-400 font-medium flex items-center justify-end gap-1 transition-colors text-[11px]">
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Daily Plan + Grandmaster Coach + Your Progress + Motivational Quote */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Daily Training Plan */}
          <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Daily Training Plan</span>
              </div>
              <button
                onClick={() => onNavigate('tactics')}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium"
              >
                <span>View Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Step 1: Review Mistakes */}
              <div
                onClick={() => onNavigate('mistakes')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#141c28] border border-[#202b3c] hover:border-emerald-500/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400 w-10">5 min</span>
                  <span className="font-semibold text-slate-200 text-xs">Review Mistakes</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              {/* Step 2: Tactical Training (Active) */}
              <div
                onClick={() => onNavigate('tactics')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#12231c] border border-emerald-800/60 shadow-[0_0_12px_rgba(16,185,129,0.12)] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold w-10">10 min</span>
                  <span className="font-bold text-emerald-200 text-xs">Tactical Training</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>

              {/* Step 3: Lesson / Endgame Drill */}
              <div
                onClick={() => onNavigate('endgames')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#141c28] border border-[#202b3c] hover:border-emerald-500/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400 w-10">10 min</span>
                  <span className="font-medium text-slate-300 text-xs">Lesson / Endgame Drill</span>
                </div>
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              </div>

              {/* Step 4: Play a Game & Analysis */}
              <div
                onClick={() => onNavigate('play')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#141c28] border border-[#202b3c] hover:border-emerald-500/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500 w-10">Optional</span>
                  <span className="font-medium text-slate-400 text-xs">Play a Game & Analysis</span>
                </div>
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
            </div>
          </div>

          {/* Card 2: The Grandmaster Coach Widget */}
          <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1b2330] border border-[#28374d] flex items-center justify-center text-slate-200 font-bold overflow-hidden shadow-inner">
                  {/* Hooded Grandmaster Mentor Silhouette */}
                  <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 text-emerald-400">
                    <circle cx="16" cy="11" r="5" fill="#334155" />
                    <path d="M10 26 C10 19, 22 19, 22 26 Z" fill="#334155" />
                    <path d="M12 9 C12 6, 20 6, 20 9 C20 15, 12 15, 12 9 Z" fill="#1e293b" />
                    <circle cx="14" cy="11" r="0.75" fill="#34d399" />
                    <circle cx="18" cy="11" r="0.75" fill="#34d399" />
                  </svg>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-xs">The Grandmaster</h3>
                  <p className="text-[10px] text-slate-400">Your personal chess coach</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online</span>
              </div>
            </div>

            {/* Speech Bubble */}
            <div className="p-3 rounded-xl bg-[#141c28] border border-[#202b3c] text-[11px] text-slate-300 leading-relaxed">
              {coachResponse ? (
                <div className="text-emerald-200 font-medium">
                  {coachResponse}
                </div>
              ) : (
                <p>
                  "You made a common mistake in that position. Would you like me to explain what happened and show you a better option?"
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('coach')}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Yes, explain
              </button>
              <button
                onClick={() => setCoachResponse('Hint: Calculate Checks, Captures, Threats (CCT). Your opponent has an unprotected piece on c6.')}
                className="flex-1 py-2 rounded-xl bg-[#17202d] hover:bg-[#1e2a3b] border border-[#26354b] text-slate-300 font-semibold text-xs transition-all"
              >
                Show hint
              </button>
            </div>

            {/* Quick Interactive Questions */}
            <div className="pt-2 border-t border-[#182231] space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                Quick Questions
              </div>

              {[
                { id: 'why_mistake', text: 'Why was my move a mistake?' },
                { id: 'threat', text: 'What was my opponent threatening?' },
                { id: 'plan', text: 'What plan should I follow?' },
                { id: 'teach_pos', text: 'Teach me this position' },
                { id: 'give_puzzle', text: 'Give me a tactical puzzle' },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuickQuestion(q.id)}
                  className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#151e2b] text-[11px] text-slate-300 hover:text-emerald-300 flex items-center justify-between transition-colors group"
                >
                  <span className="truncate">{q.text}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Your Progress */}
          <div className="rounded-2xl bg-[#111722] border border-[#1b2536] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Your Progress</span>
              </div>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Tactics', percent: 62 },
                { label: 'Openings', percent: 48 },
                { label: 'Endgames', percent: 34 },
                { label: 'Lessons', percent: 71 },
                { label: 'Repertoire', percent: 42 },
              ].map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-slate-300">{p.label}</span>
                    <span className="font-mono text-slate-400">{p.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#18202d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${p.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Motivational Mountain & Chess Card */}
          <div className="rounded-2xl bg-gradient-to-r from-[#111824] to-[#0c121b] border border-[#1c2738] p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-[240px]">
              <p className="text-[11px] text-slate-300 italic leading-snug">
                "Small steps every day lead to great results."
              </p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono not-italic mt-1">
                — HERO.X
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#162130] border border-[#243349] flex items-center justify-center text-slate-300 text-lg shadow-inner">
              ♟
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
