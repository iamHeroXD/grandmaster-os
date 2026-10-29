import React, { useState } from 'react';
import { GrandmasterCoachService } from '../../services/coachService';
import { MoveRecord, EngineEvaluation } from '../../types/chess';
import { GraduationCap, HelpCircle, Sparkles, AlertCircle, Compass, Brain } from 'lucide-react';

interface GrandmasterCoachPanelProps {
  currentFen: string;
  lastMove?: MoveRecord;
  evaluation?: EngineEvaluation;
  onSelectCandidateMove?: (uci: string) => void;
}

export const GrandmasterCoachPanel: React.FC<GrandmasterCoachPanelProps> = ({
  currentFen,
  lastMove,
  evaluation,
  onSelectCandidateMove,
}) => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [coachResponse, setCoachResponse] = useState<string | null>(null);

  const handleAsk = (
    key:
      | 'why_mistake'
      | 'what_threat'
      | 'why_winning'
      | 'what_plan'
      | 'candidate_moves'
      | 'give_hint'
      | 'quiz_me'
  ) => {
    setActiveQuestion(key);
    const ans = GrandmasterCoachService.answerQuestion(
      key,
      currentFen,
      lastMove,
      evaluation?.bestMoveUci,
      evaluation?.scoreCp
    );
    setCoachResponse(ans);
  };

  return (
    <div className="flex flex-col h-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-3 text-xs overflow-y-auto">
      {/* Coach Header */}
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-charcoal-800">
        <div className="w-6 h-6 rounded bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm"><GraduationCap className="w-3.5 h-3.5" /></div>
        <div>
          <div className="font-semibold text-charcoal-100 flex items-center gap-1.5">
            <span>The Grandmaster Coach</span>
            <span className="text-[10px] bg-charcoal-800 text-charcoal-400 px-1.5 rounded">Local Heuristic</span>
          </div>
          <div className="text-[10px] text-charcoal-500">Tournament Mentor & Calculation Guide</div>
        </div>
      </div>

      {/* Dynamic Position / Mistake Notice */}
      {lastMove?.classification && lastMove.classification !== 'best' && lastMove.classification !== 'good' && (
        <div className="mb-3 p-2 bg-rose-950/40 border border-rose-800/40 rounded flex items-start gap-2 text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-300">
              Notice: {lastMove.san} was a {lastMove.classification}
            </div>
            <div className="text-[11px] text-rose-200/80 mt-0.5">
              Engine preferred {lastMove.bestMove || 'a better candidate'}. Click below to understand why.
            </div>
          </div>
        </div>
      )}

      {/* Interactive Question Prompts */}
      <div className="flex flex-col gap-1.5 mb-3">
        <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider">
          Ask The Grandmaster
        </span>
        <button
          onClick={() => handleAsk('why_mistake')}
          className="text-left px-2.5 py-1.5 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-300 hover:text-charcoal-100 transition-colors flex items-center justify-between"
        >
          <span>Why was my move a mistake?</span>
          <HelpCircle className="w-3.5 h-3.5 text-charcoal-500" />
        </button>

        <button
          onClick={() => handleAsk('what_threat')}
          className="text-left px-2.5 py-1.5 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-300 hover:text-charcoal-100 transition-colors flex items-center justify-between"
        >
          <span>What was my opponent threatening?</span>
          <AlertCircle className="w-3.5 h-3.5 text-charcoal-500" />
        </button>

        <button
          onClick={() => handleAsk('what_plan')}
          className="text-left px-2.5 py-1.5 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-300 hover:text-charcoal-100 transition-colors flex items-center justify-between"
        >
          <span>What plan should I follow here?</span>
          <Compass className="w-3.5 h-3.5 text-charcoal-500" />
        </button>

        <button
          onClick={() => handleAsk('give_hint')}
          className="text-left px-2.5 py-1.5 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-300 hover:text-charcoal-100 transition-colors flex items-center justify-between"
        >
          <span>Give me a hint without revealing move</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        <button
          onClick={() => handleAsk('quiz_me')}
          className="text-left px-2.5 py-1.5 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-300 hover:text-charcoal-100 transition-colors flex items-center justify-between"
        >
          <span>Quiz me on the idea behind this position</span>
          <Brain className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      {/* Response Box */}
      {coachResponse && (
        <div className="mb-3 p-3 bg-charcoal-850 border border-charcoal-750 rounded leading-relaxed text-charcoal-200">
          <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>Master Coach Insight</span>
          </div>
          <p className="text-[11px]">{coachResponse}</p>
        </div>
      )}

      {/* Candidate Lines / Stockfish Evaluation */}
      {evaluation && evaluation.candidateLines.length > 0 && (
        <div className="mt-auto pt-2 border-t border-charcoal-800">
          <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider block mb-1.5">
            Engine Candidate Lines (Depth {evaluation.depth})
          </span>
          <div className="flex flex-col gap-1 font-mono text-[11px]">
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
                  onClick={() => onSelectCandidateMove && line.pv[0] && onSelectCandidateMove(line.pv[0])}
                  className="flex items-center justify-between p-1.5 rounded bg-charcoal-850 hover:bg-charcoal-800 cursor-pointer border border-charcoal-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-charcoal-500 text-[10px]">#{idx + 1}</span>
                    <span className="font-bold text-emerald-300">{line.pv[0]}</span>
                    <span className="text-charcoal-400 text-[10px] truncate max-w-[130px]">
                      {line.pv.slice(1, 4).join(' ')}
                    </span>
                  </div>
                  <span className="font-bold text-charcoal-200">{score}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
