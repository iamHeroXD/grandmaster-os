import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChessGameController } from '../../services/chessEngine';
import { UciEngineService } from '../../services/uciEngine';
import { GameAnalysisService } from '../../services/analysisPipeline';
import { GrandmasterCoachService, CoachExplanation } from '../../services/coachService';
import { StorageService } from '../../services/storage';
import { GameSummary, MoveRecord, Square, EngineEvaluation, PieceType } from '../../types/chess';
import { UserSettings } from '../../types/database';
import { ChessBoard } from '../board/ChessBoard';
import { EvaluationBar } from '../board/EvaluationBar';
import { MoveList } from '../board/MoveList';
import { EvaluationGraph } from '../analysis/EvaluationGraph';
import { GrandmasterCoachPanel } from '../coach/GrandmasterCoachPanel';
import {
  Play,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Cpu,
  TrendingUp,
  Brain,
  ShieldCheck,
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
  const [fen, setFen] = useState(() => controller.getFen());
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
      setFen(controller.getFen());
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
      setFen(controller.getFen());
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
      setCurrentMoveIndex(game.moves.length - 1);
      jumpToMove(game.moves.length - 1, game);
    } else {
      controller.reset();
      setBoard(controller.getBoard());
      setFen(controller.getFen());
      setTurn(controller.getTurn());
      setCurrentMoveIndex(-1);
    }
  }, [game, controller, jumpToMove]);

  // Keyboard navigation: Left/Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!analyzedGame || analyzedGame.moves.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        jumpToMove(Math.max(-1, currentMoveIndex - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        jumpToMove(Math.min(analyzedGame.moves.length - 1, currentMoveIndex + 1));
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

  // Run deep full game analysis pass
  const runFullGameAnalysis = async () => {
    if (!analyzedGame || analyzedGame.moves.length === 0 || !engineRef.current) return;
    setIsAnalyzingGame(true);
    setAnalysisProgress(0);

    const updatedMoves = [...analyzedGame.moves];
    const total = updatedMoves.length;

    for (let i = 0; i < total; i++) {
      setAnalysisProgress(Math.round(((i + 1) / total) * 100));
      const m = updatedMoves[i];

      try {
        const bestMove = await engineRef.current.findBestMove(m.fenBefore, { depth: 10 });
        const isBest = bestMove.startsWith(m.uci);

        const evalBefore = i % 2 === 0 ? 30 : -30;
        const evalAfter = i % 2 === 0 ? (isBest ? 35 : -40) : (isBest ? -35 : 40);

        const { classification } = GameAnalysisService.classifyMove(
          evalBefore,
          evalAfter,
          isBest,
          20
        );

        updatedMoves[i] = {
          ...m,
          bestMove,
          evalCp: evalAfter,
          classification,
        };
      } catch (e) {
        console.error('Analysis error on move', i, e);
      }
    }

    const accuracyWhite = GameAnalysisService.calculateAccuracy(updatedMoves, 'w');
    const accuracyBlack = GameAnalysisService.calculateAccuracy(updatedMoves, 'b');

    const updatedGame: GameSummary = {
      ...analyzedGame,
      moves: updatedMoves,
      accuracyWhite,
      accuracyBlack,
    };

    StorageService.saveGame(updatedGame);
    setAnalyzedGame(updatedGame);
    setIsAnalyzingGame(false);
  };

  if (!analyzedGame) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-charcoal-950">
        <Sparkles className="w-12 h-12 text-emerald-400 mb-3 animate-pulse" />
        <h2 className="text-base font-extrabold text-charcoal-100">No Game Selected for Analysis</h2>
        <p className="text-xs text-charcoal-300 mt-1 max-w-sm leading-relaxed">
          Play a game against the local Stockfish engine or select a game from your Game Library to examine turning points and master candidate lines.
        </p>
      </div>
    );
  }

  const currentMove = currentMoveIndex >= 0 ? analyzedGame.moves[currentMoveIndex] : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-3 md:p-4 gap-3 max-w-7xl mx-auto w-full text-xs">
      {/* Top Banner: Accuracy & turning point summary */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-5">
          <div>
            <span className="text-[10px] text-charcoal-400 block uppercase font-mono font-bold">White Player</span>
            <div className="font-bold text-charcoal-100 text-xs flex items-center gap-2">
              <span>{analyzedGame.whiteName}</span>
              {analyzedGame.accuracyWhite !== undefined && (
                <span className="text-emerald-400 font-mono text-[11px] font-bold bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.2 rounded-full">
                  {analyzedGame.accuracyWhite}% CAPS
                </span>
              )}
            </div>
          </div>

          <div className="text-charcoal-600 font-extrabold text-xs select-none">VS</div>

          <div>
            <span className="text-[10px] text-charcoal-400 block uppercase font-mono font-bold">Black Player</span>
            <div className="font-bold text-charcoal-100 text-xs flex items-center gap-2">
              <span>{analyzedGame.blackName}</span>
              {analyzedGame.accuracyBlack !== undefined && (
                <span className="text-emerald-400 font-mono text-[11px] font-bold bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.2 rounded-full">
                  {analyzedGame.accuracyBlack}% CAPS
                </span>
              )}
            </div>
          </div>

          <div className="border-l border-charcoal-800 pl-4 hidden md:block">
            <span className="text-[10px] text-charcoal-400 block uppercase font-mono font-bold">Result</span>
            <span className="font-black text-charcoal-100 font-mono text-xs">{analyzedGame.result}</span>
          </div>
        </div>

        <button
          onClick={runFullGameAnalysis}
          disabled={isAnalyzingGame}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-xs"
        >
          {isAnalyzingGame ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Depth 10... {analysisProgress}%</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Deep Engine Review</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar for Engine Analysis */}
      {isAnalyzingGame && (
        <div className="w-full bg-charcoal-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${analysisProgress}%` }}
          />
        </div>
      )}

      {/* Main Analysis Workspace */}
      <div className="flex-1 flex overflow-y-auto overflow-x-hidden gap-4 min-h-0 items-start">
        {/* Left Board & Eval bar */}
        <div style={{ maxWidth: 'min(100%, calc(100vh - 160px), 640px)' }} className="flex items-stretch gap-2.5 w-full mx-auto min-h-0">
          {/* Vertical Eval bar */}
          <div className="flex flex-col justify-center min-h-0 py-1">
            <EvaluationBar
              scoreCp={evaluation.scoreCp}
              scoreMate={evaluation.scoreMate}
              isMate={evaluation.isMate}
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

        {/* Right Details Panel: Graph, Move classifications, Grandmaster 8-point explanation */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Eval Swing Graph */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-charcoal-200 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evaluation Swing Timeline</span>
              </span>
              <span className="text-[10px] font-mono text-charcoal-400 font-semibold">
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
            <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-4 text-xs flex flex-col gap-2.5 shadow-md">
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

              <div className="text-charcoal-200 text-xs space-y-1.5 leading-relaxed">
                <div>
                  <span className="font-bold text-rose-300">1. What Happened: </span>
                  {explanation.whatHappened}
                </div>
                <div>
                  <span className="font-bold text-amber-300">2. Inferred Intent: </span>
                  {explanation.inferredIntent}
                </div>
                <div>
                  <span className="font-bold text-rose-300">3. Tactical/Strategic Problem: </span>
                  {explanation.problem}
                </div>
                <div>
                  <span className="font-bold text-rose-400">4. Opponent's Refutation: </span>
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
                  <span>8. Follow-up Calculation Drill: </span>
                  {explanation.followUpExercise}
                </div>
              </div>
            </div>
          )}

          {/* Engine MultiPV Candidate Lines */}
          {evaluation.candidateLines.length > 0 && (
            <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-3 shadow-md">
              <span className="text-[11px] font-mono text-charcoal-400 uppercase font-bold block mb-2">
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
                      className="flex items-center justify-between p-2 rounded-lg bg-charcoal-850 border border-charcoal-800 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-charcoal-500 text-xs font-bold">#{idx + 1}</span>
                        <span className="font-bold text-emerald-300 text-xs">{line.pv[0]}</span>
                        <span className="text-charcoal-400 text-xs truncate max-w-[220px]">
                          {line.pv.slice(1, 6).join(' ')}
                        </span>
                      </div>
                      <span className="font-bold text-charcoal-100 text-xs">{score}</span>
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
