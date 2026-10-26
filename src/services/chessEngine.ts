import { Chess, Square as ChessSquare, PieceSymbol, Color as ChessColor } from 'chess.js';
import { Color, MoveRecord, Square, PieceType } from '../types/chess';

export interface MoveAttemptResult {
  success: boolean;
  san?: string;
  uci?: string;
  fenBefore: string;
  fenAfter: string;
  captured?: PieceType;
  promotion?: PieceType;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isStalemate?: boolean;
  isDraw?: boolean;
  error?: string;
}

export class ChessGameController {
  private chess: Chess;
  private history: MoveRecord[] = [];

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public reset(fen?: string): void {
    if (fen) {
      this.chess.load(fen);
    } else {
      this.chess.reset();
    }
    this.history = [];
  }

  public getFen(): string {
    return this.chess.fen();
  }

  public getTurn(): Color {
    return this.chess.turn() as Color;
  }

  public isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  public isCheck(): boolean {
    return this.chess.inCheck();
  }

  public isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  public isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  public isDraw(): boolean {
    return this.chess.isDraw();
  }

  public isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition();
  }

  public isInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial();
  }

  public getBoard(): ({ type: PieceType; color: Color } | null)[][] {
    return this.chess.board().map((row) =>
      row.map((sq) => {
        if (!sq) return null;
        return {
          type: sq.type as PieceType,
          color: sq.color as Color,
        };
      })
    );
  }

  public getLegalMovesForSquare(square: Square): Square[] {
    const moves = this.chess.moves({ square: square as ChessSquare, verbose: true });
    return moves.map((m) => m.to as Square);
  }

  public getAllLegalMoves(): { from: Square; to: Square; san: string; uci: string }[] {
    const moves = this.chess.moves({ verbose: true });
    return moves.map((m) => ({
      from: m.from as Square,
      to: m.to as Square,
      san: m.san,
      uci: `${m.from}${m.to}${m.promotion || ''}`,
    }));
  }

  public makeMove(from: Square, to: Square, promotion: PieceType = 'q'): MoveAttemptResult {
    const fenBefore = this.chess.fen();
    try {
      const move = this.chess.move({
        from: from as ChessSquare,
        to: to as ChessSquare,
        promotion: promotion as PieceSymbol,
      });

      if (!move) {
        return {
          success: false,
          fenBefore,
          fenAfter: fenBefore,
          error: 'Illegal move',
        };
      }

      const fenAfter = this.chess.fen();
      const uci = `${move.from}${move.to}${move.promotion || ''}`;

      const moveRecord: MoveRecord = {
        from: move.from as Square,
        to: move.to as Square,
        promotion: move.promotion ? (move.promotion as PieceType) : undefined,
        san: move.san,
        uci,
        color: move.color as Color,
        fenBefore,
        fenAfter,
      };

      this.history.push(moveRecord);

      return {
        success: true,
        san: move.san,
        uci,
        fenBefore,
        fenAfter,
        captured: move.captured ? (move.captured as PieceType) : undefined,
        promotion: move.promotion ? (move.promotion as PieceType) : undefined,
        isCheck: this.chess.inCheck(),
        isCheckmate: this.chess.isCheckmate(),
        isStalemate: this.chess.isStalemate(),
        isDraw: this.chess.isDraw(),
      };
    } catch (err: unknown) {
      return {
        success: false,
        fenBefore,
        fenAfter: fenBefore,
        error: (err as Error).message || 'Move rejected by rules engine',
      };
    }
  }

  public makeUciMove(uci: string): MoveAttemptResult {
    const from = uci.substring(0, 2) as Square;
    const to = uci.substring(2, 4) as Square;
    const promotion = uci.length > 4 ? (uci[4] as PieceType) : undefined;
    return this.makeMove(from, to, promotion);
  }

  public makeSanMove(san: string): MoveAttemptResult {
    const fenBefore = this.chess.fen();
    try {
      const move = this.chess.move(san);
      if (!move) {
        return { success: false, fenBefore, fenAfter: fenBefore, error: 'Illegal SAN' };
      }
      const fenAfter = this.chess.fen();
      const uci = `${move.from}${move.to}${move.promotion || ''}`;
      const record: MoveRecord = {
        from: move.from as Square,
        to: move.to as Square,
        promotion: move.promotion ? (move.promotion as PieceType) : undefined,
        san: move.san,
        uci,
        color: move.color as Color,
        fenBefore,
        fenAfter,
      };
      this.history.push(record);
      return {
        success: true,
        san: move.san,
        uci,
        fenBefore,
        fenAfter,
        captured: move.captured ? (move.captured as PieceType) : undefined,
        promotion: move.promotion ? (move.promotion as PieceType) : undefined,
        isCheck: this.chess.inCheck(),
        isCheckmate: this.chess.isCheckmate(),
        isStalemate: this.chess.isStalemate(),
        isDraw: this.chess.isDraw(),
      };
    } catch (err: unknown) {
      return { success: false, fenBefore, fenAfter: fenBefore, error: (err as Error).message };
    }
  }

  public undo(): MoveRecord | null {
    const undone = this.chess.undo();
    if (undone) {
      return this.history.pop() || null;
    }
    return null;
  }

  public getHistory(): MoveRecord[] {
    return [...this.history];
  }

  public getPgn(): string {
    return this.chess.pgn();
  }

  public loadPgn(pgn: string): boolean {
    try {
      const newChess = new Chess();
      newChess.loadPgn(pgn);
      this.chess = newChess;
      // Reconstruct history
      const historyMoves = this.chess.history({ verbose: true });
      const tempChess = new Chess();
      this.history = historyMoves.map((m) => {
        const fenBefore = tempChess.fen();
        tempChess.move(m);
        const fenAfter = tempChess.fen();
        return {
          from: m.from as Square,
          to: m.to as Square,
          promotion: m.promotion ? (m.promotion as PieceType) : undefined,
          san: m.san,
          uci: `${m.from}${m.to}${m.promotion || ''}`,
          color: m.color as Color,
          fenBefore,
          fenAfter,
        };
      });
      return true;
    } catch {
      return false;
    }
  }

  public static validateFen(fen: string): { valid: boolean; error?: string } {
    try {
      const c = new Chess();
      c.load(fen);
      return { valid: true };
    } catch (err: unknown) {
      return { valid: false, error: (err as Error).message };
    }
  }
}
