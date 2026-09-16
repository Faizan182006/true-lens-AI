import React from 'react';
import { X, Cpu, Sparkles, Layers, ShieldAlert, Eye, AlertCircle } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative my-8 flex flex-col max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              How AI Media Detection Works
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-neutral-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <div>
            <h4 className="flex items-center gap-2 text-base font-semibold text-white mb-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Probabilistic Estimation vs. Definitive Proof</span>
            </h4>
            <p className="text-neutral-400">
              TrueLens AI evaluates media using multimodal neural vision and forensic pattern recognition. Modern generative models (such as Midjourney, Flux, Stable Diffusion, DALL-E 3, Sora, and Runway) generate pixels through mathematical diffusion or autoregressive prediction. While they can create stunning visual fidelity, they frequently leave microscopic mathematical inconsistencies.
            </p>
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Crucial Principle:</strong> TrueLens AI provides an <strong>estimated probability</strong>, not legal or definitive proof. No automated algorithm can guarantee 100% detection accuracy because advanced generative models are constantly evolving.
              </span>
            </div>
          </div>

          {/* Section 2: What we analyse */}
          <div>
            <h4 className="flex items-center gap-2 text-base font-semibold text-white mb-3">
              <Eye className="h-4 w-4 text-violet-400" />
              <span>Key Forensic Indicators Examined</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
                <h5 className="font-semibold text-white text-xs mb-1 text-cyan-300">
                  1. Anatomy & Geometry
                </h5>
                <p className="text-xs text-neutral-400">
                  Generative models often struggle with complex joints, knuckle folds, finger counts, tooth count, ear cartilage symmetry, and iris pupil roundness.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
                <h5 className="font-semibold text-white text-xs mb-1 text-cyan-300">
                  2. Lighting & Reflections
                </h5>
                <p className="text-xs text-neutral-400">
                  Physics violations: light sources cast conflicting shadows, specular catchlights in eyeballs do not match ambient light directions, or mirrors reflect distorted objects.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
                <h5 className="font-semibold text-white text-xs mb-1 text-violet-300">
                  3. Diffusion Textures & Grain
                </h5>
                <p className="text-xs text-neutral-400">
                  Real cameras produce Poisson/Gaussian sensor noise. AI models often generate an overly smooth, "waxy" plastic sheen or repetitive non-physical micro-textures.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
                <h5 className="font-semibold text-white text-xs mb-1 text-violet-300">
                  4. Background Coherence & Text
                </h5>
                <p className="text-xs text-neutral-400">
                  Warped perspective convergence, background items melting into architecture, floating objects, and illegible glyphs mimicking real alphabets.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Video Analysis */}
          <div>
            <h4 className="flex items-center gap-2 text-base font-semibold text-white mb-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Multi-Frame Temporal Video Analysis</span>
            </h4>
            <p className="text-neutral-400">
              Unlike static images, video adds the dimension of time. TrueLens AI extracts representative keyframes distributed across the video timeline. We analyze whether facial features or background lines subtly morph, flicker, or drift across consecutive timestamps.
            </p>
          </div>

          {/* Section 4: Limitations */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2">
            <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Technical Limitations to Keep in Mind</span>
            </h5>
            <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
              <li>Heavy social media compression or downscaling can erase forensic sensor noise.</li>
              <li>Professional CGI, 3D VFX rendering, or intensive Photoshop retouching may trigger false AI indicators.</li>
              <li>Novel generative models with fine-tuned LoRAs or post-processors may mask known synthetic artifacts.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 bg-neutral-900/60 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
