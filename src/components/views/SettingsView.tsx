import React, { useState } from 'react';
import { UserSettings, UserProfile, BoardThemeName } from '../../types/database';
import { StorageService } from '../../services/storage';
import { Settings, Download, Trash2, Cpu, Volume2, Palette, Check } from 'lucide-react';

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
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    StorageService.saveSettings(localSettings);

    if (profile && username.trim()) {
      const updatedProf = { ...profile, username: username.trim() };
      onUpdateProfile(updatedProf);
      StorageService.saveProfile(updatedProf);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportBackup = () => {
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
        {/* Profile Section */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100">Local Player Profile</h2>
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Local Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full max-w-sm bg-[#141c28] border border-[#202b3c] rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium text-xs"
            />
          </div>
        </div>

        {/* Board Customization */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span>Board Themes & Piece Styles</span>
          </h2>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Piece Style</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'classic', label: 'Neo Staunton (Master)', desc: 'Official shaded tournament vector' },
                { id: 'wood', label: 'Warm Woodgrain', desc: 'Carved maple and dark walnut tones' },
                { id: 'modern', label: 'Modern Minimal', desc: 'Clean, high-contrast contemporary lines' },
              ].map((ps) => (
                <button
                  type="button"
                  key={ps.id}
                  onClick={() => setLocalSettings({ ...localSettings, pieceSet: ps.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all ${
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'tournament', label: 'Tournament Green', color: 'bg-[#769656]' },
                { id: 'wood', label: 'Classic Wood', color: 'bg-[#b88b4a]' },
                { id: 'slate', label: 'Slate Gray', color: 'bg-[#8ca1a9]' },
                { id: 'monochrome', label: 'Monochrome', color: 'bg-[#6a6a6a]' },
                { id: 'highcontrast', label: 'High Contrast', color: 'bg-[#2b2b2b]' },
              ].map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setLocalSettings({ ...localSettings, boardTheme: theme.id as BoardThemeName })}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                    localSettings.boardTheme === theme.id
                      ? 'border-emerald-500 bg-[#10241c] font-bold text-emerald-300 shadow-sm'
                      : 'border-[#202b3c] bg-[#141c28] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${theme.color} border border-black/50 shadow-sm`} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={localSettings.showCoordinates}
                onChange={(e) => setLocalSettings({ ...localSettings, showCoordinates: e.target.checked })}
                className="rounded border-[#202b3c] text-emerald-600 focus:ring-0 bg-[#141c28]"
              />
              <span>Show Coordinates</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={localSettings.showLegalDots}
                onChange={(e) => setLocalSettings({ ...localSettings, showLegalDots: e.target.checked })}
                className="rounded border-[#202b3c] text-emerald-600 focus:ring-0 bg-[#141c28]"
              />
              <span>Legal Move Indicators</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={localSettings.highlightLastMove}
                onChange={(e) => setLocalSettings({ ...localSettings, highlightLastMove: e.target.checked })}
                className="rounded border-[#202b3c] text-emerald-600 focus:ring-0 bg-[#141c28]"
              />
              <span>Highlight Last Move</span>
            </label>
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

        {/* Audio */}
        <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Synthesized Sound Effects</span>
          </h2>
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
              onChange={(e) => setLocalSettings({ ...localSettings, soundVolume: parseFloat(e.target.value) })}
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
