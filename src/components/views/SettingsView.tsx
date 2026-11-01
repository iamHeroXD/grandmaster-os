import React, { useState } from 'react';
import { UserSettings, UserProfile, BoardThemeName } from '../../types/database';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/soundService';
import { ChessGameController } from '../../services/chessEngine';
import { ChessBoard } from '../board/ChessBoard';
import { Settings, Download, Trash2, Cpu, Volume2, Palette, Check, Play, UserCheck, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  profile: UserProfile | null;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onRequestReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  profile,
  onUpdateSettings,
  onUpdateProfile,
  onRequestReset,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [username, setUsername] = useState(profile?.username || 'Hero.X');
  const [coachingStyle, setCoachingStyle] = useState(profile?.coachingStyle || 'grandmaster');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Preview board controller
  const [previewController] = useState(() => new ChessGameController());
  const previewBoard = previewController.getBoard();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    onUpdateSettings(localSettings);
    StorageService.saveSettings(localSettings);

    if (profile && username.trim()) {
      const updatedProf: UserProfile = {
        ...profile,
        username: username.trim(),
        coachingStyle: coachingStyle as any,
      };
      onUpdateProfile(updatedProf);
      StorageService.saveProfile(updatedProf);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    soundService.playClick();
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GrandmasterOS_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importBackup(content);
        if (success) {
          alert('Backup successfully restored! Reloading state...');
          window.location.reload();
        } else {
          alert('Failed to import backup: invalid file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full text-xs font-sans">
      <div className="flex items-center justify-between bg-[#111722] border border-[#1b2536] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#14231b] border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100">Preferences & Offline Diagnostics</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure local engine limits, themes, audio synthesis, and private data backups.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Saved to disk</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Profile & Coaching Style Section */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Player Identity & Mentorship Style</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Local Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#141c28] border border-[#202b3c] rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Grandmaster Coach Demeanor</label>
              <select
                value={coachingStyle}
                onChange={(e) => setCoachingStyle(e.target.value as any)}
                className="w-full bg-[#141c28] border border-[#202b3c] rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium text-xs"
              >
                <option value="grandmaster">Grandmaster (Socratic, Deep Principles)</option>
                <option value="tactical">Tactical (CCT & Dynamic Combinations)</option>
                <option value="gentle">Gentle & Encouraging (Beginner Friendly)</option>
                <option value="tournament">Strict Tournament Arbiter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Board Customization & Live Interactive Preview */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>Board Themes, Piece Sets & Live Preview</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Preview Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Controls */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">Piece Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'classic', label: 'Neo Staunton', desc: 'Tournament standard' },
                    { id: 'wood', label: 'Carved Wood', desc: 'Warm timber tones' },
                    { id: 'modern', label: 'Modern Minimal', desc: 'Clean vector lines' },
                  ].map((ps) => (
                    <button
                      type="button"
                      key={ps.id}
                      onClick={() => {
                        soundService.playClick();
                        setLocalSettings({ ...localSettings, pieceSet: ps.id as any });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        localSettings.pieceSet === ps.id
                          ? 'border-emerald-500 bg-[#10241c] text-emerald-300 font-bold shadow-sm'
                          : 'border-[#202b3c] bg-[#141c28] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs">{ps.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ps.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">Board Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'obsidian', label: 'Obsidian Master', color: 'bg-[#111722]' },
                    { id: 'cyberpunk', label: 'Cyberpunk Teal', color: 'bg-[#064e3b]' },
                    { id: 'tournament', label: 'Tournament Green', color: 'bg-[#769656]' },
                    { id: 'wood', label: 'Classic Wood', color: 'bg-[#b88b4a]' },
                    { id: 'slate', label: 'Slate Gray', color: 'bg-[#8ca1a9]' },
                    { id: 'monochrome', label: 'Monochrome', color: 'bg-[#6a6a6a]' },
                    { id: 'highcontrast', label: 'High Contrast', color: 'bg-[#2b2b2b]' },
                  ].map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => {
                        soundService.playClick();
                        setLocalSettings({ ...localSettings, boardTheme: theme.id as BoardThemeName });
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                        localSettings.boardTheme === theme.id
                          ? 'border-emerald-500 bg-[#10241c] font-bold text-emerald-300 shadow-sm'
                          : 'border-[#202b3c] bg-[#141c28] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${theme.color} border border-black/50 shadow-sm shrink-0`} />
                      <span className="truncate">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={localSettings.showCoordinates}
                    onChange={(e) => setLocalSettings({ ...localSettings, showCoordinates: e.target.checked })}
                    className="rounded border-[#202b3c] text-emerald-600 focus:ring-0 bg-[#141c28]"
                  />
                  <span>Coordinates</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={localSettings.showLegalDots}
                    onChange={(e) => setLocalSettings({ ...localSettings, showLegalDots: e.target.checked })}
                    className="rounded border-[#202b3c] text-emerald-600 focus:ring-0 bg-[#141c28]"
                  />
                  <span>Legal Dots</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={localSettings.highlightLastMove}
                    onChange={(e) => setLocalSettings({ ...localSettings, highlightLastMove: e.target.checked })}
                    className="rounded border-[#202b3c] text-emerald-600 focus:ring-0 bg-[#141c28]"
                  />
                  <span>Highlight Moves</span>
                </label>
              </div>
            </div>

            {/* Live Interactive Board Preview */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0e141e] border border-[#1b2536]">
              <div className="w-full max-w-[280px] aspect-square">
                <ChessBoard
                  board={previewBoard}
                  turn="w"
                  theme={localSettings.boardTheme}
                  pieceSet={localSettings.pieceSet}
                  showCoordinates={localSettings.showCoordinates}
                  showLegalDots={localSettings.showLegalDots}
                  interactive={false}
                  maxBoardHeightOffset={0}
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                Theme: <strong className="text-emerald-400 capitalize">{localSettings.boardTheme}</strong> • Piece: <strong className="text-emerald-400 capitalize">{localSettings.pieceSet}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Engine Resources */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Stockfish 17 Engine Hardware Allocation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Engine CPU Threads: <span className="font-mono text-emerald-400 font-bold">{localSettings.engineThreads}</span>
              </label>
              <input
                type="range"
                min="1"
                max="16"
                value={localSettings.engineThreads}
                onChange={(e) => setLocalSettings({ ...localSettings, engineThreads: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Hash Memory Table: <span className="font-mono text-emerald-400 font-bold">{localSettings.engineHashMb} MB</span>
              </label>
              <input
                type="range"
                min="16"
                max="4096"
                step="16"
                value={localSettings.engineHashMb}
                onChange={(e) => setLocalSettings({ ...localSettings, engineHashMb: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Audio with Test Controls */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Synthesized Sound Effects & Tactile Feedback</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => soundService.playMove()}
                className="px-2.5 py-1 rounded-lg bg-[#141c28] hover:bg-[#1a2536] border border-[#202b3c] text-[11px] text-slate-300"
              >
                Test Move
              </button>
              <button
                type="button"
                onClick={() => soundService.playCapture()}
                className="px-2.5 py-1 rounded-lg bg-[#141c28] hover:bg-[#1a2536] border border-[#202b3c] text-[11px] text-slate-300"
              >
                Test Capture
              </button>
              <button
                type="button"
                onClick={() => soundService.playVictory()}
                className="px-2.5 py-1 rounded-lg bg-[#141c28] hover:bg-[#1a2536] border border-[#202b3c] text-[11px] text-emerald-400"
              >
                Test Victory
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Volume: <span className="font-mono text-emerald-400 font-bold">{Math.round(localSettings.soundVolume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localSettings.soundVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setLocalSettings({ ...localSettings, soundVolume: vol });
                soundService.setVolume(vol);
              }}
              className="w-full max-w-sm accent-emerald-500"
            />
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100">Private Data Backup & Reset</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 bg-[#141c28] hover:bg-[#1a2434] text-slate-200 font-semibold rounded-xl border border-[#202b3c] flex items-center gap-2 transition-all shadow-sm text-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export All Stored Games & Profile JSON</span>
            </button>

            <label className="px-4 py-2 bg-[#141c28] hover:bg-[#1a2434] text-slate-200 font-semibold rounded-xl border border-[#202b3c] flex items-center gap-2 cursor-pointer transition-all shadow-sm text-xs">
              <span>Restore Backup JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onRequestReset}
              className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-semibold rounded-xl border border-rose-800/40 flex items-center gap-2 transition-all shadow-sm ml-auto text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Profile Data</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2 pb-6">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
