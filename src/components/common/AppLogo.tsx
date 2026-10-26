import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 28, className = '', showText = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-charcoal-850 via-charcoal-900 to-charcoal-950 border border-emerald-500/30 shadow-[0_0_15px_rgba(78,124,89,0.3)] transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 100 100" className="w-[82%] h-[82%] drop-shadow">
          <defs>
            <linearGradient id="logo-emerald-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#62996e" />
              <stop offset="50%" stopColor="#4e7c59" />
              <stop offset="100%" stopColor="#c29b38" />
            </linearGradient>
            <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3e18a" />
              <stop offset="100%" stopColor="#947528" />
            </linearGradient>
          </defs>

          {/* Orbital Ring (The "OS" Laboratory) */}
          <ellipse
            cx="50"
            cy="52"
            rx="42"
            ry="18"
            fill="none"
            stroke="url(#logo-emerald-gold)"
            strokeWidth="3.5"
            strokeDasharray="6,4"
            transform="rotate(-20 50 52)"
            opacity="0.8"
          />

          {/* Grandmaster Crown Profile */}
          <path
            d="M 22,66 L 78,66 C 78,60 74,56 70,54 L 75,34 L 59,44 L 50,22 L 41,44 L 25,34 L 30,54 C 26,56 22,60 22,66 z"
            fill="url(#logo-gold)"
            stroke="#131517"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Central Crown Jewel (Brilliant Diamond) */}
          <polygon
            points="50,14 55,22 50,30 45,22"
            fill="#ffffff"
            stroke="#c29b38"
            strokeWidth="1.5"
          />

          {/* Side Jewels */}
          <circle cx="25" cy="32" r="3.5" fill="#f3e18a" stroke="#947528" strokeWidth="1" />
          <circle cx="75" cy="32" r="3.5" fill="#f3e18a" stroke="#947528" strokeWidth="1" />

          {/* Base Pedestal Band */}
          <rect
            x="24"
            y="66"
            width="52"
            height="8"
            rx="2"
            fill="#395c42"
            stroke="url(#logo-gold)"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold tracking-wider text-charcoal-100 text-sm font-sans flex items-center gap-1">
            GRANDMASTER <span className="text-emerald-400 font-mono text-xs font-semibold">OS</span>
          </span>
          <span className="text-[9px] text-charcoal-400 font-mono tracking-widest uppercase mt-0.5">
            Private Chess Academy
          </span>
        </div>
      )}
    </div>
  );
};
