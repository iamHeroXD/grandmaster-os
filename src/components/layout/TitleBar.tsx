import React from 'react';
import { Shield, Minus, Square as WindowSquare, X } from 'lucide-react';
import { UserProfile } from '../../types/database';

interface TitleBarProps {
  profile: UserProfile | null;
  onOpenSettings?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ profile, onOpenSettings }) => {
  return (
    <div className="h-9 w-full bg-charcoal-950 border-b border-charcoal-850 flex items-center justify-between px-3 select-none text-xs text-charcoal-300 z-50">
      {/* Brand & offline privacy indicator */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-chess-green flex items-center justify-center font-bold text-white text-[10px]">
          ♔
        </div>
        <span className="font-semibold tracking-wide text-charcoal-100">GRANDMASTER OS</span>
        <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full ml-2">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Offline Private</span>
        </div>
      </div>

      {/* User profile pill */}
      <div className="flex items-center gap-3">
        {profile && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 hover:text-charcoal-100 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">{profile.username}</span>
            {profile.estimatedRating && (
              <span className="text-charcoal-500 font-mono text-[11px]">({profile.estimatedRating})</span>
            )}
          </button>
        )}

        {/* Windows Desktop Window Controls */}
        <div className="flex items-center gap-1 pl-3 border-l border-charcoal-800 text-charcoal-400">
          <button
            onClick={() => window.blur()}
            title="Minimize"
            className="p-1 hover:bg-charcoal-800 hover:text-charcoal-200 rounded transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {}}
            title="Maximize"
            className="p-1 hover:bg-charcoal-800 hover:text-charcoal-200 rounded transition-colors"
          >
            <WindowSquare className="w-3 h-3" />
          </button>
          <button
            onClick={() => {}}
            title="Close"
            className="p-1 hover:bg-rose-900/50 hover:text-rose-300 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
