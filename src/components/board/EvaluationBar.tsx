import React from 'react';

interface EvaluationBarProps {
  scoreCp?: number;
  scoreMate?: number;
  isMate?: boolean;
  orientation?: 'w' | 'b';
  compact?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  scoreCp = 0,
  scoreMate,
  isMate = false,
  orientation = 'w',
  compact = false,
}) => {
  // Convert evaluation into percentage for White (0% = Black winning, 50% = Equal, 100% = White winning)
  let whitePercent = 50;

  if (isMate && scoreMate !== undefined) {
    whitePercent = scoreMate > 0 ? 100 : 0;
  } else {
    // Sigmoid or clamped transform: 1000cp gives ~98%
    // formula: 50 + 50 * (2 / (1 + exp(-0.004 * scoreCp)) - 1)
    const clampedCp = Math.max(-1500, Math.min(1500, scoreCp));
    const winChance = 1 / (1 + Math.pow(10, -clampedCp / 400));
    whitePercent = Math.round(winChance * 100);
  }

  // Display label
  let label = '0.0';
  if (isMate && scoreMate !== undefined) {
    label = `M${Math.abs(scoreMate)}`;
  } else {
    const pawns = (scoreCp / 100).toFixed(1);
    label = scoreCp > 0 ? `+${pawns}` : pawns;
  }

  // Adjust for orientation
  const topPercent = orientation === 'w' ? 100 - whitePercent : whitePercent;

  return (
    <div
      className={`relative rounded overflow-hidden bg-charcoal-800 border border-charcoal-700 select-none shadow ${
        compact ? 'w-4 h-full' : 'w-7 h-full min-h-[300px]'
      }`}
    >
      {/* Black's share (top) */}
      <div
        className="w-full bg-charcoal-900 transition-all duration-300 ease-out"
        style={{ height: `${topPercent}%` }}
      />
      {/* White's share (bottom) */}
      <div
        className="w-full bg-slate-100 transition-all duration-300 ease-out"
        style={{ height: `${100 - topPercent}%` }}
      />

      {/* Numerical score label */}
      {!compact && (
        <div
          className={`absolute inset-x-0 text-center text-[10px] font-mono font-bold px-0.5 ${
            whitePercent >= 50
              ? 'bottom-2 text-charcoal-900'
              : 'top-2 text-slate-100'
          }`}
        >
          {label}
        </div>
      )}
    </div>
  );
};
