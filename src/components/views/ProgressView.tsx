import React from 'react';
import { UserProfile, StoredMistake, LessonProgress, PuzzleAttempt } from '../../types/database';
import { GameSummary } from '../../types/chess';
import { TrendingUp, Award, Target, Zap, HelpCircle } from 'lucide-react';

interface ProgressViewProps {
  profile: UserProfile | null;
  games: GameSummary[];
  mistakes: StoredMistake[];
  lessonProgress: Record<string, LessonProgress>;
  puzzleAttempts: PuzzleAttempt[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  games,
  mistakes,
  lessonProgress,
  puzzleAttempts,
}) => {
  const totalGames = games.length;
  const whiteGames = games.filter((g) => g.whiteColor === 'user');
  const blackGames = games.filter((g) => g.blackColor === 'user');

  const whiteWins = whiteGames.filter((g) => g.result === '1-0').length;
  const blackWins = blackGames.filter((g) => g.result === '0-1').length;

  const totalWins = games.filter((g) => (g.whiteColor === 'user' && g.result === '1-0') || (g.blackColor === 'user' && g.result === '0-1')).length;
  const totalDraws = games.filter((g) => g.result === '1/2-1/2').length;
  const totalLosses = totalGames - totalWins - totalDraws;

  const puzzlesSolved = puzzleAttempts.filter((p) => p.solved).length;
  const puzzleAccuracy = puzzleAttempts.length > 0 ? Math.round((puzzlesSolved / puzzleAttempts.length) * 100) : 0;

  const mistakesMastered = mistakes.filter((m) => m.reviewStatus === 'mastered').length;
  const completedLessons = Object.values(lessonProgress).filter((l) => l.completed).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#111722] border border-[#1b2536] rounded-2xl p-5 shadow-sm">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Evidence-Based Performance Tracking
          </span>
          <h1 className="text-xl font-extrabold text-slate-100 mt-0.5">
            Personal Mastery Profile: {profile?.username || 'Hero.X'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            All metrics derive exclusively from actual local game data and puzzle attempts. Zero fabricated ratings.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Award className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] uppercase font-mono">Total Games</span>
          </div>
          <div className="text-2xl font-black text-slate-100 my-1">{totalGames}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {totalWins}W • {totalDraws}D • {totalLosses}L
          </div>
        </div>

        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase font-mono">Tactics Accuracy</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 my-1">{puzzleAccuracy}%</div>
          <div className="text-[11px] text-slate-500">
            {puzzlesSolved} of {puzzleAttempts.length} solved
          </div>
        </div>

        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Target className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] uppercase font-mono">Curriculum Mastery</span>
          </div>
          <div className="text-2xl font-black text-sky-400 my-1">{completedLessons} / 11</div>
          <div className="text-[11px] text-slate-500">
            Lessons verified on board
          </div>
        </div>

        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] uppercase font-mono">Mistakes Resolved</span>
          </div>
          <div className="text-2xl font-black text-amber-400 my-1">{mistakesMastered}</div>
          <div className="text-[11px] text-slate-500">
            Consecutive SM-2 successes
          </div>
        </div>
      </div>

      {/* Performance by Color */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-100" />
            <span>As White</span>
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Games Played:</span>
              <span className="font-mono font-bold">{whiteGames.length}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Win Rate:</span>
              <span className="font-mono font-bold text-emerald-400">
                {whiteGames.length > 0 ? Math.round((whiteWins / whiteGames.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700" />
            <span>As Black</span>
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Games Played:</span>
              <span className="font-mono font-bold">{blackGames.length}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Win Rate:</span>
              <span className="font-mono font-bold text-emerald-400">
                {blackGames.length > 0 ? Math.round((blackWins / blackGames.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Formula Methodology Notice */}
      <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Move Accuracy Methodology & Transparency</span>
        </h3>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Grandmaster OS calculates move accuracy using the mathematical centipawn loss function:
        </p>
        <div className="font-mono text-[11px] p-3 bg-[#141c28] rounded-xl border border-[#202b3c] text-emerald-300">
          Accuracy = 100 × exp(-0.0035 × Average_Centipawn_Loss)
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Move accuracy is an approximation of move precision relative to Stockfish's top choices. It is not an official FIDE rating or verified master title, but a practical indicator of consistency and tactical discipline.
        </p>
      </div>
    </div>
  );
};
