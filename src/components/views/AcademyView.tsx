import React, { useState } from 'react';
import { ACADEMY_LESSONS } from '../../data/academyLessons';
import { LessonContent, LessonProgress, UserSettings } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { StorageService } from '../../services/storage';
import { Square, PieceType, Color } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { GraduationCap, CheckCircle2, ChevronRight, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface AcademyViewProps {
  settings: UserSettings;
  lessonProgress: Record<string, LessonProgress>;
  onProgressUpdated: () => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({
  settings,
  lessonProgress,
  onProgressUpdated,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<LessonContent>(ACADEMY_LESSONS[0]);
  const [controller, setController] = useState<ChessGameController>(
    () => new ChessGameController(ACADEMY_LESSONS[0].initialFen)
  );
  const [board, setBoard] = useState(() => controller.getBoard());
  const [turn, setTurn] = useState(() => controller.getTurn());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Lesson exercise state
  const [exerciseStatus, setExerciseStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Group lessons by stage
  const stages = [1, 2, 3, 4, 5, 6, 7];
  const stageTitles: Record<number, string> = {
    1: 'Stage 1: Foundations',
    2: 'Stage 2: Beginner Tactics',
    3: 'Stage 3: Essential Strategy',
    4: 'Stage 4: Intermediate Calculation',
    5: 'Stage 5: Advanced Middlegame',
    6: 'Stage 6: Practical Endgames',
    7: 'Stage 7: Competitive Mastery',
  };

  const selectLesson = (lesson: LessonContent) => {
    setSelectedLesson(lesson);
    const newController = new ChessGameController(lesson.initialFen);
    setController(newController);
    setBoard(newController.getBoard());
    setTurn(newController.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setExerciseStatus('idle');
    setShowHint(false);
  };

  const handleSquareClick = (square: Square) => {
    if (exerciseStatus === 'correct') return;

    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const piece = board[rank]?.[file];

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === turn) {
      setSelectedSquare(square);
      setLegalMoves(controller.getLegalMovesForSquare(square));
      return;
    }

    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleMovePiece = (from: Square, to: Square, promotion: PieceType = 'q') => {
    if (exerciseStatus === 'correct') return;

    const res = controller.makeMove(from, to, promotion);
    if (!res.success) {
      soundService.playMistake();
      return;
    }

    setBoard(controller.getBoard());
    setTurn(controller.getTurn());
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);

    // Validate expected move
    const playedSan = res.san;
    const playedUci = res.uci;
    const expected = selectedLesson.expectedMove.replace('+', '').replace('#', '');
    const isMatch =
      playedSan?.startsWith(expected) ||
      playedUci === expected ||
      playedSan === selectedLesson.expectedMove;

    if (isMatch) {
      soundService.playVictory();
      setExerciseStatus('correct');
      StorageService.recordLessonComplete(selectedLesson.id);
      onProgressUpdated();
    } else {
      soundService.playMistake();
      setExerciseStatus('incorrect');
    }
  };

  const resetExercise = () => {
    const newController = new ChessGameController(selectedLesson.initialFen);
    setController(newController);
    setBoard(newController.getBoard());
    setTurn(newController.getTurn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setExerciseStatus('idle');
  };

  return (
    <div className="flex-1 flex overflow-hidden p-4 gap-4 max-w-7xl mx-auto w-full">
      {/* Left Lesson Navigation Rail */}
      <div className="w-72 bg-charcoal-900 border border-charcoal-800 rounded-lg flex flex-col overflow-y-auto p-2 text-xs divide-y divide-charcoal-800/60">
        <div className="p-2 pb-3">
          <div className="flex items-center gap-2 text-charcoal-200 font-bold">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Master Academy Curriculum</span>
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">
            Progressive 7-stage master course with interactive board exercises.
          </p>
        </div>

        {stages.map((stg) => {
          const stageLessons = ACADEMY_LESSONS.filter((l) => l.stageNumber === stg);
          if (stageLessons.length === 0) return null;

          return (
            <div key={stg} className="py-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 font-bold px-2 block mb-1">
                {stageTitles[stg]}
              </span>
              <div className="flex flex-col gap-0.5">
                {stageLessons.map((les) => {
                  const isCompleted = lessonProgress[les.id]?.completed;
                  const isSelected = selectedLesson.id === les.id;

                  return (
                    <button
                      key={les.id}
                      onClick={() => selectLesson(les)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors ${
                        isSelected
                          ? 'bg-sky-950/60 text-sky-200 font-semibold border-l-2 border-sky-400'
                          : 'text-charcoal-300 hover:bg-charcoal-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-charcoal-600 shrink-0" />
                        )}
                        <span className="truncate">{les.title}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-charcoal-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Lesson Exercise Area */}
      <div className="flex-1 flex overflow-hidden gap-4">
        {/* Interactive Board */}
        <div className="max-w-[560px] w-full flex flex-col items-center justify-center gap-3">
          <ChessBoard
            board={board}
            turn={turn}
            theme={settings.boardTheme}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            showCoordinates={settings.showCoordinates}
            showLegalDots={settings.showLegalDots}
            onSquareClick={handleSquareClick}
            onMovePiece={handleMovePiece}
            interactive={exerciseStatus !== 'correct'}
          />

          <div className="flex items-center justify-between w-full px-2 text-xs text-charcoal-400">
            <span>Side to move: {turn === 'w' ? 'White' : 'Black'}</span>
            <button
              onClick={resetExercise}
              className="text-sky-400 hover:underline font-semibold"
            >
              Reset Position
            </button>
          </div>
        </div>

        {/* Lesson Lesson Content & Master Explanations */}
        <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-lg p-5 flex flex-col gap-4 overflow-y-auto text-xs">
          <div>
            <div className="text-[10px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
              {selectedLesson.stageTitle}
            </div>
            <h1 className="text-lg font-bold text-charcoal-100 mt-0.5">
              {selectedLesson.title}
            </h1>
            <p className="text-xs text-charcoal-400 mt-1">{selectedLesson.summary}</p>
          </div>

          {/* Master Concept Body */}
          <div className="p-3 bg-charcoal-850 border border-charcoal-800 rounded leading-relaxed text-charcoal-200">
            <h3 className="font-semibold text-charcoal-100 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Core Principle</span>
            </h3>
            <p className="text-[11px]">{selectedLesson.concept}</p>
          </div>

          {/* Interactive Challenge Prompt */}
          <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded flex flex-col gap-2">
            <div className="font-semibold text-sky-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Your Exercise</span>
            </div>
            <p className="text-[11px] text-sky-200/90 font-medium">
              {selectedLesson.interactiveMovePrompt}
            </p>

            {/* Exercise feedback notification */}
            {exerciseStatus === 'correct' && (
              <div className="mt-2 p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Correct Move! Lesson Mastered.</div>
                  <div className="text-[11px] text-emerald-200/90 mt-0.5">
                    {selectedLesson.explanationOnCorrect}
                  </div>
                </div>
              </div>
            )}

            {exerciseStatus === 'incorrect' && (
              <div className="mt-2 p-2.5 bg-rose-950/60 border border-rose-800/60 rounded text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Suboptimal Move</div>
                  <div className="text-[11px] text-rose-200/90 mt-0.5">
                    {selectedLesson.commonMistake} Click "Reset Position" and try again.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hint disclosure */}
          <div className="mt-auto pt-3 border-t border-charcoal-800 flex items-center justify-between">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sky-400 hover:underline font-semibold"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <span className="text-[11px] text-charcoal-300 italic">
                Expected: {selectedLesson.expectedMove}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
