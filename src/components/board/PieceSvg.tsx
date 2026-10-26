import React from 'react';
import { PieceType, Color } from '../../types/chess';
import { PieceSetName } from '../../types/database';

interface PieceSvgProps {
  type: PieceType;
  color: Color;
  pieceSet?: PieceSetName;
  className?: string;
}

/**
 * Premium tournament-grade Staunton piece vectors (Neo / Master Staunton style)
 * with multi-layer shading, subtle gradients, and crisp outlines.
 */
export const PieceSvg: React.FC<PieceSvgProps> = ({
  type,
  color,
  pieceSet = 'classic',
  className = 'w-full h-full drop-shadow-md transition-transform duration-150',
}) => {
  const isWhite = color === 'w';

  // Master Neo/Staunton styles
  const whiteFill = pieceSet === 'wood' ? '#fbf2db' : '#ffffff';
  const whiteStroke = pieceSet === 'wood' ? '#5a3d1c' : '#1a1d20';
  const whiteSecondary = pieceSet === 'wood' ? '#e5cf9f' : '#e6ebf0';

  const blackFill = pieceSet === 'wood' ? '#3d2514' : '#1c1f24';
  const blackStroke = pieceSet === 'wood' ? '#180e07' : '#000000';
  const blackSecondary = pieceSet === 'wood' ? '#5c3a21' : '#32373e';

  const fill = isWhite ? whiteFill : blackFill;
  const stroke = isWhite ? whiteStroke : '#ffffff';
  const strokeInner = isWhite ? '#c0c9d4' : '#555e69';

  switch (type) {
    case 'p': // PAWN
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.35))">
          <defs>
            <linearGradient id={`pawn-grad-${color}-${pieceSet}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#3a4049'} />
              <stop offset="60%" stopColor={fill} />
              <stop offset="100%" stopColor={isWhite ? whiteSecondary : '#121417'} />
            </linearGradient>
          </defs>
          {/* Base */}
          <path
            d="M 12,39 L 33,39 C 33,37 31.5,35 29,34 C 26,33 19,33 16,34 C 13.5,35 12,37 12,39 z"
            fill={`url(#pawn-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Body stem */}
          <path
            d="M 16,34 C 16,30 18,25 20,20 C 18.5,18.5 17.5,16.5 17.5,14 C 17.5,11.24 19.74,9 22.5,9 C 25.26,9 27.5,11.24 27.5,14 C 27.5,16.5 26.5,18.5 25,20 C 27,25 29,30 29,34 z"
            fill={`url(#pawn-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Head sphere */}
          <circle
            cx="22.5"
            cy="14"
            r="4.5"
            fill={`url(#pawn-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {/* Subtle highlight sheen */}
          <ellipse
            cx="21"
            cy="12.5"
            rx="1.8"
            ry="1.2"
            fill={isWhite ? '#ffffff' : '#656d78'}
            opacity="0.7"
          />
        </svg>
      );

    case 'n': // KNIGHT
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.35))">
          <defs>
            <linearGradient id={`knight-grad-${color}-${pieceSet}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#3a4049'} />
              <stop offset="60%" stopColor={fill} />
              <stop offset="100%" stopColor={isWhite ? whiteSecondary : '#121417'} />
            </linearGradient>
          </defs>
          {/* Body and head curve */}
          <path
            d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,27.5 23,12 z"
            fill={`url(#knight-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.96,30.06 12.41,26.96 13,26 C 15.1,22.6 18.2,19.8 24,18 z"
            fill={`url(#knight-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Mane detail */}
          <path
            d="M 28,11 C 32,15 34,22 35,28"
            fill="none"
            stroke={isWhite ? strokeInner : '#6e7781'}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Eye */}
          <circle
            cx="14"
            cy="24"
            r="1"
            fill={isWhite ? '#1e2124' : '#ffffff'}
          />
          {/* Nostril */}
          <path
            d="M 10.5,29.5 C 11.5,30 12,29.5 12,29.5"
            stroke={isWhite ? '#1e2124' : '#ffffff'}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'b': // BISHOP
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.35))">
          <defs>
            <linearGradient id={`bishop-grad-${color}-${pieceSet}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#3a4049'} />
              <stop offset="60%" stopColor={fill} />
              <stop offset="100%" stopColor={isWhite ? whiteSecondary : '#121417'} />
            </linearGradient>
          </defs>
          {/* Base */}
          <path
            d="M 9,38 L 36,38 C 36,36 34.5,34 31,33 C 27,32 18,32 14,33 C 10.5,34 9,36 9,38 z"
            fill={`url(#bishop-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {/* Mitre body */}
          <path
            d="M 15,33 C 12.5,29 11.5,21.5 15,16.5 C 17.5,13 21,11 22.5,11 C 24,11 27.5,13 30,16.5 C 33.5,21.5 32.5,29 30,33 z"
            fill={`url(#bishop-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Mitre cross slit */}
          <path
            d="M 22.5,14 L 22.5,22 M 19.5,18 L 25.5,18"
            stroke={isWhite ? '#1e2124' : '#ffffff'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Slit incision */}
          <path
            d="M 27,15 L 20,24"
            stroke={isWhite ? '#5c6470' : '#8b949e'}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Top pommel */}
          <circle
            cx="22.5"
            cy="9.5"
            r="2"
            fill={`url(#bishop-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'r': // ROOK
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.35))">
          <defs>
            <linearGradient id={`rook-grad-${color}-${pieceSet}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#3a4049'} />
              <stop offset="60%" stopColor={fill} />
              <stop offset="100%" stopColor={isWhite ? whiteSecondary : '#121417'} />
            </linearGradient>
          </defs>
          {/* Base */}
          <path
            d="M 9,39 L 36,39 L 36,36 L 9,36 z"
            fill={`url(#rook-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {/* Base step */}
          <path
            d="M 12,36 L 12,32 L 33,32 L 33,36 z"
            fill={`url(#rook-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {/* Tower wall */}
          <path
            d="M 14,32 L 15.5,17 L 29.5,17 L 31,32 z"
            fill={`url(#rook-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Upper battlements cornice */}
          <path
            d="M 11,17 L 11,11 L 15,11 L 15,13.5 L 20,13.5 L 20,11 L 25,11 L 25,13.5 L 30,13.5 L 30,11 L 34,11 L 34,17 z"
            fill={`url(#rook-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Subtle horizontal masonry groove */}
          <line
            x1="15"
            y1="23"
            x2="30"
            y2="23"
            stroke={isWhite ? strokeInner : '#505661'}
            strokeWidth="1"
          />
        </svg>
      );

    case 'q': // QUEEN
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.4))">
          <defs>
            <linearGradient id={`queen-grad-${color}-${pieceSet}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#3a4049'} />
              <stop offset="60%" stopColor={fill} />
              <stop offset="100%" stopColor={isWhite ? whiteSecondary : '#121417'} />
            </linearGradient>
          </defs>
          {/* Crown Jewels / pearls */}
          <circle cx="6" cy="12" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="14" cy="9" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="22.5" cy="7.5" r="2.2" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="31" cy="9" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="39" cy="12" r="2" fill={fill} stroke={stroke} strokeWidth="1.2" />

          {/* Crown spikes and body */}
          <path
            d="M 9,26 C 17.5,24.5 27.5,24.5 36,26 L 38.5,13.5 L 31,23.5 L 24.5,10.5 L 20.5,10.5 L 14,23.5 L 6.5,13.5 z"
            fill={`url(#queen-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Robe curves and skirt */}
          <path
            d="M 9,26 C 9,28 10.5,30 11.5,32 C 12.5,33.5 12,34.5 11.5,37 C 17,38 28,38 33.5,37 C 33,34.5 32.5,33.5 33.5,32 C 34.5,30 36,28 36,26 z"
            fill={`url(#queen-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Base */}
          <path
            d="M 11,38.5 L 34,38.5"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'k': // KING
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.4))">
          <defs>
            <linearGradient id={`king-grad-${color}-${pieceSet}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#3a4049'} />
              <stop offset="60%" stopColor={fill} />
              <stop offset="100%" stopColor={isWhite ? whiteSecondary : '#121417'} />
            </linearGradient>
          </defs>
          {/* Royal Cross on top */}
          <path
            d="M 22.5,5.5 L 22.5,11.5 M 19.5,8 L 25.5,8"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Arching crown crest */}
          <path
            d="M 22.5,24 C 27,16.5 25.5,14 24,14 C 22.5,14 22.5,15.5 22.5,15.5 C 22.5,15.5 22.5,14 21,14 C 19.5,14 18,16.5 22.5,24"
            fill={`url(#king-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Main royal mantle */}
          <path
            d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 L 33.5,30 C 39,26 37,20 31,19 C 27,18 24.5,22 22.5,22 C 20.5,22 18,18 14,19 C 8,20 6,26 11.5,30 z"
            fill={`url(#king-grad-${color}-${pieceSet})`}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Base */}
          <path
            d="M 11.5,37 L 33.5,37"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};
