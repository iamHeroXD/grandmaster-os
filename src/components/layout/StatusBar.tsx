import React from 'react';
import { NavTab } from './Sidebar';
import { UserSettings } from '../../types/database';

interface StatusBarProps {
  activeTab: NavTab;
  isEngineReady?: boolean;
  settings?: UserSettings;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab, isEngineReady = true }) => {
  const getTabLabel = (tab: NavTab): string => {
    switch (tab) {
      case 'home':
        return 'Academy Dashboard';
      case 'play':
        return 'Play vs Stockfish';
      case 'analysis':
        return 'Interactive Analysis Lab';
      case 'coach':
        return 'Grandmaster Mentor Coach';
      case 'academy':
        return 'Curriculum Academy';
      case 'openings':
        return 'Opening Encyclopedia';
      case 'tactics':
        return 'Tactics Training Gym';
      case 'endgames':
        return 'Theoretical Endgame Lab';
      case 'repertoire':
        return 'Opening Repertoire';
      case 'mistakes':
        return 'Personal Mistake Gym';
      case 'library':
        return 'Game Archive';
      case 'progress':
        return 'Evidence-Based Progress';
      case 'settings':
        return 'Preferences & System';
      default:
        return 'Grandmaster OS';
    }
  };

  return (
    <footer className="h-7 w-full bg-[#090c12] border-t border-[#141b25] flex items-center justify-between px-3 select-none text-[10px] text-slate-400 shrink-0 font-mono">
      {/* Left: Active View status */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-slate-300 font-semibold">{getTabLabel(activeTab)}</span>
      </div>

      {/* Center: Desktop Quick Shortcuts */}
      <div className="hidden md:flex items-center gap-4 text-slate-500">
        <span><kbd className="px-1.5 py-0.5 rounded bg-[#131a24] text-slate-300 border border-[#202b3a]">Space</kbd> Flip Board</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-[#131a24] text-slate-300 border border-[#202b3a]">H</kbd> Hint</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-[#131a24] text-slate-300 border border-[#202b3a]">Z</kbd> Undo (Practice)</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-[#131a24] text-slate-300 border border-[#202b3a]">Esc</kbd> Clear Arrows</span>
      </div>

      {/* Right: Engine & Privacy Verification */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isEngineReady ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
          <span>{isEngineReady ? 'Stockfish 17 UCI Ready' : 'Initializing Engine...'}</span>
        </span>
        <span className="text-[#2a364a]">•</span>
        <span className="text-slate-500">Local SQLite Air-Gapped</span>
      </div>
    </footer>
  );
};
