import React from 'react';
import {
  Home,
  Play,
  BarChart2,
  UserCheck,
  GraduationCap,
  BookOpen,
  Zap,
  Target,
  Swords,
  FolderArchive,
  TrendingUp,
  Settings,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'play'
  | 'analysis'
  | 'coach'
  | 'academy'
  | 'openings'
  | 'tactics'
  | 'endgames'
  | 'repertoire'
  | 'mistakes'
  | 'library'
  | 'progress'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  mistakesDueCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const primaryNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'play', label: 'Play Chess', icon: Play },
    { id: 'analysis', label: 'Analysis Lab', icon: BarChart2 },
    { id: 'coach', label: 'My Coach', icon: UserCheck },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'openings', label: 'Opening Lab', icon: BookOpen },
    { id: 'tactics', label: 'Tactics', icon: Zap },
    { id: 'endgames', label: 'Endgames', icon: Target },
    { id: 'repertoire', label: 'My Repertoire', icon: Swords },
    { id: 'library', label: 'Game Library', icon: FolderArchive },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <aside className="w-60 bg-[#0b0f15] border-r border-[#171f2b] flex flex-col justify-between py-4 px-3 select-none h-full text-xs shrink-0 z-20">
      {/* Primary Navigation List */}
      <div className="space-y-1 overflow-y-auto pr-1">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-[#10231c] text-emerald-400 border border-emerald-800/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#121822]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Subtle Separator */}
        <div className="pt-2 pb-1">
          <div className="h-px bg-[#18202d] w-full" />
        </div>

        {/* Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
            activeTab === 'settings'
              ? 'bg-[#10231c] text-emerald-400 border border-emerald-800/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'text-slate-400 hover:text-slate-100 hover:bg-[#121822]'
          }`}
        >
          <Settings
            className={`w-4 h-4 transition-colors ${
              activeTab === 'settings' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          />
          <span>Settings</span>
        </button>
      </div>

      {/* Inspirational Bottom Signature matching mockup */}
      <div className="pt-4 border-t border-[#161d28] px-2 text-[11px] leading-relaxed text-slate-500 font-sans italic">
        <p>"Better decisions.</p>
        <p>Better moves.</p>
        <p>A stronger you."</p>
        <p className="not-italic text-slate-400 font-semibold tracking-wide text-[10px] mt-2 font-mono">
          — HERO.X
        </p>
      </div>
    </aside>
  );
};
