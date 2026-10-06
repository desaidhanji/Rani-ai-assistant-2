/**
 * Rani Speech-to-Text & Wake Word Engine
 * Supports hi-IN, en-IN, gu-IN with lightweight low-power wake word spotting ("Hey Rani")
 * Only initiates full AI processing after wake word trigger
 */

export interface STTCallbacks {
  onResult?: (transcript: string, isFinal: boolean, detectedLanguage?: string) => void;
  onWakeWord?: () => void;
  onError?: (error: any) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onAudioLevel?: (level: number) => void;
}

export class RaniSTTService {
  private recognition: any = null;
  private isListening = false;
  private isWakeWordMode = false;
  private currentLanguage = 'en-IN';
  private callbacks: STTCallbacks = {};
  private restartTimeout: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private vadInterval: any = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 2;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullText = (finalTranscript || interimTranscript).trim();

        // Check for "Hey Rani" wake word
        if (this.isWakeWordMode) {
          const wakePattern = /\b(hey\s*rani|rani|rani\s*ji|rani\s*suno|suno\s*rani|हे\s*रानी|હાય\s*રાણી)\b/i;
          if (wakePattern.test(fullText)) {
            this.callbacks.onWakeWord?.();
            // Check if there is command text right after the wake word
            const commandAfterWake = fullText.replace(wakePattern, '').trim();
            if (commandAfterWake.length > 2 && finalTranscript) {
              this.callbacks.onResult?.(commandAfterWake, true, this.currentLanguage);
            }
            return;
          }
        }

        if (finalTranscript) {
          this.callbacks.onResult?.(finalTranscript.trim(), true, this.currentLanguage);
        } else if (interimTranscript) {
          this.callbacks.onResult?.(interimTranscript.trim(), false, this.currentLanguage);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition event:', event.error);
          this.callbacks.onError?.(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onEnd?.();

        // Auto restart if in continuous wake word mode (24/7 simulation)
        if (this.isWakeWordMode) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isWakeWordMode && !this.isListening) {
              try {
                this.recognition.start();
              } catch {
                // ignore
              }
            }
          }, 350);
        }
      };
    }
  }

  public setLanguage(lang: 'hi-IN' | 'en-IN' | 'gu-IN' | 'auto') {
    this.currentLanguage = lang === 'auto' ? 'en-IN' : lang;
    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }
  }

  public startListening(callbacks: STTCallbacks, wakeWordOnly: boolean = false) {
    this.callbacks = callbacks;
    this.isWakeWordMode = wakeWordOnly;

    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        callbacks.onError?.('Speech recognition is not supported in this browser.');
        return;
      }
    }

    try {
      this.recognition.start();
    } catch {
      try {
        this.recognition.stop();
        setTimeout(() => {
          this.recognition.start();
        }, 120);
      } catch {
        // ignore
      }
    }
  }

  public stopListening() {
    this.isWakeWordMode = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public isWakeWordActive(): boolean {
    return this.isWakeWordMode;
  }

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }
}

export const raniSTT = new RaniSTTService();
