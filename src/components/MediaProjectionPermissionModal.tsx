import React from 'react';
import { Eye, ShieldCheck, Sparkles, CheckCircle2, Smartphone } from 'lucide-react';

interface MediaProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmGrant: () => void;
}

export const MediaProjectionPermissionModal: React.FC<MediaProjectionModalProps> = ({
  isOpen,
  onClose,
  onConfirmGrant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border-b border-cyan-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Rani Screen Vision (MediaProjection)
              </h3>
              <p className="text-xs text-cyan-200/80 mt-0.5">
                Android Screen Capture & Multimodal AI Vision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
            <span className="font-semibold text-white block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              How Rani "Sees & Acts" on your screen:
            </span>
            <p className="leading-relaxed text-slate-300">
              When you say commands like <em>"Isme se sabse sasta wala select karo"</em> or <em>"Rani screen dekh kar batao"</em>, Rani takes an on-demand screenshot via Android's MediaProjection API and passes it to Gemini 3.8 Flash Vision.
            </p>
            <p className="text-cyan-200/80 font-medium">
              She visually identifies buttons, products, and prices, and then uses AccessibilityService to tap the target directly!
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Only captures when you explicitly ask — no silent recordings.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>A glowing "Rani is watching" badge appears whenever vision is active.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Android Intent: MediaProjectionManager.createScreenCaptureIntent()</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Not Now
          </button>
          <button
            onClick={() => {
              onConfirmGrant();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Grant Screen Vision</span>
          </button>
        </div>
      </div>
    </div>
  );
};
