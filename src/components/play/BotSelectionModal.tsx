import React, { useState } from 'react';
import { ChessBot, BotTier } from '../../types/bots';
import { CHESS_BOTS } from '../../data/botsData';
import { X, Swords, Trophy, Sparkles, Filter, Check, Flame } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface BotSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBotId: string;
  onSelectBot: (bot: ChessBot) => void;
}

export const BotSelectionModal: React.FC<BotSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedBotId,
  onSelectBot,
}) => {
  const [activeTier, setActiveTier] = useState<'all' | BotTier>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredBots = CHESS_BOTS.filter((bot) => {
    const matchesTier = activeTier === 'all' || bot.tier === activeTier;
    const matchesQuery =
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.playstyle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.elo.toString().includes(searchQuery);
    return matchesTier && matchesQuery;
  });

  const getTierColor = (tier: BotTier) => {
    switch (tier) {
      case 'beginner':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'intermediate':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'advanced':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/60';
      case 'master':
        return 'text-blue-400 bg-blue-950/60 border-blue-800/60';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-[#0c1119] border border-[#1c2738] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#182333] bg-[#0f1622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
                <span>Chess Bot Arena</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                  12 ELO PERSONALITIES
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose an AI sparring partner from Beginner 400 Elo to Grandmaster 2850+ Elo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141d2a] hover:bg-[#1a2536] text-slate-400 hover:text-slate-100 transition-colors border border-[#202d40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-6 py-3 border-b border-[#182333] bg-[#0c121b] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-[#121926] p-1 rounded-xl border border-[#1e2a3c]">
            {[
              { id: 'all', label: 'All Bots' },
              { id: 'beginner', label: 'Beginner (400-1000)' },
              { id: 'intermediate', label: 'Club (1200-1800)' },
              { id: 'advanced', label: 'Advanced (2000-2300)' },
              { id: 'master', label: 'Master (2600-2850+)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundService.playClick();
                  setActiveTier(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                  activeTier === tab.id
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#182333]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by name, playstyle, Elo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#121926] border border-[#1e2a3c] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Bot Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBots.map((bot) => {
            const isSelected = selectedBotId === bot.id;
            return (
              <div
                key={bot.id}
                onClick={() => {
                  soundService.playClick();
                  onSelectBot(bot);
                  onClose();
                }}
                className={`group relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#12221b] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-[#101723] hover:bg-[#141d2c] border-[#1c2738] hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Top row: Avatar, Name, Elo Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-inner ${bot.avatarBg}`}
                      >
                        {bot.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                            {bot.name}
                          </h3>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {bot.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="text-sm font-black font-mono text-emerald-400">
                        {bot.elo}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500">
                        ELO
                      </span>
                    </div>
                  </div>

                  {/* Playstyle pill & opening */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTierColor(
                        bot.tier
                      )}`}
                    >
                      {bot.playstyle}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-[#16202e] px-2 py-0.5 rounded-full border border-[#223145] truncate max-w-[150px]">
                      {bot.favoriteOpening}
                    </span>
                  </div>

                  {/* Bio & Quote */}
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {bot.bio}
                  </p>
                  <p className="mt-1.5 text-[11px] italic text-slate-400 line-clamp-1 font-serif">
                    {bot.quote}
                  </p>
                </div>

                {/* Bottom action button */}
                <div className="mt-4 pt-3 border-t border-[#182333] flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Stockfish Lv.{bot.stockfishLevel} • Depth {bot.depth}
                  </div>

                  {isSelected ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      className="px-3 py-1 rounded-lg bg-[#162130] group-hover:bg-emerald-600 text-slate-300 group-hover:text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a0f16] border-t border-[#182333] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All bots run 100% offline via local WebAssembly Stockfish 17 UCI</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#141d2a] hover:bg-[#1a2536] text-slate-200 font-medium transition-colors border border-[#202d40]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
