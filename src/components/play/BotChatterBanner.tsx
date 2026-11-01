import React, { useState } from 'react';
import { ChessBot } from '../../types/bots';
import { MessageSquare, Volume2, VolumeX } from 'lucide-react';

interface BotChatterBannerProps {
  bot: ChessBot;
  message: string;
  isEngineThinking?: boolean;
}

export const BotChatterBanner: React.FC<BotChatterBannerProps> = ({
  bot,
  message,
  isEngineThinking = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="Show bot chatter"
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#111722] hover:bg-[#151e2c] border border-[#1b2536] text-[11px] text-slate-400 hover:text-slate-200 transition-all shadow-sm"
      >
        <span>{bot.avatar}</span>
        <span className="font-semibold text-slate-300">{bot.name}</span>
        <MessageSquare className="w-3 h-3 text-emerald-400" />
      </button>
    );
  }

  return (
    <div className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#111722]/90 border border-[#1b2536] backdrop-blur-sm shadow-md transition-all">
      {/* Bot Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0 shadow-inner ${bot.avatarBg}`}
      >
        {bot.avatar}
      </div>

      {/* Chatter Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200">{bot.name}</span>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
            {bot.elo} Elo
          </span>
          {isEngineThinking && (
            <span className="text-[10px] text-amber-400 font-mono italic animate-pulse">
              thinking...
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-snug truncate font-sans">
          "{message}"
        </p>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(true)}
        title="Minimize bot dialogue"
        className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#182232] transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
      </button>
    </div>
  );
};
