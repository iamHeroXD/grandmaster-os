import React from 'react';
import { Shield, Minus, Square as WindowSquare, X } from 'lucide-react';
import { UserProfile } from '../../types/database';
import { AppLogo } from '../common/AppLogo';

interface TitleBarProps {
  profile: UserProfile | null;
  onOpenSettings?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ profile, onOpenSettings }) => {
  const handleToggleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="h-10 w-full bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-charcoal-950 border-b border-charcoal-800 flex items-center justify-between px-3.5 select-none text-xs text-charcoal-300 z-50 shadow-sm">
      {/* Brand & offline privacy indicator */}
      <div className="flex items-center gap-3">
        <AppLogo size={22} showText={true} />
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-700/40 px-2.5 py-0.5 rounded-full ml-2 shadow-inner">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="font-medium">100% Offline & Private</span>
        </div>
      </div>

      {/* User profile pill */}
      <div className="flex items-center gap-3">
        {profile && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 hover:text-charcoal-100 transition-all shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-charcoal-200">{profile.username}</span>
            {profile.estimatedRating && (
              <span className="text-amber-400 font-mono text-[11px] font-bold">
                {profile.estimatedRating}
              </span>
            )}
          </button>
        )}

        {/* Windows Desktop Window Controls */}
        <div className="flex items-center gap-1 pl-2 border-l border-charcoal-800 text-charcoal-400">
          <button
            onClick={() => window.blur()}
            title="Minimize"
            className="p-1.5 hover:bg-charcoal-800 hover:text-charcoal-200 rounded transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleMaximize}
            title="Maximize / Restore Fullscreen"
            className="p-1.5 hover:bg-charcoal-800 hover:text-charcoal-200 rounded transition-colors"
          >
            <WindowSquare className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.close()}
            title="Close Application"
            className="p-1.5 hover:bg-rose-950/70 hover:text-rose-300 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
