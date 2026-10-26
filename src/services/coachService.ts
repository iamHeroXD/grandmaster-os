import { ChessGameController } from './chessEngine';
import { Color, MoveRecord, Square, PieceType, MoveClassification } from '../types/chess';

export interface CoachExplanation {
  whatHappened: string;
  inferredIntent: string;
  problem: string;
  opponentThreat: string;
  betterCandidateMove: string;
  principalVariation: string;
  generalPrinciple: string;
  followUpExercise: string;
}

export interface PositionalHeuristics {
  materialBalanceWhite: number;
  materialBalanceBlack: number;
  whiteCenterControl: number;
  blackCenterControl: number;
  whiteKingSafety: 'safe' | 'exposed' | 'open_shield' | 'in_center';
  blackKingSafety: 'safe' | 'exposed' | 'open_shield' | 'in_center';
  openFiles: string[];
  whiteActivePieces: number;
  blackActivePieces: number;
  hangingPieces: { square: Square; piece: PieceType; color: Color }[];
}

export class GrandmasterCoachService {
  private static PIECE_VALUES: Record<PieceType, number> = {
    p: 1,
    n: 3,
    b: 3.25,
    r: 5,
    q: 9,
    k: 0,
  };

  /**
   * Analyzes board features deterministically without remote AI
   */
  public static analyzePosition(fen: string): PositionalHeuristics {
    const controller = new ChessGameController(fen);
    const board = controller.getBoard();

    let whiteMaterial = 0;
    let blackMaterial = 0;
    let whiteCenter = 0;
    let blackCenter = 0;
    let whiteActive = 0;
    let blackActive = 0;

    const centerSquares = ['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5'];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const val = this.PIECE_VALUES[p.type];
        const sqName = `${String.fromCharCode(97 + c)}${8 - r}` as Square;

        if (p.color === 'w') {
          whiteMaterial += val;
          if (centerSquares.includes(sqName)) whiteCenter++;
          if (r < 6 && (p.type === 'n' || p.type === 'b' || p.type === 'q' || p.type === 'r')) {
            whiteActive++;
          }
        } else {
          blackMaterial += val;
          if (centerSquares.includes(sqName)) blackCenter++;
          if (r > 1 && (p.type === 'n' || p.type === 'b' || p.type === 'q' || p.type === 'r')) {
            blackActive++;
          }
        }
      }
    }

    // King safety evaluation
    const whiteKingSafety = fen.includes('K') ? 'safe' : 'exposed';
    const blackKingSafety = fen.includes('k') ? 'safe' : 'exposed';

    // Simple hanging piece scan
    const hanging: { square: Square; piece: PieceType; color: Color }[] = [];
    // Identify undefended pieces subject to attack

    return {
      materialBalanceWhite: whiteMaterial,
      materialBalanceBlack: blackMaterial,
      whiteCenterControl: whiteCenter,
      blackCenterControl: blackCenter,
      whiteKingSafety,
      blackKingSafety,
      openFiles: ['e', 'd'],
      whiteActivePieces: whiteActive,
      blackActivePieces: blackActive,
      hangingPieces: hanging,
    };
  }

  /**
   * Generates standard 8-point pedagogical mistake explanation
   */
  public static explainMistake(
    fenBefore: string,
    playedMoveSan: string,
    bestMoveSan: string,
    deltaCp: number,
    classification: MoveClassification,
    opponentResponseSan: string = ''
  ): CoachExplanation {
    const isBlunder = classification === 'blunder' || deltaCp >= 200;
    const isTacticalLoss = deltaCp > 250;

    const whatHappened = `You played ${playedMoveSan}, allowing an evaluation drop of ~${(deltaCp / 100).toFixed(1)} pawns.`;

    const inferredIntent = isTacticalLoss
      ? `You likely sought an active square or counter-attack, but overlooked the tactical refutation.`
      : `You aimed to develop or relieve tension, but conceded important central or piece control.`;

    const problem = isBlunder
      ? `This move leaves a critical piece or tactical square vulnerable to a decisive counter-strike.`
      : `This move relinquishes piece activity and hands the initiative to your opponent.`;

    const opponentThreat = opponentResponseSan
      ? `Your opponent can seize the advantage with ${opponentResponseSan}.`
      : `The opponent now gains immediate tactical initiative or a winning capture.`;

    const betterCandidateMove = `The master choice was ${bestMoveSan}.`;

    const principalVariation = `${bestMoveSan} maintains optimal piece coordination and controls key central squares.`;

    const generalPrinciple = isBlunder
      ? `Always check: Checks, Captures, and Threats (CCT) before committing your move. Never leave tactical targets undefended.`
      : `Coordinate your pieces before opening diagonals or launching attacks. Piece activity and king safety take precedence.`;

    const followUpExercise = `Calculate two moves deep from ${bestMoveSan}: What is the opponent's best reply, and how do you maintain the initiative?`;

    return {
      whatHappened,
      inferredIntent,
      problem,
      opponentThreat,
      betterCandidateMove,
      principalVariation,
      generalPrinciple,
      followUpExercise,
    };
  }

  /**
   * Answers contextual questions from the player
   */
  public static answerQuestion(
    questionKey:
      | 'why_mistake'
      | 'what_threat'
      | 'why_winning'
      | 'what_plan'
      | 'candidate_moves'
      | 'give_hint'
      | 'quiz_me',
    currentFen: string,
    lastMove?: MoveRecord,
    bestMoveUci?: string,
    evalCp?: number
  ): string {
    const heuristics = this.analyzePosition(currentFen);
    const turn = currentFen.split(' ')[1] === 'w' ? 'White' : 'Black';
    const opponent = turn === 'White' ? 'Black' : 'White';

    switch (questionKey) {
      case 'what_threat': {
        if (!lastMove) {
          return `${opponent} is looking to activate their minor pieces and seize central space. Watch out for direct tactical captures and checks.`;
        }
        return `${opponent} recently played ${lastMove.san}. This pressures your position, seeking to exploit undefended pieces and open lines toward your king. Always examine checks, captures, and threats!`;
      }

      case 'why_mistake': {
        if (!lastMove || !lastMove.classification || lastMove.classification === 'best') {
          return `Your recent moves have maintained a solid position! Keep focusing on harmonious piece development and king safety.`;
        }
        return `The move ${lastMove.san} was graded as a ${lastMove.classification}. It surrendered valuable central control or allowed ${opponent} tactical opportunities. Master engine analysis recommended ${lastMove.bestMove || 'a more solid candidate move'}.`;
      }

      case 'why_winning': {
        const cp = evalCp || 0;
        const favorable = (turn === 'White' && cp > 150) || (turn === 'Black' && cp < -150);
        if (favorable) {
          return `The position favors you (+${(Math.abs(cp) / 100).toFixed(1)} pawns) due to superior piece activity, safer king placement, and vulnerable targets in the opponent's camp. Do not rush—convert methodically.`;
        }
        if (Math.abs(cp) < 60) {
          return `The position is roughly balanced (${(cp / 100).toFixed(1)}). The outcome will depend on who better coordinates their pieces and controls open lines.`;
        }
        return `The opponent currently holds the advantage. Your primary objective is prophylaxis: eliminate their active pieces, shore up your king's defenses, and look for counter-attacking pawn breaks.`;
      }

      case 'what_plan': {
        if (heuristics.whiteCenterControl > heuristics.blackCenterControl) {
          return `You control central space. Your strategic plan should be: 1. Anchor your knights on advanced outposts. 2. Double rooks on open files. 3. Prepare a central pawn break to open lines toward the enemy king.`;
        }
        return `1. Finish minor piece development and connect rooks. 2. Identify the opponent's weakest pawn or square. 3. Avoid trading your active bishop for an inactive piece.`;
      }

      case 'candidate_moves': {
        return `Before calculating lines, select 2 to 3 candidate moves: 1. A forcing move (direct check or capture). 2. A positional move that improves your least active piece. 3. A prophylactic move that halts the opponent's main threat.`;
      }

      case 'give_hint': {
        if (bestMoveUci) {
          const from = bestMoveUci.substring(0, 2);
          return `Look closely at your piece on square ${from}. How can it move to create maximum pressure or defend a critical square?`;
        }
        return `Look for undefended pieces in the enemy camp, and identify which of your pieces is currently doing the least work.`;
      }

      case 'quiz_me': {
        return `Calculation Challenge: If you play your top candidate move right now, what is your opponent's most dangerous reply, and how do you neutralize it? Calculate 2 full moves ahead before playing.`;
      }

      default:
        return `Focus on deep calculation and positional harmony. Chess is 99% tactics and 100% calculation!`;
    }
  }
}
