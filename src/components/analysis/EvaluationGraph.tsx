import React from 'react';
import { MoveRecord } from '../../types/chess';

interface EvaluationGraphProps {
  moves: MoveRecord[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  height?: number;
}

export const EvaluationGraph: React.FC<EvaluationGraphProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  height = 90,
}) => {
  if (moves.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full bg-charcoal-900 border border-charcoal-800 rounded flex items-center justify-center text-xs text-charcoal-500 italic"
      >
        Play moves to generate evaluation chart
      </div>
    );
  }

  // Clamped centipawn values [-500, +500]
  const clampEval = (cp?: number) => {
    if (cp === undefined) return 0;
    return Math.max(-500, Math.min(500, cp));
  };

  const points = moves.map((m, idx) => {
    const cp = clampEval(m.evalCp);
    // map cp [-500, 500] to y [height - 4, 4]
    const y = (height / 2) - (cp / 500) * ((height - 12) / 2);
    return { x: idx, y, move: m, cp };
  });

  const width = Math.max(100, moves.length * 12);
  const midY = height / 2;

  // Build SVG path
  let pathD = `M 0 ${midY} `;
  points.forEach((p, idx) => {
    const x = ((idx + 0.5) / moves.length) * 100;
    pathD += `L ${x} ${p.y} `;
  });

  return (
    <div className="w-full bg-charcoal-900 border border-charcoal-800 rounded p-1.5 flex flex-col gap-1 select-none">
      <div className="flex items-center justify-between text-[10px] text-charcoal-400 font-mono px-1">
        <span>Evaluation Swing Chart</span>
        <span>+5.0 / -5.0</span>
      </div>

      <div className="relative w-full overflow-x-auto" style={{ height }}>
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full cursor-pointer">
          {/* Zero baseline */}
          <line x1="0" y1={midY} x2="100" y2={midY} stroke="#32373d" strokeWidth="1" strokeDasharray="2,2" />

          {/* Eval Curve */}
          <path d={pathD} fill="none" stroke="#4e7c59" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Move Points */}
          {points.map((p, idx) => {
            const x = ((idx + 0.5) / moves.length) * 100;
            const isSelected = currentMoveIndex === idx;
            const isBlunder = p.move.classification === 'blunder';
            const isMistake = p.move.classification === 'mistake';

            return (
              <g key={idx} onClick={() => onSelectMove(idx)}>
                {/* Click target */}
                <rect x={x - 1.5} y="0" width="3" height={height} fill="transparent" />

                {/* Point dot */}
                <circle
                  cx={x}
                  cy={p.y}
                  r={isSelected ? 3.5 : isBlunder ? 3 : isMistake ? 2.5 : 1.5}
                  fill={isBlunder ? '#e11d48' : isMistake ? '#f97316' : isSelected ? '#34d399' : '#656e79'}
                  className="transition-all hover:r-4"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
