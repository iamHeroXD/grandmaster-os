import React from 'react';
import { Minus, Square as WindowSquare, X, User } from 'lucide-react';
import { UserProfile, UserSettings } from '../../types/database';
import { AppLogo } from '../common/AppLogo';

interface TitleBarProps {
  profile: UserProfile | null;
  settings?: UserSettings;
  onOpenSettings?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ profile, onOpenSettings }) => {
  const username = profile?.username || 'Hero.X';

  const handleToggleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-12 w-full bg-[#0b0f15] border-b border-[#171f2b] flex items-center justify-between px-4 select-none text-xs text-slate-300 z-50 shrink-0">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <AppLogo size={28} showText={true} />
      </div>

      {/* Right Controls: Offline Mode, Profile, Window Controls */}
      <div className="flex items-center gap-4">
        {/* Offline Mode Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span>Offline Mode</span>
        </div>

        {/* User Profile Pill */}
        <button
          onClick={onOpenSettings}
          title="Open Profile & Settings"
          className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#131a24] hover:bg-[#182230] border border-[#202b3c] hover:border-emerald-500/50 text-slate-200 transition-all shadow-sm group"
        >
          <div className="w-6 h-6 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-slate-300 group-hover:text-emerald-300">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs tracking-tight">{username}</span>
        </button>

        {/* Native Windows Controls */}
        <div className="flex items-center gap-1 pl-1 text-slate-400">
          <button
            onClick={() => window.blur()}
            title="Minimize"
            className="p-1.5 hover:bg-[#17202c] hover:text-slate-200 rounded transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleMaximize}
            title="Maximize / Restore Fullscreen"
            className="p-1.5 hover:bg-[#17202c] hover:text-slate-200 rounded transition-colors"
          >
            <WindowSquare className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.close()}
            title="Close Application"
            className="p-1.5 hover:bg-rose-950/80 hover:text-rose-300 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
