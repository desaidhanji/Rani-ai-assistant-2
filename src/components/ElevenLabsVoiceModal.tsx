import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  Square,
  Sparkles,
  Check,
  Search,
  Filter,
  Heart,
  RefreshCw,
  Crown,
  Flame,
  Zap,
} from 'lucide-react';
import { ElevenLabsVoice } from '../types';
import {
  ELEVENLABS_VOICE_CATALOG,
  DEFAULT_RANI_VOICE_ID,
} from '../constants/elevenLabsVoices';
import { vaultService } from '../services/vaultService';
import { raniTTS } from '../services/ttsService';

interface ElevenLabsVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSelect?: (voice: ElevenLabsVoice) => void;
}

export const ElevenLabsVoiceModal: React.FC<ElevenLabsVoiceModalProps> = ({
  isOpen,
  onClose,
  onVoiceSelect,
}) => {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>(ELEVENLABS_VOICE_CATALOG);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(DEFAULT_RANI_VOICE_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<'all' | 'sweet' | 'influencer' | 'polite' | 'caring' | 'story' | 'smart'>('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const activeId = vaultService.getSelectedVoiceId();
      setSelectedVoiceId(activeId);
    } else {
      raniTTS.stop();
      setPlayingVoiceId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredVoices = voices.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.descriptive.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStyle =
      styleFilter === 'all'
        ? true
        : styleFilter === 'sweet'
        ? voice.descriptive.includes('sweet') || voice.descriptive.includes('bubbly')
        : styleFilter === 'influencer'
        ? voice.descriptive.includes('lively') || voice.descriptive.includes('sassy') || voice.useCase === 'social_media'
        : styleFilter === 'polite'
        ? voice.descriptive.includes('polite') || voice.descriptive.includes('respectful')
        : styleFilter === 'caring'
        ? voice.descriptive.includes('caring') || voice.descriptive.includes('reassuring') || voice.descriptive.includes('gentle')
        : styleFilter === 'story'
        ? voice.descriptive.includes('poetic') || voice.descriptive.includes('melodious') || voice.useCase === 'narrative_story'
        : styleFilter === 'smart'
        ? voice.descriptive.includes('smart') || voice.descriptive.includes('professional') || voice.descriptive.includes('clear')
        : true;

    return matchesSearch && matchesStyle;
  });

  const handlePreviewVoice = (voice: ElevenLabsVoice) => {
    if (playingVoiceId === voice.id) {
      raniTTS.stop();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);
    const sampleText = `Namaste! Main ${voice.characterName} hoon, aapki Hindi voice companion. Kaise ho aap? 💕`;

    raniTTS.previewVoice(voice.id, sampleText, voice.previewUrl, {
      emotion: 'excited',
      onEnd: () => setPlayingVoiceId(null),
      onError: () => setPlayingVoiceId(null),
    });
  };

  const handleSelectVoice = (voice: ElevenLabsVoice) => {
    vaultService.setSelectedVoice(voice.id, voice.characterName);
    setSelectedVoiceId(voice.id);
    onVoiceSelect?.(voice);

    setToastMessage(`"${voice.characterName}" ko Rani ki active Hindi awaz bana diya gaya hai!`);
    setTimeout(() => setToastMessage(null), 3500);

    // Speak quick confirmation in chosen voice
    const sampleText = `Arrey waah! Ab se meri Hindi awaz ${voice.characterName} character me sunai degi! 💕`;

    raniTTS.speak(sampleText, {
      voiceId: voice.id,
      emotion: 'happy',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-pink-500/30 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-950/70 via-purple-950/50 to-slate-900 border-b border-pink-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/30 flex items-center justify-center">
              <span className="text-2xl">👩‍🎤</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">
                  Hindi Female Voice Actors
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {voices.length} Hindi Actresses
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  🇮🇳 Pure Hindi Female Voice
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Sirf pyari aur expressive Hindi female voice actors — Rani ke liye apni pasandida awaz chuniye
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-purple-500/10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Hindi character, mood, tone..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Filter Pills for Hindi Female Styles */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Mood:
              </span>
              {[
                { id: 'all', label: 'All Hindi' },
                { id: 'sweet', label: '💖 Sweet & Bubbly' },
                { id: 'influencer', label: '✨ Desi Creator' },
                { id: 'polite', label: '🌸 Polite' },
                { id: 'caring', label: '🕊️ Caring' },
                { id: 'story', label: '👑 Melodious' },
                { id: 'smart', label: '🎓 Professional' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setStyleFilter(style.id as any)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    styleFilter === style.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-scale-up">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Voices Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredVoices.map((voice) => {
              const isSelected = selectedVoiceId === voice.id;
              const isPlaying = playingVoiceId === voice.id;

              return (
                <div
                  key={voice.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-950/60 via-purple-950/40 to-slate-900 border-pink-500/60 shadow-lg shadow-pink-500/15 ring-1 ring-pink-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-pink-500/30 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-pink-500/30 flex items-center justify-center text-xl shadow-sm">
                        {voice.avatarEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">
                            {voice.characterName}
                          </h4>
                          {voice.isRaniDefault && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> Rani Default
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Active Voice
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-pink-300/90 font-medium">
                          {voice.tagline}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 font-mono border border-pink-800/40">
                      🇮🇳 Hindi Female
                    </span>
                  </div>

                  {/* Description & Personality */}
                  <p className="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed">
                    {voice.description}
                  </p>

                  {/* Character Traits Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-300">
                      {voice.descriptive}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400">
                      {voice.language}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handlePreviewVoice(voice)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isPlaying
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Awaz Rokiye</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Sample Awaz Sunein</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSelectVoice(voice)}
                      disabled={isSelected}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                          : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-md shadow-pink-600/20 cursor-pointer'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Chuni Hui Awaz</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Awaz Set Karein</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVoices.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Koi bhi Hindi voice actor aapki search se match nahi hui.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStyleFilter('all');
                }}
                className="mt-2 text-xs text-pink-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            <span>
              Active Hindi Voice:{' '}
              <strong className="text-pink-300">
                {voices.find((v) => v.id === selectedVoiceId)?.characterName || 'Rani (Ananya)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const defaultVoice = voices.find((v) => v.id === DEFAULT_RANI_VOICE_ID);
                if (defaultVoice) handleSelectVoice(defaultVoice);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Reset to Rani Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-600/20"
            >
              Theek Hai (Done)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
