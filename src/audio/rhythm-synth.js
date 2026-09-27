/**
 * Web Audio Rhythm Synthesizer
 * Generates accurate metronomic audio pulses for Sanskrit poetic prosody:
 * - Laghu (∪): 880 Hz crisp pulse (1 mora)
 * - Guru (—): 440 Hz resonant tone (2 morae)
 * Supports dynamic BPM tempo control, master volume envelope, and visual pulse callbacks.
 */

class RhythmSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.playbackTimeouts = [];
    this.tempoBpm = 110;
    this.volume = 0.4;
    this.pulseListeners = [];
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  setTempo(bpm) {
    this.tempoBpm = Math.max(40, Math.min(240, bpm));
  }

  addPulseListener(fn) {
    this.pulseListeners.push(fn);
  }

  notifyPulse(type, durationMs) {
    this.pulseListeners.forEach(fn => fn(type, durationMs));
  }

  /**
   * Play a single tone
   * @param {'L'|'G'} type 
   * @param {number} timeOffset - in seconds from now
   */
  playTone(type, timeOffset = 0) {
    this.init();
    if (!this.audioCtx || this.volume <= 0.001) return;

    const isGuru = type === 'G';
    const freq = isGuru ? 440 : 880; // A4 (Guru) or A5 (Laghu)
    const baseDuration = (60 / this.tempoBpm);
    const duration = isGuru ? baseDuration * 0.45 : baseDuration * 0.22;
    const now = this.audioCtx.currentTime + timeOffset;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = isGuru ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // ADSR Envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(isGuru ? 0.45 : 0.35, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);

    // Notify pulse listeners for UI visual pulses
    this.notifyPulse(type, duration * 1000);
  }

  /**
   * Play a full meter sequence with visual step callbacks
   * @param {Array<'L'|'G'>} pattern 
   * @param {Function} onStepCallback - Called with (index, syllable) on each beat
   * @param {Function} onCompleteCallback - Called when pattern finishes
   */
  playSequence(pattern, onStepCallback = null, onCompleteCallback = null) {
    this.stop();
    this.init();
    this.isPlaying = true;

    const beatDurationMs = (60 / this.tempoBpm) * 1000;
    let accumulatedTimeMs = 0;

    pattern.forEach((syl, idx) => {
      const sylDurationMs = syl === 'G' ? beatDurationMs * 1.5 : beatDurationMs * 0.9;
      
      const timeoutId = setTimeout(() => {
        if (!this.isPlaying) return;
        this.playTone(syl);
        if (onStepCallback) onStepCallback(idx, syl);
      }, accumulatedTimeMs);

      this.playbackTimeouts.push(timeoutId);
      accumulatedTimeMs += sylDurationMs;
    });

    const completionTimeout = setTimeout(() => {
      this.isPlaying = false;
      if (onCompleteCallback) onCompleteCallback();
    }, accumulatedTimeMs + 200);

    this.playbackTimeouts.push(completionTimeout);
  }

  stop() {
    this.isPlaying = false;
    this.playbackTimeouts.forEach(t => clearTimeout(t));
    this.playbackTimeouts = [];
  }
}

export const rhythmSynth = new RhythmSynthesizer();
