import { UserProfile, UserSettings, StoredMistake, PuzzleAttempt, LessonProgress, RepertoireLine } from '../types/database';
import { GameSummary } from '../types/chess';

const STORAGE_KEYS = {
  PROFILE: 'gmos_profile_v1',
  SETTINGS: 'gmos_settings_v1',
  GAMES: 'gmos_games_v1',
  MISTAKES: 'gmos_mistakes_v1',
  PUZZLE_ATTEMPTS: 'gmos_puzzle_attempts_v1',
  LESSON_PROGRESS: 'gmos_lesson_progress_v1',
  REPERTOIRE: 'gmos_repertoire_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  boardTheme: 'tournament',
  pieceSet: 'classic',
  boardOrientation: 'w',
  soundEnabled: true,
  soundVolume: 0.6,
  showLegalDots: true,
  showCoordinates: true,
  highlightLastMove: true,
  highlightCheck: true,
  animationSpeed: 'normal',
  reducedMotion: false,
  darkMode: true,
  engineThreads: 2,
  engineHashMb: 128,
  engineDepthLimit: 16,
  coachingLevel: 'intermediate',
  calculateBeforeEngine: true,
};

export class StorageService {
  // Profiles
  public static getProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static saveProfile(profile: UserProfile): void {
    profile.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // Settings
  public static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Games
  public static getGames(): GameSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveGame(game: GameSummary): void {
    const games = this.getGames();
    if (!game.id) {
      game.id = 'game_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    const idx = games.findIndex((g) => g.id === game.id);
    if (idx >= 0) {
      games[idx] = game;
    } else {
      games.unshift(game);
    }
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  }

  public static getGameById(id: string): GameSummary | null {
    const games = this.getGames();
    return games.find((g) => g.id === id) || null;
  }

  public static deleteGame(id: string): void {
    const games = this.getGames().filter((g) => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  }

  // Mistakes
  public static getMistakes(): StoredMistake[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveMistake(mistake: StoredMistake): void {
    const mistakes = this.getMistakes();
    const idx = mistakes.findIndex((m) => m.id === mistake.id || (m.fen === mistake.fen && m.playerMove === mistake.playerMove));
    if (idx >= 0) {
      mistakes[idx] = { ...mistakes[idx], ...mistake };
    } else {
      mistakes.unshift(mistake);
    }
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  }

  // Puzzle attempts
  public static getPuzzleAttempts(): PuzzleAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PUZZLE_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static recordPuzzleAttempt(attempt: PuzzleAttempt): void {
    const attempts = this.getPuzzleAttempts();
    attempts.push(attempt);
    localStorage.setItem(STORAGE_KEYS.PUZZLE_ATTEMPTS, JSON.stringify(attempts));
  }

  // Lesson Progress
  public static getLessonProgress(): Record<string, LessonProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public static recordLessonComplete(lessonId: string): void {
    const progress = this.getLessonProgress();
    const current = progress[lessonId] || { lessonId, completed: false, attempts: 0 };
    progress[lessonId] = {
      ...current,
      completed: true,
      completedAt: new Date().toISOString(),
      attempts: current.attempts + 1,
    };
    localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(progress));
  }

  // Repertoire
  public static getRepertoireLines(): RepertoireLine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPERTOIRE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveRepertoireLine(line: RepertoireLine): void {
    const lines = this.getRepertoireLines();
    const idx = lines.findIndex((l) => l.id === line.id);
    if (idx >= 0) {
      lines[idx] = line;
    } else {
      lines.push(line);
    }
    localStorage.setItem(STORAGE_KEYS.REPERTOIRE, JSON.stringify(lines));
  }

  public static deleteRepertoireLine(id: string): void {
    const lines = this.getRepertoireLines().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPERTOIRE, JSON.stringify(lines));
  }

  // Backup & Restore
  public static exportAllData(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      settings: this.getSettings(),
      games: this.getGames(),
      mistakes: this.getMistakes(),
      puzzleAttempts: this.getPuzzleAttempts(),
      lessonProgress: this.getLessonProgress(),
      repertoire: this.getRepertoireLines(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;
      if (data.profile) this.saveProfile(data.profile);
      if (data.settings) this.saveSettings(data.settings);
      if (Array.isArray(data.games)) localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(data.games));
      if (Array.isArray(data.mistakes)) localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data.mistakes));
      if (Array.isArray(data.puzzleAttempts)) localStorage.setItem(STORAGE_KEYS.PUZZLE_ATTEMPTS, JSON.stringify(data.puzzleAttempts));
      if (data.lessonProgress) localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(data.lessonProgress));
      if (Array.isArray(data.repertoire)) localStorage.setItem(STORAGE_KEYS.REPERTOIRE, JSON.stringify(data.repertoire));
      return true;
    } catch {
      return false;
    }
  }

  // Wipe / Destructive reset
  public static resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
}
