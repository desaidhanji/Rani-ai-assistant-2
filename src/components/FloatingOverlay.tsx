import React, { useState } from 'react';
import { Mic, X, MessageSquare, Sparkles, Volume2 } from 'lucide-react';

interface FloatingOverlayProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onMicClick: () => void;
  onClose: () => void;
  lastReply?: string;
}

export const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
  isActive,
  isListening,
  isSpeaking,
  onMicClick,
  onClose,
  lastReply,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 select-none">
      {/* Expanded quick speech dialog */}
      {isExpanded && (
        <div className="w-72 p-4 rounded-2xl bg-slate-900/95 border border-pink-500/40 backdrop-blur-xl shadow-2xl text-white mb-2 animate-scale-up">
          <div className="flex items-center justify-between pb-2 border-b border-pink-500/20">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🌸</span>
              <span className="text-xs font-bold text-pink-300">Rani Floating Assistant</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-200 mt-2.5 min-h-[40px] leading-relaxed">
            {lastReply || "Hey! Rani here, boliyen kaise madad karoon? 💕"}
          </p>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] text-pink-300/80">SYSTEM_ALERT_WINDOW</span>
            <button
              onClick={onMicClick}
              className={`p-2 rounded-full cursor-pointer transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Orb Button */}
      <div className="relative group">
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 blur opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
        <button
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
            onMicClick();
          }}
          className={`relative w-14 h-14 rounded-full p-0.5 shadow-2xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
            isListening ? 'ring-4 ring-pink-400' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #ec4899, #a855f7, #6366f1)',
          }}
          title="Rani Floating Overlay (Tap to speak)"
        >
          <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-white">
            {isListening ? (
              <Mic className="w-6 h-6 text-pink-400 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-6 h-6 text-fuchsia-400 animate-pulse" />
            ) : (
              <span className="text-2xl">🌸</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
