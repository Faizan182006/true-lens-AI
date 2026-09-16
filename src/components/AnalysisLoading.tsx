import React, { useEffect, useState } from 'react';
import { Scan, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisLoadingProps {
  mediaType: 'image' | 'video';
  previewUrl: string;
}

const ANALYSIS_PHASES = [
  'Initializing forensic neural vision pipeline...',
  'Extracting high-frequency visual and geometric features...',
  'Analyzing directional lighting, shadow angles & specular catchlights...',
  'Scanning skin texture, subsurface scattering & diffusion patterns...',
  'Inspecting facial, hand, finger & limb anatomical coherence...',
  'Evaluating background vanishing points & perspective depth...',
  'Cross-referencing temporal keyframe continuity & motion vectors...',
  'Synthesizing probabilistic indicators & calculating confidence scores...',
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  mediaType,
  previewUrl,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_PHASES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full bg-cyan-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Animated Forensic Scanner Viewport */}
          <div className="relative mb-8 h-64 w-full max-w-md overflow-hidden rounded-xl border border-cyan-500/40 bg-neutral-950 shadow-inner">
            {mediaType === 'video' ? (
              <video
                src={previewUrl}
                muted
                autoPlay
                loop
                playsInline
                className="h-full w-full object-cover opacity-60 filter contrast-125"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Scanning target"
                className="h-full w-full object-cover opacity-60 filter contrast-125"
              />
            )}

            {/* Laser scanning line sweeping down and up */}
            <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-[scan_2.5s_ease-in-out_infinite]"></div>

            {/* Grid Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

            {/* HUD Corner Targets */}
            <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-cyan-400"></div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
              SCANNING IN PROGRESS // MULTIMODAL INSPECTION
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-300 mb-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span>ANALYSING MEDIA CHARACTERISTICS</span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Evaluating Visual & Geometric Evidence
          </h3>

          <p className="mt-2 text-sm text-neutral-400 max-w-lg">
            Our multi-layer forensic engine is interrogating the media for synthetic diffusion artifacts, anatomical markers, and physical lighting consistency.
          </p>

          {/* Forensic Pipeline Steps List */}
          <div className="mt-8 w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-left">
            <div className="space-y-2.5">
              {ANALYSIS_PHASES.map((phase, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs transition-colors ${
                      isCurrent
                        ? 'text-cyan-300 font-medium'
                        : isCompleted
                        ? 'text-neutral-400'
                        : 'text-neutral-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <div className="h-4 w-4 flex items-center justify-center shrink-0">
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-neutral-700 shrink-0"></div>
                    )}
                    <span className="font-mono text-[11px] truncate">{phase}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
