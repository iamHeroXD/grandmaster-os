import { EngineCandidateLine, EngineEvaluation, OpponentStrength } from '../types/chess';

export interface UciEngineCallbacks {
  onEvaluation?: (evalData: EngineEvaluation) => void;
  onBestMove?: (bestMoveUci: string) => void;
  onInfoLine?: (rawLine: string) => void;
  onReady?: () => void;
  onError?: (err: string) => void;
}

export class UciEngineService {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private isAnalyzing: boolean = false;
  private currentEvaluation: EngineEvaluation = { depth: 0, candidateLines: [] };
  private callbacks: UciEngineCallbacks = {};
  private currentSearchId: number = 0;
  private pendingBestMoveResolve: ((move: string) => void) | null = null;
  private readyResolve: (() => void) | null = null;

  constructor() {
    this.initWorker();
  }

  public setCallbacks(cb: UciEngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...cb };
  }

  private initWorker() {
    try {
      if (typeof window === 'undefined') return;

      // Clean up old worker if any
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }

      const isWasmSupported =
        typeof WebAssembly === 'object' &&
        WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

      const scriptPath = isWasmSupported ? './stockfish.wasm.js' : './stockfish.js';
      this.worker = new Worker(scriptPath);

      this.worker.onmessage = (e) => {
        const line = typeof e.data === 'string' ? e.data : '';
        this.handleEngineOutput(line);
      };

      this.worker.onerror = (err) => {
        console.error('Stockfish Worker Error:', err);
        if (this.callbacks.onError) {
          this.callbacks.onError('Stockfish worker error: ' + (err.message || 'unknown error'));
        }
      };

      // Initial UCI handshake
      this.sendCommand('uci');
    } catch (e: unknown) {
      console.error('Failed to initialize Stockfish worker:', e);
      if (this.callbacks.onError) {
        this.callbacks.onError('Could not start Stockfish worker: ' + (e as Error).message);
      }
    }
  }

  public sendCommand(cmd: string) {
    if (this.worker) {
      this.worker.postMessage(cmd);
    }
  }

  public async waitReady(): Promise<void> {
    if (this.isReady) return;
    return new Promise((resolve) => {
      this.readyResolve = resolve;
      this.sendCommand('isready');
    });
  }

  public configure(options: { threads?: number; hashMb?: number; multiPv?: number }) {
    if (options.threads) {
      this.sendCommand(`setoption name Threads value ${options.threads}`);
    }
    if (options.hashMb) {
      this.sendCommand(`setoption name Hash value ${options.hashMb}`);
    }
    if (options.multiPv) {
      this.sendCommand(`setoption name MultiPV value ${options.multiPv}`);
    }
    this.sendCommand('isready');
  }

  public setDifficulty(strength: OpponentStrength) {
    switch (strength) {
      case 'beginner':
        this.sendCommand('setoption name Skill Level value 1');
        this.sendCommand('setoption name UCI_LimitStrength value true');
        this.sendCommand('setoption name UCI_Elo value 1000');
        break;
      case 'intermediate':
        this.sendCommand('setoption name Skill Level value 8');
        this.sendCommand('setoption name UCI_LimitStrength value true');
        this.sendCommand('setoption name UCI_Elo value 1400');
        break;
      case 'advanced':
        this.sendCommand('setoption name Skill Level value 16');
        this.sendCommand('setoption name UCI_LimitStrength value true');
        this.sendCommand('setoption name UCI_Elo value 1850');
        break;
      case 'master':
      default:
        this.sendCommand('setoption name Skill Level value 20');
        this.sendCommand('setoption name UCI_LimitStrength value false');
        break;
    }
  }

  public startAnalysis(fen: string, depth: number = 16, multiPv: number = 3) {
    this.stop();
    this.isAnalyzing = true;
    this.currentSearchId++;
    this.currentEvaluation = { depth: 0, candidateLines: [] };

    this.sendCommand(`setoption name MultiPV value ${multiPv}`);
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${depth}`);
  }

  public async findBestMove(
    fen: string,
    options: { depth?: number; movetime?: number; strength?: OpponentStrength } = {}
  ): Promise<string> {
    this.stop();
    this.currentSearchId++;

    const depth = options.depth || (options.strength === 'beginner' ? 3 : options.strength === 'intermediate' ? 8 : 14);
    if (options.strength) {
      this.setDifficulty(options.strength);
    }

    return new Promise((resolve) => {
      this.pendingBestMoveResolve = resolve;
      this.sendCommand(`position fen ${fen}`);
      if (options.movetime) {
        this.sendCommand(`go movetime ${options.movetime}`);
      } else {
        this.sendCommand(`go depth ${depth}`);
      }
    });
  }

  public stop() {
    this.isAnalyzing = false;
    this.sendCommand('stop');
  }

  public restart() {
    this.stop();
    this.initWorker();
  }

  public terminate() {
    this.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  private handleEngineOutput(line: string) {
    if (!line) return;

    if (this.callbacks.onInfoLine) {
      this.callbacks.onInfoLine(line);
    }

    if (line === 'uciok') {
      this.sendCommand('isready');
    } else if (line === 'readyok') {
      this.isReady = true;
      if (this.readyResolve) {
        this.readyResolve();
        this.readyResolve = null;
      }
      if (this.callbacks.onReady) {
        this.callbacks.onReady();
      }
    } else if (line.startsWith('info depth')) {
      this.parseInfoLine(line);
    } else if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestMove = parts[1];
      if (this.pendingBestMoveResolve) {
        this.pendingBestMoveResolve(bestMove);
        this.pendingBestMoveResolve = null;
      }
      if (this.callbacks.onBestMove && bestMove && bestMove !== '(none)') {
        this.callbacks.onBestMove(bestMove);
      }
    }
  }

  // Parses UCI info string: e.g. "info depth 14 seldepth 18 multipv 1 score cp 32 nodes 12344 nps 450000 pv e2e4 e7e5"
  public static parseUciInfo(line: string): Partial<EngineCandidateLine> & { depth?: number; nodes?: number; nps?: number } {
    const tokens = line.split(' ');
    const result: Partial<EngineCandidateLine> & { depth?: number; nodes?: number; nps?: number } = {};

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === 'depth' && tokens[i + 1]) {
        result.depth = parseInt(tokens[i + 1], 10);
      } else if (tokens[i] === 'multipv' && tokens[i + 1]) {
        result.multipv = parseInt(tokens[i + 1], 10);
      } else if (tokens[i] === 'nodes' && tokens[i + 1]) {
        result.nodes = parseInt(tokens[i + 1], 10);
      } else if (tokens[i] === 'nps' && tokens[i + 1]) {
        result.nps = parseInt(tokens[i + 1], 10);
      } else if (tokens[i] === 'score') {
        if (tokens[i + 1] === 'cp' && tokens[i + 2]) {
          result.scoreCp = parseInt(tokens[i + 2], 10);
        } else if (tokens[i + 1] === 'mate' && tokens[i + 2]) {
          result.scoreMate = parseInt(tokens[i + 2], 10);
        }
      } else if (tokens[i] === 'pv') {
        result.pv = tokens.slice(i + 1);
        break;
      }
    }
    return result;
  }

  private parseInfoLine(line: string) {
    const parsed = UciEngineService.parseUciInfo(line);
    if (!parsed.depth || !parsed.pv) return;

    const multipvIndex = (parsed.multipv || 1) - 1;
    const candidateLine: EngineCandidateLine = {
      multipv: parsed.multipv || 1,
      depth: parsed.depth,
      scoreCp: parsed.scoreCp,
      scoreMate: parsed.scoreMate,
      pv: parsed.pv,
      nodes: parsed.nodes,
      nps: parsed.nps,
    };

    const lines = [...this.currentEvaluation.candidateLines];
    lines[multipvIndex] = candidateLine;

    this.currentEvaluation = {
      depth: parsed.depth,
      scoreCp: lines[0]?.scoreCp,
      scoreMate: lines[0]?.scoreMate,
      bestMoveUci: lines[0]?.pv[0],
      candidateLines: lines.filter(Boolean),
      nodes: parsed.nodes,
      isMate: lines[0]?.scoreMate !== undefined,
    };

    if (this.callbacks.onEvaluation) {
      this.callbacks.onEvaluation(this.currentEvaluation);
    }
  }
}
