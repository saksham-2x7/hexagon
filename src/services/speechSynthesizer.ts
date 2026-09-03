import { parseTextToTimeline, SpeechTimeline, VisemeCue, VisemeName } from '../utils/phonetics';

export interface ActiveSpeechState {
  isSpeaking: boolean;
  text: string;
  currentCue: VisemeCue;
  elapsed: number;
  duration: number;
}

type SpeechListener = (state: ActiveSpeechState) => void;

class SpeechSynthesizerManager {
  private timeline: SpeechTimeline | null = null;
  private startTime: number = 0;
  private isSpeaking: boolean = false;
  private currentText: string = '';
  private duration: number = 0;
  private listeners: Set<SpeechListener> = new Set();
  private animFrameId: number | null = null;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up voice list
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(cue: VisemeCue, elapsed: number) {
    const state: ActiveSpeechState = {
      isSpeaking: this.isSpeaking,
      text: this.currentText,
      currentCue: cue,
      elapsed,
      duration: this.duration
    };
    this.listeners.forEach(l => l(state));
  }

  /**
   * Returns the current phonetic viseme cue for the active utterance.
   * Can be safely queried 60fps inside Three.js useFrame without React overhead.
   */
  public getCurrentCue(): VisemeCue {
    if (!this.isSpeaking || !this.timeline) {
      return {
        viseme: 'viseme_sil',
        start: 0,
        end: 999999,
        intensity: 0,
        char: ''
      };
    }

    const elapsed = (performance.now() - this.startTime) / 1000;
    if (elapsed >= this.duration) {
      this.isSpeaking = false;
      return {
        viseme: 'viseme_sil',
        start: 0,
        end: 999999,
        intensity: 0,
        char: ''
      };
    }

    return this.timeline.getCueAt(elapsed);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Speak text out loud with browser SpeechSynthesis and generate real-time phoneme timeline.
   */
  public speak(
    text: string,
    options: {
      gender?: 'female' | 'male';
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
    } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      this.stop();

      const cleanText = text.trim();
      if (!cleanText) {
        resolve();
        return;
      }

      this.currentText = cleanText;
      const wordCount = cleanText.split(/\s+/).length;
      // Normal human conversational speech: ~150-165 words per min -> ~0.38s per word + pauses
      const estimatedDuration = Math.max((wordCount * 0.38) + 0.6, 1.2);
      this.duration = estimatedDuration;
      this.timeline = parseTextToTimeline(cleanText, estimatedDuration);
      this.startTime = performance.now();
      this.isSpeaking = true;

      // Real Audible Speech via window.speechSynthesis
      if ('speechSynthesis' in window && !this.isMuted) {
        window.speechSynthesis.cancel(); // Clear queue

        const utterance = new SpeechSynthesisUtterance(cleanText);
        this.currentUtterance = utterance;

        const voices = window.speechSynthesis.getVoices();
        const isMale = options.gender === 'male';

        // Find natural educator voices
        let preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && 
          (isMale ? /(male|david|daniel|george|ryan|james)/i.test(v.name) : /(female|zira|samantha|victoria|karen|sonia)/i.test(v.name))
        );

        if (!preferredVoice) {
          preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? (isMale ? 0.95 : 1.05);

        // Synchronize onboundary events for exact word alignment
        utterance.onboundary = (event) => {
          if (event.name === 'word' && this.timeline) {
            const charIdx = event.charIndex;
            const progress = cleanText.length > 0 ? charIdx / cleanText.length : 0;
            // Calibrate timeline clock to speech synthesizer progress
            const expectedTime = progress * this.duration;
            this.startTime = performance.now() - (expectedTime * 1000);
          }
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          options.onEnd?.();
          resolve();
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis playback note:', e);
          // Fallback to internal timer
          setTimeout(() => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            options.onEnd?.();
            resolve();
          }, estimatedDuration * 1000);
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('Speech synthesis speak invocation:', err);
          setTimeout(() => {
            this.isSpeaking = false;
            options.onEnd?.();
            resolve();
          }, estimatedDuration * 1000);
        }
      } else {
        // Muted or no SpeechSynthesis API: run timed silent articulation
        setTimeout(() => {
          this.isSpeaking = false;
          options.onEnd?.();
          resolve();
        }, estimatedDuration * 1000);
      }
    });
  }

  public stop() {
    this.isSpeaking = false;
    this.currentText = '';
    this.timeline = null;
    this.currentUtterance = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSynthesizer = new SpeechSynthesizerManager();
