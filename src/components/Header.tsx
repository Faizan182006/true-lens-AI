import React from 'react';
import {
  Scan,
  History,
  ShieldCheck,
  HelpCircle,
  Sun,
  Moon,
  Cpu,
} from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHistory: () => void;
  onOpenHowItWorks: () => void;
  onOpenPrivacy: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenHistory,
  onOpenHowItWorks,
  onOpenPrivacy,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-neutral-950">
              <Scan className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                True<span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Lens</span>
              </span>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                AI Forensic
              </span>
            </div>
            <p className="hidden text-xs text-neutral-400 sm:block">
              Probabilistic Media Authenticity Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs text-neutral-300 md:flex">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">Gemini 3.8 Flash</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          </div>

          {/* How AI Detection Works */}
          <button
            id="how-it-works-btn"
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            title="How AI Detection Works"
          >
            <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          {/* Privacy Notice */}
          <button
            id="privacy-notice-btn"
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            title="Privacy Notice"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Privacy</span>
          </button>

          {/* Session History */}
          <button
            id="session-history-btn"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            title="Upload History"
          >
            <History className="h-3.5 w-3.5 text-violet-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-neutral-950">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white transition-all cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
