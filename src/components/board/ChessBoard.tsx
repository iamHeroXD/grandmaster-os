import React, { useState, useEffect } from 'react';
import { Square, PieceType, Color } from '../../types/chess';
import { BoardThemeName, PieceSetName } from '../../types/database';
import { PieceSvg } from './PieceSvg';

interface Arrow {
  from: Square;
  to: Square;
  color?: string;
}

interface ChessBoardProps {
  board: ({ type: PieceType; color: Color } | null)[][];
  turn: Color;
  orientation?: Color;
  theme?: BoardThemeName;
  pieceSet?: PieceSetName;
  legalMoves?: Square[];
  selectedSquare?: Square | null;
  lastMove?: { from: Square; to: Square } | null;
  checkSquare?: Square | null;
  hintArrow?: { from: Square; to: Square } | null;
  threatArrow?: { from: Square; to: Square } | null;
  showCoordinates?: boolean;
  showLegalDots?: boolean;
  onSquareClick?: (square: Square) => void;
  onMovePiece?: (from: Square, to: Square, promotion?: PieceType) => void;
  interactive?: boolean;
  className?: string;
  maxBoardHeightOffset?: number;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  turn,
  orientation = 'w',
  theme = 'tournament',
  pieceSet = 'classic',
  legalMoves = [],
  selectedSquare = null,
  lastMove = null,
  checkSquare = null,
  hintArrow = null,
  threatArrow = null,
  showCoordinates = true,
  showLegalDots = true,
  onSquareClick,
  onMovePiece,
  interactive = true,
  className = '',
  maxBoardHeightOffset = 210,
}) => {
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);

  // User drawn arrows and square highlights (ChessBase / Lichess style)
  const [drawnArrows, setDrawnArrows] = useState<Arrow[]>([]);
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
  const [rightClickStart, setRightClickStart] = useState<Square | null>(null);

  // Files and ranks based on orientation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = orientation === 'w' ? files : [...files].reverse();
  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();

  // Clear user drawings on Escape key or regular left click
  const clearDrawings = () => {
    setDrawnArrows([]);
    setHighlightedSquares([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearDrawings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPieceAt = (square: Square) => {
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    return board[rank]?.[file] || null;
  };

  const handleSquareClick = (square: Square) => {
    clearDrawings();
    if (!interactive) return;

    if (selectedSquare && legalMoves.includes(square)) {
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
    clearDrawings();
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

  // Right-click analysis drawing (ChessBase / Lichess style)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleMouseDown = (e: React.MouseEvent, square: Square) => {
    if (e.button === 2) {
      // Right click start
      setRightClickStart(square);
    } else if (e.button === 0) {
      // Left click clears drawings
      clearDrawings();
    }
  };

  const handleMouseUp = (e: React.MouseEvent, square: Square) => {
    if (e.button === 2 && rightClickStart) {
      if (rightClickStart === square) {
        // Toggle square highlight
        setHighlightedSquares((prev) =>
          prev.includes(square) ? prev.filter((s) => s !== square) : [...prev, square]
        );
      } else {
        // Add or remove arrow (Shift+RightClick = Red, Normal = Gold)
        const arrowColor = e.shiftKey ? '#ef4444' : '#f59e0b';
        setDrawnArrows((prev) => {
          const exists = prev.some((a) => a.from === rightClickStart && a.to === square);
          if (exists) {
            return prev.filter((a) => !(a.from === rightClickStart && a.to === square));
          } else {
            return [...prev, { from: rightClickStart, to: square, color: arrowColor }];
          }
        });
      }
      setRightClickStart(null);
    }
  };

  // Convert square e.g. "e4" to percentage coordinates for arrow drawing
  const getSquareCenter = (square: Square): { cx: number; cy: number } => {
    const file = square[0];
    const rank = square[1];
    const fIdx = displayFiles.indexOf(file);
    const rIdx = displayRanks.indexOf(rank);
    return {
      cx: ((fIdx + 0.5) / 8) * 100,
      cy: ((rIdx + 0.5) / 8) * 100,
    };
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        maxWidth: `min(100%, calc(100vh - ${maxBoardHeightOffset}px), 640px)`,
        maxHeight: `calc(100vh - ${maxBoardHeightOffset}px)`,
      }}
      className={`relative select-none aspect-square w-full rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.65)] p-2 sm:p-2.5 bg-gradient-to-b from-charcoal-850 via-charcoal-900 to-charcoal-950 border border-charcoal-700/80 theme-${theme} mx-auto transition-all ${className}`}
    >
      <div className="relative grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden border border-charcoal-800 shadow-inner">
        {displayRanks.map((rank, rIdx) =>
          displayFiles.map((file, fIdx) => {
            const sqName = `${file}${rank}` as Square;
            const piece = getPieceAt(sqName);
            const isLight = (fIdx + rIdx) % 2 === 0;
            const isSelected = selectedSquare === sqName;
            const isLegal = legalMoves.includes(sqName);
            const isLastMove = lastMove?.from === sqName || lastMove?.to === sqName;
            const isCheck = checkSquare === sqName;
            const isHovered = hoveredSquare === sqName;
            const isRightClickHighlighted = highlightedSquares.includes(sqName);

            return (
              <div
                key={sqName}
                onClick={() => handleSquareClick(sqName)}
                onMouseDown={(e) => handleMouseDown(e, sqName)}
                onMouseUp={(e) => handleMouseUp(e, sqName)}
                onMouseEnter={() => setHoveredSquare(sqName)}
                onMouseLeave={() => setHoveredSquare(null)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sqName)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                  isLight ? 'square-light' : 'square-dark'
                } ${isSelected ? '!bg-amber-400/60 shadow-inner' : ''} ${
                  isLastMove && !isSelected ? '!bg-emerald-500/35 shadow-inner' : ''
                } ${isCheck ? '!bg-rose-600/80 animate-pulse shadow-lg ring-2 ring-rose-400' : ''} ${
                  isRightClickHighlighted ? '!bg-amber-500/40 ring-2 ring-inset ring-amber-400' : ''
                }`}
              >
                {/* Board coordinates - crystal clear and theme-aware */}
                {showCoordinates && (
                  <>
                    {fIdx === 0 && (
                      <span
                        className={`absolute top-0.5 left-1 text-[11px] font-extrabold leading-none select-none font-mono ${
                          isLight ? 'coord-light' : 'coord-dark'
                        }`}
                      >
                        {rank}
                      </span>
                    )}
                    {rIdx === 7 && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[11px] font-extrabold leading-none select-none font-mono ${
                          isLight ? 'coord-light' : 'coord-dark'
                        }`}
                      >
                        {file}
                      </span>
                    )}
                  </>
                )}

                {/* Subtle Hover Ring */}
                {isHovered && interactive && !isSelected && (
                  <div className="absolute inset-0 bg-white/10 pointer-events-none rounded transition-opacity" />
                )}

                {/* Chess piece */}
                {piece && (
                  <div
                    draggable={interactive}
                    onDragStart={(e) => handleDragStart(e, sqName)}
                    className="w-[88%] h-[88%] z-10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-100 ease-out"
                  >
                    <PieceSvg type={piece.type} color={piece.color} pieceSet={pieceSet} />
                  </div>
                )}

                {/* Legal move indicators */}
                {showLegalDots && isLegal && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {piece ? (
                      // Capture ring
                      <div className="w-[86%] h-[86%] rounded-full border-[4px] border-emerald-950/70 shadow-sm animate-pulse" />
                    ) : (
                      // Quiet move dot
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-950/60 shadow-sm hover:scale-125 transition-transform" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* User Drawn Arrows & Engine Hint Arrow SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
          <defs>
            <marker id="hint-arrowhead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#34d399" />
            </marker>
            <marker id="threat-arrowhead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#f87171" />
            </marker>
            <marker id="user-arrowhead-gold" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
            </marker>
            <marker id="user-arrowhead-red" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>

          {/* Threat Arrow (Red) */}
          {threatArrow && (() => {
            const fromC = getSquareCenter(threatArrow.from);
            const toC = getSquareCenter(threatArrow.to);
            return (
              <line
                x1={`${fromC.cx}%`}
                y1={`${fromC.cy}%`}
                x2={`${toC.cx}%`}
                y2={`${toC.cy}%`}
                stroke="#f87171"
                strokeWidth="5"
                strokeLinecap="round"
                markerEnd="url(#threat-arrowhead)"
                opacity="0.9"
                className="animate-pulse"
              />
            );
          })()}

          {/* Engine Hint Arrow (Green Dash) */}
          {hintArrow && (() => {
            const fromC = getSquareCenter(hintArrow.from);
            const toC = getSquareCenter(hintArrow.to);
            return (
              <line
                x1={`${fromC.cx}%`}
                y1={`${fromC.cy}%`}
                x2={`${toC.cx}%`}
                y2={`${toC.cy}%`}
                stroke="#34d399"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="6,4"
                markerEnd="url(#hint-arrowhead)"
                opacity="0.95"
                className="animate-pulse"
              />
            );
          })()}

          {/* User Drawn Analysis Arrows (Right click drag) */}
          {drawnArrows.map((arr, i) => {
            const fromC = getSquareCenter(arr.from);
            const toC = getSquareCenter(arr.to);
            const isRed = arr.color === '#ef4444';
            return (
              <line
                key={i}
                x1={`${fromC.cx}%`}
                y1={`${fromC.cy}%`}
                x2={`${toC.cx}%`}
                y2={`${toC.cy}%`}
                stroke={arr.color || '#f59e0b'}
                strokeWidth="4.5"
                strokeLinecap="round"
                markerEnd={isRed ? 'url(#user-arrowhead-red)' : 'url(#user-arrowhead-gold)'}
                opacity="0.85"
              />
            );
          })}
        </svg>
      </div>

      {/* Pawn Promotion Modal */}
      {promotionPending && (
        <div className="absolute inset-0 z-50 bg-charcoal-950/85 backdrop-blur-md flex items-center justify-center p-4 rounded-2xl">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5 shadow-2xl flex flex-col items-center">
            <span className="text-sm font-bold mb-3 text-charcoal-100 tracking-wide">
              Promote Pawn To
            </span>
            <div className="flex gap-3">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionSelect(pType)}
                  className="w-16 h-16 p-2 bg-charcoal-800 hover:bg-emerald-950/60 border border-charcoal-700 hover:border-emerald-500 rounded-xl transition-all transform hover:scale-110 shadow-lg flex items-center justify-center"
                >
                  <PieceSvg type={pType} color={turn} pieceSet={pieceSet} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
