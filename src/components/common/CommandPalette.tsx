import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
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
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';
import { soundService } from '../../services/soundService';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Learning';
  description: string;
  icon: React.FC<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  isMuted = false,
  onToggleMute,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Command registry
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-home',
      title: 'Home Dashboard',
      category: 'Navigation',
      description: 'Overview, stats, daily routine, and grandmaster advice',
      icon: Home,
      action: () => onNavigate('home'),
      shortcut: 'H',
    },
    {
      id: 'nav-play',
      title: 'Play Chess',
      category: 'Navigation',
      description: 'Challenge Stockfish 17 offline at any Elo level',
      icon: Play,
      action: () => onNavigate('play'),
      shortcut: 'P',
    },
    {
      id: 'nav-analysis',
      title: 'Analysis Lab',
      category: 'Navigation',
      description: 'Deep centipawn evaluation, MultiPV lines, and accuracy scoring',
      icon: BarChart2,
      action: () => onNavigate('analysis'),
      shortcut: 'A',
    },
    {
      id: 'nav-coach',
      title: 'Grandmaster Coach',
      category: 'Navigation',
      description: 'Consult GM mentor personas with Socratic thinking guidance',
      icon: UserCheck,
      action: () => onNavigate('coach'),
      shortcut: 'C',
    },
    {
      id: 'nav-academy',
      title: 'Academy Curriculum',
      category: 'Learning',
      description: '7-stage structured roadmap and the Grandmaster Compendium',
      icon: GraduationCap,
      action: () => onNavigate('academy'),
      badge: 'Core',
    },
    {
      id: 'nav-tactics',
      title: 'Tactics Gym',
      category: 'Learning',
      description: 'Pattern recognition, Forks, Pins, Skewers & CCT protocol',
      icon: Zap,
      action: () => onNavigate('tactics'),
      badge: 'Drill',
    },
    {
      id: 'nav-openings',
      title: 'Opening Lab',
      category: 'Learning',
      description: 'Explore master tree, ECO codes, and win rates',
      icon: BookOpen,
      action: () => onNavigate('openings'),
    },
    {
      id: 'nav-endgames',
      title: 'Endgame Mastery',
      category: 'Learning',
      description: 'Lucena, Philidor, Opposition, and Smirnov rules',
      icon: Target,
      action: () => onNavigate('endgames'),
    },
    {
      id: 'nav-repertoire',
      title: 'My Repertoire',
      category: 'Learning',
      description: 'White and Black defensive and offensive opening books',
      icon: Swords,
      action: () => onNavigate('repertoire'),
    },
    {
      id: 'nav-mistakes',
      title: 'Review Blunders & Mistakes',
      category: 'Actions',
      description: 'Spaced repetition review of your logged tactical errors',
      icon: Sparkles,
      action: () => onNavigate('mistakes'),
      badge: 'SRS',
    },
    {
      id: 'nav-library',
      title: 'Game Library',
      category: 'Navigation',
      description: 'Past games, PGN archives, and historical tournament matches',
      icon: FolderArchive,
      action: () => onNavigate('library'),
    },
    {
      id: 'nav-progress',
      title: 'Progress & Elo Metrics',
      category: 'Navigation',
      description: 'Rating trajectory, accuracy trends, and skill breakdown',
      icon: TrendingUp,
      action: () => onNavigate('progress'),
    },
    {
      id: 'nav-settings',
      title: 'Settings & Profile',
      category: 'Actions',
      description: 'Audio, theme, engine threads, and profile options',
      icon: Settings,
      action: () => onNavigate('settings'),
      shortcut: ',',
    },
    {
      id: 'act-fullscreen',
      title: 'Toggle Fullscreen',
      category: 'Actions',
      description: 'Enter or exit immersive distraction-free desktop mode',
      icon: Maximize2,
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      },
      shortcut: 'F11',
    },
    {
      id: 'act-mute',
      title: isMuted ? 'Unmute Audio' : 'Mute Audio',
      category: 'Actions',
      description: 'Toggle chess moves, tactile clicks, and alert sounds',
      icon: isMuted ? VolumeX : Volume2,
      action: () => {
        if (onToggleMute) onToggleMute();
      },
      shortcut: 'M',
    },
  ], [onNavigate, isMuted, onToggleMute]);

  // Filter commands
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
        soundService.playClick();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
        soundService.playClick();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          soundService.playClick();
          filtered[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  // Auto-scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0e141d] border border-[#1f2b3e] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1b2536] bg-[#111824]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, lesson, or feature... (e.g. tactics, analysis)"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] font-mono font-medium text-slate-500 bg-[#16202e] border border-[#233145] px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 divide-y divide-[#17202d]/50"
        >
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching commands or destinations found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundService.playClick();
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#142325] text-slate-100 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-[#121a24] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-[#151e2b] text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-3">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="text-[10px] font-mono bg-[#16212f] text-slate-400 border border-[#243347] px-1.5 py-0.5 rounded min-w-[20px] text-center">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts legend */}
        <div className="px-4 py-2 bg-[#0c1118] border-t border-[#17202d] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="text-emerald-400 flex items-center gap-1 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Grandmaster OS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
