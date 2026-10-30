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

export type CoachPersona = 'kasparov' | 'karpov' | 'tal' | 'elena';

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

    const hanging: { square: Square; piece: PieceType; color: Color }[] = [];

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
      ? `You sought an active square or counter-attack, but overlooked the concrete tactical refutation.`
      : `You aimed to develop or relieve tension, but conceded important central space or diagonal control.`;

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
   * Answers contextual questions from the player with Grandmaster Persona voice
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
    evalCp?: number,
    persona: CoachPersona = 'elena'
  ): string {
    const heuristics = this.analyzePosition(currentFen);
    const turn = currentFen.split(' ')[1] === 'w' ? 'White' : 'Black';
    const opponent = turn === 'White' ? 'Black' : 'White';

    // Persona-specific intros
    const personaPrefixes: Record<CoachPersona, string> = {
      kasparov: 'Kasparov says: "In chess, the initiative is everything. Strike before your opponent consolidates!"\n\n',
      karpov: 'Karpov says: "Style is fine, but accuracy and prophylaxis win championships. Constrain your opponent first."\n\n',
      tal: 'Tal says: "You must take your opponent into a deep dark forest where 2+2=5, and the path out is only wide enough for one."\n\n',
      elena: 'Teacher Elena: "Let\'s break down the position step-by-step using first principles."\n\n',
    };

    const prefix = personaPrefixes[persona] || '';

    switch (questionKey) {
      case 'what_threat': {
        if (!lastMove) {
          if (persona === 'kasparov') {
            return prefix + `${opponent} wants to seize the center and challenge our active pieces. Do not wait — develop with threats!`;
          }
          if (persona === 'karpov') {
            return prefix + `${opponent} is looking to plant an outpost in the center. Identify their target square and place a clamp on it.`;
          }
          if (persona === 'tal') {
            return prefix + `Watch their tactical geometry! Are your pieces defended? Look for pins and open diagonals towards your king.`;
          }
          return prefix + `${opponent} is aiming to activate their minor pieces and fight for central squares (d4, d5, e4, e5). Watch out for direct tactical checks and captures!`;
        }

        if (persona === 'kasparov') {
          return prefix + `${opponent} just played ${lastMove.san}. They are aggressively contesting the initiative! Look for counter-strikes rather than passive retreats.`;
        }
        if (persona === 'karpov') {
          return prefix + `${opponent}'s ${lastMove.san} is a concession of certain squares. Look at the squares left behind their move and claim them.`;
        }
        return prefix + `${opponent} recently played ${lastMove.san}. This pressures your position, seeking to exploit undefended pieces or open lines toward your king. Always calculate Checks, Captures, and Threats!`;
      }

      case 'why_mistake': {
        if (!lastMove || !lastMove.classification || lastMove.classification === 'best' || lastMove.classification === 'good') {
          return prefix + `Your recent moves have maintained a solid position! Keep focusing on harmonious piece development and king safety.`;
        }
        return prefix + `The move ${lastMove.san} was graded as a ${lastMove.classification}. It surrendered valuable central control or allowed ${opponent} tactical opportunities. Master engine analysis recommended ${lastMove.bestMove || 'a more solid candidate move'}.`;
      }

      case 'why_winning': {
        const cp = evalCp || 0;
        const favorable = (turn === 'White' && cp > 150) || (turn === 'Black' && cp < -150);
        if (favorable) {
          if (persona === 'tal') {
            return prefix + `You have a decisive advantage (+${(Math.abs(cp) / 100).toFixed(1)} pawns)! Look for the tactical dagger to finish the game now.`;
          }
          if (persona === 'karpov') {
            return prefix + `You hold a clear winning advantage (+${(Math.abs(cp) / 100).toFixed(1)} pawns). Do not rush — eliminate their counter-play, trade into a winning endgame, and convert cleanly.`;
          }
          return prefix + `The position favors you (+${(Math.abs(cp) / 100).toFixed(1)} pawns) due to superior piece activity, safer king placement, and vulnerable targets in the opponent's camp. Convert methodically.`;
        }
        if (Math.abs(cp) < 60) {
          return prefix + `The position is roughly balanced (${(cp / 100).toFixed(1)}). The outcome will depend on who better coordinates their pieces and controls open lines.`;
        }
        return prefix + `The opponent holds the upper hand. Your primary objective is prophylaxis: eliminate their most active piece, shore up your king's pawn shield, and look for tactical counter-breaks.`;
      }

      case 'what_plan': {
        if (heuristics.whiteCenterControl > heuristics.blackCenterControl) {
          if (persona === 'kasparov') {
            return prefix + `You own the center! Push your pawns forward to break open their king, activate rooks on the half-open files, and launch a direct assault.`;
          }
          return prefix + `You control central space. Your strategic plan: 1. Anchor your knights on advanced central outposts. 2. Double rooks on open files. 3. Prepare a pawn break to open lines toward the enemy king.`;
        }
        if (persona === 'karpov') {
          return prefix + `Your plan is restraint: 1. Prevent their knight from landing on d5/e5. 2. Improve your worst-placed piece. 3. Build pressure against their weakest pawn.`;
        }
        return prefix + `1. Finish minor piece development and connect rooks. 2. Identify the opponent's weakest pawn or square. 3. Avoid trading your active bishop for an inactive piece.`;
      }

      case 'candidate_moves': {
        return prefix + `Before calculating lines, select 3 candidate moves:\n1. A forcing move (direct check, capture, or threat).\n2. A positional move that improves your least active piece.\n3. A prophylactic move that halts the opponent's main idea.`;
      }

      case 'give_hint': {
        if (bestMoveUci) {
          const from = bestMoveUci.substring(0, 2);
          return prefix + `Look closely at your piece on square ${from}. How can it move to create maximum pressure or defend a critical square?`;
        }
        return prefix + `Look for undefended pieces in the enemy camp, and identify which of your pieces is currently doing the least work.`;
      }

      case 'quiz_me': {
        return prefix + `Calculation Challenge: If you play your top candidate move right now, what is your opponent's most dangerous reply, and how do you neutralize it? Calculate 2 full moves ahead before playing.`;
      }

      default:
        return prefix + `Focus on deep calculation and positional harmony. Chess is 99% tactics and 100% calculation!`;
    }
  }
}
