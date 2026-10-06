import React, { useState } from 'react';
import { Eye, Scan, Sparkles, CheckCircle2, ShieldCheck, X, Camera, Zap } from 'lucide-react';
import { ScreenVisionState } from '../types';

interface ScreenVisionOverlayProps {
  visionState: ScreenVisionState;
  onCloseWatching?: () => void;
  onRequestCapture?: (prompt?: string) => void;
}

export const ScreenVisionOverlay: React.FC<ScreenVisionOverlayProps> = ({
  visionState,
  onCloseWatching,
  onRequestCapture,
}) => {
  if (!visionState.isWatching && !visionState.analyzing && !visionState.lastScreenshot) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-40 flex flex-col items-end gap-2 animate-fade-in pointer-events-auto select-none">
      {/* "Rani is watching" Floating Active Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 border border-cyan-500/50 shadow-xl backdrop-blur-md text-white">
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 relative" />
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold tracking-wide">
          <Eye className="w-3.5 h-3.5 text-cyan-300" />
          <span className="bg-gradient-to-r from-cyan-300 to-sky-200 bg-clip-text text-transparent">
            Rani is watching
          </span>
        </div>

        {visionState.analyzing ? (
          <span className="text-[10px] text-cyan-300 animate-pulse font-mono flex items-center gap-1 bg-cyan-500/10 px-1.5 py-0.5 rounded">
            <Scan className="w-3 h-3 animate-spin" />
            Analyzing Screen...
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono">MediaProjection Active</span>
        )}

        {onCloseWatching && (
          <button
            onClick={onCloseWatching}
            className="text-slate-400 hover:text-white text-xs ml-1 cursor-pointer"
            title="Close Screen Vision"
          >
            ✕
          </button>
        )}
      </div>

      {/* Action result banner if detected */}
      {visionState.detectedAction && (
        <div className="max-w-xs p-3 rounded-2xl bg-slate-900/95 border border-pink-500/40 shadow-2xl backdrop-blur-md text-white space-y-1.5 animate-scale-up">
          <div className="flex items-center justify-between text-[11px] text-pink-300 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Vision Action Executed
            </span>
            <span className="text-[10px] bg-pink-500/20 px-1.5 py-0.5 rounded text-pink-200">
              Accessibility Tap
            </span>
          </div>

          <p className="text-xs font-bold text-white">
            {visionState.detectedAction.target}
          </p>

          <p className="text-[11px] text-slate-300">
            {visionState.detectedAction.reason}
          </p>

          {visionState.lastScreenshot && (
            <div className="mt-2 rounded-lg overflow-hidden border border-slate-800 max-h-24 relative group">
              <img
                src={visionState.lastScreenshot}
                alt="Captured Screen"
                className="w-full h-auto object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-pink-500/10 border-2 border-dashed border-pink-400 animate-pulse pointer-events-none" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
