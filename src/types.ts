export type MediaType = 'image' | 'video';

export type VerdictCategory = 'Likely AI-generated' | 'Uncertain / Inconclusive' | 'Likely authentic';

export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type IndicatorSeverity = 'critical' | 'warning' | 'neutral' | 'pass';

export interface KeyIndicator {
  indicator: string;
  description: string;
  severity: IndicatorSeverity;
}

export interface MetricBreakdown {
  score: number; // 0 to 100 (higher means higher AI likelihood / anomaly detection)
  observations: string;
}

export interface DetailedBreakdown {
  facialHandGeometry: MetricBreakdown;
  lightingShadows: MetricBreakdown;
  texturesPatterns: MetricBreakdown;
  backgroundGeometry: MetricBreakdown;
  textLogos: MetricBreakdown;
  temporalConsistency?: MetricBreakdown;
}

export interface VideoFrame {
  index: number;
  timestamp: number; // in seconds
  base64: string;
  notes?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  fileName: string;
  mediaType: MediaType;
  fileSize: number;
  fileMimeType: string;
  previewUrl?: string;
  likelihood: number; // 0 - 100
  verdict: VerdictCategory;
  confidence: ConfidenceLevel;
  summary: string;
  keyIndicators: KeyIndicator[];
  detectedInconsistencies: string[];
  detailedBreakdown: DetailedBreakdown;
  limitations: string;
  analysedFramesCount?: number;
  frames?: VideoFrame[];
  exifData?: Record<string, string>;
  isReliable: boolean;
  unreliableReason?: string;
  engine?: string;
  isOfflineFallback?: boolean;
}

export interface AnalysisRequestPayload {
  mediaType: MediaType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Data?: string; // For images
  videoFrames?: VideoFrame[]; // For videos: multiple representative frames
  metadata?: Record<string, string>;
}
