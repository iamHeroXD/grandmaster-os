import { MoveRecord, MoveClassification, GameSummary } from '../types/chess';
import { StoredMistake } from '../types/database';
import { GrandmasterCoachService } from './coachService';

export interface AnalysisProgressCallback {
  (currentMoveIndex: number, totalMoves: number, evalCp?: number): void;
}

export class GameAnalysisService {
  /**
   * Classifies a move based on centipawn drop from previous position eval
   */
  public static classifyMove(
    evalBefore: number, // from perspective of side to move (+ is winning)
    evalAfter: number,  // from perspective of side to move (+ is winning)
    isBestMove: boolean,
    legalMovesCount: number
  ): { classification: MoveClassification; deltaCp: number } {
    if (legalMovesCount <= 1) {
      return { classification: 'forced', deltaCp: 0 };
    }

    if (isBestMove) {
      return { classification: 'best', deltaCp: 0 };
    }

    // Centipawn drop: positive means position got worse
    const deltaCp = Math.max(0, evalBefore - evalAfter);

    if (deltaCp <= 15) {
      return { classification: 'excellent', deltaCp };
    }
    if (deltaCp <= 45) {
      return { classification: 'good', deltaCp };
    }
    if (deltaCp <= 110) {
      return { classification: 'inaccuracy', deltaCp };
    }
    if (deltaCp <= 230) {
      return { classification: 'mistake', deltaCp };
    }
    // High drop or throwing away a decisive advantage
    if (evalBefore >= 200 && evalAfter <= 0) {
      return { classification: 'missed_win', deltaCp };
    }
    return { classification: 'blunder', deltaCp };
  }

  /**
   * Calculates overall CAPS-style accuracy from average centipawn loss
   */
  public static calculateAccuracy(moves: MoveRecord[], color: 'w' | 'b'): number {
    const playerMoves = moves.filter((m) => m.color === color && m.evalCp !== undefined);
    if (playerMoves.length === 0) return 85.0;

    let totalLoss = 0;
    let count = 0;

    for (let i = 0; i < playerMoves.length; i++) {
      const m = playerMoves[i];
      // calculate loss if eval was assigned
      const loss = m.classification === 'best' ? 0 : m.classification === 'excellent' ? 10 : m.classification === 'good' ? 30 : m.classification === 'inaccuracy' ? 70 : m.classification === 'mistake' ? 150 : 300;
      totalLoss += loss;
      count++;
    }

    const avgLoss = count > 0 ? totalLoss / count : 30;
    // Formula: 100 * exp(-0.004 * avgLoss)
    const accuracy = 100 * Math.exp(-0.0035 * avgLoss);
    return Math.max(25, Math.min(99.5, Number(accuracy.toFixed(1))));
  }

  /**
   * Identifies key game moments: biggest turning point, best move, and blunders
   */
  public static extractKeyMoments(game: GameSummary): {
    turningPoint: MoveRecord | null;
    bestDecision: MoveRecord | null;
    blunders: StoredMistake[];
  } {
    let maxDrop = 0;
    let turningPoint: MoveRecord | null = null;
    let bestDecision: MoveRecord | null = null;
    const blunders: StoredMistake[] = [];

    for (let i = 0; i < game.moves.length; i++) {
      const m = game.moves[i];
      if (m.classification === 'best' && !bestDecision) {
        bestDecision = m;
      }

      if (m.classification === 'blunder' || m.classification === 'mistake') {
        const drop = m.classification === 'blunder' ? 250 : 120;
        if (drop > maxDrop) {
          maxDrop = drop;
          turningPoint = m;
        }

        const explanation = GrandmasterCoachService.explainMistake(
          m.fenBefore,
          m.san,
          m.bestMove || 'better candidate',
          drop,
          m.classification
        );

        blunders.push({
          id: `mistake_${game.id || Date.now()}_${i}`,
          gameId: game.id,
          fen: m.fenBefore,
          playerMove: m.uci,
          playerMoveSan: m.san,
          bestMove: m.bestMove || '',
          bestMoveSan: m.bestMove || '',
          deltaCp: drop,
          classification: m.classification,
          motif: m.classification === 'blunder' ? 'Tactical Oversight' : 'Positional Concession',
          explanation: explanation.problem + ' ' + explanation.generalPrinciple,
          dateCaptured: game.playedAt || new Date().toISOString(),
          reviewStatus: 'new',
          easeFactor: 2.5,
          intervalDays: 1,
          nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
          consecutiveSuccesses: 0,
        });
      }
    }

    return { turningPoint, bestDecision, blunders };
  }
}
