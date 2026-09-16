import React, { useState, useEffect, useRef } from 'react';
import { X, Sliders, Eye, RefreshCw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface ForensicFilterViewerProps {
  imageUrl: string;
  onClose: () => void;
  fileName: string;
}

type FilterMode = 'normal' | 'edges' | 'luminance' | 'noise';

export const ForensicFilterViewer: React.FC<ForensicFilterViewerProps> = ({
  imageUrl,
  onClose,
  fileName,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('normal');
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessingFilter, setIsProcessingFilter] = useState(false);

  useEffect(() => {
    applyFilter(filterMode);
  }, [filterMode, imageUrl]);

  const applyFilter = (mode: FilterMode) => {
    setIsProcessingFilter(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      ctx.drawImage(img, 0, 0);

      if (mode === 'normal') {
        setIsProcessingFilter(false);
        return;
      }

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      if (mode === 'edges') {
        // Sobel Edge Detection
        const gray = new Float32Array(w * h);
        for (let i = 0; i < d.length; i += 4) {
          gray[i / 4] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        }

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const gx =
              -gray[(y - 1) * w + (x - 1)] +
              gray[(y - 1) * w + (x + 1)] -
              2 * gray[y * w + (x - 1)] +
              2 * gray[y * w + (x + 1)] -
              gray[(y + 1) * w + (x - 1)] +
              gray[(y + 1) * w + (x + 1)];

            const gy =
              -gray[(y - 1) * w + (x - 1)] -
              2 * gray[(y - 1) * w + x] -
              gray[(y - 1) * w + (x + 1)] +
              gray[(y + 1) * w + (x - 1)] +
              2 * gray[(y + 1) * w + x] +
              gray[(y + 1) * w + (x + 1)];

            const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.5);
            const pixelIdx = idx * 4;
            d[pixelIdx] = mag > 40 ? 0 : 10;
            d[pixelIdx + 1] = mag > 40 ? mag : 20;
            d[pixelIdx + 2] = mag > 40 ? 255 : 30;
          }
        }
      } else if (mode === 'luminance') {
        // High-contrast Luminance Inversion (highlights catchlights and reflections)
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const inverted = 255 - lum;
          d[i] = inverted;
          d[i + 1] = Math.min(255, inverted * 1.2);
          d[i + 2] = 255;
        }
      } else if (mode === 'noise') {
        // High-pass Noise Isolation (reveals camera sensor grain vs smooth AI diffusion)
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
          const diff = Math.abs(d[i] - avg) * 3;
          d[i] = 128 + diff;
          d[i + 1] = 128 + diff;
          d[i + 2] = 128 + diff;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setIsProcessingFilter(false);
    };

    img.onerror = () => {
      setIsProcessingFilter(false);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6">
      <div className="relative flex flex-col h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Forensic Artifact Inspector
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-md">
                {fileName} — Inspect high-frequency diffusion artifacts and edge consistency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-300 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs text-neutral-400 min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-300 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="ml-2 rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Selection Strip */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800/80 bg-neutral-900/50 px-6 py-2.5">
          <span className="text-xs font-semibold text-neutral-400 mr-2">
            Diagnostic Filters:
          </span>

          <button
            onClick={() => setFilterMode('normal')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'normal'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Original
          </button>

          <button
            onClick={() => setFilterMode('edges')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'edges'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Sobel Edge Contours
          </button>

          <button
            onClick={() => setFilterMode('luminance')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'luminance'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Specular Catchlights
          </button>

          <button
            onClick={() => setFilterMode('noise')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'noise'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Noise & Sensor Grain
          </button>

          <div className="ml-auto text-[11px] text-neutral-400 italic hidden md:block">
            {filterMode === 'edges' && 'Highlights boundary discontinuities & unnatural hair/finger blending.'}
            {filterMode === 'luminance' && 'Inverts lighting to inspect specular highlights and shadow directions.'}
            {filterMode === 'noise' && 'Highlights natural sensor grain vs waxy AI texture smoothing.'}
            {filterMode === 'normal' && 'Standard calibrated RGB view.'}
          </div>
        </div>

        {/* Canvas Viewport */}
        <div className="relative flex-1 overflow-auto bg-neutral-950 p-6 flex items-center justify-center">
          {isProcessingFilter && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm text-xs text-cyan-300 font-mono">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Computing filter transformations...
            </div>
          )}

          <div
            className="transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <canvas
              ref={canvasRef}
              className="max-h-[65vh] max-w-full rounded-lg shadow-2xl object-contain border border-neutral-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 bg-neutral-900/60 px-6 py-3 text-xs text-neutral-400 flex justify-between items-center">
          <span>Forensic visual layer diagnostic</span>
          <span>Click and scroll to inspect high-frequency anomalies</span>
        </div>
      </div>
    </div>
  );
};
