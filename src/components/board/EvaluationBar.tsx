import React from 'react';

interface EvaluationBarProps {
  scoreCp?: number;
  scoreMate?: number;
  isMate?: boolean;
  orientation?: 'w' | 'b';
  compact?: boolean;
  heightClass?: string;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  scoreCp = 0,
  scoreMate,
  isMate = false,
  orientation = 'w',
  compact = false,
  heightClass = 'min-h-[280px]',
}) => {
  // Convert evaluation into percentage for White (0% = Black winning, 50% = Equal, 100% = White winning)
  let whitePercent = 50;

  if (isMate && scoreMate !== undefined) {
    whitePercent = scoreMate > 0 ? 100 : 0;
  } else {
    // Sigmoid transformation: 400cp ~ 73%, 800cp ~ 90%, 1500cp ~ 98%
    const clampedCp = Math.max(-1500, Math.min(1500, scoreCp));
    const winChance = 1 / (1 + Math.pow(10, -clampedCp / 400));
    whitePercent = Math.round(winChance * 100);
  }

  // Display label
  let label = '0.0';
  if (isMate && scoreMate !== undefined) {
    label = scoreMate > 0 ? `+M${Math.abs(scoreMate)}` : `-M${Math.abs(scoreMate)}`;
  } else {
    const pawns = (scoreCp / 100).toFixed(1);
    label = scoreCp > 0 ? `+${pawns}` : pawns;
  }

  // Adjust for orientation
  const topPercent = orientation === 'w' ? 100 - whitePercent : whitePercent;

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-charcoal-900 border border-charcoal-700 select-none shadow-lg ${heightClass} ${
        compact ? 'w-5' : 'w-7'
      } flex flex-col`}
    >
      {/* Black's share (top) */}
      <div
        className="w-full bg-[#1e2329] transition-all duration-300 ease-out border-b border-charcoal-800"
        style={{ height: `${topPercent}%` }}
      />
      {/* White's share (bottom) */}
      <div
        className="w-full bg-[#f0f2f5] transition-all duration-300 ease-out"
        style={{ height: `${100 - topPercent}%` }}
      />

      {/* Numerical score label */}
      <div
        className={`absolute inset-x-0 text-center font-mono font-black tracking-tighter px-0.5 pointer-events-none drop-shadow ${
          compact ? 'text-[9px]' : 'text-[10px]'
        } ${
          whitePercent >= 50
            ? 'bottom-2 text-charcoal-950'
            : 'top-2 text-charcoal-50'
        }`}
      >
        {label}
      </div>
    </div>
  );
};
