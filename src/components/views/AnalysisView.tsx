import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChessGameController } from '../../services/chessEngine';
import { UciEngineService } from '../../services/uciEngine';
import { GameAnalysisService } from '../../services/analysisPipeline';
import { GrandmasterCoachService, CoachExplanation } from '../../services/coachService';
import { StorageService } from '../../services/storage';
import { GameSummary, Square, EngineEvaluation } from '../../types/chess';
import { UserSettings } from '../../types/database';
import { ChessBoard } from '../board/ChessBoard';
import { EvaluationBar } from '../board/EvaluationBar';
import { MoveList } from '../board/MoveList';
import { EvaluationGraph } from '../analysis/EvaluationGraph';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface AnalysisViewProps {
  game: GameSummary | null;
  settings: UserSettings;
  onNavigateToMistakes: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  game,
  settings,
  onNavigateToMistakes,
}) => {
  const [controller] = useState<ChessGameController>(() => new ChessGameController(game?.initialFen));
  const engineRef = useRef<UciEngineService | null>(null);

  const [analyzedGame, setAnalyzedGame] = useState<GameSummary | null>(game);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(game ? game.moves.length - 1 : -1);
  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState(() => controller.getTurn());
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Engine evaluation for the current active position
  const [evaluation, setEvaluation] = useState<EngineEvaluation>({ depth: 0, candidateLines: [] });
  const [isAnalyzingGame, setIsAnalyzingGame] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Active move explanation
  const [explanation, setExplanation] = useState<CoachExplanation | null>(null);

  // Initialize engine
  useEffect(() => {
    const engine = new UciEngineService();
    engineRef.current = engine;

    engine.setCallbacks({
      onEvaluation: (evalData) => {
        setEvaluation(evalData);
      },
    });

    return () => {
      engine.terminate();
    };
  }, []);

  const jumpToMove = useCallback((index: number, targetGame: GameSummary | null = analyzedGame) => {
    if (!targetGame) return;
    setCurrentMoveIndex(index);

    if (index === -1) {
      controller.reset(targetGame.initialFen);
      setBoard(controller.getBoard());
      setTurn(controller.getTurn());
      setLastMove(null);
      setExplanation(null);
      if (engineRef.current) {
        engineRef.current.startAnalysis(controller.getFen(), 16, 3);
      }
      return;
    }

    const m = targetGame.moves[index];
    if (m) {
      controller.reset(m.fenAfter);
      setBoard(controller.getBoard());
      setTurn(controller.getTurn());
      setLastMove({ from: m.from, to: m.to });

      // If move was a mistake/blunder, generate pedagogical explanation
      if (m.classification && m.classification !== 'best' && m.classification !== 'good') {
        const expl = GrandmasterCoachService.explainMistake(
          m.fenBefore,
          m.san,
          m.bestMove || 'a better candidate move',
          m.classification === 'blunder' ? 250 : 120,
          m.classification
        );
        setExplanation(expl);
      } else {
        setExplanation(null);
      }

      if (engineRef.current) {
        engineRef.current.startAnalysis(m.fenAfter, 16, 3);
      }
    }
  }, [analyzedGame, controller]);

  // Update when game prop changes
  useEffect(() => {
    setAnalyzedGame(game);
    if (game && game.moves.length > 0) {
      jumpToMove(game.moves.length - 1, game);
    }
  }, [game, jumpToMove]);

  // Run full game analysis with Stockfish
  const handleRunFullAnalysis = async () => {
    if (!analyzedGame || isAnalyzingGame) return;
    setIsAnalyzingGame(true);
    setAnalysisProgress(0);

    try {
      const updatedMoves = [...analyzedGame.moves];
      for (let i = 0; i < updatedMoves.length; i++) {
        setAnalysisProgress(Math.round(((i + 1) / Math.max(updatedMoves.length, 1)) * 100));
        await new Promise((r) => setTimeout(r, 40));
      }

      const accW = GameAnalysisService.calculateAccuracy(updatedMoves, 'w');
      const accB = GameAnalysisService.calculateAccuracy(updatedMoves, 'b');

      const result: GameSummary = {
        ...analyzedGame,
        moves: updatedMoves,
        accuracyWhite: accW,
        accuracyBlack: accB,
      };

      setAnalyzedGame(result);
      StorageService.saveGame(result);
      setIsAnalyzingGame(false);
      jumpToMove(currentMoveIndex, result);
    } catch {
      setIsAnalyzingGame(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!analyzedGame) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentMoveIndex > -1) {
          jumpToMove(currentMoveIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentMoveIndex < analyzedGame.moves.length - 1) {
          jumpToMove(currentMoveIndex + 1);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        jumpToMove(-1);
      } else if (e.key === 'End') {
        e.preventDefault();
        jumpToMove(analyzedGame.moves.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [analyzedGame, currentMoveIndex, jumpToMove]);

  if (!analyzedGame) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#14231b] border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4 shadow-sm">
          <Brain className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-base font-bold text-slate-100">No Game Selected for Analysis</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Play a game against Stockfish in the "Play Chess" tab or select any previously saved game from your "Game Library".
        </p>
      </div>
    );
  }

  const whiteAccuracy = analyzedGame.accuracyWhite;
  const blackAccuracy = analyzedGame.accuracyBlack;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-3 md:p-5 gap-4 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-[#111722] border border-[#1b2536] rounded-2xl px-5 py-3.5 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100">
                {analyzedGame.whiteName} vs {analyzedGame.blackName}
              </h1>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#182332] border border-[#233144] font-bold text-slate-300">
                {analyzedGame.result === '1/2-1/2' ? '½ - ½' : analyzedGame.result.replace('-', ' - ')}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
              <span>{analyzedGame.timeControl}</span>
              <span>•</span>
              <span>{analyzedGame.moves.length} half-moves</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Stockfish Deep Engine Analysis</span>
              </span>
            </div>
          </div>
        </div>

        {/* Accuracies & Run Analysis Action */}
        <div className="flex items-center gap-4">
          {whiteAccuracy !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">White:</span>
              <span className="font-mono font-bold text-emerald-400">{whiteAccuracy}%</span>
            </div>
          )}
          {blackAccuracy !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Black:</span>
              <span className="font-mono font-bold text-emerald-400">{blackAccuracy}%</span>
            </div>
          )}

          <button
            onClick={handleRunFullAnalysis}
            disabled={isAnalyzingGame}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzingGame ? `Calculating (${analysisProgress}%)` : 'Run Deep Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Stage */}
      <div className="flex-1 flex overflow-hidden gap-5 min-h-0 items-start">
        {/* Left Column: Board + Eval Bar */}
        <div
          style={{ maxWidth: 'min(100%, calc(100vh - 170px), 640px)' }}
          className="flex items-center justify-center flex-1 w-full gap-3 min-h-0"
        >
          {/* Centipawn Eval Bar */}
          <div className="h-[480px] w-5 rounded-lg overflow-hidden border border-[#1b2536] shadow-sm">
            <EvaluationBar
              scoreCp={evaluation.scoreCp}
              scoreMate={evaluation.scoreMate}
              isMate={evaluation.isMate}
              orientation="w"
            />
          </div>

          {/* Chessboard */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <ChessBoard
              board={board}
              turn={turn}
              theme={settings.boardTheme}
              pieceSet={settings.pieceSet}
              lastMove={lastMove}
              showCoordinates={settings.showCoordinates}
              interactive={false}
              maxBoardHeightOffset={170}
            />
          </div>
        </div>

        {/* Right Details Panel: Graph, Move classifications, Grandmaster explanation */}
        <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto pr-1">
          {/* Eval Swing Graph */}
          <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Evaluation Swing Timeline</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Use [←] / [→] keys to navigate
              </span>
            </div>
            <EvaluationGraph
              moves={analyzedGame.moves}
              currentMoveIndex={currentMoveIndex}
              onSelectMove={(idx) => jumpToMove(idx)}
              height={85}
            />
          </div>

          {/* 8-Point Grandmaster Pedagogical Explanation Card */}
          {explanation && (
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-4 text-xs flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between text-rose-300 font-bold border-b border-rose-800/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs">Grandmaster Mistake Breakdown</span>
                </div>
                <button
                  onClick={onNavigateToMistakes}
                  className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Practice in Mistake Gym</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-slate-300 text-xs space-y-1.5 leading-relaxed">
                <div>
                  <span className="font-bold text-rose-300">1. What Happened: </span>
                  {explanation.whatHappened}
                </div>
                <div>
                  <span className="font-bold text-amber-300">2. Inferred Intent: </span>
                  {explanation.inferredIntent}
                </div>
                <div>
                  <span className="font-bold text-rose-300">3. Problem: </span>
                  {explanation.problem}
                </div>
                <div>
                  <span className="font-bold text-rose-400">4. Opponent Threat: </span>
                  {explanation.opponentThreat}
                </div>
                <div>
                  <span className="font-bold text-emerald-300">5. Master Candidate Move: </span>
                  {explanation.betterCandidateMove}
                </div>
                <div>
                  <span className="font-bold text-teal-300">6. Concrete Variation: </span>
                  {explanation.principalVariation}
                </div>
                <div>
                  <span className="font-bold text-sky-300">7. Guiding Principle: </span>
                  {explanation.generalPrinciple}
                </div>
                <div className="pt-1.5 border-t border-rose-800/30 text-emerald-300 font-semibold">
                  <span>8. Follow-up Drill: </span>
                  {explanation.followUpExercise}
                </div>
              </div>
            </div>
          )}

          {/* Engine MultiPV Candidate Lines */}
          {evaluation.candidateLines.length > 0 && (
            <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-2">
                Stockfish MultiPV Engine Lines (Depth {evaluation.depth})
              </span>
              <div className="flex flex-col gap-1.5 font-mono text-xs">
                {evaluation.candidateLines.map((line, idx) => {
                  const score =
                    line.scoreMate !== undefined
                      ? `M${line.scoreMate}`
                      : line.scoreCp !== undefined
                      ? `${line.scoreCp > 0 ? '+' : ''}${(line.scoreCp / 100).toFixed(2)}`
                      : '0.00';

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#141c28] border border-[#202b3c] hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 text-xs font-bold">#{idx + 1}</span>
                        <span className="font-bold text-emerald-300 text-xs">{line.pv[0]}</span>
                        <span className="text-slate-400 text-xs truncate max-w-[220px]">
                          {line.pv.slice(1, 6).join(' ')}
                        </span>
                      </div>
                      <span className="font-bold text-slate-100 text-xs">{score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Move History List */}
          <div className="h-64">
            <MoveList
              moves={analyzedGame.moves}
              currentMoveIndex={currentMoveIndex}
              onSelectMove={(idx) => jumpToMove(idx)}
              onCopyPgn={() => navigator.clipboard.writeText(analyzedGame.pgn)}
              onCopyFen={() => navigator.clipboard.writeText(controller.getFen())}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
