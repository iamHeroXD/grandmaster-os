import React, { useRef, useEffect } from 'react';
import { MoveRecord, MoveClassification } from '../../types/chess';
import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast, Copy, Check } from 'lucide-react';

interface MoveListProps {
  moves: MoveRecord[];
  currentMoveIndex: number; // -1 for start position, 0 for move 1 white, etc.
  onSelectMove: (index: number) => void;
  onCopyPgn?: () => void;
  onCopyFen?: () => void;
}

const CLASSIFICATION_BADGES: Record<MoveClassification, { symbol: string; color: string; bg: string; label: string }> = {
  best: { symbol: '★', color: 'text-emerald-300', bg: 'bg-emerald-950/80 border-emerald-700/50', label: 'Best Move' },
  excellent: { symbol: '!', color: 'text-teal-300', bg: 'bg-teal-950/80 border-teal-700/50', label: 'Excellent' },
  good: { symbol: '✓', color: 'text-charcoal-300', bg: 'bg-charcoal-800 border-charcoal-700', label: 'Good' },
  inaccuracy: { symbol: '?!', color: 'text-amber-300', bg: 'bg-amber-950/80 border-amber-700/50', label: 'Inaccuracy' },
  mistake: { symbol: '?', color: 'text-orange-400', bg: 'bg-orange-950/80 border-orange-700/50', label: 'Mistake' },
  blunder: { symbol: '??', color: 'text-rose-400', bg: 'bg-rose-950/80 border-rose-700/50', label: 'Blunder' },
  missed_win: { symbol: '✗', color: 'text-rose-300', bg: 'bg-rose-950/90 border-rose-600/70', label: 'Missed Win' },
  forced: { symbol: '□', color: 'text-charcoal-400', bg: 'bg-charcoal-800 border-charcoal-700', label: 'Forced Move' },
};

export const MoveList: React.FC<MoveListProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  onCopyPgn,
  onCopyFen,
}) => {
  const activeRowRef = useRef<HTMLDivElement | null>(null);
  const [copiedPgn, setCopiedPgn] = React.useState(false);
  const [copiedFen, setCopiedFen] = React.useState(false);

  // Group into pairs: [{ white: MoveRecord, black?: MoveRecord, number: 1 }, ...]
  const movePairs: { number: number; white: MoveRecord; whiteIdx: number; black?: MoveRecord; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i,
      black: moves[i + 1],
      blackIdx: i + 1 < moves.length ? i + 1 : undefined,
    });
  }

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentMoveIndex]);

  const handleCopyPgn = () => {
    if (onCopyPgn) {
      onCopyPgn();
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 1500);
    }
  };

  const handleCopyFen = () => {
    if (onCopyFen) {
      onCopyFen();
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-charcoal-900 border border-charcoal-800 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-charcoal-850 border-b border-charcoal-800 text-xs font-bold text-charcoal-200">
        <span className="tracking-wide">Move History</span>
        <div className="flex items-center gap-1.5 font-sans font-semibold">
          {onCopyFen && (
            <button
              onClick={handleCopyFen}
              title="Copy current FEN to clipboard"
              className="px-2 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 hover:text-charcoal-100 border border-charcoal-700 transition-colors flex items-center gap-1"
            >
              {copiedFen ? <Check className="w-3 h-3 text-emerald-400" /> : null}
              <span>FEN</span>
            </button>
          )}
          {onCopyPgn && (
            <button
              onClick={handleCopyPgn}
              title="Copy PGN game to clipboard"
              className="px-2 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 hover:text-charcoal-100 border border-charcoal-700 transition-colors flex items-center gap-1"
            >
              {copiedPgn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>PGN</span>
            </button>
          )}
        </div>
      </div>

      {/* Move scroll area */}
      <div className="flex-1 overflow-y-auto font-mono text-xs divide-y divide-charcoal-800/40 p-1">
        {movePairs.length === 0 ? (
          <div className="p-6 text-center text-charcoal-500 italic text-xs">Game has not started yet. Make a move!</div>
        ) : (
          movePairs.map((pair) => {
            const isWhiteActive = currentMoveIndex === pair.whiteIdx;
            const isBlackActive = currentMoveIndex === pair.blackIdx;

            return (
              <div
                key={pair.number}
                ref={isWhiteActive || isBlackActive ? activeRowRef : null}
                className="grid grid-cols-12 py-1 px-1.5 hover:bg-charcoal-850/60 items-center rounded transition-colors"
              >
                {/* Move number */}
                <span className="col-span-2 text-charcoal-400 font-semibold select-none text-[11px]">{pair.number}.</span>

                {/* White move */}
                <button
                  onClick={() => onSelectMove(pair.whiteIdx)}
                  className={`col-span-5 flex items-center justify-between px-2 py-1 rounded text-left transition-all ${
                    isWhiteActive
                      ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-600/60 shadow-sm'
                      : 'hover:bg-charcoal-800 text-charcoal-200'
                  }`}
                >
                  <span className="truncate">{pair.white.san}</span>
                  {pair.white.classification && CLASSIFICATION_BADGES[pair.white.classification] && (
                    <span
                      title={CLASSIFICATION_BADGES[pair.white.classification].label}
                      className={`text-[10px] ml-1 px-1 py-0.2 rounded border font-mono font-bold ${CLASSIFICATION_BADGES[pair.white.classification].color} ${CLASSIFICATION_BADGES[pair.white.classification].bg}`}
                    >
                      {CLASSIFICATION_BADGES[pair.white.classification].symbol}
                    </span>
                  )}
                </button>

                {/* Black move */}
                {pair.black ? (
                  <button
                    onClick={() => pair.blackIdx !== undefined && onSelectMove(pair.blackIdx)}
                    className={`col-span-5 flex items-center justify-between px-2 py-1 rounded text-left transition-all ${
                      isBlackActive
                        ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-600/60 shadow-sm'
                        : 'hover:bg-charcoal-800 text-charcoal-200'
                    }`}
                  >
                    <span className="truncate">{pair.black.san}</span>
                    {pair.black.classification && CLASSIFICATION_BADGES[pair.black.classification] && (
                      <span
                        title={CLASSIFICATION_BADGES[pair.black.classification].label}
                        className={`text-[10px] ml-1 px-1 py-0.2 rounded border font-mono font-bold ${CLASSIFICATION_BADGES[pair.black.classification].color} ${CLASSIFICATION_BADGES[pair.black.classification].bg}`}
                      >
                        {CLASSIFICATION_BADGES[pair.black.classification].symbol}
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="col-span-5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 bg-charcoal-850 border-t border-charcoal-800 shrink-0">
        <button
          onClick={() => onSelectMove(-1)}
          disabled={currentMoveIndex === -1}
          className="p-1.5 rounded-lg hover:bg-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 hover:text-charcoal-100 transition-colors"
          title="Start Position"
        >
          <ChevronFirst className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex === -1}
          className="p-1.5 rounded-lg hover:bg-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 hover:text-charcoal-100 transition-colors"
          title="Previous Move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= moves.length - 1}
          className="p-1.5 rounded-lg hover:bg-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 hover:text-charcoal-100 transition-colors"
          title="Next Move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(moves.length - 1)}
          disabled={currentMoveIndex >= moves.length - 1}
          className="p-1.5 rounded-lg hover:bg-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 hover:text-charcoal-100 transition-colors"
          title="Latest Position"
        >
          <ChevronLast className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
