import React, { useState } from 'react';
import { ACADEMY_LESSONS } from '../../data/academyLessons';
import { LessonContent, LessonProgress, UserSettings } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { StorageService } from '../../services/storage';
import { Square, PieceType, Color } from '../../types/chess';
import { ChessBoard } from '../board/ChessBoard';
import { ConfettiEffect } from '../common/ConfettiEffect';
import {
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

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
  const [hintArrow, setHintArrow] = useState<{ from: Square; to: Square } | null>(null);

  // Lesson exercise state
  const [exerciseStatus, setExerciseStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Group lessons by stage
  const stages = [1, 2, 3, 4, 5, 6, 7];
  const stageTitles: Record<number, string> = {
    1: 'Stage 1: Foundations of Chess',
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
    setHintArrow(null);
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
    setHintArrow(null);

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
      setShowConfetti(true);
      StorageService.recordLessonComplete(selectedLesson.id);
      onProgressUpdated();
    } else {
      soundService.playMistake();
      setExerciseStatus('incorrect');
    }
  };

  const handleRevealHint = () => {
    setShowHint(true);
    // Parse expected move to give a visual clue
    const exp = selectedLesson.expectedMove;
    if (exp === 'O-O') {
      setHintArrow({ from: 'e1', to: 'g1' });
    } else if (exp === 'O-O-O') {
      setHintArrow({ from: 'e1', to: 'c1' });
    } else if (exp.length >= 2) {
      // Find candidate piece that can deliver expected move
      const targetSq = exp.slice(-2) as Square;
      if (targetSq.length === 2) {
        setHintArrow({ from: (selectedLesson.initialFen.includes('w') ? 'e2' : 'e7') as Square, to: targetSq });
      }
    }
  };

  const handleNextLesson = () => {
    const currentIdx = ACADEMY_LESSONS.findIndex((l) => l.id === selectedLesson.id);
    if (currentIdx !== -1 && currentIdx + 1 < ACADEMY_LESSONS.length) {
      selectLesson(ACADEMY_LESSONS[currentIdx + 1]);
    }
  };

  const resetExercise = () => {
    selectLesson(selectedLesson);
  };

  return (
    <div className="flex-1 flex overflow-hidden p-3 md:p-4 gap-4 max-w-7xl mx-auto w-full text-xs">
      <ConfettiEffect active={showConfetti} onFinish={() => setShowConfetti(false)} />

      {/* Left Lesson Navigation Rail */}
      <div className="w-72 bg-charcoal-900 border border-charcoal-800 rounded-2xl flex flex-col overflow-y-auto p-2.5 text-xs divide-y divide-charcoal-800/60 shadow-lg shrink-0">
        <div className="p-2 pb-3">
          <div className="flex items-center gap-2 text-charcoal-100 font-extrabold text-sm">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Academy Curriculum</span>
          </div>
          <p className="text-xs text-charcoal-300 mt-1">
            Progressive 7-stage master course with interactive board exercises.
          </p>
        </div>

        {stages.map((stg) => {
          const stageLessons = ACADEMY_LESSONS.filter((l) => l.stageNumber === stg);
          if (stageLessons.length === 0) return null;

          return (
            <div key={stg} className="py-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-400 font-extrabold px-2 block mb-1.5">
                {stageTitles[stg]}
              </span>
              <div className="flex flex-col gap-1">
                {stageLessons.map((les) => {
                  const isCompleted = lessonProgress[les.id]?.completed;
                  const isSelected = selectedLesson.id === les.id;

                  return (
                    <button
                      key={les.id}
                      onClick={() => selectLesson(les)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-sky-950/70 text-sky-200 font-bold border border-sky-500/60 shadow-sm'
                          : 'text-charcoal-300 hover:text-charcoal-100 hover:bg-charcoal-850/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-charcoal-600 shrink-0" />
                        )}
                        <span className="truncate text-xs font-semibold">{les.title}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Lesson Exercise Area */}
      <div className="flex-1 flex overflow-y-auto overflow-x-hidden gap-5 min-h-0 items-start">
        {/* Interactive Board Column */}
        <div style={{ maxWidth: 'min(100%, calc(100vh - 140px), 580px)' }} className="w-full flex flex-col items-center justify-center gap-2.5 mx-auto min-h-0">
          <ChessBoard
            board={board}
            turn={turn}
            theme={settings.boardTheme}
            pieceSet={settings.pieceSet}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            hintArrow={hintArrow}
            showCoordinates={settings.showCoordinates}
            showLegalDots={settings.showLegalDots}
            onSquareClick={handleSquareClick}
            onMovePiece={handleMovePiece}
            interactive={exerciseStatus !== 'correct'}
            maxBoardHeightOffset={160}
          />

          <div className="flex items-center justify-between w-full px-2 text-xs text-charcoal-300 font-medium">
            <span>Side to move: <strong className="text-emerald-400">{turn === 'w' ? 'White' : 'Black'}</strong></span>
            <button
              onClick={resetExercise}
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Position</span>
            </button>
          </div>
        </div>

        {/* Lesson Content & Master Explanations */}
        <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto text-xs shadow-lg">
          <div>
            <div className="text-[11px] font-mono text-sky-400 font-extrabold uppercase tracking-wider">
              {selectedLesson.stageTitle}
            </div>
            <h1 className="text-lg font-black text-charcoal-100 mt-0.5 tracking-tight">
              {selectedLesson.title}
            </h1>
            <p className="text-xs text-charcoal-300 mt-1 leading-relaxed">{selectedLesson.summary}</p>
          </div>

          {/* Master Concept Body */}
          <div className="p-4 bg-charcoal-850 border border-charcoal-800 rounded-xl leading-relaxed text-charcoal-200">
            <h3 className="font-bold text-charcoal-100 mb-1.5 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Core Principle</span>
            </h3>
            <p className="text-xs text-charcoal-200 leading-normal">{selectedLesson.concept}</p>
          </div>

          {/* Interactive Challenge Prompt */}
          <div className="p-4 bg-sky-950/30 border border-sky-800/40 rounded-xl flex flex-col gap-2">
            <div className="font-bold text-sky-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Your Interactive Exercise</span>
              </div>
              <button
                onClick={handleRevealHint}
                className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Show Hint</span>
              </button>
            </div>
            <p className="text-xs text-sky-200 font-medium leading-relaxed">
              {selectedLesson.interactiveMovePrompt}
            </p>
          </div>

          {/* Status Feedback Banners */}
          {exerciseStatus === 'correct' && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-600/70 rounded-xl flex flex-col gap-2 animate-fade-in shadow-md">
              <div className="font-black text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Master Move Executed!</span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed font-sans">
                {selectedLesson.explanationOnCorrect}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextLesson}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 text-xs"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {exerciseStatus === 'incorrect' && (
            <div className="p-4 bg-rose-950/50 border border-rose-700/60 rounded-xl flex flex-col gap-2 animate-fade-in shadow-md">
              <div className="font-black text-rose-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>Not the optimal master move</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                {selectedLesson.commonMistake || 'Take another look at the position, identify the active targets, and try again!'}
              </p>
              <button
                onClick={resetExercise}
                className="self-start text-xs font-bold text-amber-300 hover:underline flex items-center gap-1 mt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
