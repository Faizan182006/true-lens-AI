import React from 'react';
import { X, Layers, Clock } from 'lucide-react';
import { VideoFrame } from '../types';

interface FrameInspectorModalProps {
  frame: VideoFrame;
  onClose: () => void;
}

export const FrameInspectorModal: React.FC<FrameInspectorModalProps> = ({
  frame,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative my-8 flex flex-col max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-violet-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Analyzed Video Keyframe #{frame.index + 1}
              </h3>
              <p className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>Captured at timeline position: {frame.timestamp.toFixed(2)} seconds</span>
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

        {/* Frame Image Canvas */}
        <div className="flex-1 overflow-auto bg-neutral-950 p-6 flex items-center justify-center">
          <img
            src={frame.base64}
            alt={`Keyframe #${frame.index + 1}`}
            className="max-h-[65vh] max-w-full rounded-lg border border-neutral-800 object-contain shadow-2xl"
          />
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 bg-neutral-900/60 px-6 py-3 flex items-center justify-between text-xs text-neutral-400">
          <span>{frame.notes || 'Representative sample frame for temporal cross-checking'}</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-1.5 font-semibold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
