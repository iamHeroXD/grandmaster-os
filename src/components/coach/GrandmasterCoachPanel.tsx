import React, { useState } from 'react';
import { GrandmasterCoachService, CoachPersona } from '../../services/coachService';
import { MoveRecord, EngineEvaluation } from '../../types/chess';
import { GraduationCap, HelpCircle, Sparkles, AlertCircle, Compass, Brain, Swords, ShieldAlert } from 'lucide-react';

interface GrandmasterCoachPanelProps {
  currentFen: string;
  lastMove?: MoveRecord;
  evaluation?: EngineEvaluation;
  onSelectCandidateMove?: (uci: string) => void;
  onShowThreatArrow?: () => void;
}

export const GrandmasterCoachPanel: React.FC<GrandmasterCoachPanelProps> = ({
  currentFen,
  lastMove,
  evaluation,
  onSelectCandidateMove,
  onShowThreatArrow,
}) => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [coachResponse, setCoachResponse] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<CoachPersona>('elena');

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
      evaluation?.scoreCp,
      activePersona
    );
    setCoachResponse(ans);

    if (key === 'what_threat' && onShowThreatArrow) {
      onShowThreatArrow();
    }
  };

  const personas: { id: CoachPersona; name: string; tag: string }[] = [
    { id: 'elena', name: 'Elena', tag: 'Teacher' },
    { id: 'kasparov', name: 'Kasparov', tag: 'Aggressive' },
    { id: 'karpov', name: 'Karpov', tag: 'Positional' },
    { id: 'tal', name: 'Tal', tag: 'Tactician' },
  ];

  return (
    <div className="flex flex-col h-full bg-charcoal-900 border border-charcoal-800 rounded-xl p-3 text-xs overflow-y-auto shadow-md">
      {/* Coach Header & Persona Selector */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-charcoal-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-charcoal-100 flex items-center gap-1.5 leading-none">
              <span>Grandmaster Coach</span>
            </div>
            <div className="text-[10px] text-charcoal-400 mt-0.5">Tactical Mentor & Calculation Guide</div>
          </div>
        </div>

        {/* Persona pills */}
        <div className="flex items-center gap-1 bg-charcoal-850 p-0.5 rounded-lg border border-charcoal-750">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePersona(p.id);
                if (activeQuestion) {
                  const ans = GrandmasterCoachService.answerQuestion(
                    activeQuestion as any,
                    currentFen,
                    lastMove,
                    evaluation?.bestMoveUci,
                    evaluation?.scoreCp,
                    p.id
                  );
                  setCoachResponse(ans);
                }
              }}
              title={`${p.name} (${p.tag})`}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                activePersona === p.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-charcoal-400 hover:text-charcoal-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Position / Mistake Notice */}
      {lastMove?.classification && lastMove.classification !== 'best' && lastMove.classification !== 'good' && (
        <div className="mb-2.5 p-2 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-start gap-2 text-rose-200 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-rose-300 text-xs">
              Notice: {lastMove.san} was a {lastMove.classification}
            </div>
            <div className="text-[11px] text-rose-200/90 mt-0.5 leading-tight">
              Engine preferred <span className="font-mono font-bold text-emerald-300">{lastMove.bestMove || 'a better move'}</span>.
            </div>
          </div>
        </div>
      )}

      {/* Interactive Question Prompts */}
      <div className="flex flex-col gap-1.5 mb-2.5">
        <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">
          Ask The Grandmaster
        </span>

        <button
          onClick={() => handleAsk('what_threat')}
          className="text-left px-2.5 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-200 hover:text-white transition-all flex items-center justify-between group"
        >
          <span className="font-medium text-xs">What is the immediate threat?</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => handleAsk('what_plan')}
          className="text-left px-2.5 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-200 hover:text-white transition-all flex items-center justify-between group"
        >
          <span className="font-medium text-xs">What strategic plan should I follow?</span>
          <Compass className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => handleAsk('candidate_moves')}
          className="text-left px-2.5 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-200 hover:text-white transition-all flex items-center justify-between group"
        >
          <span className="font-medium text-xs">Which 3 candidate moves to calculate?</span>
          <Swords className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => handleAsk('give_hint')}
          className="text-left px-2.5 py-1.5 rounded-lg bg-charcoal-850 hover:bg-emerald-950/40 border border-charcoal-750 hover:border-emerald-600/50 text-charcoal-200 hover:text-emerald-300 transition-all flex items-center justify-between group"
        >
          <span className="font-medium text-xs">Give me a pedagogical hint</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Response Box */}
      {coachResponse && (
        <div className="mb-2.5 p-3 bg-charcoal-850 border border-charcoal-750 rounded-xl leading-relaxed text-charcoal-200 text-xs shadow-inner">
          <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Coach Advice</span>
          </div>
          <p className="whitespace-pre-line text-xs text-charcoal-200 leading-normal">{coachResponse}</p>
        </div>
      )}

      {/* Candidate Lines / Stockfish Evaluation */}
      {evaluation && evaluation.candidateLines.length > 0 && (
        <div className="mt-auto pt-2 border-t border-charcoal-800">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider block mb-1">
            Engine Candidate Lines (Depth {evaluation.depth})
          </span>
          <div className="flex flex-col gap-1 font-mono text-xs">
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
                  className="flex items-center justify-between p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 cursor-pointer border border-charcoal-800 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-charcoal-500 text-[10px] font-bold">#{idx + 1}</span>
                    <span className="font-bold text-emerald-300">{line.pv[0]}</span>
                    <span className="text-charcoal-400 text-[10px] truncate max-w-[120px]">
                      {line.pv.slice(1, 4).join(' ')}
                    </span>
                  </div>
                  <span className="font-bold text-charcoal-200 text-xs">{score}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
