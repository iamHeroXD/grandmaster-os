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

const CLASSIFICATION_BADGES: Record<MoveClassification, { symbol: string; color: string; label: string }> = {
  best: { symbol: '★', color: 'text-emerald-400 font-bold', label: 'Best Move' },
  excellent: { symbol: '✓', color: 'text-teal-400', label: 'Excellent' },
  good: { symbol: '○', color: 'text-charcoal-400', label: 'Good' },
  inaccuracy: { symbol: '?!', color: 'text-amber-400 font-semibold', label: 'Inaccuracy' },
  mistake: { symbol: '?', color: 'text-orange-400 font-bold', label: 'Mistake' },
  blunder: { symbol: '??', color: 'text-rose-400 font-extrabold', label: 'Blunder' },
  missed_win: { symbol: '≠', color: 'text-rose-500 font-bold', label: 'Missed Win' },
  forced: { symbol: '□', color: 'text-charcoal-500', label: 'Forced Move' },
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

  return (
    <div className="flex flex-col h-full bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-charcoal-850 border-b border-charcoal-800 text-xs font-semibold text-charcoal-300">
        <span>Move History</span>
        <div className="flex gap-2">
          {onCopyFen && (
            <button
              onClick={onCopyFen}
              title="Copy current FEN"
              className="hover:text-charcoal-100 transition-colors"
            >
              FEN
            </button>
          )}
          {onCopyPgn && (
            <button
              onClick={handleCopyPgn}
              title="Copy PGN"
              className="flex items-center gap-1 hover:text-charcoal-100 transition-colors"
            >
              {copiedPgn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>PGN</span>
            </button>
          )}
        </div>
      </div>

      {/* Move scroll area */}
      <div className="flex-1 overflow-y-auto font-mono text-xs divide-y divide-charcoal-800/50">
        {movePairs.length === 0 ? (
          <div className="p-4 text-center text-charcoal-500 italic">Game has not started</div>
        ) : (
          movePairs.map((pair) => {
            const isWhiteActive = currentMoveIndex === pair.whiteIdx;
            const isBlackActive = currentMoveIndex === pair.blackIdx;

            return (
              <div
                key={pair.number}
                ref={isWhiteActive || isBlackActive ? activeRowRef : null}
                className="grid grid-cols-12 py-1 px-2 hover:bg-charcoal-800/40 items-center transition-colors"
              >
                {/* Move number */}
                <span className="col-span-2 text-charcoal-500 select-none">{pair.number}.</span>

                {/* White move */}
                <button
                  onClick={() => onSelectMove(pair.whiteIdx)}
                  className={`col-span-5 flex items-center justify-between px-2 py-0.5 rounded text-left transition-colors ${
                    isWhiteActive
                      ? 'bg-chess-green/30 text-emerald-200 font-bold border border-chess-green/40'
                      : 'hover:bg-charcoal-700/50 text-charcoal-200'
                  }`}
                >
                  <span>{pair.white.san}</span>
                  {pair.white.classification && (
                    <span
                      title={CLASSIFICATION_BADGES[pair.white.classification]?.label}
                      className={`text-[10px] ml-1 ${CLASSIFICATION_BADGES[pair.white.classification]?.color}`}
                    >
                      {CLASSIFICATION_BADGES[pair.white.classification]?.symbol}
                    </span>
                  )}
                </button>

                {/* Black move */}
                {pair.black ? (
                  <button
                    onClick={() => pair.blackIdx !== undefined && onSelectMove(pair.blackIdx)}
                    className={`col-span-5 flex items-center justify-between px-2 py-0.5 rounded text-left transition-colors ${
                      isBlackActive
                        ? 'bg-chess-green/30 text-emerald-200 font-bold border border-chess-green/40'
                        : 'hover:bg-charcoal-700/50 text-charcoal-200'
                    }`}
                  >
                    <span>{pair.black.san}</span>
                    {pair.black.classification && (
                      <span
                        title={CLASSIFICATION_BADGES[pair.black.classification]?.label}
                        className={`text-[10px] ml-1 ${CLASSIFICATION_BADGES[pair.black.classification]?.color}`}
                      >
                        {CLASSIFICATION_BADGES[pair.black.classification]?.symbol}
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
      <div className="flex items-center justify-center gap-1 p-1.5 bg-charcoal-850 border-t border-charcoal-800">
        <button
          onClick={() => onSelectMove(-1)}
          disabled={currentMoveIndex === -1}
          className="p-1 rounded hover:bg-charcoal-700 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 transition-colors"
          title="Start Position"
        >
          <ChevronFirst className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex === -1}
          className="p-1 rounded hover:bg-charcoal-700 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 transition-colors"
          title="Previous Move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= moves.length - 1}
          className="p-1 rounded hover:bg-charcoal-700 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 transition-colors"
          title="Next Move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(moves.length - 1)}
          disabled={currentMoveIndex >= moves.length - 1}
          className="p-1 rounded hover:bg-charcoal-700 disabled:opacity-30 disabled:hover:bg-transparent text-charcoal-300 transition-colors"
          title="Latest Position"
        >
          <ChevronLast className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
