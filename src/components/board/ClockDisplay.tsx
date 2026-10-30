import React from 'react';
import { Color } from '../../types/chess';
import { Clock, Bot, User } from 'lucide-react';

interface ClockDisplayProps {
  whiteSeconds: number;
  blackSeconds: number;
  activeColor: Color | null;
  whiteName?: string;
  blackName?: string;
  isUntimed?: boolean;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  whiteSeconds,
  blackSeconds,
  activeColor,
  whiteName = 'White',
  blackName = 'Black',
  isUntimed = false,
}) => {
  const formatTime = (totalSecs: number) => {
    if (isUntimed) return '∞';
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isWhiteActive = activeColor === 'w';
  const isBlackActive = activeColor === 'b';

  const isBlackBot = blackName.toLowerCase().includes('stockfish');
  const isWhiteBot = whiteName.toLowerCase().includes('stockfish');

  return (
    <div className="flex items-center justify-between w-full px-1 py-1 gap-2.5 font-mono select-none">
      {/* Black Player info & clock */}
      <div
        className={`flex items-center justify-between flex-1 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
          isBlackActive
            ? 'bg-charcoal-850 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40 text-charcoal-100'
            : 'bg-charcoal-900 border-charcoal-800 text-charcoal-400'
        }`}
      >
        <div className="flex items-center gap-2 truncate max-w-[150px]">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              isBlackBot ? 'bg-sky-950/70 text-sky-400 border border-sky-700/50' : 'bg-charcoal-800 text-charcoal-300'
            }`}
          >
            {isBlackBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="font-sans text-xs font-bold truncate text-charcoal-200">{blackName}</span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-sm">
          <Clock className={`w-3.5 h-3.5 ${isBlackActive ? 'text-emerald-400 animate-pulse' : 'text-charcoal-600'}`} />
          <span
            className={`${
              blackSeconds < 30 && !isUntimed && isBlackActive
                ? 'text-rose-400 font-extrabold animate-pulse'
                : isBlackActive
                ? 'text-emerald-300'
                : 'text-charcoal-300'
            }`}
          >
            {formatTime(blackSeconds)}
          </span>
        </div>
      </div>

      {/* White Player info & clock */}
      <div
        className={`flex items-center justify-between flex-1 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
          isWhiteActive
            ? 'bg-charcoal-850 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40 text-charcoal-100'
            : 'bg-charcoal-900 border-charcoal-800 text-charcoal-400'
        }`}
      >
        <div className="flex items-center gap-2 truncate max-w-[150px]">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              isWhiteBot ? 'bg-sky-950/70 text-sky-400 border border-sky-700/50' : 'bg-charcoal-800 text-charcoal-300'
            }`}
          >
            {isWhiteBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="font-sans text-xs font-bold truncate text-charcoal-200">{whiteName}</span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-sm">
          <Clock className={`w-3.5 h-3.5 ${isWhiteActive ? 'text-emerald-400 animate-pulse' : 'text-charcoal-600'}`} />
          <span
            className={`${
              whiteSeconds < 30 && !isUntimed && isWhiteActive
                ? 'text-rose-400 font-extrabold animate-pulse'
                : isWhiteActive
                ? 'text-emerald-300'
                : 'text-charcoal-300'
            }`}
          >
            {formatTime(whiteSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
