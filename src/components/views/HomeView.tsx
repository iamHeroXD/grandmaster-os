import React from 'react';
import { UserProfile, StoredMistake, LessonProgress } from '../../types/database';
import { GameSummary } from '../../types/chess';
import { NavTab } from '../layout/Sidebar';
import {
  Play,
  GraduationCap,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Trophy,
  Clock,
  Sparkles,
  Swords,
  Target,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

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
  mistakes,
  lessonProgress,
  onNavigate,
  onSelectGame,
}) => {
  const username = profile?.username || 'Grandmaster';
  const totalGames = games.length;
  const wins = games.filter((g) => g.result === '1-0').length;
  const draws = games.filter((g) => g.result === '1/2-1/2').length;
  const losses = games.filter((g) => g.result === '0-1').length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const mistakesDue = mistakes.filter((m) => new Date(m.nextReviewDate).getTime() <= Date.now()).length;
  const completedLessons = Object.values(lessonProgress).filter((l) => l.completed).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full text-xs">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-charcoal-850 border border-charcoal-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <AppLogo size={56} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Private Chess Academy</span>
              </span>
              <span className="text-[11px] font-mono text-charcoal-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Offline</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-charcoal-100 tracking-tight">
              Welcome back, {username}
            </h1>
            <p className="text-xs text-charcoal-300 mt-1 max-w-lg leading-relaxed">
              Your offline training laboratory is active. Stockfish neural engine is initialized and ready for practice, tactical drills, and game analysis.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('play')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 z-10"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Match</span>
        </button>
      </div>

      {/* Daily Training Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Review Mistakes */}
        <div
          onClick={() => onNavigate('mistakes')}
          className="bg-charcoal-900 border border-charcoal-800 hover:border-amber-600/60 rounded-2xl p-5 cursor-pointer transition-all hover:bg-charcoal-850/80 hover:-translate-y-0.5 shadow-md flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
              {mistakesDue > 0 ? (
                <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-full animate-pulse">
                  {mistakesDue} Due Now
                </span>
              ) : (
                <span className="text-xs font-semibold text-charcoal-400 bg-charcoal-800 px-2 py-0.5 rounded-full">
                  Up to date
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-charcoal-100 group-hover:text-amber-300 transition-colors">
              Mistake Gym (Spaced Repetition)
            </h3>
            <p className="text-xs text-charcoal-300 mt-1.5 leading-relaxed">
              Turn past game blunders into permanent master reflexes. The gym serves flashcards of positions where you stumbled.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-charcoal-800 text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <span>Solve Blunders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Tactical Calculation */}
        <div
          onClick={() => onNavigate('tactics')}
          className="bg-charcoal-900 border border-charcoal-800 hover:border-emerald-600/60 rounded-2xl p-5 cursor-pointer transition-all hover:bg-charcoal-850/80 hover:-translate-y-0.5 shadow-md flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-mono">
                Rated Puzzles
              </span>
            </div>
            <h3 className="text-sm font-bold text-charcoal-100 group-hover:text-emerald-300 transition-colors">
              Tactics Gym & Calculations
            </h3>
            <p className="text-xs text-charcoal-300 mt-1.5 leading-relaxed">
              Sharpen your tactical vision: forks, skewers, pins, deflections, and mating nets with 3-tier progressive hints.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-charcoal-800 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span>Train Tactics</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Academy Curriculum */}
        <div
          onClick={() => onNavigate('academy')}
          className="bg-charcoal-900 border border-charcoal-800 hover:border-sky-600/60 rounded-2xl p-5 cursor-pointer transition-all hover:bg-charcoal-850/80 hover:-translate-y-0.5 shadow-md flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-950/70 border border-sky-800/60 flex items-center justify-center text-sky-400 shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded-full font-mono">
                {completedLessons} Completed
              </span>
            </div>
            <h3 className="text-sm font-bold text-charcoal-100 group-hover:text-sky-300 transition-colors">
              Master Academy Curriculum
            </h3>
            <p className="text-xs text-charcoal-300 mt-1.5 leading-relaxed">
              A 7-stage master course with interactive board exercises spanning board basics, King safety, pawn structures, and endgames.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-charcoal-800 text-xs font-bold text-sky-400 flex items-center gap-1.5">
            <span>Resume Lessons</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Progress & Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-charcoal-400 uppercase font-bold">Games Played</span>
          <div className="text-2xl font-black text-charcoal-100 mt-1">{totalGames}</div>
          <div className="text-xs text-charcoal-300 mt-0.5 font-mono">
            {wins}W / {draws}D / {losses}L
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-charcoal-400 uppercase font-bold">Win Rate</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{winRate}%</div>
          <div className="text-xs text-charcoal-300 mt-0.5">Against local computer</div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-charcoal-400 uppercase font-bold">Lessons Mastered</span>
          <div className="text-2xl font-black text-sky-400 mt-1">{completedLessons}</div>
          <div className="text-xs text-charcoal-300 mt-0.5">Across 7 courses</div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-charcoal-400 uppercase font-bold">Mistakes Resolved</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {mistakes.filter((m) => m.reviewStatus === 'mastered').length}
          </div>
          <div className="text-xs text-charcoal-300 mt-0.5">Via spaced repetition</div>
        </div>
      </div>

      {/* Recent Games Shelf */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-charcoal-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Games & Match History</span>
          </h2>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-10 text-charcoal-400 italic text-xs bg-charcoal-950/60 rounded-xl border border-charcoal-800/80">
            No games recorded yet. Click <strong className="text-emerald-400">"Start Match"</strong> above to play your first game against the offline engine!
          </div>
        ) : (
          <div className="divide-y divide-charcoal-800/60 font-mono text-xs">
            {games.slice(0, 5).map((g) => (
              <div
                key={g.id}
                onClick={() => {
                  onSelectGame(g);
                  onNavigate('analysis');
                }}
                className="py-3 px-3 flex items-center justify-between hover:bg-charcoal-850/70 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-black px-2 py-0.5 rounded text-xs ${
                      g.result === '1-0'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : g.result === '0-1'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-charcoal-800 text-charcoal-300 border border-charcoal-700'
                    }`}
                  >
                    {g.result}
                  </span>
                  <span className="text-charcoal-100 font-sans font-bold text-xs group-hover:text-emerald-300 transition-colors">
                    {g.whiteName} vs {g.blackName}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-charcoal-300 text-xs font-sans">
                  <span className="font-mono text-charcoal-400">{g.timeControl}</span>
                  <span className="font-mono text-charcoal-400">{g.moves.length} moves</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>Analyze</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
