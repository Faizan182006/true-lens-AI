import { VideoFrame } from '../types';

/**
 * Extracts representative frames evenly distributed across a video file.
 * @param videoFile The uploaded video file
 * @param frameCount Number of representative frames to extract (default: 5)
 * @param onProgress Callback receiving progress from 0 to 100 and current step
 */
export async function extractVideoFrames(
  videoFile: File,
  frameCount: number = 5,
  onProgress?: (percent: number, message: string) => void
): Promise<{ frames: VideoFrame[]; duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    const frames: VideoFrame[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      URL.revokeObjectURL(videoUrl);
      return reject(new Error('Canvas 2D context could not be initialized'));
    }

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 360;

        // Downscale frame slightly for efficient API transmission while preserving high forensic fidelity
        const maxDim = 800;
        let targetWidth = width;
        let targetHeight = height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            targetWidth = maxDim;
            targetHeight = Math.round((height / width) * maxDim);
          } else {
            targetHeight = maxDim;
            targetWidth = Math.round((width / height) * maxDim);
          }
        }
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculate sample timestamps (avoiding extreme 0.0s black frames if present)
        const timestamps: number[] = [];
        for (let i = 0; i < frameCount; i++) {
          const ratio = (i + 0.5) / frameCount;
          timestamps.push(Math.min(duration * ratio, duration - 0.05));
        }

        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          if (onProgress) {
            const pct = Math.round(((i + 1) / timestamps.length) * 100);
            onProgress(pct, `Extracting keyframe ${i + 1} of ${timestamps.length} (${t.toFixed(1)}s)...`);
          }

          await seekVideoTo(video, t);

          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);

          frames.push({
            index: i,
            timestamp: t,
            base64,
            notes: `Keyframe #${i + 1} at ${formatTime(t)}`,
          });
        }

        URL.revokeObjectURL(videoUrl);
        resolve({ frames, duration, width, height });
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Failed to load video for frame extraction. Format might be unsupported.'));
    };
  });
}

function seekVideoTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const handleSeeked = () => {
      video.removeEventListener('seeked', handleSeeked);
      // Brief pause to allow rendering pipeline to latch the frame
      setTimeout(resolve, 50);
    };
    video.addEventListener('seeked', handleSeeked);
    video.currentTime = Math.max(0, time);
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}s`;
}
