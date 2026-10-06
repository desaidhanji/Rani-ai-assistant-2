import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, Radio, Zap, Heart, Flame, Wind, Smile, ShieldAlert } from 'lucide-react';
import { EmotionType } from '../types';

interface RaniOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  emotion?: EmotionType;
  onEmotionChange?: (emotion: EmotionType) => void;
  onClick: () => void;
  isWakeWordActive?: boolean;
  is24x7Active?: boolean;
  isWatchingScreen?: boolean;
}

interface EmotionConfig {
  name: EmotionType;
  label: string;
  hindiLabel: string;
  emoji: string;
  pulseSpeed: number; // in seconds (lower = faster)
  flowSpeed: number;  // in seconds for rotating ambient fluid
  textColor: string;
  bgBadge: string;
  borderBadge: string;
  accentColor: string;
  glowAura: string;
  glowSecondary: string;
  gradientAura: string;
  rimGradient: string;
  innerFluid: string;
  speedDesc: string;
  vibeSummary: string;
}

export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  excited: {
    name: 'excited',
    label: 'Rani is excited!',
    hindiLabel: 'उत्साहित ✨',
    emoji: '⚡',
    pulseSpeed: 0.85,
    flowSpeed: 2.6,
    textColor: 'text-amber-300',
    bgBadge: 'bg-amber-500/15',
    borderBadge: 'border-amber-400/40',
    accentColor: '#f59e0b',
    glowAura: 'rgba(245, 158, 11, 0.75)',
    glowSecondary: 'rgba(244, 63, 94, 0.65)',
    gradientAura: 'from-amber-400 via-orange-500 to-rose-500',
    rimGradient: 'linear-gradient(135deg, #fbbf24, #f97316, #f43f5e, #e11d48)',
    innerFluid: 'conic-gradient(from 0deg, rgba(245, 158, 11, 0.4), rgba(244, 63, 94, 0.45), rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 0.4))',
    speedDesc: 'Ultra-fast 0.85s electric pulse',
    vibeSummary: 'High energy, vibrant sparks & swift rhythms',
  },
  caring: {
    name: 'caring',
    label: 'Rani is here for you',
    hindiLabel: 'स्नेही 💕',
    emoji: '💕',
    pulseSpeed: 3.4,
    flowSpeed: 9.5,
    textColor: 'text-pink-300',
    bgBadge: 'bg-pink-500/15',
    borderBadge: 'border-pink-400/40',
    accentColor: '#fb7185',
    glowAura: 'rgba(244, 114, 182, 0.6)',
    glowSecondary: 'rgba(216, 180, 254, 0.5)',
    gradientAura: 'from-pink-400 via-rose-400 to-purple-400',
    rimGradient: 'linear-gradient(135deg, #f472b6, #fb7185, #c084fc, #ec4899)',
    innerFluid: 'radial-gradient(circle at center, rgba(244, 114, 182, 0.35) 0%, rgba(251, 113, 133, 0.25) 50%, rgba(192, 132, 252, 0.15) 100%)',
    speedDesc: 'Calm flowing 3.4s breathe cycle',
    vibeSummary: 'Warm blush hues, soothing gentle waves',
  },
  calm: {
    name: 'calm',
    label: 'Rani is peaceful',
    hindiLabel: 'शांत 🕊️',
    emoji: '🕊️',
    pulseSpeed: 4.5,
    flowSpeed: 12.0,
    textColor: 'text-cyan-300',
    bgBadge: 'bg-cyan-500/15',
    borderBadge: 'border-cyan-400/40',
    accentColor: '#22d3ee',
    glowAura: 'rgba(34, 211, 238, 0.55)',
    glowSecondary: 'rgba(56, 189, 248, 0.45)',
    gradientAura: 'from-teal-300 via-cyan-400 to-blue-500',
    rimGradient: 'linear-gradient(135deg, #5eead4, #38bdf8, #6366f1, #0ea5e9)',
    innerFluid: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.3) 0%, rgba(45, 212, 191, 0.2) 60%, rgba(99, 102, 241, 0.1) 100%)',
    speedDesc: 'Serene tranquil 4.5s tide cycle',
    vibeSummary: 'Aquamarine ocean drift, meditative glow',
  },
  happy: {
    name: 'happy',
    label: 'Rani is happy',
    hindiLabel: 'प्रसन्न 😊',
    emoji: '😊',
    pulseSpeed: 1.5,
    flowSpeed: 4.5,
    textColor: 'text-yellow-300',
    bgBadge: 'bg-yellow-500/15',
    borderBadge: 'border-yellow-400/40',
    accentColor: '#facc15',
    glowAura: 'rgba(250, 204, 21, 0.65)',
    glowSecondary: 'rgba(52, 211, 153, 0.45)',
    gradientAura: 'from-yellow-400 via-amber-400 to-emerald-400',
    rimGradient: 'linear-gradient(135deg, #facc15, #fbbf24, #34d399, #f59e0b)',
    innerFluid: 'conic-gradient(from 45deg, rgba(250, 204, 21, 0.35), rgba(245, 158, 11, 0.3), rgba(52, 211, 153, 0.25), rgba(250, 204, 21, 0.35))',
    speedDesc: 'Upbeat 1.5s cheerful cadence',
    vibeSummary: 'Sunny gold & spring green vibrancy',
  },
  playful: {
    name: 'playful',
    label: 'Rani is feeling playful',
    hindiLabel: 'चंचल 🌸',
    emoji: '🌸',
    pulseSpeed: 1.15,
    flowSpeed: 3.5,
    textColor: 'text-fuchsia-300',
    bgBadge: 'bg-fuchsia-500/15',
    borderBadge: 'border-fuchsia-400/40',
    accentColor: '#e879f9',
    glowAura: 'rgba(232, 121, 249, 0.7)',
    glowSecondary: 'rgba(168, 85, 247, 0.55)',
    gradientAura: 'from-fuchsia-400 via-pink-500 to-violet-500',
    rimGradient: 'linear-gradient(135deg, #e879f9, #ec4899, #8b5cf6, #d946ef)',
    innerFluid: 'conic-gradient(from 180deg, rgba(232, 121, 249, 0.35), rgba(236, 72, 153, 0.35), rgba(139, 92, 246, 0.3), rgba(232, 121, 249, 0.35))',
    speedDesc: 'Brisk 1.15s sparkling tempo',
    vibeSummary: 'Electric magenta & whimsical bursts',
  },
  concerned: {
    name: 'concerned',
    label: 'Rani is caring for you',
    hindiLabel: 'सहयोगी 🤗',
    emoji: '🤗',
    pulseSpeed: 2.3,
    flowSpeed: 6.5,
    textColor: 'text-indigo-300',
    bgBadge: 'bg-indigo-500/15',
    borderBadge: 'border-indigo-400/40',
    accentColor: '#818cf8',
    glowAura: 'rgba(99, 102, 241, 0.6)',
    glowSecondary: 'rgba(129, 140, 248, 0.5)',
    gradientAura: 'from-blue-400 via-indigo-400 to-purple-400',
    rimGradient: 'linear-gradient(135deg, #60a5fa, #818cf8, #a855f7, #6366f1)',
    innerFluid: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.35) 0%, rgba(129, 140, 248, 0.25) 55%, rgba(168, 85, 247, 0.15) 100%)',
    speedDesc: 'Attentive 2.3s steady cadence',
    vibeSummary: 'Protective periwinkle & gentle blue aura',
  },
  empathetic: {
    name: 'empathetic',
    label: 'Rani understands you',
    hindiLabel: 'सहानुभूति 💜',
    emoji: '💜',
    pulseSpeed: 2.7,
    flowSpeed: 7.5,
    textColor: 'text-purple-300',
    bgBadge: 'bg-purple-500/15',
    borderBadge: 'border-purple-400/40',
    accentColor: '#c084fc',
    glowAura: 'rgba(192, 132, 252, 0.65)',
    glowSecondary: 'rgba(244, 114, 182, 0.5)',
    gradientAura: 'from-purple-400 via-fuchsia-400 to-rose-400',
    rimGradient: 'linear-gradient(135deg, #c084fc, #f472b6, #fb7185, #9333ea)',
    innerFluid: 'radial-gradient(circle at center, rgba(192, 132, 252, 0.35) 0%, rgba(244, 114, 182, 0.25) 50%, rgba(147, 51, 234, 0.15) 100%)',
    speedDesc: 'Warm harmonic 2.7s pulse',
    vibeSummary: 'Soft lilac & compassionate resonance',
  },
};

export const RaniOrb: React.FC<RaniOrbProps> = ({
  state,
  emotion = 'caring',
  onEmotionChange,
  onClick,
  isWakeWordActive,
  is24x7Active,
  isWatchingScreen,
}) => {
  const [showMoodTray, setShowMoodTray] = useState(false);

  // Active emotion configuration
  const config = EMOTION_CONFIGS[emotion] || EMOTION_CONFIGS.caring;

  // Compute dynamic pulse duration based on emotion AND operational state
  // When listening or speaking, cadence accelerates slightly while maintaining emotional ratio
  const getEffectivePulseSpeed = () => {
    let base = config.pulseSpeed;
    if (state === 'listening') return Math.max(0.6, base * 0.7);
    if (state === 'speaking') return Math.max(0.7, base * 0.85);
    if (state === 'thinking') return 1.0;
    return base;
  };

  const effectivePulseSpeed = getEffectivePulseSpeed();
  const bounceSpeed = Math.max(0.4, effectivePulseSpeed * 0.45);

  const ALL_EMOTIONS: EmotionType[] = [
    'excited',
    'caring',
    'calm',
    'happy',
    'playful',
    'concerned',
    'empathetic',
  ];

  return (
    <div className="flex flex-col items-center justify-center select-none py-2 w-full max-w-md mx-auto">
      {/* Outer interactive glowing container */}
      <div
        className="relative group cursor-pointer flex items-center justify-center"
        onClick={onClick}
        title="Tap to talk to Rani or activate voice commands"
      >
        {/* Layer 1: Ambient emotional glowing aura */}
        <div
          className={`absolute -inset-6 rounded-full blur-3xl transition-colors duration-1000 ${
            state === 'thinking' ? 'opacity-85' : 'opacity-70 group-hover:opacity-95'
          }`}
          style={{
            background: `radial-gradient(circle, ${config.glowAura} 0%, ${config.glowSecondary} 55%, transparent 75%)`,
            animation: `raniOrbPulse ${effectivePulseSpeed}s ease-in-out infinite`,
          }}
        />

        {/* Layer 2: Emotional ripple wave rings */}
        <div
          className="absolute -inset-5 rounded-full pointer-events-none"
          style={{
            border: `2px solid ${config.accentColor}`,
            animation: `raniOrbRipple ${effectivePulseSpeed}s cubic-bezier(0.2, 0.8, 0.4, 1) infinite`,
          }}
        />
        <div
          className="absolute -inset-5 rounded-full pointer-events-none"
          style={{
            border: `1.5px solid ${config.accentColor}`,
            animation: `raniOrbRipple ${effectivePulseSpeed}s cubic-bezier(0.2, 0.8, 0.4, 1) ${(effectivePulseSpeed * 0.5).toFixed(2)}s infinite`,
          }}
        />

        {/* Screen vision scanning radar ring if active */}
        {isWatchingScreen && (
          <div className="absolute -inset-9 rounded-full border-2 border-cyan-400/60 animate-ping duration-1000 pointer-events-none" />
        )}

        {/* 24x7 Active orbital pulse ring */}
        {is24x7Active && (
          <div className="absolute -inset-10 rounded-full border border-emerald-400/40 pointer-events-none animate-pulse" />
        )}

        {/* Layer 3: Outer Chromatic Ring / Sphere Bevel */}
        <div
          className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1.5 flex items-center justify-center transition-all duration-500 shadow-2xl ${
            state === 'listening'
              ? 'scale-105'
              : state === 'speaking'
              ? 'scale-103'
              : 'group-hover:scale-105'
          }`}
          style={{
            background: config.rimGradient,
            boxShadow: `0 0 35px ${config.glowAura}, 0 0 15px ${config.glowSecondary}`,
          }}
        >
          {/* Layer 4: Inner Orb Sphere */}
          <div className="w-full h-full rounded-full bg-slate-950/92 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden border border-white/20">
            {/* Swirling fluid gradient interior */}
            <div
              className="absolute -inset-4 transition-all duration-1000 pointer-events-none"
              style={{
                background: config.innerFluid,
                animation: `raniOrbFlow ${config.flowSpeed}s linear infinite`,
              }}
            />

            {/* Drifting fluid SVG wave ribbon in the bottom hemisphere */}
            <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none opacity-40 overflow-hidden">
              <svg
                viewBox="0 0 400 100"
                className="w-[200%] h-full"
                style={{
                  animation: `raniWaveDrift ${config.flowSpeed * 0.7}s linear infinite`,
                  color: config.accentColor,
                }}
              >
                <path
                  d="M0 40 Q 50 10, 100 40 T 200 40 T 300 40 T 400 40 T 500 40 T 600 40 T 700 40 T 800 40 V 100 H 0 Z"
                  fill="currentColor"
                  opacity="0.25"
                />
                <path
                  d="M0 50 Q 50 75, 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50 T 700 50 T 800 50 V 100 H 0 Z"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
            </div>

            {/* Layer 5: Center Core Icon & Dynamic Equalizer */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 text-white">
              {state === 'listening' ? (
                <>
                  <div
                    className="p-3.5 rounded-full shadow-lg transition-colors duration-300"
                    style={{
                      backgroundColor: config.accentColor,
                      boxShadow: `0 0 20px ${config.glowAura}`,
                      animation: `raniOrbPulse ${effectivePulseSpeed}s ease-in-out infinite`,
                    }}
                  >
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  {/* Dynamic wave visualizer bars jumping to emotion frequency */}
                  <div className="flex items-center gap-1.5 mt-1.5 h-6">
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: config.accentColor,
                        height: '14px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0s infinite`,
                      }}
                    />
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: '#ffffff',
                        height: '24px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.1s infinite`,
                      }}
                    />
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: config.accentColor,
                        height: '30px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.2s infinite`,
                      }}
                    />
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: '#ffffff',
                        height: '22px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.15s infinite`,
                      }}
                    />
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: config.accentColor,
                        height: '14px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.05s infinite`,
                      }}
                    />
                  </div>
                </>
              ) : state === 'thinking' ? (
                <>
                  <div
                    className="p-3.5 rounded-full shadow-lg"
                    style={{
                      backgroundColor: config.accentColor,
                      boxShadow: `0 0 25px ${config.glowAura}`,
                      animation: `raniOrbFlow 2s linear infinite`,
                    }}
                  >
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider animate-pulse text-white/90">
                    सोच रही हूँ...
                  </span>
                </>
              ) : state === 'speaking' ? (
                <>
                  <div
                    className="p-3.5 rounded-full shadow-lg transition-colors"
                    style={{
                      backgroundColor: config.accentColor,
                      boxShadow: `0 0 22px ${config.glowAura}`,
                      animation: `raniOrbPulse ${effectivePulseSpeed}s ease-in-out infinite`,
                    }}
                  >
                    <Volume2 className="w-7 h-7 text-white" />
                  </div>
                  {/* Dynamic speaking equalizer bars */}
                  <div className="flex items-center gap-1.5 mt-1.5 h-6">
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: config.accentColor,
                        height: '18px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.1s infinite`,
                      }}
                    />
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: '#ffffff',
                        height: '28px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.25s infinite`,
                      }}
                    />
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: config.accentColor,
                        height: '20px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.15s infinite`,
                      }}
                    />
                    <span
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: '#ffffff',
                        height: '26px',
                        animation: `raniBarWave ${bounceSpeed}s ease-in-out 0.3s infinite`,
                      }}
                    />
                  </div>
                </>
              ) : (
                /* Idle state with dynamic emotion rhythm */
                <>
                  <div
                    className="p-3.5 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: config.accentColor,
                      boxShadow: `0 0 16px ${config.glowAura}`,
                    }}
                  >
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span
                      className="text-xs font-bold tracking-widest uppercase"
                      style={{ color: config.accentColor }}
                    >
                      RANI
                    </span>
                    {/* Subtle rhythmic breathing indicator */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: config.accentColor,
                          animation: `raniOrbPulse ${effectivePulseSpeed}s ease-in-out infinite`,
                        }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-white"
                        style={{
                          animation: `raniOrbPulse ${effectivePulseSpeed}s ease-in-out ${(effectivePulseSpeed * 0.2).toFixed(2)}s infinite`,
                        }}
                      />
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: config.accentColor,
                          animation: `raniOrbPulse ${effectivePulseSpeed}s ease-in-out infinite`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Glowing orbital inner rim shimmer */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `1px solid ${config.accentColor}`,
                opacity: 0.35,
              }}
            />
          </div>
        </div>
      </div>

      {/* Primary status pill with emotional awareness and live pulse speed badge */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-xl transition-all">
        {/* State Ping Light */}
        <span
          className="w-2.5 h-2.5 rounded-full transition-colors"
          style={{
            backgroundColor: config.accentColor,
            animation: `raniOrbPulse ${effectivePulseSpeed}s ease-in-out infinite`,
          }}
        />

        {/* State description */}
        <span className="text-xs text-slate-100 font-medium">
          {state === 'listening'
            ? 'Rani is listening... (बोलिए)'
            : state === 'thinking'
            ? 'Rani is thinking...'
            : state === 'speaking'
            ? 'Rani is speaking'
            : is24x7Active
            ? '24/7 Listening for "Hey Rani"'
            : isWakeWordActive
            ? 'Say "Hey Rani" or Tap'
            : 'Tap mic to talk to Rani'}
        </span>

        {/* Active Emotion Badge with quick modal trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMoodTray((prev) => !prev);
          }}
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${config.bgBadge} ${config.borderBadge} ${config.textColor} hover:brightness-110`}
          title="Click to test or switch active emotion"
        >
          <span>{config.emoji}</span>
          <span>{config.hindiLabel}</span>
          <span className="text-[10px] opacity-70 ml-0.5">({effectivePulseSpeed.toFixed(1)}s)</span>
        </button>

        {is24x7Active && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
            24/7
          </span>
        )}
      </div>

      {/* Dynamic Emotion Speed Indicator Bar */}
      <div className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accentColor }} />
        <span className="font-medium text-slate-300">{config.speedDesc}</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400 hidden sm:inline">{config.vibeSummary}</span>
      </div>

      {/* Interactive Emotion Palette Selector (Allows instant switching to compare excited vs caring vs calm etc.) */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto max-w-full px-2 py-1 bg-slate-950/60 rounded-xl border border-slate-800/60 no-scrollbar">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1 pr-0.5 shrink-0">
          Mood:
        </span>
        {ALL_EMOTIONS.map((em) => {
          const cfg = EMOTION_CONFIGS[em];
          const isSelected = emotion === em;
          return (
            <button
              key={em}
              onClick={() => onEmotionChange?.(em)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? `${cfg.bgBadge} ${cfg.borderBadge} ${cfg.textColor} border shadow-sm ring-1 ring-white/10 font-bold scale-105`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
              title={`${cfg.label} - ${cfg.speedDesc}`}
            >
              <span>{cfg.emoji}</span>
              <span className="capitalize">{em}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
