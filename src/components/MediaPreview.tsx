import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  Play,
  Film,
  Info,
  Maximize2,
  FileCheck2,
  Layers,
} from 'lucide-react';
import { VideoFrame } from '../types';

interface MediaPreviewProps {
  mediaType: 'image' | 'video';
  previewUrl: string;
  fileName: string;
  fileSize: number;
  metadata?: Record<string, string>;
  videoFrames?: VideoFrame[];
  onStartAnalysis: () => void;
  onClear: () => void;
  isAnalyzing: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaType,
  previewUrl,
  fileName,
  fileSize,
  metadata,
  videoFrames,
  onStartAnalysis,
  onClear,
  isAnalyzing,
}) => {
  const [selectedFrame, setSelectedFrame] = useState<VideoFrame | null>(null);
  const [showFullMetadata, setShowFullMetadata] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Container Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-2xl backdrop-blur-xl">
        {/* Top bar with file info and clear button */}
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700">
              {mediaType === 'video' ? (
                <Film className="h-4 w-4 text-violet-400" />
              ) : (
                <FileCheck2 className="h-4 w-4 text-cyan-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                {fileName}
              </h3>
              <p className="text-xs text-neutral-400">
                {(fileSize / (1024 * 1024)).toFixed(2)} MB • {mediaType.toUpperCase()}
                {videoFrames && videoFrames.length > 0 ? ` • ${videoFrames.length} representative frames extracted` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <button
              id="clear-media-btn"
              onClick={onClear}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear / Change Media</span>
            </button>
          </div>
        </div>

        {/* Media Preview Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Main Visual Preview */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
              {mediaType === 'video' ? (
                <video
                  src={previewUrl}
                  controls
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Uploaded media preview"
                  className="h-full w-full object-contain"
                />
              )}

              <div className="absolute top-3 right-3 rounded-md bg-neutral-950/80 px-2 py-1 text-[11px] font-mono text-neutral-300 border border-neutral-800 backdrop-blur-md">
                {mediaType === 'video' ? 'Video Player' : 'High-Res Preview'}
              </div>
            </div>

            {/* Extracted Video Frames Strip (if video) */}
            {mediaType === 'video' && videoFrames && videoFrames.length > 0 && (
              <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-semibold text-neutral-200">
                      Representative Analyzed Frames ({videoFrames.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Extracted across duration for temporal consistency
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {videoFrames.map((frame, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedFrame(frame)}
                      className={`group relative aspect-video overflow-hidden rounded-lg border transition-all cursor-pointer ${
                        selectedFrame?.index === frame.index
                          ? 'border-cyan-400 ring-2 ring-cyan-500/20'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <img
                        src={frame.base64}
                        alt={`Frame ${idx + 1}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] font-mono text-cyan-300">
                        {frame.timestamp.toFixed(1)}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Forensic Specs & Action Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    <Info className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Media Properties</span>
                  </h4>
                  <button
                    onClick={() => setShowFullMetadata(!showFullMetadata)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showFullMetadata ? 'Less' : 'More'}
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                    <span className="text-neutral-400">Format</span>
                    <span className="font-mono text-neutral-200">
                      {metadata?.['Format'] || mediaType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                    <span className="text-neutral-400">Payload Size</span>
                    <span className="font-mono text-neutral-200">
                      {(fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                    <span className="text-neutral-400">EXIF Status</span>
                    <span className="font-mono text-neutral-200 truncate max-w-[140px] text-right">
                      {metadata?.['EXIF Presence'] || 'Inspected'}
                    </span>
                  </div>
                  {metadata?.['Software Hint'] && (
                    <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                      <span className="text-amber-400">Software Marker</span>
                      <span className="font-mono text-amber-300 font-semibold truncate max-w-[140px] text-right">
                        {metadata['Software Hint']}
                      </span>
                    </div>
                  )}
                  {showFullMetadata && metadata && (
                    <>
                      {Object.entries(metadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px] pt-1">
                          <span className="text-neutral-400">{k}</span>
                          <span className="font-mono text-neutral-300 truncate max-w-[140px]">
                            {v}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* What will be analysed notice */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4">
                <h5 className="text-xs font-semibold text-cyan-300 mb-1">
                  Analysis Pipeline Checklist:
                </h5>
                <ul className="text-[11px] text-neutral-300 space-y-1 list-disc list-inside">
                  <li>Facial, hand & anatomy geometry</li>
                  <li>Specular highlights & shadow physics</li>
                  <li>High-frequency diffusion textures</li>
                  <li>Background perspective & depth coherence</li>
                  {mediaType === 'video' && <li>Cross-frame temporal drift & morphing</li>}
                </ul>
              </div>
            </div>

            {/* Analyse Media CTA */}
            <div className="pt-4">
              <button
                id="start-analysis-btn"
                onClick={onStartAnalysis}
                disabled={isAnalyzing}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-2 rounded-[11px] bg-neutral-950/80 px-6 py-3.5 font-semibold text-white group-hover:bg-transparent transition-all">
                  <Sparkles className="h-5 w-5 text-cyan-400 group-hover:text-white transition-colors" />
                  <span className="text-base tracking-wide">
                    {isAnalyzing ? 'Analyzing Media...' : 'Analyse Media'}
                  </span>
                </div>
              </button>
              <p className="mt-2 text-center text-[11px] text-neutral-400">
                Evaluation produces probabilistic estimates, not definitive proof.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
