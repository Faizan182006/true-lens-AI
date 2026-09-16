import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, Trash } from 'lucide-react';

interface PrivacyNoticeModalProps {
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative my-8 flex flex-col max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Privacy Notice & Data Handling
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-neutral-300 text-sm leading-relaxed">
          <p className="text-neutral-400">
            At <strong>TrueLens AI</strong>, user trust, transparency, and data integrity are central to our design. Here is how your uploaded files and analytical data are handled:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 shrink-0">
                <EyeOff className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Zero Permanent Retention
                </h4>
                <p className="mt-1 text-xs text-neutral-400">
                  Uploaded images and videos are processed in-memory solely for the duration of the forensic evaluation. Files are not stored permanently on our servers or disk drives.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  No Model Training on Uploads
                </h4>
                <p className="mt-1 text-xs text-neutral-400">
                  Your uploaded personal photos, documents, and videos are never used to train, retrain, or fine-tune artificial intelligence models.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400 shrink-0">
                <Trash className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Immediate Client Clear Control
                </h4>
                <p className="mt-1 text-xs text-neutral-400">
                  You can click the <strong>Delete / Clear Analysis</strong> button at any time to purge the active media payload and results from local memory immediately.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400 shrink-0">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Encrypted Transmission
                </h4>
                <p className="mt-1 text-xs text-neutral-400">
                  All communications between the browser client and server-side analysis pipeline utilize secure HTTPS/TLS encryption.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 bg-neutral-900/60 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
