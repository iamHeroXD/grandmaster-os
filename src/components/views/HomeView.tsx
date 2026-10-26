import React from 'react';
import { UserProfile, StoredMistake, LessonProgress } from '../../types/database';
import { GameSummary } from '../../types/chess';
import { NavTab } from '../layout/Sidebar';
import { Play, GraduationCap, AlertTriangle, Zap, CheckCircle2, Trophy, Clock } from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 shadow">
        <div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
            Private Academy Dashboard
          </span>
          <h1 className="text-2xl font-bold text-charcoal-100 mt-0.5">
            Welcome back, {username}
          </h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Your offline chess laboratory is ready. Daily training plan formulated based on your personal weaknesses.
          </p>
        </div>

        <button
          onClick={() => onNavigate('play')}
          className="px-5 py-2.5 bg-chess-green hover:bg-chess-greenLight text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-2 transition-all hover:scale-105"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Quick Play</span>
        </button>
      </div>

      {/* Daily Training Plan & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Review Mistakes */}
        <div
          onClick={() => onNavigate('mistakes')}
          className="bg-charcoal-900 border border-charcoal-800 hover:border-amber-700/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-charcoal-850 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            {mistakesDue > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-full">
                {mistakesDue} Due Now
              </span>
            ) : (
              <span className="text-[10px] font-medium text-charcoal-500">Up to date</span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-100">Review My Mistakes</h3>
            <p className="text-xs text-charcoal-400 mt-1">
              Spaced repetition drills converting past game blunders into permanent master reflexes.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal-800/60 text-[11px] font-semibold text-amber-400">
            5 min workout &rarr;
          </div>
        </div>

        {/* Card 2: Tactical Calculation */}
        <div
          onClick={() => onNavigate('tactics')}
          className="bg-charcoal-900 border border-charcoal-800 hover:border-emerald-700/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-charcoal-850 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
              Tactics Gym
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-100">Daily Calculation Gym</h3>
            <p className="text-xs text-charcoal-400 mt-1">
              Sharpen pattern recognition with verified checkmate shots, forks, pins, and skewers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal-800/60 text-[11px] font-semibold text-emerald-400">
            10 min workout &rarr;
          </div>
        </div>

        {/* Card 3: Academy Course */}
        <div
          onClick={() => onNavigate('academy')}
          className="bg-charcoal-900 border border-charcoal-800 hover:border-sky-700/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-charcoal-850 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded-full">
              {completedLessons}/11 Done
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-100">Continue Academy</h3>
            <p className="text-xs text-charcoal-400 mt-1">
              Follow the 7-stage master curriculum from board fundamentals to competitive tournament mastery.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal-800/60 text-[11px] font-semibold text-sky-400">
            Resume Lessons &rarr;
          </div>
        </div>
      </div>

      {/* Progress & Stat Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-charcoal-400 uppercase">Games Played</span>
          <div className="text-xl font-bold text-charcoal-100 mt-1">{totalGames}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">
            {wins}W / {draws}D / {losses}L
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-charcoal-400 uppercase">Win Rate</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{winRate}%</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Against local computer</div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-charcoal-400 uppercase">Lessons Mastered</span>
          <div className="text-xl font-bold text-sky-400 mt-1">{completedLessons}</div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Across 7 courses</div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-charcoal-400 uppercase">Mistakes Resolved</span>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {mistakes.filter((m) => m.reviewStatus === 'mastered').length}
          </div>
          <div className="text-[11px] text-charcoal-400 mt-0.5">Via spaced repetition</div>
        </div>
      </div>

      {/* Recent Games */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-charcoal-400" />
            <span>Recent Games</span>
          </h2>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-chess-green hover:underline font-semibold"
          >
            View all games &rarr;
          </button>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500 italic text-xs">
            No games played yet. Click "Quick Play" to play your first game against the local engine!
          </div>
        ) : (
          <div className="divide-y divide-charcoal-800 font-mono text-xs">
            {games.slice(0, 5).map((g) => (
              <div
                key={g.id}
                onClick={() => {
                  onSelectGame(g);
                  onNavigate('analysis');
                }}
                className="py-2.5 px-3 flex items-center justify-between hover:bg-charcoal-800/50 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      g.result === '1-0'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : g.result === '0-1'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-charcoal-800 text-charcoal-300'
                    }`}
                  >
                    {g.result}
                  </span>
                  <span className="text-charcoal-200 font-sans">
                    {g.whiteName} vs {g.blackName}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-charcoal-400 text-[11px]">
                  <span>{g.timeControl}</span>
                  <span>{g.moves.length} moves</span>
                  <span className="text-chess-green font-semibold">Analyze &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
