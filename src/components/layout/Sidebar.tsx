import React from 'react';
import {
  Home,
  Play,
  BarChart3,
  GraduationCap,
  BookOpen,
  Zap,
  Target,
  Swords,
  FolderArchive,
  TrendingUp,
  Settings,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

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

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, mistakesDueCount = 0 }) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'play', label: 'Play Chess', icon: Play },
    { id: 'analysis', label: 'Analysis Lab', icon: BarChart3 },
    { id: 'coach', label: 'My Coach', icon: HelpCircle },
    { id: 'academy', label: 'Master Academy', icon: GraduationCap },
    { id: 'openings', label: 'Opening Lab', icon: BookOpen },
    { id: 'tactics', label: 'Tactics Gym', icon: Zap },
    { id: 'endgames', label: 'Endgames', icon: Target },
    { id: 'repertoire', label: 'My Repertoire', icon: Swords },
    { id: 'mistakes', label: 'My Mistakes', icon: AlertTriangle, badge: mistakesDueCount },
    { id: 'library', label: 'Game Library', icon: FolderArchive },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-gradient-to-b from-charcoal-900 via-charcoal-900 to-charcoal-950 border-r border-charcoal-800 flex flex-col justify-between py-3 select-none h-full text-xs shadow-lg">
      {/* Navigation items list */}
      <div className="flex flex-col gap-1 px-3">
        <div className="px-2 py-1 mb-1 text-[10px] font-semibold tracking-wider text-charcoal-400 uppercase font-mono">
          Academy Training
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-950/80 to-charcoal-850 text-emerald-300 font-bold border-l-4 border-emerald-500 shadow-md translate-x-0.5'
                  : 'text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 drop-shadow' : 'text-charcoal-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer system status */}
      <div className="px-3.5 py-3 mx-3 bg-charcoal-950/80 rounded-xl border border-charcoal-800/80 text-[11px] text-charcoal-400 shadow-inner">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-charcoal-200">Stockfish UCI</span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-mono text-[10px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ONLINE (LOCAL)
          </span>
        </div>
        <div className="text-[10px] text-charcoal-500 leading-tight">
          Air-Gapped Chess Intelligence
        </div>
      </div>
    </aside>
  );
};
