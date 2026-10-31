import React, { useState } from 'react';
import { OPENING_ENCYCLOPEDIA, OpeningVariation } from '../../data/openings';
import { ChessGameController } from '../../services/chessEngine';
import { UserSettings } from '../../types/database';
import { ChessBoard } from '../board/ChessBoard';
import { BookOpen, Search, ShieldAlert, Sparkles } from 'lucide-react';

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
    <div className="flex-1 flex overflow-hidden p-3 md:p-5 gap-4 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* Left Opening Catalog */}
      <div className="w-80 bg-[#111722] border border-[#1b2536] rounded-2xl flex flex-col overflow-hidden text-xs shrink-0 shadow-sm">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-[#1b2536] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Opening Encyclopedia</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ECO, moves..."
              className="w-full bg-[#141c28] border border-[#202b3c] rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Category tabs */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#141c28] border border-[#202b3c] rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Filtered List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#17202c] p-1.5">
          {filteredOpenings.map((op) => {
            const isSelected = selectedOpening.name === op.name;

            return (
              <button
                key={op.name}
                onClick={() => handleSelectOpening(op)}
                className={`w-full p-3 text-left rounded-xl transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[#10241c] text-emerald-200 border border-emerald-800/60 shadow-sm'
                    : 'hover:bg-[#141c28] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">{op.name}</span>
                  <span className="font-mono text-[10px] text-amber-300 px-1.5 py-0.2 bg-[#182332] rounded font-bold">
                    {op.eco}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 truncate">
                  {op.moves.join(' ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Opening Explorer */}
      <div className="flex-1 flex overflow-y-auto overflow-x-hidden gap-5 min-h-0 items-start">
        {/* Board */}
        <div style={{ maxWidth: 'min(100%, calc(100vh - 140px), 580px)' }} className="w-full flex flex-col items-center justify-center gap-2.5 mx-auto min-h-0">
          <ChessBoard
            board={board}
            turn={controller.getTurn()}
            theme={settings.boardTheme}
            pieceSet={settings.pieceSet}
            showCoordinates={settings.showCoordinates}
            interactive={false}
            maxBoardHeightOffset={160}
          />
          <div className="text-xs text-slate-400 font-mono text-center">
            Line: {selectedOpening.moves.join(' ')}
          </div>
        </div>

        {/* Detailed Strategic Breakdown */}
        <div className="flex-1 bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto text-xs shadow-sm">
          <div className="border-b border-[#1b2536] pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#182332] border border-[#233144] font-mono font-bold text-amber-300 text-[11px]">
                {selectedOpening.eco}
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                {selectedOpening.category}
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-100 mt-1 tracking-tight">{selectedOpening.name}</h1>
          </div>

          {/* Strategic Plans */}
          <div className="p-3.5 bg-[#141c28] border border-[#202b3c] rounded-xl">
            <h3 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Strategic Plans</span>
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">{selectedOpening.plans}</p>
          </div>

          {/* Pawn Structure */}
          <div className="p-3.5 bg-[#141c28] border border-[#202b3c] rounded-xl">
            <h3 className="font-bold text-sky-400 mb-1 text-xs">Pawn Structure Blueprints</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">{selectedOpening.pawnStructure}</p>
          </div>

          {/* Tactical Motifs */}
          <div className="p-3.5 bg-[#141c28] border border-[#202b3c] rounded-xl">
            <h3 className="font-bold text-amber-400 mb-1 text-xs">Key Tactical Motifs</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">{selectedOpening.tacticalMotifs}</p>
          </div>

          {/* Traps & Refutations */}
          {selectedOpening.trapWarning && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-start gap-2 text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">Important Trap / Defensive Warning: </span>
                <p className="text-[11px] text-rose-200/90 mt-0.5">{selectedOpening.trapWarning}</p>
              </div>
            </div>
          )}

          {/* Model Line */}
          <div className="mt-auto pt-3 border-t border-[#1b2536]">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
              Model Continuation Line
            </span>
            <div className="font-mono text-[11px] p-2.5 bg-[#141c28] rounded-xl border border-[#202b3c] text-emerald-300">
              {selectedOpening.modelLine}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
