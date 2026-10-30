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

interface NavGroup {
  heading: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, mistakesDueCount = 0 }) => {
  const groups: NavGroup[] = [
    {
      heading: 'MAIN HUB',
      items: [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'play', label: 'Play Chess', icon: Play },
        { id: 'analysis', label: 'Analysis Lab', icon: BarChart3 },
        { id: 'coach', label: 'Master Coach', icon: HelpCircle },
      ],
    },
    {
      heading: 'TRAINING & ACADEMY',
      items: [
        { id: 'academy', label: 'Academy Courses', icon: GraduationCap },
        { id: 'tactics', label: 'Tactics Gym', icon: Zap },
        { id: 'endgames', label: 'Endgame Lab', icon: Target },
        { id: 'openings', label: 'Opening Lab', icon: BookOpen },
      ],
    },
    {
      heading: 'MY CHESS LAB',
      items: [
        { id: 'repertoire', label: 'My Repertoire', icon: Swords },
        {
          id: 'mistakes',
          label: 'Mistake Review',
          icon: AlertTriangle,
          badge: mistakesDueCount,
          badgeColor: 'bg-rose-950 text-rose-300 border-rose-700/60',
        },
        { id: 'library', label: 'Game Library', icon: FolderArchive },
      ],
    },
    {
      heading: 'SYSTEM',
      items: [
        { id: 'progress', label: 'Stats & Progress', icon: TrendingUp },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-56 bg-gradient-to-b from-charcoal-900 via-charcoal-900 to-charcoal-950 border-r border-charcoal-800 flex flex-col justify-between py-2.5 select-none h-full text-xs shadow-xl shrink-0 z-20">
      {/* Navigation items grouped by category */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3.5 pt-1">
        {groups.map((group) => (
          <div key={group.heading} className="space-y-0.5">
            <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-charcoal-400 uppercase font-mono">
              {group.heading}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-950/80 to-charcoal-800 text-emerald-300 border border-emerald-500/50 shadow-md translate-x-0.5'
                        : 'text-charcoal-300 hover:text-charcoal-100 hover:bg-charcoal-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'text-emerald-400 scale-110 drop-shadow' : 'text-charcoal-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border shadow-sm animate-pulse ${
                          item.badgeColor || 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer system status */}
      <div className="p-2 mx-2 mt-2 bg-charcoal-950/90 rounded-xl border border-charcoal-800/90 text-[11px] text-charcoal-400 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="font-bold text-charcoal-200 text-xs">Stockfish UCI</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px] font-bold bg-emerald-950/70 border border-emerald-700/50 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            READY
          </span>
        </div>
        <div className="text-[10px] text-charcoal-500 mt-1">
          Offline Neural Engine
        </div>
      </div>
    </aside>
  );
};
