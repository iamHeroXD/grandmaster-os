export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Square =
  | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'
  | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7'
  | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
  | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5'
  | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4'
  | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
  | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2'
  | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1';

export type MoveClassification =
  | 'best'            // ★ Best engine move
  | 'excellent'       // ✓ Nearly equal to best (< 15 cp difference)
  | 'good'            // ○ Good sound move (< 40 cp difference)
  | 'inaccuracy'      // ?! Small loss of advantage (40 - 90 cp)
  | 'mistake'         // ? Significant concession (90 - 200 cp)
  | 'blunder'         // ?? Game-altering mistake (> 200 cp or swing from win to draw/loss)
  | 'missed_win'      // Missed tactical or mating shot
  | 'forced';         // □ Only legal or reasonable move

export interface MoveRecord {
  from: Square;
  to: Square;
  promotion?: PieceType;
  san: string;
  uci: string;
  color: Color;
  fenBefore: string;
  fenAfter: string;
  evalCp?: number;
  evalMate?: number;
  classification?: MoveClassification;
  bestMove?: string;
  timeTakenMs?: number;
  explanation?: string;
}

export interface EngineCandidateLine {
  multipv: number;
  depth: number;
  scoreCp?: number;
  scoreMate?: number;
  pv: string[];
  pvSan?: string[];
  nodes?: number;
  nps?: number;
}

export interface EngineEvaluation {
  depth: number;
  scoreCp?: number;
  scoreMate?: number;
  bestMoveUci?: string;
  candidateLines: EngineCandidateLine[];
  nodes?: number;
  isMate?: boolean;
}

export type GameMode =
  | 'vs_computer'
  | 'local_two_player'
  | 'practice'
  | 'puzzle'
  | 'lesson'
  | 'repertoire_training'
  | 'endgame_sparring';

export type OpponentStrength =
  | 'beginner'      // ~1000 Elo
  | 'intermediate'  // ~1400 Elo
  | 'advanced'      // ~1800 Elo
  | 'master';       // Maximum Stockfish

export interface TimeControlConfig {
  name: string;
  baseMinutes: number;
  incrementSeconds: number;
}

export const TIME_CONTROLS: TimeControlConfig[] = [
  { name: '1 + 0 (Bullet)', baseMinutes: 1, incrementSeconds: 0 },
  { name: '2 + 1 (Bullet)', baseMinutes: 2, incrementSeconds: 1 },
  { name: '3 + 2 (Blitz)', baseMinutes: 3, incrementSeconds: 2 },
  { name: '5 + 3 (Blitz)', baseMinutes: 5, incrementSeconds: 3 },
  { name: '10 + 0 (Rapid)', baseMinutes: 10, incrementSeconds: 0 },
  { name: '15 + 10 (Rapid)', baseMinutes: 15, incrementSeconds: 10 },
  { name: '30 + 0 (Classical)', baseMinutes: 30, incrementSeconds: 0 },
  { name: 'Untimed', baseMinutes: 0, incrementSeconds: 0 },
];

export type GameTerminationReason =
  | 'checkmate'
  | 'stalemate'
  | 'resignation'
  | 'timeout'
  | 'threefold_repetition'
  | 'fifty_moves'
  | 'insufficient_material'
  | 'agreement'
  | 'abandoned';

export interface GameSummary {
  id?: string;
  whiteName: string;
  blackName: string;
  whiteColor: 'user' | 'computer' | 'guest';
  blackColor: 'user' | 'computer' | 'guest';
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  terminationReason: GameTerminationReason;
  timeControl: string;
  initialFen: string;
  pgn: string;
  moves: MoveRecord[];
  playedAt: string;
  accuracyWhite?: number;
  accuracyBlack?: number;
  isAnalyzed?: boolean;
}
