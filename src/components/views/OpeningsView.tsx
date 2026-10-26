import React, { useState } from 'react';
import { OPENING_ENCYCLOPEDIA, OpeningVariation } from '../../data/openings';
import { ChessGameController } from '../../services/chessEngine';
import { UserSettings } from '../../types/database';
import { ChessBoard } from '../board/ChessBoard';
import { BookOpen, Search, ShieldAlert, Sparkles, MoveRight } from 'lucide-react';

interface OpeningsViewProps {
  settings: UserSettings;
}

export const OpeningsView: React.FC<OpeningsViewProps> = ({ settings }) => {
  const [selectedOpening, setSelectedOpening] = useState<OpeningVariation>(OPENING_ENCYCLOPEDIA[0]);
  const [controller, setController] = useState<ChessGameController>(
    () => new ChessGameController(OPENING_ENCYCLOPEDIA[0].fen)
  );
  const [board, setBoard] = useState(() => controller.getBoard());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'Open Games (1.e4 e5)',
    'Sicilian Defense (1.e4 c5)',
    'Other 1.e4 Defenses',
    'Queen\'s Pawn (1.d4)',
    'Flank & Systems',
  ];

  const filteredOpenings = OPENING_ENCYCLOPEDIA.filter((op) => {
    const matchesSearch =
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.eco.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.moves.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || op.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectOpening = (op: OpeningVariation) => {
    setSelectedOpening(op);
    const c = new ChessGameController(op.fen);
    setController(c);
    setBoard(c.getBoard());
  };

  return (
    <div className="flex-1 flex overflow-hidden p-4 gap-4 max-w-7xl mx-auto w-full">
      {/* Left Opening Catalog */}
      <div className="w-80 bg-charcoal-900 border border-charcoal-800 rounded-lg flex flex-col overflow-hidden text-xs">
        {/* Search & Filter Header */}
        <div className="p-3 border-b border-charcoal-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-charcoal-100 font-bold">
            <BookOpen className="w-4 h-4 text-chess-green" />
            <span>Opening Encyclopedia</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-charcoal-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ECO, moves..."
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded pl-8 pr-2 py-1.5 text-charcoal-200 focus:outline-none focus:border-chess-green"
            />
          </div>

          {/* Category tabs */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-2 py-1 text-charcoal-300"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Filtered List */}
        <div className="flex-1 overflow-y-auto divide-y divide-charcoal-800/50 p-1">
          {filteredOpenings.map((op) => {
            const isSelected = selectedOpening.name === op.name;

            return (
              <button
                key={op.name}
                onClick={() => handleSelectOpening(op)}
                className={`w-full p-2.5 text-left rounded transition-colors flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-chess-green/20 border-l-2 border-chess-green text-emerald-200'
                    : 'hover:bg-charcoal-800/60 text-charcoal-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal-100">{op.name}</span>
                  <span className="font-mono text-[10px] text-charcoal-500 px-1 bg-charcoal-800 rounded">
                    {op.eco}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-charcoal-400 truncate">
                  {op.moves.join(' ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Opening Explorer */}
      <div className="flex-1 flex overflow-hidden gap-4">
        {/* Board */}
        <div className="max-w-[560px] w-full flex flex-col items-center justify-center gap-3">
          <ChessBoard
            board={board}
            turn={controller.getTurn()}
            theme={settings.boardTheme}
            showCoordinates={settings.showCoordinates}
            interactive={false}
          />
          <div className="text-xs text-charcoal-400 font-mono">
            Line: {selectedOpening.moves.join(' ')}
          </div>
        </div>

        {/* Detailed Strategic Breakdown */}
        <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-lg p-5 flex flex-col gap-4 overflow-y-auto text-xs">
          <div className="border-b border-charcoal-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700 font-mono font-bold text-amber-400 text-[11px]">
                {selectedOpening.eco}
              </span>
              <span className="text-[11px] font-mono text-charcoal-400 uppercase">
                {selectedOpening.category}
              </span>
            </div>
            <h1 className="text-lg font-bold text-charcoal-100 mt-1">{selectedOpening.name}</h1>
          </div>

          {/* Strategic Plans */}
          <div className="p-3 bg-charcoal-850 border border-charcoal-800 rounded">
            <h3 className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Strategic Plans</span>
            </h3>
            <p className="text-[11px] text-charcoal-200 leading-relaxed">{selectedOpening.plans}</p>
          </div>

          {/* Pawn Structure */}
          <div className="p-3 bg-charcoal-850 border border-charcoal-800 rounded">
            <h3 className="font-semibold text-sky-400 mb-1">Pawn Structure Tendencies</h3>
            <p className="text-[11px] text-charcoal-200 leading-relaxed">{selectedOpening.pawnStructure}</p>
          </div>

          {/* Tactical Motifs */}
          <div className="p-3 bg-charcoal-850 border border-charcoal-800 rounded">
            <h3 className="font-semibold text-amber-400 mb-1">Key Tactical Motifs</h3>
            <p className="text-[11px] text-charcoal-200 leading-relaxed">{selectedOpening.tacticalMotifs}</p>
          </div>

          {/* Traps & Refutations */}
          {selectedOpening.trapWarning && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded flex items-start gap-2 text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">Important Trap / Defensive Warning: </span>
                <p className="text-[11px] text-rose-200/90 mt-0.5">{selectedOpening.trapWarning}</p>
              </div>
            </div>
          )}

          {/* Model Line */}
          <div className="mt-auto pt-3 border-t border-charcoal-800">
            <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider block mb-1">
              Model Continuation Line
            </span>
            <div className="font-mono text-[11px] p-2 bg-charcoal-850 rounded border border-charcoal-800 text-charcoal-300">
              {selectedOpening.modelLine}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
