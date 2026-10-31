import React, { useState, useEffect } from 'react';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';
import { UserProfile, UserSettings, StoredMistake, LessonProgress, PuzzleAttempt } from './types/database';
import { GameSummary } from './types/chess';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { FirstRunModal } from './components/modals/FirstRunModal';
import { ConfirmResetModal } from './components/modals/ConfirmResetModal';

// Views
import { HomeView } from './components/views/HomeView';
import { PlayView } from './components/views/PlayView';
import { AnalysisView } from './components/views/AnalysisView';
import { CoachView } from './components/views/CoachView';
import { AcademyView } from './components/views/AcademyView';
import { OpeningsView } from './components/views/OpeningsView';
import { TacticsView } from './components/views/TacticsView';
import { EndgamesView } from './components/views/EndgamesView';
import { RepertoireView } from './components/views/RepertoireView';
import { MistakesView } from './components/views/MistakesView';
import { GameLibraryView } from './components/views/GameLibraryView';
import { ProgressView } from './components/views/ProgressView';
import { SettingsView } from './components/views/SettingsView';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => StorageService.getProfile());
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [games, setGames] = useState<GameSummary[]>(() => StorageService.getGames());
  const [mistakes, setMistakes] = useState<StoredMistake[]>(() => StorageService.getMistakes());
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>(() =>
    StorageService.getLessonProgress()
  );
  const [puzzleAttempts, setPuzzleAttempts] = useState<PuzzleAttempt[]>(() =>
    StorageService.getPuzzleAttempts()
  );

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeAnalysisGame, setActiveAnalysisGame] = useState<GameSummary | null>(games[0] || null);
  const [showFirstRunModal, setShowFirstRunModal] = useState<boolean>(!profile);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Desktop heartbeat to keep offline supervisor alive while window is active
  useEffect(() => {
    const pingHeartbeat = () => {
      fetch('/api/heartbeat').catch(() => {});
    };
    pingHeartbeat();
    const intervalId = setInterval(pingHeartbeat, 4000);
    return () => clearInterval(intervalId);
  }, []);

  // Sync state
  const refreshStorageState = () => {
    setProfile(StorageService.getProfile());
    setSettings(StorageService.getSettings());
    setGames(StorageService.getGames());
    setMistakes(StorageService.getMistakes());
    setLessonProgress(StorageService.getLessonProgress());
    setPuzzleAttempts(StorageService.getPuzzleAttempts());
  };

  const handleFirstRunComplete = (newProfile: UserProfile, partialSettings: Partial<UserSettings>) => {
    const mergedSettings = { ...settings, ...partialSettings };
    StorageService.saveProfile(newProfile);
    StorageService.saveSettings(mergedSettings);
    setProfile(newProfile);
    setSettings(mergedSettings);
    setShowFirstRunModal(false);
  };

  const handleGameFinished = (finishedGame: GameSummary) => {
    refreshStorageState();
    setActiveAnalysisGame(finishedGame);
  };

  const handleNavigateToAnalysis = (game: GameSummary) => {
    setActiveAnalysisGame(game);
    setActiveTab('analysis');
  };

  const handleResetConfirm = () => {
    StorageService.resetAllData();
    setShowResetModal(false);
    setProfile(null);
    setSettings(DEFAULT_SETTINGS);
    setGames([]);
    setMistakes([]);
    setLessonProgress({});
    setPuzzleAttempts([]);
    setShowFirstRunModal(true);
    setActiveTab('home');
  };

  const mistakesDueCount = mistakes.filter(
    (m) => new Date(m.nextReviewDate).getTime() <= Date.now()
  ).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f15] text-slate-100 font-sans">
      {/* Title Bar */}
      <TitleBar
        profile={profile}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          mistakesDueCount={mistakesDueCount}
        />

        {/* View Switcher */}
        <main className="flex-1 flex overflow-y-auto overflow-x-hidden bg-[#0b0f15] min-h-0">
          {activeTab === 'home' && (
            <HomeView
              profile={profile}
              games={games}
              mistakes={mistakes}
              lessonProgress={lessonProgress}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectGame={handleNavigateToAnalysis}
            />
          )}

          {activeTab === 'play' && (
            <PlayView
              profile={profile}
              settings={settings}
              onGameFinished={handleGameFinished}
              onNavigateToAnalysis={handleNavigateToAnalysis}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisView
              game={activeAnalysisGame}
              settings={settings}
              onNavigateToMistakes={() => setActiveTab('mistakes')}
            />
          )}

          {activeTab === 'coach' && (
            <CoachView profile={profile} settings={settings} />
          )}

          {activeTab === 'academy' && (
            <AcademyView
              settings={settings}
              lessonProgress={lessonProgress}
              onProgressUpdated={refreshStorageState}
            />
          )}

          {activeTab === 'openings' && <OpeningsView settings={settings} />}

          {activeTab === 'tactics' && <TacticsView settings={settings} />}

          {activeTab === 'endgames' && <EndgamesView settings={settings} />}

          {activeTab === 'repertoire' && <RepertoireView settings={settings} />}

          {activeTab === 'mistakes' && <MistakesView settings={settings} />}

          {activeTab === 'library' && (
            <GameLibraryView onSelectGameForAnalysis={handleNavigateToAnalysis} />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              profile={profile}
              games={games}
              mistakes={mistakes}
              lessonProgress={lessonProgress}
              puzzleAttempts={puzzleAttempts}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              profile={profile}
              onUpdateSettings={setSettings}
              onUpdateProfile={setProfile}
              onRequestReset={() => setShowResetModal(true)}
            />
          )}
        </main>
      </div>

      {/* Desktop Status Bar */}
      <StatusBar activeTab={activeTab} settings={settings} />

      {/* First-Run Onboarding Modal */}
      {showFirstRunModal && (
        <FirstRunModal onComplete={handleFirstRunComplete} />
      )}

      {/* Destructive Reset Confirmation Modal */}
      <ConfirmResetModal
        isOpen={showResetModal}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
