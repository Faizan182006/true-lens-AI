import React from 'react';
import { X, History, Trash2, ArrowRight, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';
import { AnalysisResult } from '../types';

interface SessionHistoryModalProps {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative my-8 flex flex-col max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-violet-400" />
            <div>
              <h3 className="text-base font-bold text-white">Session History</h3>
              <p className="text-xs text-neutral-400">
                Media analyzed during your current browser session ({history.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <History className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
              <p className="text-sm font-medium text-neutral-300">No session history yet</p>
              <p className="text-xs text-neutral-500 mt-1">
                Upload and analyse images or videos to see past reports here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const isAi = item.verdict === 'Likely AI-generated';
                const isAuthentic = item.verdict === 'Likely authentic';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectResult(item);
                      onClose();
                    }}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 hover:border-cyan-500/50 hover:bg-neutral-900 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt={item.fileName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400 uppercase">
                            {item.mediaType}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate max-w-xs group-hover:text-cyan-300 transition-colors">
                          {item.fileName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              isAi
                                ? 'bg-rose-500/20 text-rose-300'
                                : isAuthentic
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {isAi && <ShieldAlert className="h-3 w-3" />}
                            {isAuthentic && <ShieldCheck className="h-3 w-3" />}
                            {!isAi && !isAuthentic && <HelpCircle className="h-3 w-3" />}
                            <span>{item.likelihood}% — {item.verdict}</span>
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="border-t border-neutral-800 bg-neutral-900/60 px-6 py-3 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Session History</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
