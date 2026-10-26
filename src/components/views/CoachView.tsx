import React, { useState } from 'react';
import { UserProfile, UserSettings } from '../../types/database';
import { GrandmasterCoachService } from '../../services/coachService';
import { ChessGameController } from '../../services/chessEngine';
import { ChessBoard } from '../board/ChessBoard';
import { HelpCircle, Brain, Sparkles, Award, Compass, ArrowRight } from 'lucide-react';

interface CoachViewProps {
  profile: UserProfile | null;
  settings: UserSettings;
}

export const CoachView: React.FC<CoachViewProps> = ({ profile, settings }) => {
  const [controller] = useState<ChessGameController>(
    () => new ChessGameController('r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1')
  );
  const [board] = useState(() => controller.getBoard());
  const [turn] = useState(() => controller.getTurn());
  const [selectedPersona, setSelectedPersona] = useState<
    'tournament' | 'gentle' | 'tactical' | 'grandmaster' | 'minimal'
  >(profile?.coachingStyle || 'tournament');
  const [questionInput, setQuestionInput] = useState('');
  const [activeInsight, setActiveInsight] = useState<string | null>(
    'Welcome to the Private Coaching Lab! Select a coaching style or ask any question about plans, candidate moves, or threats in this position.'
  );

  const personas = [
    {
      id: 'tournament',
      title: 'Tournament Coach',
      desc: 'Pragmatic, time-conscious, emphasizes concrete calculation and avoiding blunders.',
    },
    {
      id: 'gentle',
      title: 'Gentle Teacher',
      desc: 'Patient, encouraging, explains first principles and pawn structures step-by-step.',
    },
    {
      id: 'tactical',
      title: 'Tactical Analyst',
      desc: 'Sharp, relentless focus on checks, captures, and threats (CCT) and forcing lines.',
    },
    {
      id: 'grandmaster',
      title: 'Grandmaster Challenge',
      desc: 'Demanding, holds you to high calculation standards, refuses superficial answers.',
    },
  ];

  const handlePrompt = (
    key: 'why_mistake' | 'what_threat' | 'why_winning' | 'what_plan' | 'candidate_moves' | 'quiz_me'
  ) => {
    const res = GrandmasterCoachService.answerQuestion(key, controller.getFen());
    setActiveInsight(res);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full text-xs">
      {/* Header banner */}
      <div className="flex items-center justify-between bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chess-green/30 border border-chess-green flex items-center justify-center text-emerald-400 font-bold text-xl">
            ♔
          </div>
          <div>
            <h1 className="text-base font-bold text-charcoal-100">
              The Grandmaster — Personal Chess Mentor
            </h1>
            <p className="text-xs text-charcoal-400">
              Deterministic, local reasoning engine teaching you how to think, calculate, and evaluate.
            </p>
          </div>
        </div>
      </div>

      {/* Persona Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {personas.map((p) => {
          const isSelected = selectedPersona === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-chess-green bg-charcoal-800 shadow font-semibold text-emerald-300'
                  : 'border-charcoal-800 bg-charcoal-900 text-charcoal-400 hover:bg-charcoal-850'
              }`}
            >
              <div className="font-bold text-charcoal-100 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>{p.title}</span>
              </div>
              <p className="text-[10px] text-charcoal-400 mt-1 leading-relaxed">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Interactive Demonstration Workspace */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="max-w-[480px] w-full flex flex-col items-center gap-2">
          <ChessBoard
            board={board}
            turn={turn}
            theme={settings.boardTheme}
            showCoordinates={settings.showCoordinates}
            interactive={false}
          />
          <div className="text-[11px] text-charcoal-400 font-mono">
            Position: White to strike (Scholar's mating geometry)
          </div>
        </div>

        {/* Coach Advice and Dialog */}
        <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Socratic Inquiry & Deep Calculation</span>
            </h2>

            {/* Quick Prompts */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePrompt('what_threat')}
                className="p-2 rounded bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-left text-charcoal-300 font-medium"
              >
                What is Black threatening?
              </button>
              <button
                onClick={() => handlePrompt('candidate_moves')}
                className="p-2 rounded bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-left text-charcoal-300 font-medium"
              >
                Which candidate moves to calculate?
              </button>
              <button
                onClick={() => handlePrompt('what_plan')}
                className="p-2 rounded bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-left text-charcoal-300 font-medium"
              >
                What is the strategic plan?
              </button>
              <button
                onClick={() => handlePrompt('quiz_me')}
                className="p-2 rounded bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-left text-charcoal-300 font-medium"
              >
                Give me a calculation quiz
              </button>
            </div>

            {/* Coach Output */}
            {activeInsight && (
              <div className="p-4 bg-charcoal-850 border border-charcoal-750 rounded-lg text-charcoal-200 leading-relaxed text-[11px]">
                <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Coach Guidance ({selectedPersona.toUpperCase()})</span>
                </div>
                <p>{activeInsight}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
