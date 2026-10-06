import React, { useEffect } from 'react';
import { ShieldAlert, Check, X, Mic, Volume2 } from 'lucide-react';
import { PendingActionConfirmation } from '../types';

interface QuickConfirmationBannerProps {
  confirmation: PendingActionConfirmation | null;
  onConfirm: () => void;
  onCancel: () => void;
  onPlayPrompt?: (prompt: string) => void;
}

export const QuickConfirmationBanner: React.FC<QuickConfirmationBannerProps> = ({
  confirmation,
  onConfirm,
  onCancel,
  onPlayPrompt,
}) => {
  if (!confirmation) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-scale-up">
      <div className="rounded-3xl bg-slate-900/95 border border-pink-500/40 shadow-2xl p-4.5 backdrop-blur-xl text-white space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Quick Confirmation Needed
              </span>
              <span className="text-[10px] text-pink-300 font-medium">
                High-Risk Protected Action
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            Say "Haan" or "Cancel"
          </span>
        </div>

        {/* Action Description */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <p className="text-xs text-white font-semibold">{confirmation.title}</p>
          <p className="text-[11px] text-slate-300 mt-0.5">{confirmation.description}</p>
          <p className="text-xs text-pink-200 mt-2 italic flex items-center gap-1.5">
            <span>"{confirmation.verbalPrompt}"</span>
            {onPlayPrompt && (
              <button
                onClick={() => onPlayPrompt(confirmation.verbalPrompt)}
                className="text-pink-400 hover:text-pink-200 cursor-pointer"
                title="Hear Rani prompt"
              >
                <Volume2 className="w-3.5 h-3.5 inline" />
              </button>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>Cancel (रहने दो)</span>
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Haan, Bhej do (Confirm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
