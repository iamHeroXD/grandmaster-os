import React from 'react';
import { Color } from '../../types/chess';
import { Clock } from 'lucide-react';

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

  return (
    <div className="flex items-center justify-between w-full px-1 py-1 gap-2 font-mono text-xs sm:text-sm">
      {/* Black Player info & clock */}
      <div
        className={`flex items-center justify-between flex-1 px-3 py-1.5 rounded-lg border transition-all ${
          isBlackActive
            ? 'bg-charcoal-800 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
            : 'bg-charcoal-900 border-charcoal-800 text-charcoal-400'
        }`}
      >
        <span className="font-sans text-xs truncate max-w-[120px]">{blackName}</span>
        <div className="flex items-center gap-1.5 font-bold">
          <Clock className={`w-3.5 h-3.5 ${isBlackActive ? 'text-emerald-400 animate-pulse' : 'text-charcoal-500'}`} />
          <span className={blackSeconds < 30 && !isUntimed ? 'text-rose-400 font-bold' : ''}>
            {formatTime(blackSeconds)}
          </span>
        </div>
      </div>

      {/* White Player info & clock */}
      <div
        className={`flex items-center justify-between flex-1 px-3 py-1.5 rounded-lg border transition-all ${
          isWhiteActive
            ? 'bg-charcoal-800 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
            : 'bg-charcoal-900 border-charcoal-800 text-charcoal-400'
        }`}
      >
        <span className="font-sans text-xs truncate max-w-[120px]">{whiteName}</span>
        <div className="flex items-center gap-1.5 font-bold">
          <Clock className={`w-3.5 h-3.5 ${isWhiteActive ? 'text-emerald-400 animate-pulse' : 'text-charcoal-500'}`} />
          <span className={whiteSeconds < 30 && !isUntimed ? 'text-rose-400 font-bold' : ''}>
            {formatTime(whiteSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
