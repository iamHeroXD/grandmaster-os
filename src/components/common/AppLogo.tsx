import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 28, className = '', showText = false }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Stylized 'H' Chess Crown / Rook Monogram */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0 rounded-lg bg-gradient-to-b from-[#1b2330] to-[#0f141d] border border-[#26354a] shadow-[0_0_12px_rgba(16,185,129,0.15)] group transition-transform hover:scale-105"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
        >
          {/* Left Rook Pillar */}
          <path
            d="M8 8V24M8 8H12M8 24H12M10 8V24"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Right Rook Pillar */}
          <path
            d="M24 8V24M24 8H20M24 24H20M22 8V24"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Central King Crown Bridge */}
          <path
            d="M10 16H22M16 12L16 16M14 13L16 10L18 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Accent Dots */}
          <circle cx="10" cy="7" r="1.2" fill="#34d399" />
          <circle cx="16" cy="6" r="1.4" fill="#34d399" />
          <circle cx="22" cy="7" r="1.2" fill="#34d399" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="font-extrabold tracking-wider text-slate-100 text-sm font-sans flex items-center gap-1.5">
            GRANDMASTER <span className="text-emerald-400 font-mono text-xs font-semibold">OS</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">
            CHESS ACADEMY · BY HERO.X
          </span>
        </div>
      )}
    </div>
  );
};
