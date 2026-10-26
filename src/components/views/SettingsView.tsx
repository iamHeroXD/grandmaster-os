import React, { useState } from 'react';
import { UserSettings, UserProfile, BoardThemeName } from '../../types/database';
import { StorageService } from '../../services/storage';
import { Settings, Shield, Download, Upload, Trash2, Cpu, Volume2, Palette, Check } from 'lucide-react';

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
  const [username, setUsername] = useState(profile?.username || '');
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
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full text-xs">
      <div className="flex items-center justify-between bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-charcoal-200">
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-charcoal-100">Preferences & Offline Diagnostics</h1>
            <p className="text-xs text-charcoal-400">
              Configure local engine limits, themes, audio synthesis, and private data backups.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
            <Check className="w-4 h-4" />
            <span>Saved to disk</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Profile Section */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
            <span>Local Player Profile</span>
          </h2>

          <div>
            <label className="block text-charcoal-300 font-medium mb-1">Local Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full max-w-sm bg-charcoal-800 border border-charcoal-700 rounded px-3 py-1.5 text-charcoal-100 focus:outline-none focus:border-chess-green font-medium"
            />
          </div>
        </div>

        {/* Board Customization */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Board & Visuals</span>
          </h2>

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
                className={`p-2.5 rounded border flex items-center gap-2.5 transition-all ${
                  localSettings.boardTheme === theme.id
                    ? 'border-chess-green bg-charcoal-800 font-bold text-emerald-300'
                    : 'border-charcoal-750 bg-charcoal-850 text-charcoal-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${theme.color} border border-charcoal-900 shadow-sm`} />
                <span>{theme.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
              <input
                type="checkbox"
                checked={localSettings.showCoordinates}
                onChange={(e) => setLocalSettings({ ...localSettings, showCoordinates: e.target.checked })}
                className="rounded border-charcoal-700 text-chess-green focus:ring-0"
              />
              <span>Show Coordinates</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
              <input
                type="checkbox"
                checked={localSettings.showLegalDots}
                onChange={(e) => setLocalSettings({ ...localSettings, showLegalDots: e.target.checked })}
                className="rounded border-charcoal-700 text-chess-green focus:ring-0"
              />
              <span>Legal Move Indicators</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
              <input
                type="checkbox"
                checked={localSettings.highlightLastMove}
                onChange={(e) => setLocalSettings({ ...localSettings, highlightLastMove: e.target.checked })}
                className="rounded border-charcoal-700 text-chess-green focus:ring-0"
              />
              <span>Highlight Last Move</span>
            </label>
          </div>
        </div>

        {/* Engine Limits & Resources */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Stockfish Engine Resources</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-charcoal-300 font-medium mb-1">
                CPU Threads: {localSettings.engineThreads}
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={localSettings.engineThreads}
                onChange={(e) => setLocalSettings({ ...localSettings, engineThreads: parseInt(e.target.value, 10) })}
                className="w-full accent-chess-green"
              />
            </div>

            <div>
              <label className="block text-charcoal-300 font-medium mb-1">
                Hash Memory: {localSettings.engineHashMb} MB
              </label>
              <input
                type="range"
                min={16}
                max={512}
                step={16}
                value={localSettings.engineHashMb}
                onChange={(e) => setLocalSettings({ ...localSettings, engineHashMb: parseInt(e.target.value, 10) })}
                className="w-full accent-chess-green"
              />
            </div>

            <div>
              <label className="block text-charcoal-300 font-medium mb-1">
                Default Depth Limit: {localSettings.engineDepthLimit}
              </label>
              <input
                type="range"
                min={10}
                max={25}
                value={localSettings.engineDepthLimit}
                onChange={(e) => setLocalSettings({ ...localSettings, engineDepthLimit: parseInt(e.target.value, 10) })}
                className="w-full accent-chess-green"
              />
            </div>
          </div>
        </div>

        {/* Audio Synthesis */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Procedural Audio</span>
          </h2>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })}
                className="rounded border-charcoal-700 text-chess-green focus:ring-0"
              />
              <span>Audio Synthesis Enabled</span>
            </label>

            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-charcoal-400">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={localSettings.soundVolume}
                onChange={(e) => setLocalSettings({ ...localSettings, soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-chess-green"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Air-gap Diagnostics */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Privacy & Air-Gap Verification</span>
          </h2>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded flex flex-col gap-1.5 text-emerald-300">
            <div className="font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Network Isolation Active (Zero Telemetry)</span>
            </div>
            <p className="text-[11px] text-emerald-200/80">
              Content Security Policy blocks all external origins. No analytics beacons, telemetry pings, remote LLMs, or cloud databases are enabled or configured.
            </p>
          </div>
        </div>

        {/* Backup, Restore & Reset */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-charcoal-100">Data Management</h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Backup (.json)</span>
            </button>

            <label className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 rounded font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onRequestReset}
              className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded font-semibold flex items-center gap-1.5 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Profile & Data</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-chess-green hover:bg-chess-greenLight text-white font-semibold rounded shadow transition-all hover:scale-105"
          >
            Save All Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
