import React, { useState } from 'react';
import { UserProfile, UserSettings, PieceSetName } from '../../types/database';
import { TIME_CONTROLS } from '../../types/chess';
import { Shield, Sparkles, Check } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

interface FirstRunModalProps {
  onComplete: (profile: UserProfile, settings: Partial<UserSettings>) => void;
}

export const FirstRunModal: React.FC<FirstRunModalProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('ChessEnthusiast');
  const [experience, setExperience] = useState<'beginner' | 'casual' | 'club_player' | 'advanced'>('beginner');
  const [rating, setRating] = useState<string>('1000');
  const [notation, setNotation] = useState<'none' | 'basic' | 'fluent'>('basic');
  const [timeControl, setTimeControl] = useState('10 + 0 (Rapid)');
  const [coachingStyle, setCoachingStyle] = useState<'gentle' | 'tournament' | 'tactical' | 'grandmaster' | 'minimal'>('gentle');
  const [dailyMinutes, setDailyMinutes] = useState(25);
  const [boardTheme, setBoardTheme] = useState<'tournament' | 'wood' | 'slate'>('tournament');
  const [pieceSet, setPieceSet] = useState<PieceSetName>('classic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profile: UserProfile = {
      id: 'profile_' + Date.now(),
      username: username.trim() || 'Player',
      experienceLevel: experience,
      estimatedRating: rating ? parseInt(rating, 10) : undefined,
      notationFamiliarity: notation,
      preferredTimeControl: timeControl,
      coachingStyle,
      dailyGoalMinutes: dailyMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onComplete(profile, { boardTheme, pieceSet });
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-charcoal-800">
          <AppLogo size={42} />
          <div>
            <h1 className="text-lg font-bold text-charcoal-100 flex items-center gap-2">
              Welcome to Grandmaster OS
            </h1>
            <p className="text-xs text-charcoal-400">
              Your private, offline-first personal chess laboratory. Designed for beginner to tournament mastery.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Username */}
          <div>
            <label className="block text-charcoal-300 font-medium mb-1">
              Local Username (used for local profiles and PGN tags)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-3 py-2 text-charcoal-100 focus:outline-none focus:border-chess-green font-medium"
              placeholder="e.g. Mikhail"
            />
          </div>

          {/* Playing Experience */}
          <div>
            <label className="block text-charcoal-300 font-medium mb-1">Self-Estimated Experience</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'beginner', label: 'Beginner (< 1000)', desc: 'Learning rules & basic moves' },
                { id: 'casual', label: 'Casual (1000 - 1300)', desc: 'Plays online or with friends' },
                { id: 'club_player', label: 'Club Player (1300 - 1700)', desc: 'Knows openings & tactics' },
                { id: 'advanced', label: 'Advanced (1700+)', desc: 'Tournament competitor' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setExperience(opt.id as 'beginner' | 'casual' | 'club_player' | 'advanced')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    experience === opt.id
                      ? 'bg-chess-green/20 border-chess-green text-emerald-300'
                      : 'bg-charcoal-800 border-charcoal-700 text-charcoal-300 hover:bg-charcoal-750'
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-charcoal-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notation & Rating Estimate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-charcoal-300 font-medium mb-1">Notation Familiarity</label>
              <select
                value={notation}
                onChange={(e) => setNotation(e.target.value as 'none' | 'basic' | 'fluent')}
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-2.5 py-1.5 text-charcoal-200"
              >
                <option value="none">None (prefer visuals)</option>
                <option value="basic">Basic (know square names)</option>
                <option value="fluent">Fluent (read SAN effortlessly)</option>
              </select>
            </div>

            <div>
              <label className="block text-charcoal-300 font-medium mb-1">Optional Rating Estimate</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-2.5 py-1.5 text-charcoal-100"
                placeholder="1200"
              />
            </div>
          </div>

          {/* Preferred Time Control & Coaching Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-charcoal-300 font-medium mb-1">Preferred Time Control</label>
              <select
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-2.5 py-1.5 text-charcoal-200"
              >
                {TIME_CONTROLS.map((tc) => (
                  <option key={tc.name} value={tc.name}>
                    {tc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-charcoal-300 font-medium mb-1">Coach Tone</label>
              <select
                value={coachingStyle}
                onChange={(e) =>
                  setCoachingStyle(e.target.value as 'gentle' | 'tournament' | 'tactical' | 'grandmaster' | 'minimal')
                }
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-2.5 py-1.5 text-charcoal-200"
              >
                <option value="gentle">Gentle Teacher (Encouraging)</option>
                <option value="tournament">Tournament Coach (Pragmatic)</option>
                <option value="tactical">Tactical Analyst (Calculating)</option>
                <option value="grandmaster">Grandmaster Challenge (Demanding)</option>
                <option value="minimal">Minimal Hints</option>
              </select>
            </div>
          </div>

          {/* Board Theme & Piece Set */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-charcoal-300 font-medium mb-1">Board Theme</label>
              <select
                value={boardTheme}
                onChange={(e) => setBoardTheme(e.target.value as any)}
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-2.5 py-1.5 text-charcoal-200"
              >
                <option value="tournament">Tournament Green</option>
                <option value="wood">Classic Wood</option>
                <option value="slate">Slate Gray</option>
              </select>
            </div>

            <div>
              <label className="block text-charcoal-300 font-medium mb-1">Piece Style</label>
              <select
                value={pieceSet}
                onChange={(e) => setPieceSet(e.target.value as any)}
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-2.5 py-1.5 text-charcoal-200"
              >
                <option value="classic">Neo Staunton (Master)</option>
                <option value="wood">Warm Woodgrain</option>
                <option value="modern">Modern Minimal</option>
              </select>
            </div>
          </div>

          {/* Privacy note */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded flex items-center gap-2 text-emerald-300 text-[11px]">
            <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              All data is stored exclusively on your local computer. No cloud synchronization, analytics, or external requests.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 bg-chess-green hover:bg-chess-greenLight text-white font-semibold rounded shadow transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Initialize Private Academy</span>
          </button>
        </form>
      </div>
    </div>
  );
};
