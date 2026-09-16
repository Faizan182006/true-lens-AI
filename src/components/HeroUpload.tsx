import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  FileVideo,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck,
} from 'lucide-react';
import { SAMPLE_MEDIA, SampleMediaItem } from '../utils/sampleMedia';

interface HeroUploadProps {
  onFileSelected: (file: File) => void;
  onSampleSelected: (sample: SampleMediaItem) => void;
  isProcessing: boolean;
  progressPercent: number;
  progressMessage: string;
}

export const HeroUpload: React.FC<HeroUploadProps> = ({
  onFileSelected,
  onSampleSelected,
  isProcessing,
  progressPercent,
  progressMessage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const supportedVideoExtensions = ['.mp4', '.mov', '.webm'];
  const maxFileSizeMb = 50;

  const validateAndHandleFile = (file: File) => {
    setValidationError(null);

    const isImage = file.type.startsWith('image/') || supportedImageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    const isVideo = file.type.startsWith('video/') || supportedVideoExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isImage && !isVideo) {
      setValidationError('Unsupported file format. Please upload JPG, PNG, WEBP, MP4, MOV, or WEBM.');
      return;
    }

    if (file.size > maxFileSizeMb * 1024 * 1024) {
      setValidationError(`File size exceeds ${maxFileSizeMb}MB limit. Please upload a smaller file.`);
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 shadow-sm backdrop-blur-md mb-6">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Multimodal Forensic Detection Engine</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Is This Image or Video <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            AI-Generated?
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400 sm:text-lg">
          Upload media and analyse its visual characteristics using AI. Evaluate synthetic geometry, diffusion artifacts, lighting physics, and multi-frame consistency.
        </p>
      </div>

      {/* Upload Box */}
      <div className="mt-10">
        <div
          id="upload-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-950/20 shadow-2xl shadow-cyan-500/20 scale-[1.01]'
              : 'border-neutral-800 bg-neutral-900/40 hover:border-cyan-500/40 hover:bg-neutral-900/70'
          } p-8 sm:p-12 text-center backdrop-blur-xl`}
        >
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/15 transition-all"></div>
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl group-hover:bg-violet-500/15 transition-all"></div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            onChange={handleInputChange}
            disabled={isProcessing}
          />

          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Upload Icon with radar rings */}
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-700/60 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-xl group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20 transition-all">
              <UploadCloud className="h-10 w-10 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>

            <h3 className="text-xl font-semibold text-white group-hover:text-cyan-200 transition-colors">
              Click to upload or drag & drop media
            </h3>

            <p className="mt-2 text-sm text-neutral-400 max-w-md">
              Drag your file here, or click to browse from your device. Supported images and video files up to {maxFileSizeMb}MB.
            </p>

            {/* Supported Formats Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-300">
                <FileImage className="h-3.5 w-3.5 text-cyan-400" />
                <span>JPG, PNG, WEBP</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-300">
                <FileVideo className="h-3.5 w-3.5 text-violet-400" />
                <span>MP4, MOV, WEBM (up to 60s)</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-400">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>In-Memory Private Analysis</span>
              </div>
            </div>

            {/* Processing / Upload Progress Bar */}
            {isProcessing && (
              <div className="mt-8 w-full max-w-md rounded-xl border border-cyan-500/30 bg-neutral-950/90 p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs text-cyan-300 mb-2 font-mono">
                  <span>{progressMessage || 'Processing media payload...'}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${Math.max(5, progressPercent)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <p>{validationError}</p>
          </div>
        )}
      </div>

      {/* Curated Sample Media Strip */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
              Or Test With Sample Media
            </h4>
          </div>
          <span className="text-xs text-neutral-400">Instant one-click evaluation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_MEDIA.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              disabled={isProcessing}
              className="group flex flex-col text-left overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-cyan-500/50 hover:bg-neutral-900 transition-all cursor-pointer p-3"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-800">
                <img
                  src={sample.url}
                  alt={sample.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    sample.expectedCategory === 'Likely AI-generated'
                      ? 'bg-rose-500/90 text-white'
                      : 'bg-emerald-600/90 text-white'
                  }`}
                >
                  {sample.expectedCategory === 'Likely AI-generated' ? 'AI Sample' : 'Real Photo'}
                </span>
              </div>

              <div className="mt-3 flex-1 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {sample.title}
                  </h5>
                  <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2">
                    {sample.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-cyan-400 group-hover:text-cyan-300">
                  <span>Analyse sample</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
