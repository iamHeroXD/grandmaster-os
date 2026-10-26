import React from 'react';
import { PieceType, Color } from '../../types/chess';
import { PieceSvg } from './PieceSvg';

interface CapturedTrayProps {
  board: ({ type: PieceType; color: Color } | null)[][];
  playerColor?: Color;
}

const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const INITIAL_PIECES: Record<Color, Record<PieceType, number>> = {
  w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
};

export const CapturedTray: React.FC<CapturedTrayProps> = ({ board }) => {
  // Count remaining pieces on board
  const remaining: Record<Color, Record<PieceType, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        remaining[p.color][p.type]++;
      }
    }
  }

  // Calculate captured pieces
  const capturedByWhite: PieceType[] = [];
  const capturedByBlack: PieceType[] = [];

  let whitePoints = 0;
  let blackPoints = 0;

  (['q', 'r', 'b', 'n', 'p'] as PieceType[]).forEach((t) => {
    // Pieces captured by White are Black pieces missing from board
    const missingBlack = Math.max(0, INITIAL_PIECES.b[t] - remaining.b[t]);
    for (let i = 0; i < missingBlack; i++) {
      capturedByWhite.push(t);
      whitePoints += PIECE_VALUES[t];
    }

    // Pieces captured by Black are White pieces missing
    const missingWhite = Math.max(0, INITIAL_PIECES.w[t] - remaining.w[t]);
    for (let i = 0; i < missingWhite; i++) {
      capturedByBlack.push(t);
      blackPoints += PIECE_VALUES[t];
    }
  });

  const diffWhite = whitePoints - blackPoints;
  const diffBlack = blackPoints - whitePoints;

  return (
    <div className="flex items-center justify-between w-full max-w-[620px] px-2 py-1 text-xs select-none">
      {/* Captured by Black (White pieces captured) */}
      <div className="flex items-center gap-1.5 h-6">
        <div className="flex items-center -space-x-1.5">
          {capturedByBlack.map((t, idx) => (
            <div key={idx} className="w-4 h-4 opacity-80 hover:opacity-100 transition-opacity">
              <PieceSvg type={t} color="w" />
            </div>
          ))}
        </div>
        {diffBlack > 0 && (
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-charcoal-800 px-1 rounded">
            +{diffBlack}
          </span>
        )}
      </div>

      {/* Captured by White (Black pieces captured) */}
      <div className="flex items-center gap-1.5 h-6">
        {diffWhite > 0 && (
          <span className="font-mono text-[10px] font-bold text-emerald-400 bg-charcoal-800 px-1 rounded">
            +{diffWhite}
          </span>
        )}
        <div className="flex items-center -space-x-1.5">
          {capturedByWhite.map((t, idx) => (
            <div key={idx} className="w-4 h-4 opacity-80 hover:opacity-100 transition-opacity">
              <PieceSvg type={t} color="b" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
