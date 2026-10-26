import { Square, MoveClassification, Color } from './chess';

export interface UserProfile {
  id: string;
  username: string;
  experienceLevel: 'beginner' | 'casual' | 'club_player' | 'advanced';
  estimatedRating?: number;
  notationFamiliarity: 'none' | 'basic' | 'fluent';
  preferredTimeControl: string;
  coachingStyle: 'gentle' | 'tournament' | 'tactical' | 'grandmaster' | 'minimal';
  dailyGoalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export type BoardThemeName = 'wood' | 'tournament' | 'slate' | 'monochrome' | 'highcontrast';
export type PieceSetName = 'classic' | 'wood' | 'modern';

export interface UserSettings {
  boardTheme: BoardThemeName;
  pieceSet: PieceSetName;
  boardOrientation: Color;
  soundEnabled: boolean;
  soundVolume: number;
  showLegalDots: boolean;
  showCoordinates: boolean;
  highlightLastMove: boolean;
  highlightCheck: boolean;
  animationSpeed: 'instant' | 'fast' | 'normal';
  reducedMotion: boolean;
  darkMode: boolean;
  engineThreads: number;
  engineHashMb: number;
  engineDepthLimit: number;
  coachingLevel: 'beginner' | 'intermediate' | 'advanced';
  calculateBeforeEngine: boolean; // Hides engine eval until requested
}

export interface StoredMistake {
  id: string;
  gameId?: string;
  fen: string;
  playerMove: string;
  playerMoveSan: string;
  bestMove: string;
  bestMoveSan: string;
  deltaCp: number;
  classification: MoveClassification;
  motif: string;
  explanation: string;
  dateCaptured: string;
  reviewStatus: 'new' | 'learning' | 'mastered';
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  consecutiveSuccesses: number;
}

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[]; // sequence of moves in UCI or SAN
  rating: number;
  theme: string;
  description: string;
  hints: [string, string, string]; // [Motif hint, Piece/Square hint, Move direction hint]
  sideToMove: Color;
}

export interface PuzzleAttempt {
  puzzleId: string;
  timestamp: string;
  solved: boolean;
  timeSpentMs: number;
  hintsUsed: number;
}

export interface LessonContent {
  id: string;
  stageNumber: number;
  stageTitle: string;
  title: string;
  summary: string;
  concept: string;
  initialFen: string;
  interactiveMovePrompt: string;
  expectedMove: string; // SAN or UCI
  explanationOnCorrect: string;
  commonMistake: string;
  masteryQuizFen?: string;
  masteryQuizExpectedMove?: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  attempts: number;
}

export interface RepertoireLine {
  id: string;
  color: Color;
  openingName: string;
  eco: string;
  moves: string[]; // moves in SAN
  fens: string[];  // FEN after each move
  notes: string;
}
