import React from 'react';
import { Shield, Cpu, Keyboard, Activity } from 'lucide-react';
import { UserSettings } from '../../types/database';

interface StatusBarProps {
  activeTab: string;
  settings: UserSettings;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab, settings }) => {
  return (
    <div className="h-6 w-full bg-charcoal-950 border-t border-charcoal-850 flex items-center justify-between px-3 text-[10px] text-charcoal-400 select-none font-mono">
      {/* Left: Active Mode & Engine Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">{activeTab}</span>
        </div>

        <span className="text-charcoal-700">•</span>

        <div className="flex items-center gap-1 text-charcoal-300">
          <Cpu className="w-3 h-3 text-sky-400" />
          <span>Stockfish UCI ({settings.engineThreads}T / {settings.engineHashMb}MB)</span>
        </div>
      </div>

      {/* Center: Desktop Hotkeys Helper */}
      <div className="hidden md:flex items-center gap-2 text-charcoal-500">
        <Keyboard className="w-3 h-3 text-charcoal-500" />
        <span>[Space] Flip Board</span>
        <span>•</span>
        <span>[H] Hint Arrow</span>
        <span>•</span>
        <span>[Right-Click Drag] Draw Arrows</span>
        <span>•</span>
        <span>[Esc] Clear</span>
      </div>

      {/* Right: Air-Gap Verification badge */}
      <div className="flex items-center gap-1 text-emerald-400/90 font-medium">
        <Shield className="w-3 h-3 text-emerald-400" />
        <span>Local Air-Gapped</span>
      </div>
    </div>
  );
};
