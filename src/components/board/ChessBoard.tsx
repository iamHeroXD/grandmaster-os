import React, { useState } from 'react';
import { Square, PieceType, Color } from '../../types/chess';
import { BoardThemeName } from '../../types/database';
import { PieceSvg } from './PieceSvg';

interface ChessBoardProps {
  board: ({ type: PieceType; color: Color } | null)[][];
  turn: Color;
  orientation?: Color;
  theme?: BoardThemeName;
  legalMoves?: Square[];
  selectedSquare?: Square | null;
  lastMove?: { from: Square; to: Square } | null;
  checkSquare?: Square | null;
  showCoordinates?: boolean;
  showLegalDots?: boolean;
  onSquareClick?: (square: Square) => void;
  onMovePiece?: (from: Square, to: Square, promotion?: PieceType) => void;
  interactive?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  turn,
  orientation = 'w',
  theme = 'tournament',
  legalMoves = [],
  selectedSquare = null,
  lastMove = null,
  checkSquare = null,
  showCoordinates = true,
  showLegalDots = true,
  onSquareClick,
  onMovePiece,
  interactive = true,
}) => {
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);

  // Files and ranks based on orientation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = orientation === 'w' ? files : [...files].reverse();
  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();

  const getSquareName = (fileIdx: number, rankIdx: number): Square => {
    return `${displayFiles[fileIdx]}${displayRanks[rankIdx]}` as Square;
  };

  const getPieceAt = (square: Square) => {
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    return board[rank]?.[file] || null;
  };

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;

    if (selectedSquare && legalMoves.includes(square)) {
      // Check for pawn promotion
      const piece = getPieceAt(selectedSquare);
      if (piece?.type === 'p' && (square[1] === '8' || square[1] === '1')) {
        setPromotionPending({ from: selectedSquare, to: square });
        return;
      }
      if (onMovePiece) {
        onMovePiece(selectedSquare, square);
      }
      return;
    }

    if (onSquareClick) {
      onSquareClick(square);
    }
  };

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (!interactive) return;
    const piece = getPieceAt(square);
    if (!piece) return;
    setDraggedSquare(square);
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toSquare: Square) => {
    e.preventDefault();
    if (!interactive) return;
    const fromSquare = (e.dataTransfer.getData('text/plain') as Square) || draggedSquare;
    setDraggedSquare(null);

    if (fromSquare && fromSquare !== toSquare) {
      const piece = getPieceAt(fromSquare);
      if (piece?.type === 'p' && (toSquare[1] === '8' || toSquare[1] === '1')) {
        setPromotionPending({ from: fromSquare, to: toSquare });
        return;
      }
      if (onMovePiece) {
        onMovePiece(fromSquare, toSquare);
      }
    }
  };

  const handlePromotionSelect = (promotedPiece: PieceType) => {
    if (promotionPending && onMovePiece) {
      onMovePiece(promotionPending.from, promotionPending.to, promotedPiece);
    }
    setPromotionPending(null);
  };

  return (
    <div className={`relative select-none aspect-square w-full max-w-[620px] rounded shadow-2xl p-1 bg-charcoal-900 border border-charcoal-800 theme-${theme}`}>
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded overflow-hidden">
        {displayRanks.map((rank, rIdx) =>
          displayFiles.map((file, fIdx) => {
            const sqName = `${file}${rank}` as Square;
            const piece = getPieceAt(sqName);
            const isLight = (fIdx + rIdx) % 2 === 0;
            const isSelected = selectedSquare === sqName;
            const isLegal = legalMoves.includes(sqName);
            const isLastMove = lastMove?.from === sqName || lastMove?.to === sqName;
            const isCheck = checkSquare === sqName;

            return (
              <div
                key={sqName}
                onClick={() => handleSquareClick(sqName)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sqName)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'square-light' : 'square-dark'
                } ${isSelected ? '!bg-amber-300/60' : ''} ${
                  isLastMove && !isSelected ? '!bg-emerald-500/30' : ''
                } ${isCheck ? '!bg-red-600/70 shadow-inner' : ''}`}
              >
                {/* Board coordinates */}
                {showCoordinates && (
                  <>
                    {fIdx === 0 && (
                      <span
                        className={`absolute top-0.5 left-1 text-[10px] font-semibold leading-none ${
                          isLight ? 'text-charcoal-700' : 'text-charcoal-200'
                        }`}
                      >
                        {rank}
                      </span>
                    )}
                    {rIdx === 7 && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[10px] font-semibold leading-none ${
                          isLight ? 'text-charcoal-700' : 'text-charcoal-200'
                        }`}
                      >
                        {file}
                      </span>
                    )}
                  </>
                )}

                {/* Chess piece */}
                {piece && (
                  <div
                    draggable={interactive}
                    onDragStart={(e) => handleDragStart(e, sqName)}
                    className="w-[84%] h-[84%] z-10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                  >
                    <PieceSvg type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Legal move indicators */}
                {showLegalDots && isLegal && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {piece ? (
                      // Capture ring
                      <div className="w-[84%] h-[84%] rounded-full border-4 border-charcoal-950/40" />
                    ) : (
                      // Quiet move dot
                      <div className="w-3.5 h-3.5 rounded-full bg-charcoal-950/35" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal */}
      {promotionPending && (
        <div className="absolute inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-4 shadow-2xl flex flex-col items-center">
            <span className="text-sm font-semibold mb-3 text-charcoal-200">Promote Pawn To</span>
            <div className="flex gap-3">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionSelect(pType)}
                  className="w-14 h-14 p-2 bg-charcoal-800 hover:bg-chess-green/30 border border-charcoal-700 rounded transition-all hover:scale-110"
                >
                  <PieceSvg type={pType} color={turn} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
