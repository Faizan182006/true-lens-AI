import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check,
  Download,
  Trash2,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  Eye,
  Info,
  ExternalLink,
} from 'lucide-react';
import { AnalysisResult, VideoFrame } from '../types';

interface ResultViewProps {
  result: AnalysisResult;
  onClear: () => void;
  onOpenFilterViewer: () => void;
  onSelectFrame?: (frame: VideoFrame) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onClear,
  onOpenFilterViewer,
  onSelectFrame,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAllIndicators, setShowAllIndicators] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'frames'>('overview');

  const {
    likelihood,
    verdict,
    confidence,
    summary,
    keyIndicators,
    detectedInconsistencies,
    detailedBreakdown,
    limitations,
    fileName,
    mediaType,
    frames,
  } = result;

  // Determine badge styling based on verdict category
  const isAi = verdict === 'Likely AI-generated';
  const isAuthentic = verdict === 'Likely authentic';
  const isInconclusive = verdict === 'Uncertain / Inconclusive';

  const badgeColor = isAi
    ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
    : isAuthentic
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    : 'border-amber-500/40 bg-amber-500/10 text-amber-300';

  const progressGradient = isAi
    ? 'from-rose-500 via-orange-500 to-rose-600'
    : isAuthentic
    ? 'from-emerald-400 via-teal-500 to-cyan-500'
    : 'from-amber-400 via-orange-400 to-yellow-500';

  const handleCopyResult = () => {
    const textReport = `TrueLens AI Forensic Analysis Report
File: ${fileName} (${mediaType.toUpperCase()})
Estimated AI Likelihood: ${likelihood}% — ${verdict}
Confidence Level: ${confidence}

Summary:
${summary}

Key Indicators:
${keyIndicators.map((k) => `• [${k.severity.toUpperCase()}] ${k.indicator}: ${k.description}`).join('\n')}

Detected Inconsistencies:
${detectedInconsistencies.map((d) => `• ${d}`).join('\n')}

Important Notice & Limitations:
${limitations}
(Note: Probabilistic estimate, not definitive proof)`;

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TrueLens AI Forensic Report - ${fileName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { border-bottom: 2px solid #00d2ff; padding-bottom: 8px; margin-bottom: 20px; }
    .score-box { background: #f4f6f8; border-left: 6px solid ${isAi ? '#e11d48' : isAuthentic ? '#059669' : '#d97706'}; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .badge { display: inline-block; padding: 4px 10px; font-weight: bold; border-radius: 4px; font-size: 14px; }
    .indicator { margin-bottom: 12px; }
    .notice { background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 6px; font-size: 13px; color: #92400e; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>TrueLens AI Forensic Analysis Report</h1>
  <p><strong>Target File:</strong> ${fileName} | <strong>Media Type:</strong> ${mediaType.toUpperCase()} | <strong>Date:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
  
  <div class="score-box">
    <h2>${likelihood}% — ${verdict}</h2>
    <p><strong>Confidence Level:</strong> ${confidence}</p>
    <p><strong>Executive Summary:</strong> ${summary}</p>
  </div>

  <h3>Key Visual Indicators</h3>
  <ul>
    ${keyIndicators.map((k) => `<li class="indicator"><strong>${k.indicator} (${k.severity}):</strong> ${k.description}</li>`).join('')}
  </ul>

  <h3>Detected Inconsistencies</h3>
  <ul>
    ${detectedInconsistencies.map((d) => `<li>${d}</li>`).join('')}
  </ul>

  <div class="notice">
    <strong>Important Limitations & Ethical Disclosure:</strong><br>
    ${limitations}
    <p>AI detection is strictly probabilistic and cannot establish legally definitive origin. Results should be corroborated with provenance metadata, watermarking, and secondary forensic tools.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrueLens-Report-${fileName.replace(/\.[^/.]+$/, '')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
              Analysis Complete
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Forensic Evaluation Results
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="inspect-artifacts-btn"
            onClick={onOpenFilterViewer}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
            title="Inspect visual edge and luminance filters"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Inspect Artifacts</span>
          </button>

          <button
            id="copy-result-btn"
            onClick={handleCopyResult}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-all cursor-pointer"
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            id="download-report-btn"
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-all cursor-pointer"
            title="Download full forensic report"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Report</span>
          </button>

          <button
            id="delete-analysis-btn"
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs font-medium text-neutral-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
            title="Delete & Clear analysis"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Primary Result Hero Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl backdrop-blur-xl">
        {/* Main Likelihood Section */}
        <div className="relative border-b border-neutral-800/80 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Score Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                AI-Generated Likelihood
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black tracking-tight text-white">
                  {likelihood}
                </span>
                <span className="text-3xl font-bold text-neutral-400">%</span>
              </div>

              {/* Category Verdict Badge */}
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badgeColor}`}>
                {isAi && <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />}
                {isAuthentic && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                {isInconclusive && <HelpCircle className="h-3.5 w-3.5 text-amber-400" />}
                <span>{verdict}</span>
              </div>

              {/* Confidence Indicator */}
              <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                <span>Confidence:</span>
                <span className="font-semibold text-neutral-200">{confidence}</span>
              </div>
            </div>

            {/* Right: Summary and Probability Explanation */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {verdict} ({likelihood}% Estimated Likelihood)
                </h3>
                <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                  {summary}
                </p>
              </div>

              {/* Progress Likelihood Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-neutral-400">
                  <span>Authentic (0%)</span>
                  <span>Inconclusive (50%)</span>
                  <span>AI Generated (100%)</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-950 border border-neutral-800">
                  <div
                    className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-700`}
                    style={{ width: `${Math.max(4, likelihood)}%` }}
                  ></div>
                </div>
              </div>

              {/* Mandatory Probabilistic Warning Box */}
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  <strong>Important:</strong> These are <strong>probabilistic estimates, not proof</strong>. AI detection cannot establish 100% certainty. Results reflect visual statistical patterns common to generative synthesis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Detailed Breakdown */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`border-b-2 py-3 px-4 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Key Indicators & Findings
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`border-b-2 py-3 px-4 transition-colors cursor-pointer ${
              activeTab === 'breakdown'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Dimensional Forensic Scores
          </button>
          {mediaType === 'video' && frames && frames.length > 0 && (
            <button
              onClick={() => setActiveTab('frames')}
              className={`border-b-2 py-3 px-4 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'frames'
                  ? 'border-cyan-400 text-cyan-300 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Analysed Keyframes ({frames.length})</span>
            </button>
          )}
        </div>

        {/* Tab 1: Key Indicators & Inconsistencies */}
        {activeTab === 'overview' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Why section */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Why this verdict? (Key Visual Indicators)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keyIndicators.map((indicator, idx) => {
                  const sevColor =
                    indicator.severity === 'critical'
                      ? 'border-rose-500/30 bg-rose-500/5 text-rose-300'
                      : indicator.severity === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/5 text-amber-300'
                      : indicator.severity === 'pass'
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                      : 'border-neutral-700/40 bg-neutral-800/30 text-neutral-300';

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 transition-all ${sevColor}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">
                          {indicator.indicator}
                        </span>
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-mono uppercase font-semibold">
                          {indicator.severity}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {indicator.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detected Inconsistencies List */}
            {detectedInconsistencies && detectedInconsistencies.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Detected Inconsistencies</span>
                </h4>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <ul className="space-y-2 text-xs text-neutral-300">
                    {detectedInconsistencies.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dimensional Forensic Scores */}
        {activeTab === 'breakdown' && (
          <div className="p-6 sm:p-8 space-y-5">
            <p className="text-xs text-neutral-400">
              Each forensic dimension represents anomaly intensity (higher score = greater likelihood of synthetic / generative artifacts).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(detailedBreakdown).map(([key, rawData]) => {
                if (!rawData) return null;
                const data = rawData as { score: number; observations: string };
                const titleMap: Record<string, string> = {
                  facialHandGeometry: 'Facial, Hand & Limb Geometry',
                  lightingShadows: 'Lighting Physics & Specular Reflections',
                  texturesPatterns: 'Diffusion Noise & Texture Repetition',
                  backgroundGeometry: 'Background & Perspective Coherence',
                  textLogos: 'Text, Typography & Glyph Coherence',
                  temporalConsistency: 'Temporal Multi-Frame Consistency',
                };

                const title = titleMap[key] || key;
                const score = data.score ?? 0;

                return (
                  <div
                    key={key}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-200">{title}</span>
                      <span className="font-mono text-neutral-400">{score}/100</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          score > 60
                            ? 'bg-rose-500'
                            : score > 35
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-normal">
                      {data.observations}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Analysed Video Frames */}
        {activeTab === 'frames' && frames && frames.length > 0 && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Representative keyframes sampled across video timeline for multi-frame temporal inspection.
              </span>
              <span className="text-xs font-mono text-cyan-300">
                {frames.length} frames analyzed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {frames.map((frame) => (
                <div
                  key={frame.index}
                  onClick={() => onSelectFrame?.(frame)}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 hover:border-cyan-500/60 transition-all cursor-pointer"
                >
                  <img
                    src={frame.base64}
                    alt={`Analysed frame at ${frame.timestamp.toFixed(1)}s`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-cyan-300 font-mono">
                      Click to inspect
                    </span>
                  </div>
                  <span className="absolute top-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-neutral-300">
                    #{frame.index + 1} • {frame.timestamp.toFixed(1)}s
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-xs text-neutral-400">
              <strong>Notice on Video Analysis:</strong> Representative frame sampling evaluates temporal morphing, frame-to-frame feature drift, and object continuity. Analyzing sample frames provides an informed estimate but does not guarantee every millisecond of footage was evaluated.
            </div>
          </div>
        )}

        {/* Limitations and Transparency Footer */}
        <div className="border-t border-neutral-800/80 bg-neutral-950/60 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-cyan-400 mt-0.5" />
            <div className="space-y-1 text-xs text-neutral-300">
              <h5 className="font-semibold text-white">
                Analysis Limitations & Ethical Disclosure
              </h5>
              <p className="leading-relaxed text-neutral-400">
                {limitations ||
                  'Several visual patterns are consistent with AI-generated media, but this result cannot establish whether the content was created by AI. Visual artifacts can also arise from sensor noise, post-processing compression, heavy editing, or artistic lenses.'}
              </p>
              <p className="text-[11px] text-neutral-400 pt-1">
                Never rely solely on automated detectors for legal, disciplinary, or copyright adjudications without independent verification and chain-of-custody metadata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
