import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 32, className = '', showText = false }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-xl bg-charcoal-900 border border-emerald-500/40 p-0.5 shadow-[0_0_15px_rgba(78,124,89,0.35)] transition-transform hover:scale-105 overflow-hidden"
      >
        <img
          src="./logo.png"
          alt="Grandmaster OS Logo"
          className="w-full h-full object-contain filter drop-shadow"
          onError={(e) => {
            // Fallback if image path has unexpected relative resolution
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold tracking-wider text-charcoal-100 text-sm font-sans flex items-center gap-1">
            GRANDMASTER <span className="text-emerald-400 font-mono text-xs font-semibold">OS</span>
          </span>
          <span className="text-[9px] text-charcoal-400 font-mono tracking-widest uppercase mt-0.5">
            The Private Chess Academy
          </span>
        </div>
      )}
    </div>
  );
};
