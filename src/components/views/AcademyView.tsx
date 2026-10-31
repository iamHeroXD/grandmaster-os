import React, { useState } from 'react';
import { ACADEMY_LESSONS } from '../../data/academyLessons';
import { LessonContent, LessonProgress, UserSettings } from '../../types/database';
import { ChessGameController } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { StorageService } from '../../services/storage';
import { Square, PieceType } from '../../types/chess';
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
  BookOpen,
  Award,
  Layers,
  Clock,
  Shield,
  Zap,
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
  const [activeTab, setActiveTab] = useState<'board_lessons' | 'grandmaster_compendium'>('board_lessons');
  const [selectedCompendiumSection, setSelectedCompendiumSection] = useState<'fide_titles' | '3_questions_cct' | 'endgame_algorithms' | 'opening_archetypes' | 'thinking_speeds'>('fide_titles');

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

  // Stages
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
    const exp = selectedLesson.expectedMove;
    if (exp === 'O-O') {
      setHintArrow({ from: 'e1', to: 'g1' });
    } else if (exp === 'O-O-O') {
      setHintArrow({ from: 'e1', to: 'c1' });
    } else if (exp.length >= 2) {
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
    <div className="flex-1 flex flex-col overflow-hidden p-3 md:p-5 gap-3.5 max-w-[1400px] mx-auto w-full text-xs font-sans">
      <ConfettiEffect active={showConfetti} onFinish={() => setShowConfetti(false)} />

      {/* Header Mode Navigation */}
      <div className="flex items-center justify-between bg-[#111722] border border-[#1b2536] rounded-2xl px-5 py-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#14231b] border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100">Master Chess Academy</h1>
            <p className="text-[11px] text-slate-400">Structured road to chess mastery — from beginner fundamentals to FIDE Grandmaster</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#141c28] p-1 rounded-xl border border-[#202b3c]">
          <button
            onClick={() => setActiveTab('board_lessons')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'board_lessons'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum Lessons</span>
          </button>
          <button
            onClick={() => setActiveTab('grandmaster_compendium')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'grandmaster_compendium'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>GM Visual Compendium</span>
          </button>
        </div>
      </div>

      {activeTab === 'board_lessons' ? (
        /* Board Lessons Layout */
        <div className="flex-1 flex overflow-hidden gap-4 min-h-0">
          {/* Left Lesson Navigation Rail */}
          <div className="w-72 bg-[#111722] border border-[#1b2536] rounded-2xl flex flex-col overflow-y-auto p-2.5 text-xs divide-y divide-[#1b2536] shadow-sm shrink-0">
            <div className="p-2 pb-3">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                7-Stage Mastery Track
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Click any lesson to load the position and train on the board.
              </p>
            </div>

            {stages.map((stg) => {
              const stageLessons = ACADEMY_LESSONS.filter((l) => l.stageNumber === stg);
              if (stageLessons.length === 0) return null;

              return (
                <div key={stg} className="py-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold px-2 block mb-1.5">
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
                              ? 'bg-[#10241c] text-emerald-300 font-bold border border-emerald-800/60 shadow-sm'
                              : 'text-slate-300 hover:text-slate-100 hover:bg-[#141c28] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                            )}
                            <span className="truncate text-xs">{les.title}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
            <div style={{ maxWidth: 'min(100%, calc(100vh - 170px), 580px)' }} className="w-full flex flex-col items-center justify-center gap-2 mx-auto min-h-0">
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
                maxBoardHeightOffset={180}
              />

              <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400 font-medium">
                <span>Side to move: <strong className="text-emerald-400">{turn === 'w' ? 'White' : 'Black'}</strong></span>
                <button
                  onClick={resetExercise}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Position</span>
                </button>
              </div>
            </div>

            {/* Lesson Content & Master Explanations */}
            <div className="flex-1 bg-[#111722] border border-[#1b2536] rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto text-xs shadow-sm">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  {selectedLesson.stageTitle}
                </span>
                <h1 className="text-lg font-extrabold text-slate-100 mt-0.5 tracking-tight">
                  {selectedLesson.title}
                </h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedLesson.summary}</p>
              </div>

              {/* Master Concept Body */}
              <div className="p-4 bg-[#141c28] border border-[#202b3c] rounded-xl leading-relaxed text-slate-300">
                <h3 className="font-bold text-slate-100 mb-1.5 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Core Principle</span>
                </h3>
                <p className="text-xs leading-normal">{selectedLesson.concept}</p>
              </div>

              {/* Interactive Challenge Prompt */}
              <div className="p-4 bg-[#10231d] border border-emerald-800/40 rounded-xl flex flex-col gap-2">
                <div className="font-bold text-emerald-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
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
                <p className="text-xs text-emerald-200 font-medium leading-relaxed">
                  {selectedLesson.interactiveMovePrompt}
                </p>
                {showHint && (
                  <div className="text-[11px] text-amber-300 font-mono pt-1 border-t border-emerald-800/40">
                    Hint: Find the move that delivers <span className="font-bold text-emerald-200">{selectedLesson.expectedMove}</span>.
                  </div>
                )}
              </div>

              {/* Status Feedback Banners */}
              {exerciseStatus === 'correct' && (
                <div className="p-4 bg-emerald-950/70 border border-emerald-600 rounded-xl flex flex-col gap-2 shadow-md animate-fade-in">
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
                <div className="p-4 bg-rose-950/60 border border-rose-700/60 rounded-xl flex flex-col gap-2 shadow-md animate-fade-in">
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
      ) : (
        /* Grandmaster Visual Compendium (Figures, Schematics & Diagrams) */
        <div className="flex-1 flex overflow-hidden gap-4 min-h-0">
          {/* Compendium Topic Menu */}
          <div className="w-64 bg-[#111722] border border-[#1b2536] rounded-2xl flex flex-col p-2.5 gap-1 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold px-3 py-2">
              Visual Compendium Topics
            </span>
            {[
              { id: 'fide_titles', label: '1. FIDE Title Roadmap', icon: Award },
              { id: '3_questions_cct', label: '2. The 3 Questions & CCT', icon: Zap },
              { id: 'endgame_algorithms', label: '3. Endgame Algorithms', icon: Shield },
              { id: 'opening_archetypes', label: '4. 13 Opening Blueprints', icon: BookOpen },
              { id: 'thinking_speeds', label: '5. 3 Thinking Speeds', icon: Clock },
            ].map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedCompendiumSection === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedCompendiumSection(topic.id as any)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-[#10241c] text-emerald-300 font-bold border border-emerald-800/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#141c28]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>

          {/* Compendium Content Canvas */}
          <div className="flex-1 bg-[#111722] border border-[#1b2536] rounded-2xl p-6 overflow-y-auto space-y-6 shadow-sm">
            {/* Section 1: FIDE Titles */}
            {selectedCompendiumSection === 'fide_titles' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Regulatory Governance
                  </span>
                  <h2 className="text-xl font-black text-slate-100">FIDE Title Ladder & Official Norm Requirements</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Official FIDE Handbook standards for titles awarded for life. Norms require 27+ rated tournament games against titled international opposition.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {[
                    { title: 'Grandmaster (GM)', elo: '≥ 2500 FIDE', req: '3 GM Norms (≥ 2600 TPR, 27 games, field avg ≥ 2380, ≥ 3 GMs)' },
                    { title: 'International Master (IM)', elo: '≥ 2400 FIDE', req: '3 IM Norms (≈ 2450 TPR against titled international field)' },
                    { title: 'FIDE Master (FM)', elo: '≥ 2300 FIDE', req: 'Direct rating title floor (no norms; min 30 rated games)' },
                    { title: 'Candidate Master (CM)', elo: '≥ 2200 FIDE', req: 'Entry title threshold (top ~2% of tournament players)' },
                    { title: 'Club / Class A Player', elo: '1800 - 2000', req: 'Tactical discipline, solid opening repertoire, basic endgame algorithms' },
                    { title: 'Intermediate Improver', elo: '1200 - 1600', req: 'Eliminating one-move blunders, CCT scanning on every turn' },
                  ].map((t) => (
                    <div key={t.title} className="p-4 rounded-xl bg-[#141c28] border border-[#202b3c] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-100 text-xs">{t.title}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#10241c] text-emerald-300 font-bold border border-emerald-800/40">
                            {t.elo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{t.req}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: The 3 Questions & CCT Algorithm */}
            {selectedCompendiumSection === '3_questions_cct' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Middlegame Calculation Discipline
                  </span>
                  <h2 className="text-xl font-black text-slate-100">The 3 Coaching Questions & Strict CCT Priority</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Whenever unsure of a plan, ask these 3 questions in strict order, then calculate forcing candidate moves first.
                  </p>
                </div>

                {/* 3 Coaching Questions Visual Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#141c28] border border-[#202b3c]">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">QUESTION 1</span>
                    <h3 className="font-bold text-slate-100 text-xs mt-1">What does the position demand?</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Read pawn structures, open files, and king safety. Do not force an attack if the center is liquid or uncastled.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#141c28] border border-[#202b3c]">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">QUESTION 2</span>
                    <h3 className="font-bold text-slate-100 text-xs mt-1">What is my worst-placed piece?</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Relentlessly maneuver passive knights and blocked bishops to outposts. Grandmaster coordination wins without flashy sacrifices.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#141c28] border border-[#202b3c]">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">QUESTION 3</span>
                    <h3 className="font-bold text-slate-100 text-xs mt-1">What is my pawn break?</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Identify the lever pawn advance (e.g. c5, f5, d4, e4) that tears open lines for your rooks and active pieces.
                    </p>
                  </div>
                </div>

                {/* CCT Generator Visual Protocol */}
                <div className="p-5 rounded-xl bg-[#10231d] border border-emerald-800/40 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>The CCT Calculation Generator (Nunn's Protocol)</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Always scan forcing moves first for BOTH sides before analyzing quiet candidate moves:
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[#141c28] rounded-lg border border-[#202b3c]">
                      <div className="text-emerald-400 font-extrabold text-sm font-mono">1. CHECKS</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Most forcing; limits replies immediately.</p>
                    </div>
                    <div className="p-3 bg-[#141c28] rounded-lg border border-[#202b3c]">
                      <div className="text-emerald-400 font-extrabold text-sm font-mono">2. CAPTURES</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Exchanges, sacrifices, removing guards.</p>
                    </div>
                    <div className="p-3 bg-[#141c28] rounded-lg border border-[#202b3c]">
                      <div className="text-emerald-400 font-extrabold text-sm font-mono">3. THREATS</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Direct attacks on queen, king, or undefended piece.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Endgame Algorithms */}
            {selectedCompendiumSection === 'endgame_algorithms' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Technical Endgames
                  </span>
                  <h2 className="text-xl font-black text-slate-100">GM Smirnov's Endgame Algorithms</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Endgame conversion requires mathematical precision. Master these three essential schematics:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Schematic 1: Rule of the Square */}
                  <div className="p-4 rounded-xl bg-[#141c28] border border-[#202b3c] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">ALGORITHM 1</span>
                      <h3 className="font-bold text-slate-100 text-xs mt-1">Rule of the Square</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Draw a diagonal from the passed pawn to the 8th rank. If the defending king cannot step inside the square, the pawn promotes unconditionally.
                      </p>
                    </div>
                    <div className="mt-3 p-2 bg-[#0d131c] rounded border border-[#1b2536] text-[10px] text-emerald-300 font-mono text-center">
                      Diagonal = Rank to 8th rank
                    </div>
                  </div>

                  {/* Schematic 2: Lucena Bridge */}
                  <div className="p-4 rounded-xl bg-[#141c28] border border-[#202b3c] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">ALGORITHM 2</span>
                      <h3 className="font-bold text-slate-100 text-xs mt-1">The Lucena Bridge (100% Win)</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        1. Place Rook on the 4th rank.<br />
                        2. Step King out from in front of pawn.<br />
                        3. Interpose Rook ("The Bridge") on the 4th rank to block rear checks.
                      </p>
                    </div>
                    <div className="mt-3 p-2 bg-[#0d131c] rounded border border-[#1b2536] text-[10px] text-emerald-300 font-mono text-center">
                      Rook to 4th rank &rarr; Bridge
                    </div>
                  </div>

                  {/* Schematic 3: Philidor Barrier */}
                  <div className="p-4 rounded-xl bg-[#141c28] border border-[#202b3c] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">ALGORITHM 3</span>
                      <h3 className="font-bold text-slate-100 text-xs mt-1">Philidor Barrier (100% Draw)</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        1. Keep Rook on the 6th (or 3rd) rank cutting off the enemy king.<br />
                        2. Once the pawn advances to the 6th rank, immediately drop your rook to the 1st rank for endless rear checks.
                      </p>
                    </div>
                    <div className="mt-3 p-2 bg-[#0d131c] rounded border border-[#1b2536] text-[10px] text-emerald-300 font-mono text-center">
                      Cut 6th rank &rarr; Drop to 1st rank
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: 13 Opening Blueprints */}
            {selectedCompendiumSection === 'opening_archetypes' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Opening Taxonomy
                  </span>
                  <h2 className="text-xl font-black text-slate-100">13 Opening Archetypes & Pawn Structures</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Every grandmaster chooses openings based on pawn skeletons and known middlegame plans rather than pure rote memorization.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  {[
                    { name: 'Open Games', moves: '1.e4 e5', desc: 'Open files, active diagonals, rapid castling.' },
                    { name: 'Semi-Open', moves: '1.e4 c5 / e6 / c6', desc: 'Asymmetric counterattacks (Sicilian, French).' },
                    { name: 'Closed Games', moves: '1.d4 d5', desc: 'Locked central chains; knight maneuvering.' },
                    { name: 'Semi-Closed', moves: '1.d4 Nf6', desc: 'Indian defenses (KID, Grünfeld, Nimzo).' },
                    { name: 'Hypermodern', moves: 'Flank pressure', desc: 'Fianchetto bishops undermine enemy center.' },
                    { name: 'Systems', moves: 'London / Colle', desc: 'Identical solid setups against any reply.' },
                    { name: 'Gambits', moves: 'Sacrifice for lead', desc: 'Pawn for tempo, open lines, initiative.' },
                    { name: 'Reversed Openings', moves: '1.c4 e5', desc: 'Playing Black defense with an extra tempo.' },
                  ].map((arch) => (
                    <div key={arch.name} className="p-3 bg-[#141c28] border border-[#202b3c] rounded-xl">
                      <span className="font-bold text-slate-100 text-xs block">{arch.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400">{arch.moves}</span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{arch.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: 3 Thinking Speeds */}
            {selectedCompendiumSection === 'thinking_speeds' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Resource Allocation
                  </span>
                  <h2 className="text-xl font-black text-slate-100">Three Thinking Speeds: Clock Management</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Time is a finite budget. Zeitnot (time trouble) causes 70% of decisive errors. Manage your clock dynamically:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="p-4 bg-[#141c28] border border-[#202b3c] rounded-xl">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">SPEED 1 (0 – 30 sec)</span>
                    <h3 className="font-bold text-slate-100 text-xs mt-1">Fast / Intuitive</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Obvious single recaptures, book opening moves, forced moves with no alternatives. Play swiftly to save time.
                    </p>
                  </div>
                  <div className="p-4 bg-[#141c28] border border-[#202b3c] rounded-xl">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">SPEED 2 (1 – 3 min)</span>
                    <h3 className="font-bold text-slate-100 text-xs mt-1">Medium / Prophylactic</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Quiet piece maneuvers, identifying the worst-placed piece, asking "What does opponent want?", routine development.
                    </p>
                  </div>
                  <div className="p-4 bg-[#141c28] border border-[#202b3c] rounded-xl">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">SPEED 3 (5 – 15 min max)</span>
                    <h3 className="font-bold text-slate-100 text-xs mt-1">Deep Tactical Calculation</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Irreversible pawn breaks, piece sacrifices, king safety emergencies, transition to the endgame. Calculate to the very end!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
