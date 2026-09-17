/**
 * TrueLens AI - Forensic Image & Video Authenticity Analysis
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroUpload } from './components/HeroUpload';
import { MediaPreview } from './components/MediaPreview';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ResultView } from './components/ResultView';
import { ForensicFilterViewer } from './components/ForensicFilterViewer';
import { HowItWorksModal } from './components/HowItWorksModal';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { FrameInspectorModal } from './components/FrameInspectorModal';
import { extractVideoFrames } from './utils/frameExtractor';
import { extractMediaMetadata } from './utils/exifReader';
import { optimizeImageForAnalysis } from './utils/imageOptimizer';
import { SampleMediaItem } from './utils/sampleMedia';
import { AnalysisResult, MediaType, VideoFrame } from './types';
import { AlertTriangle, Sparkles, Shield, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Active media state
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [videoFrames, setVideoFrames] = useState<VideoFrame[]>([]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  // Loading & Progress states
  const [isPreparingMedia, setIsPreparingMedia] = useState<boolean>(false);
  const [prepProgress, setPrepProgress] = useState<number>(0);
  const [prepMessage, setPrepMessage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Results & History
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sessionHistory, setSessionHistory] = useState<AnalysisResult[]>(() => {
    try {
      const saved = sessionStorage.getItem('truelens_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal Dialogs
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showFilterViewer, setShowFilterViewer] = useState<boolean>(false);
  const [inspectedFrame, setInspectedFrame] = useState<VideoFrame | null>(null);

  // Sync session history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('truelens_history', JSON.stringify(sessionHistory));
    } catch {
      // Ignore quota exceeded
    }
  }, [sessionHistory]);

  // Clean up object URL when component unmounts or media changes
  const activeBlobUrlRef = useRef<string | null>(null);
  const cleanupActiveBlobUrl = () => {
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupActiveBlobUrl();
    };
  }, []);

  // Handle uploaded file
  const handleFileSelected = async (file: File) => {
    cleanupActiveBlobUrl();
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsPreparingMedia(true);
    setPrepProgress(10);
    setPrepMessage('Inspecting file headers and format...');

    const isVid = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);
    const resolvedType: MediaType = isVid ? 'video' : 'image';

    setCurrentFile(file);
    setMediaType(resolvedType);

    const objUrl = URL.createObjectURL(file);
    activeBlobUrlRef.current = objUrl;
    setPreviewUrl(objUrl);

    try {
      // 1. Extract metadata
      setPrepProgress(25);
      setPrepMessage('Extracting EXIF & format properties...');
      const extractedMeta = await extractMediaMetadata(file);
      setMetadata(extractedMeta);

      if (resolvedType === 'image') {
        // Convert to optimized base64 for API (downscales if >1600px, preserves visual forensic fidelity)
        setPrepProgress(60);
        setPrepMessage('Optimizing image representation...');
        const optimizedBase64 = await optimizeImageForAnalysis(file);
        setBase64Data(optimizedBase64);
        setVideoFrames([]);
        setPrepProgress(100);
        setIsPreparingMedia(false);
      } else {
        // Extract 5 representative video keyframes
        setPrepProgress(40);
        setPrepMessage('Extracting representative timeline keyframes...');
        const extraction = await extractVideoFrames(file, 5, (pct, msg) => {
          setPrepProgress(40 + Math.round(pct * 0.55));
          setPrepMessage(msg);
        });

        setVideoFrames(extraction.frames);
        setBase64Data(null);
        setMetadata((prev) => ({
          ...prev,
          'Video Duration': `${extraction.duration.toFixed(1)}s`,
          Resolution: `${extraction.width} x ${extraction.height}`,
          'Extracted Frames': `${extraction.frames.length} keyframes`,
        }));
        setPrepProgress(100);
        setIsPreparingMedia(false);
      }
    } catch (err: any) {
      console.error('File preparation error:', err);
      setAnalysisError('Unable to process the media file. Please verify file integrity.');
      setIsPreparingMedia(false);
    }
  };

  // Handle curated sample media selection
  const handleSampleSelected = async (sample: SampleMediaItem) => {
    cleanupActiveBlobUrl();
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsPreparingMedia(true);
    setPrepProgress(20);
    setPrepMessage(`Loading sample: ${sample.title}...`);

    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });

      handleFileSelected(file);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setAnalysisError('Failed to load sample media from network. You can upload any image directly.');
      setIsPreparingMedia(false);
    }
  };

  // Run AI Forensic Analysis
  const handleStartAnalysis = async () => {
    if (!currentFile && !base64Data && videoFrames.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const payload: any = {
        mediaType,
        fileName: currentFile?.name || 'sample_media.jpg',
        fileSize: currentFile?.size || 0,
        mimeType: currentFile?.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
        metadata,
      };

      if (mediaType === 'image' && base64Data) {
        payload.base64Data = base64Data;
      } else if (mediaType === 'video' && videoFrames.length > 0) {
        payload.videoFrames = videoFrames;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      const rawResponseText = await res.text();
      try {
        data = JSON.parse(rawResponseText);
      } catch {
        // Non-JSON response (e.g. proxy HTML error page, 502/504 gateway timeout, or 413)
        if (!res.ok) {
          throw new Error(
            res.status === 413
              ? 'The uploaded file is too large for transmission. Please try a smaller image or video.'
              : `The analysis service returned an unexpected server response (${res.status}). Please retry in a few moments.`
          );
        } else {
          throw new Error('Received unexpected response format from server. Please click Retry Analysis.');
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to complete media forensic analysis.');
      }

      const completeResult: AnalysisResult = {
        ...data,
        id: `analysis-${Date.now()}`,
        timestamp: Date.now(),
        fileName: currentFile?.name || 'media_item',
        mediaType,
        fileSize: currentFile?.size || 0,
        fileMimeType: currentFile?.type || 'image/jpeg',
        previewUrl: previewUrl || undefined,
        frames: mediaType === 'video' ? videoFrames : undefined,
      };

      setAnalysisResult(completeResult);

      // Add to session history
      setSessionHistory((prev) => [completeResult, ...prev.slice(0, 19)]);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err?.message || 'An unexpected error occurred during forensic evaluation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset / Clear Media and Results
  const handleClear = () => {
    cleanupActiveBlobUrl();
    setCurrentFile(null);
    setPreviewUrl(null);
    setBase64Data(null);
    setVideoFrames([]);
    setMetadata({});
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  // Select historical result
  const handleSelectHistoricalResult = (item: AnalysisResult) => {
    setAnalysisResult(item);
    setMediaType(item.mediaType);
    setPreviewUrl(item.previewUrl || null);
    if (item.frames) {
      setVideoFrames(item.frames);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'}`}>
      {/* Top Navigation */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
        onOpenPrivacy={() => setShowPrivacy(true)}
        historyCount={sessionHistory.length}
      />

      {/* Main Content Body */}
      <main className="pb-20">
        {/* Error Notification Banner */}
        {analysisError && (
          <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300 backdrop-blur-sm">
              <div className="flex items-start sm:items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
                <p className="leading-snug">{analysisError}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {previewUrl && (
                  <button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>Retry Analysis</span>
                  </button>
                )}
                <button
                  onClick={() => setAnalysisError(null)}
                  className="rounded-lg bg-neutral-800/80 hover:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 1: Initial State - Hero & Dropzone */}
        {!previewUrl && !analysisResult && (
          <HeroUpload
            onFileSelected={handleFileSelected}
            onSampleSelected={handleSampleSelected}
            isProcessing={isPreparingMedia}
            progressPercent={prepProgress}
            progressMessage={prepMessage}
          />
        )}

        {/* View 2: Media Selected, Ready for Analysis */}
        {previewUrl && !isAnalyzing && !analysisResult && (
          <MediaPreview
            mediaType={mediaType}
            previewUrl={previewUrl}
            fileName={currentFile?.name || 'Sample Media'}
            fileSize={currentFile?.size || 1024 * 512}
            metadata={metadata}
            videoFrames={videoFrames}
            onStartAnalysis={handleStartAnalysis}
            onClear={handleClear}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* View 3: Active Analysis Running */}
        {isAnalyzing && previewUrl && (
          <AnalysisLoading
            mediaType={mediaType}
            previewUrl={previewUrl}
          />
        )}

        {/* View 4: Complete Analysis Results */}
        {analysisResult && (
          <ResultView
            result={analysisResult}
            onClear={handleClear}
            onOpenFilterViewer={() => setShowFilterViewer(true)}
            onSelectFrame={(frame) => setInspectedFrame(frame)}
          />
        )}
      </main>

      {/* Modals and Overlays */}
      {showFilterViewer && (previewUrl || analysisResult?.previewUrl) && (
        <ForensicFilterViewer
          imageUrl={previewUrl || analysisResult?.previewUrl || ''}
          fileName={analysisResult?.fileName || currentFile?.name || 'media_item'}
          onClose={() => setShowFilterViewer(false)}
        />
      )}

      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
      )}

      {showPrivacy && (
        <PrivacyNoticeModal onClose={() => setShowPrivacy(false)} />
      )}

      {showHistory && (
        <SessionHistoryModal
          history={sessionHistory}
          onSelectResult={handleSelectHistoricalResult}
          onClearHistory={() => setSessionHistory([])}
          onClose={() => setShowHistory(false)}
        />
      )}

      {inspectedFrame && (
        <FrameInspectorModal
          frame={inspectedFrame}
          onClose={() => setInspectedFrame(null)}
        />
      )}

      {/* Trust & Transparency Global Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950/60 py-8 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">TrueLens AI</span>
            <span>•</span>
            <span>Probabilistic Media Analysis</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowHowItWorks(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              How AI Detection Works
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Privacy Notice
            </button>
            <span>In-Memory Forensic Evaluation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
