import React from 'react';
import { Shield, Cpu, Keyboard, Activity } from 'lucide-react';
import { UserSettings } from '../../types/database';

interface StatusBarProps {
  activeTab: string;
  settings: UserSettings;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab, settings }) => {
  return (
    <div className="h-6 w-full bg-charcoal-950 border-t border-charcoal-850 flex items-center justify-between px-3 text-[11px] text-charcoal-300 select-none font-mono shrink-0">
      {/* Left: Active Mode & Engine Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">{activeTab}</span>
        </div>

        <span className="text-charcoal-600">•</span>

        <div className="flex items-center gap-1.5 text-charcoal-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span>Stockfish UCI ({settings.engineThreads} Threads / {settings.engineHashMb} MB Hash)</span>
        </div>
      </div>

      {/* Center: Desktop Hotkeys Helper */}
      <div className="hidden lg:flex items-center gap-2.5 text-charcoal-400">
        <Keyboard className="w-3.5 h-3.5 text-charcoal-500" />
        <span>[Space] Flip</span>
        <span className="text-charcoal-700">•</span>
        <span>[H] Hint Arrow</span>
        <span className="text-charcoal-700">•</span>
        <span>[Right-Click Drag] Plan Arrows</span>
        <span className="text-charcoal-700">•</span>
        <span>[Esc] Clear</span>
      </div>

      {/* Right: Air-Gap Verification badge */}
      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span>Local Air-Gapped</span>
      </div>
    </div>
  );
};
