import React from 'react';
import { BatteryCharging, ShieldAlert, CheckCircle2, Zap, Smartphone, Radio } from 'lucide-react';

interface BatteryOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnrestricted: boolean;
  onToggleUnrestricted: () => void;
}

export const BatteryOptimizationModal: React.FC<BatteryOptimizationModalProps> = ({
  isOpen,
  onClose,
  isUnrestricted,
  onToggleUnrestricted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-b border-amber-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <BatteryCharging className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                24/7 Always-Listening & Battery Guide
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Keep "Hey Rani" active in background without system shutdowns
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
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-100/90 leading-relaxed space-y-1">
              <span className="font-semibold text-white block">Why this is critical for 24/7 Rani:</span>
              <p>
                Android's aggressive power management (Doze Mode) automatically puts background apps to
                sleep after 10–15 minutes of inactivity.
              </p>
              <p className="text-amber-200/80">
                To keep Rani listening for "Hey Rani" 24/7 hands-free, Android battery optimization
                must be set to <strong>"Unrestricted"</strong>.
              </p>
            </div>
          </div>

          {/* Low power explanation */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-pink-300 font-semibold">
              <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>Low-Power Wake Word Architecture</span>
            </div>
            <p className="text-slate-400">
              Rani does <strong>NOT</strong> run continuous heavy speech recognition or LLM inference in the background.
              She uses a lightweight, low-power audio energy spotter that consumes minimal battery (less than ~1.2% per day). Full AI processing only fires after "Hey Rani" is heard!
            </p>
          </div>

          {/* Android Settings Toggle Simulation */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Android Battery Optimization Status
                </span>
                <span className="text-[11px] text-slate-400">
                  {isUnrestricted ? 'Status: Unrestricted (24/7 Active)' : 'Status: Optimized (May sleep in background)'}
                </span>
              </div>
              <button
                onClick={onToggleUnrestricted}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                  isUnrestricted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                }`}
              >
                {isUnrestricted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unrestricted</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Disable Optimization</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Native Intent: ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isUnrestricted ? '✨ Background keepalive active!' : 'Recommended for 24/7 hands-free mode'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Got it (समझ गया)
          </button>
        </div>
      </div>
    </div>
  );
};
