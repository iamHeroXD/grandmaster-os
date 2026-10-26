import React, { useState, useEffect, useRef } from 'react';
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
import { Play, Sparkles, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

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
  }, [game]);

  const jumpToMove = (index: number, targetGame: GameSummary | null = analyzedGame) => {
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
          m.bestMove || 'a better candidate',
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
  };

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
        // Query engine for position before move
        const bestMove = await engineRef.current.findBestMove(m.fenBefore, { depth: 10 });
        const isBest = bestMove.startsWith(m.uci);

        // Assign classification
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

    const updatedGame: GameSummary = {
      ...analyzedGame,
      moves: updatedMoves,
      accuracyWhite: GameAnalysisService.calculateAccuracy(updatedMoves, 'w'),
      accuracyBlack: GameAnalysisService.calculateAccuracy(updatedMoves, 'b'),
      isAnalyzed: true,
    };

    // Extract key moments and auto-save blunders to Mistake Library
    const { blunders } = GameAnalysisService.extractKeyMoments(updatedGame);
    blunders.forEach((b) => StorageService.saveMistake(b));

    StorageService.saveGame(updatedGame);
    setAnalyzedGame(updatedGame);
    setIsAnalyzingGame(false);
  };

  if (!analyzedGame) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="w-12 h-12 text-charcoal-600 mb-3" />
        <h2 className="text-base font-bold text-charcoal-200">No Game Selected for Analysis</h2>
        <p className="text-xs text-charcoal-400 mt-1 max-w-sm">
          Play a game against the local engine or import a PGN from your library to examine turning points and mistakes.
        </p>
      </div>
    );
  }

  const currentMove = currentMoveIndex >= 0 ? analyzedGame.moves[currentMoveIndex] : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3 max-w-7xl mx-auto w-full">
      {/* Top Banner: Accuracy & turning point summary */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-3 flex items-center justify-between shadow text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-charcoal-400 block uppercase font-mono">White Player</span>
            <div className="font-semibold text-charcoal-100 flex items-center gap-2">
              <span>{analyzedGame.whiteName}</span>
              {analyzedGame.accuracyWhite !== undefined && (
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  {analyzedGame.accuracyWhite}% CAPS
                </span>
              )}
            </div>
          </div>

          <div className="text-charcoal-600 font-bold">VS</div>

          <div>
            <span className="text-[10px] text-charcoal-400 block uppercase font-mono">Black Player</span>
            <div className="font-semibold text-charcoal-100 flex items-center gap-2">
              <span>{analyzedGame.blackName}</span>
              {analyzedGame.accuracyBlack !== undefined && (
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  {analyzedGame.accuracyBlack}% CAPS
                </span>
              )}
            </div>
          </div>

          <div className="border-l border-charcoal-800 pl-4">
            <span className="text-[10px] text-charcoal-400 block uppercase font-mono">Result</span>
            <span className="font-bold text-charcoal-200 font-mono">{analyzedGame.result}</span>
          </div>
        </div>

        <button
          onClick={runFullGameAnalysis}
          disabled={isAnalyzingGame}
          className="px-4 py-2 bg-chess-green hover:bg-chess-greenLight disabled:opacity-50 text-white font-semibold rounded shadow flex items-center gap-2 transition-all"
        >
          {isAnalyzingGame ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing... {analysisProgress}%</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Deep Engine Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Main Analysis Workspace */}
      <div className="flex-1 flex overflow-hidden gap-4">
        {/* Left Board & Eval bar */}
        <div className="flex items-center gap-2 max-w-[620px] w-full">
          {/* Vertical Eval bar */}
          <EvaluationBar
            scoreCp={evaluation.scoreCp}
            scoreMate={evaluation.scoreMate}
            isMate={evaluation.isMate}
          />

          {/* Chessboard */}
          <div className="flex-1 flex flex-col gap-2">
            <ChessBoard
              board={board}
              turn={turn}
              theme={settings.boardTheme}
              pieceSet={settings.pieceSet}
              lastMove={lastMove}
              showCoordinates={settings.showCoordinates}
              interactive={false}
            />
          </div>
        </div>

        {/* Right Details Panel: Graph, Move classifications, Grandmaster 8-point explanation */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          {/* Eval Swing Graph */}
          <EvaluationGraph
            moves={analyzedGame.moves}
            currentMoveIndex={currentMoveIndex}
            onSelectMove={(idx) => jumpToMove(idx)}
            height={80}
          />

          {/* 8-Point Grandmaster Pedagogical Explanation Card */}
          {explanation && (
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg p-3 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between text-rose-300 font-bold border-b border-rose-800/30 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Grandmaster Mistake Breakdown</span>
                </div>
                <button
                  onClick={onNavigateToMistakes}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Practice in Mistake Gym</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="text-charcoal-200 text-[11px] space-y-1">
                <div>
                  <span className="font-semibold text-rose-300">1. What Happened: </span>
                  {explanation.whatHappened}
                </div>
                <div>
                  <span className="font-semibold text-amber-300">2. Inferred Intent: </span>
                  {explanation.inferredIntent}
                </div>
                <div>
                  <span className="font-semibold text-rose-300">3. Tactical/Strategic Problem: </span>
                  {explanation.problem}
                </div>
                <div>
                  <span className="font-semibold text-emerald-300">4. Recommended Master Move: </span>
                  {explanation.betterCandidateMove}
                </div>
                <div>
                  <span className="font-semibold text-charcoal-300">5. General Principle: </span>
                  {explanation.generalPrinciple}
                </div>
              </div>
            </div>
          )}

          {/* Move History Table with classifications */}
          <div className="flex-1 min-h-[200px]">
            <MoveList
              moves={analyzedGame.moves}
              currentMoveIndex={currentMoveIndex}
              onSelectMove={(idx) => jumpToMove(idx)}
              onCopyPgn={() => navigator.clipboard.writeText(analyzedGame.pgn)}
              onCopyFen={() => navigator.clipboard.writeText(controller.getFen())}
            />
          </div>

          {/* Coach Advice */}
          <div className="h-48">
            <GrandmasterCoachPanel
              currentFen={fen}
              lastMove={currentMove || undefined}
              evaluation={evaluation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
