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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'play', label: 'Play Chess', icon: Play },
    { id: 'analysis', label: 'Analysis Lab', icon: BarChart3 },
    { id: 'coach', label: 'My Coach', icon: HelpCircle },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'openings', label: 'Opening Lab', icon: BookOpen },
    { id: 'tactics', label: 'Tactics Gym', icon: Zap },
    { id: 'endgames', label: 'Endgames', icon: Target },
    { id: 'repertoire', label: 'My Repertoire', icon: Swords },
    { id: 'mistakes', label: 'My Mistakes', icon: AlertTriangle, badge: mistakesDueCount },
    { id: 'library', label: 'Game Library', icon: FolderArchive },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-charcoal-900 border-r border-charcoal-850 flex flex-col justify-between py-2 select-none h-full text-xs">
      {/* Navigation items list */}
      <div className="flex flex-col gap-0.5 px-2">
        <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-charcoal-500 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-all ${
                isActive
                  ? 'bg-chess-green/20 text-emerald-300 font-semibold border-l-2 border-chess-green shadow-sm'
                  : 'text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-charcoal-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-900/70 text-rose-300 border border-rose-700/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer system status */}
      <div className="px-4 py-3 mx-2 bg-charcoal-950/60 rounded border border-charcoal-800/60 text-[11px] text-charcoal-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-charcoal-300">Stockfish UCI</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Active
          </span>
        </div>
        <div className="text-[10px] text-charcoal-500">Local Zero-Cloud Engine</div>
      </div>
    </aside>
  );
};
