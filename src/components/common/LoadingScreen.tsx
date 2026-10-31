import React, { useState, useEffect } from 'react';
import { AppLogo } from './AppLogo';
import { ShieldCheck, Cpu, Database, BookOpen, CheckCircle2 } from 'lucide-react';

interface LoadingScreenProps {
  onFinished: () => void;
  username?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished, username = 'Hero.X' }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const steps = [
    { label: 'Initializing Stockfish 17 NNUE Engine...', icon: Cpu },
    { label: 'Mounting offline air-gapped database...', icon: Database },
    { label: 'Loading Grandmaster opening repertoire...', icon: BookOpen },
    { label: 'Calibrating tactical calculation puzzles...', icon: ShieldCheck },
    { label: `All systems ready. Welcome, ${username}!`, icon: CheckCircle2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onFinished, 500);
          }, 300);
          return 100;
        }

        const next = prev + 5;
        if (next >= 85) setCurrentStep(4);
        else if (next >= 60) setCurrentStep(3);
        else if (next >= 35) setCurrentStep(2);
        else if (next >= 15) setCurrentStep(1);
        else setCurrentStep(0);

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onFinished, username]);

  const StepIcon = steps[currentStep]?.icon || Cpu;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070a0f] text-slate-100 select-none transition-opacity duration-500 font-sans ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 w-full flex justify-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">
        100% Offline • Zero Telemetry • Local Air-Gapped Intelligence
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Pulsing Animated Brand Monogram */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#182333] to-[#0d141e] border border-emerald-500/40 p-1 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.25)] animate-pulse">
            <AppLogo size={56} showText={false} />
          </div>
          {/* Subtle Rotating Accent Ring */}
          <div className="absolute -inset-2 rounded-3xl border border-emerald-500/20 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Title */}
        <h1 className="text-xl font-extrabold text-slate-100 tracking-wider">
          GRANDMASTER <span className="text-emerald-400 font-mono text-sm">OS</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">
          THE PRIVATE CHESS ACADEMY
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-8">
          <div className="h-1.5 w-full bg-[#131b27] rounded-full overflow-hidden border border-[#1e2a3c] relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono mt-2 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <StepIcon className="w-3.5 h-3.5 animate-pulse" />
              <span>{steps[currentStep]?.label}</span>
            </span>
            <span className="font-bold text-slate-300">{progress}%</span>
          </div>
        </div>

        {/* System Checklist Preview */}
        <div className="mt-8 grid grid-cols-2 gap-2 w-full text-left font-mono text-[10px]">
          <div className="p-2 rounded-lg bg-[#0e141f] border border-[#1b2536] flex items-center gap-1.5 text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${progress >= 20 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
            <span>Stockfish 17 UCI</span>
          </div>
          <div className="p-2 rounded-lg bg-[#0e141f] border border-[#1b2536] flex items-center gap-1.5 text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${progress >= 40 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
            <span>Local SQLite DB</span>
          </div>
          <div className="p-2 rounded-lg bg-[#0e141f] border border-[#1b2536] flex items-center gap-1.5 text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${progress >= 65 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
            <span>ECO Opening Book</span>
          </div>
          <div className="p-2 rounded-lg bg-[#0e141f] border border-[#1b2536] flex items-center gap-1.5 text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${progress >= 90 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
            <span>Curriculum Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
