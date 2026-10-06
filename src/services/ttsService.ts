/**
 * Rani TTS Voice Engine
 * Warm, sweet, expressive female Indian voice synthesized with Web Speech API
 * & dynamic emotional prosody (pitch, rate, inflections)
 * Supports ElevenLabs upgraded voice plugin when connected
 */

import { EmotionType } from '../types';
import { vaultService } from './vaultService';

export interface SpeakOptions {
  language?: string;
  emotion?: EmotionType;
  voiceId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number) => void;
}

export class RaniTTSService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  /**
   * Find the sweetest, most natural female voice for given language
   */
  private pickBestVoice(targetLang: string = 'hi-IN'): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const langLower = targetLang.toLowerCase();

    // 1. Look for explicit Hindi female voice if Hindi/Hinglish
    if (langLower.startsWith('hi')) {
      const hindiVoice = this.voices.find(
        (v) =>
          v.lang.toLowerCase().includes('hi') &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('kalpana') ||
            v.name.toLowerCase().includes('swara') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('lekha'))
      );
      if (hindiVoice) return hindiVoice;

      const anyHindi = this.voices.find((v) => v.lang.toLowerCase().includes('hi'));
      if (anyHindi) return anyHindi;
    }

    // 2. Look for Gujarati voice
    if (langLower.startsWith('gu')) {
      const gujVoice = this.voices.find(
        (v) =>
          v.lang.toLowerCase().includes('gu') ||
          v.name.toLowerCase().includes('gujarati')
      );
      if (gujVoice) return gujVoice;
    }

    // 3. Look for Indian English female voice (en-IN)
    const indianEnglishFemale = this.voices.find(
      (v) =>
        v.lang.toLowerCase().includes('en-in') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('heera') ||
          v.name.toLowerCase().includes('neerja') ||
          v.name.toLowerCase().includes('google'))
    );
    if (indianEnglishFemale) return indianEnglishFemale;

    const anyIndianEnglish = this.voices.find((v) => v.lang.toLowerCase().includes('en-in'));
    if (anyIndianEnglish) return anyIndianEnglish;

    // 4. Fallback to high quality sweet female voices
    const softFemaleVoice = this.voices.find(
      (v) =>
        (v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('serena') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('female')) &&
        v.lang.toLowerCase().startsWith('en')
    );
    if (softFemaleVoice) return softFemaleVoice;

    // Default to first available voice
    return this.voices.find((v) => v.lang.startsWith('en')) || this.voices[0] || null;
  }

  /**
   * Calculate dynamic pitch & rate based on emotion tag
   */
  private getEmotionalProsody(emotion: EmotionType = 'caring'): { pitch: number; rate: number } {
    switch (emotion) {
      case 'excited':
        return { pitch: 1.35, rate: 1.08 };
      case 'concerned':
      case 'empathetic':
        return { pitch: 1.12, rate: 0.90 };
      case 'caring':
        return { pitch: 1.24, rate: 0.96 };
      case 'playful':
        return { pitch: 1.30, rate: 1.04 };
      case 'happy':
        return { pitch: 1.26, rate: 1.00 };
      case 'calm':
        return { pitch: 1.15, rate: 0.92 };
      default:
        return { pitch: 1.25, rate: 0.98 };
    }
  }

  /**
   * Speak text in Rani's warm, soft, cute expressive tone
   * Uses ElevenLabs natural expressive voice by default with Web Speech fallback
   */
  public async speak(text: string, options?: SpeakOptions): Promise<void> {
    this.stop();

    // Clean text of technical markdown or action payloads for speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[EMOTION:.*?\]/gi, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) {
      options?.onEnd?.();
      return;
    }

    // 1. Try ElevenLabs Expressive Voice by default
    try {
      const customKey = vaultService.getActiveVoicePlugin()?.apiKey;
      const targetVoiceId = options?.voiceId || vaultService.getSelectedVoiceId();
      const played = await this.playElevenLabsTTS(cleanText, options, customKey, targetVoiceId);
      if (played) return;
    } catch {
      // Fall through to browser SpeechSynthesis
    }

    // 2. Fallback to browser Web Speech API
    this.speakWithWebSpeech(cleanText, options);
  }

  /**
   * Preview a specific ElevenLabs voice character with a greeting
   */
  public async previewVoice(
    voiceId: string,
    sampleText: string = 'Namaste! Main Rani hoon, aapki sweet AI companion 💕',
    previewAudioUrl?: string,
    options?: SpeakOptions
  ): Promise<void> {
    this.stop();
    if (previewAudioUrl) {
      try {
        const audio = new Audio(previewAudioUrl);
        this.currentAudioElement = audio;
        this.isSpeaking = true;
        options?.onStart?.();

        audio.onended = () => {
          this.isSpeaking = false;
          this.currentAudioElement = null;
          options?.onEnd?.();
        };
        audio.onerror = async () => {
          // Fall back to live synthesis
          const customKey = vaultService.getActiveVoicePlugin()?.apiKey;
          await this.playElevenLabsTTS(sampleText, options, customKey, voiceId);
        };
        await audio.play();
        return;
      } catch {
        // Fall back to live synthesis
      }
    }

    const customKey = vaultService.getActiveVoicePlugin()?.apiKey;
    await this.playElevenLabsTTS(sampleText, options, customKey, voiceId);
  }

  /**
   * ElevenLabs realistic voice playback via server-side proxy
   */
  private async playElevenLabsTTS(
    text: string,
    options?: SpeakOptions,
    apiKey?: string,
    voiceId?: string
  ): Promise<boolean> {
    try {
      const targetVoice = voiceId || vaultService.getSelectedVoiceId();
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId: targetVoice,
          emotion: options?.emotion || 'caring',
          apiKey: apiKey && apiKey !== 'BUILTIN_STUDIO_KEY' ? apiKey : undefined,
        }),
      });

      if (!response.ok) return false;

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      this.isSpeaking = true;
      options?.onStart?.();

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        URL.revokeObjectURL(audioUrl);
        options?.onEnd?.();
      };

      audio.onerror = (e) => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        URL.revokeObjectURL(audioUrl);
        options?.onError?.(e);
      };

      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Web Speech API fallback
   */
  private speakWithWebSpeech(cleanText: string, options?: SpeakOptions): void {
    if (!this.synth) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Auto-detect language if needed
    let lang = options?.language || 'hi-IN';
    if (!options?.language || options.language === 'auto') {
      if (
        /[\u0900-\u097F]/.test(cleanText) ||
        /\b(karo|kardo|batao|kaam|main|hoon|kya|hai|bolo|lagao|aaj|kal)\b/i.test(cleanText)
      ) {
        lang = 'hi-IN';
      } else if (
        /[\u0A80-\u0AFF]/.test(cleanText) ||
        /\b(kem|cho|tamaru|su|che|aavjo|mane|tame)\b/i.test(cleanText)
      ) {
        lang = 'gu-IN';
      } else {
        lang = 'en-IN';
      }
    }

    utterance.lang = lang;
    const selectedVoice = this.pickBestVoice(lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Dynamically adjust pitch and speech rate based on emotion tag
    const emotion = options?.emotion || 'caring';
    const prosody = this.getEmotionalProsody(emotion);
    utterance.pitch = prosody.pitch;
    utterance.rate = prosody.rate;

    utterance.onstart = () => {
      this.isSpeaking = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options?.onError?.(e);
    };

    utterance.onboundary = (e) => {
      options?.onBoundary?.(e.charIndex);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const raniTTS = new RaniTTSService();
