/**
 * Advanced Grapheme-to-Phoneme / Oculus Viseme Parser
 * Maps English text and speech phonemes into the 15 standard Oculus Visemes
 * supported by Ready Player Me 3D avatars.
 */

export type VisemeName =
  | 'viseme_sil' // Silence / resting lips
  | 'viseme_PP'  // P, B, M (lips pressed together)
  | 'viseme_FF'  // F, V (lower lip on upper teeth)
  | 'viseme_TH'  // TH (tongue between teeth)
  | 'viseme_DD'  // T, D, L (tongue on alveolar ridge)
  | 'viseme_kk'  // K, G (velar)
  | 'viseme_CH'  // CH, SH, J (postalveolar rounded)
  | 'viseme_SS'  // S, Z, C (teeth together sibilant)
  | 'viseme_nn'  // N, NG (nasal)
  | 'viseme_RR'  // R (rhotic)
  | 'viseme_aa'  // AA, AH, AE (open jaw vowel)
  | 'viseme_E'   // EH, EY (mid front vowel)
  | 'viseme_I'   // IY, IH, EE (spread smile vowel)
  | 'viseme_O'   // OH, AO, OW (rounded open vowel)
  | 'viseme_U';  // UW, OO, W (puckered small vowel)

export interface VisemeCue {
  viseme: VisemeName;
  start: number;      // Seconds from utterance start
  end: number;        // Seconds from utterance start
  intensity: number;  // 0.0 to 1.0 target weight
  char: string;
}

export interface SpeechTimeline {
  text: string;
  duration: number;
  cues: VisemeCue[];
  getCueAt: (seconds: number) => VisemeCue;
}

// Phonetic pattern rules ordered by specificity (diphthongs & multi-chars first)
const PHONETIC_RULES: { match: RegExp; viseme: VisemeName; dur: number; intensity: number }[] = [
  { match: /^(th)/, viseme: 'viseme_TH', dur: 0.10, intensity: 0.90 },
  { match: /^(sh|ch)/, viseme: 'viseme_CH', dur: 0.11, intensity: 0.92 },
  { match: /^(ph)/, viseme: 'viseme_FF', dur: 0.09, intensity: 0.88 },
  { match: /^(wh)/, viseme: 'viseme_U', dur: 0.10, intensity: 0.85 },
  { match: /^(ee|ea)/, viseme: 'viseme_I', dur: 0.14, intensity: 0.95 },
  { match: /^(oo)/, viseme: 'viseme_U', dur: 0.14, intensity: 0.95 },
  { match: /^(ou|ow)/, viseme: 'viseme_O', dur: 0.15, intensity: 0.92 },
  { match: /^(ai|ay)/, viseme: 'viseme_aa', dur: 0.14, intensity: 0.95 },
  { match: /^(oa)/, viseme: 'viseme_O', dur: 0.14, intensity: 0.92 },
  { match: /^(au|aw)/, viseme: 'viseme_O', dur: 0.14, intensity: 0.90 },
  { match: /^(igh)/, viseme: 'viseme_I', dur: 0.15, intensity: 0.95 },
  { match: /^[bpm]/, viseme: 'viseme_PP', dur: 0.08, intensity: 1.00 }, // Firm closure
  { match: /^[fv]/, viseme: 'viseme_FF', dur: 0.09, intensity: 0.88 },
  { match: /^[szc]/, viseme: 'viseme_SS', dur: 0.09, intensity: 0.82 },
  { match: /^[tdl]/, viseme: 'viseme_DD', dur: 0.08, intensity: 0.78 },
  { match: /^[kg]/, viseme: 'viseme_kk', dur: 0.08, intensity: 0.78 },
  { match: /^[r]/, viseme: 'viseme_RR', dur: 0.09, intensity: 0.75 },
  { match: /^[n]/, viseme: 'viseme_nn', dur: 0.08, intensity: 0.72 },
  { match: /^[a]/, viseme: 'viseme_aa', dur: 0.13, intensity: 0.95 },
  { match: /^[e]/, viseme: 'viseme_E', dur: 0.11, intensity: 0.88 },
  { match: /^[iy]/, viseme: 'viseme_I', dur: 0.12, intensity: 0.92 },
  { match: /^[o]/, viseme: 'viseme_O', dur: 0.13, intensity: 0.95 },
  { match: /^[uw]/, viseme: 'viseme_U', dur: 0.12, intensity: 0.90 },
  { match: /^[j]/, viseme: 'viseme_CH', dur: 0.10, intensity: 0.85 },
  { match: /^./, viseme: 'viseme_sil', dur: 0.06, intensity: 0.0 }
];

const SILENT_CUE: VisemeCue = {
  viseme: 'viseme_sil',
  start: 0,
  end: 999999,
  intensity: 0,
  char: ''
};

/**
 * Parse an English text sentence into an accurate viseme timeline
 * with optional time-stretching to match exact audio playback duration.
 */
export function parseTextToTimeline(text: string, targetDuration?: number): SpeechTimeline {
  if (!text || !text.trim()) {
    return {
      text: '',
      duration: 0,
      cues: [],
      getCueAt: () => SILENT_CUE
    };
  }

  const words = text.toLowerCase().split(/\s+/);
  const rawCues: VisemeCue[] = [];
  let currentTime = 0;

  for (let w = 0; w < words.length; w++) {
    const word = words[w].replace(/[^a-z]/g, '');
    if (!word) continue;

    let i = 0;
    while (i < word.length) {
      const remaining = word.slice(i);
      let matched = false;

      for (const rule of PHONETIC_RULES) {
        const m = remaining.match(rule.match);
        if (m) {
          const chars = m[0];
          rawCues.push({
            viseme: rule.viseme,
            start: currentTime,
            end: currentTime + rule.dur,
            intensity: rule.intensity,
            char: chars
          });
          currentTime += rule.dur;
          i += chars.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        i += 1;
        currentTime += 0.05;
      }
    }

    // Inter-word natural pause (~75ms)
    rawCues.push({
      viseme: 'viseme_sil',
      start: currentTime,
      end: currentTime + 0.075,
      intensity: 0,
      char: ' '
    });
    currentTime += 0.075;
  }

  // Inter-sentence punctuation pause if ends with . ! ?
  if (/[.!?]$/.test(text.trim())) {
    currentTime += 0.18;
  }

  // Time-stretch cues to match actual audio duration if provided
  const finalDuration = targetDuration && targetDuration > 0 ? targetDuration : currentTime;
  const timeScale = targetDuration && currentTime > 0 ? targetDuration / currentTime : 1.0;

  const cues: VisemeCue[] = rawCues.map(cue => ({
    ...cue,
    start: cue.start * timeScale,
    end: cue.end * timeScale
  }));

  const getCueAt = (seconds: number): VisemeCue => {
    if (seconds < 0 || seconds >= finalDuration || cues.length === 0) {
      return SILENT_CUE;
    }
    // Binary search for efficiency
    let low = 0;
    let high = cues.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      const cue = cues[mid];
      if (seconds >= cue.start && seconds < cue.end) {
        return cue;
      }
      if (seconds < cue.start) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return SILENT_CUE;
  };

  return {
    text,
    duration: finalDuration,
    cues,
    getCueAt
  };
}
