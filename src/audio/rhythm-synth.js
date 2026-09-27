/**
 * Web Audio Rhythm Synthesizer
 * Generates accurate metronomic audio pulses for Sanskrit poetic prosody:
 * - Laghu (∪): 880 Hz crisp pulse (1 mora)
 * - Guru (—): 440 Hz resonant tone (2 morae)
 *
 * TIMING ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────
 * Audio scheduling uses the Web Audio hardware clock (audioCtx.currentTime),
 * which has ~0.02 ms resolution and is immune to main-thread jank.
 *
 * UI callbacks use performance.now() + a lightweight lookahead scheduler
 * so visual pulses stay in sync without relying on drifting setTimeout.
 *
 * Pattern:
 *   1. All tones are scheduled ahead of time via audioCtx offsets (zero jitter).
 *   2. UI callbacks fire via a single rAF/setTimeout scheduler that reads
 *      performance.now() and audioCtx.currentTime to hit the exact frame.
 * ─────────────────────────────────────────────────────────────────────────
 */

class RhythmSynthesizer {
  constructor() {
    this.audioCtx    = null;
    this.masterGain  = null;
    this.isPlaying   = false;
    this.tempoBpm    = 110;
    this.volume      = 0.4;
    this.pulseListeners = [];

    // Lookahead scheduler state
    this._scheduledCallbacks = []; // { audioTime, fn }
    this._rafId              = null;
    this._wallOrigin         = 0;  // performance.now() when playback started
    this._audioOrigin        = 0;  // audioCtx.currentTime when playback started
  }

  // ─── Initialisation ────────────────────────────────────────────────────────

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx  = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // ─── Controls ──────────────────────────────────────────────────────────────

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

  // ─── Single Tone ───────────────────────────────────────────────────────────

  /**
   * Play a single tone immediately (or at a pre-scheduled audio offset).
   * Uses the Web Audio hardware clock — no setTimeout, no drift.
   *
   * @param {'L'|'G'} type
   * @param {number}  audioTimeOffset - seconds from audioCtx.currentTime
   */
  playTone(type, audioTimeOffset = 0) {
    this.init();
    if (!this.audioCtx || this.volume <= 0.001) return;

    const isGuru      = type === 'G';
    const freq        = isGuru ? 440 : 880;          // A4 (Guru) | A5 (Laghu)
    const beatSec     = 60 / this.tempoBpm;
    const duration    = isGuru ? beatSec * 0.45 : beatSec * 0.22;
    const startAt     = this.audioCtx.currentTime + audioTimeOffset;

    const osc  = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = isGuru ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startAt);

    // ADSR envelope
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(isGuru ? 0.45 : 0.35, startAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);

    // Notify UI pulse listeners (immediate call, offset already baked into audio)
    if (audioTimeOffset === 0) {
      this.notifyPulse(type, duration * 1000);
    }
  }

  // ─── Sequence Playback ─────────────────────────────────────────────────────

  /**
   * Play a full meter sequence.
   *
   * Audio scheduling: ALL tones are pre-scheduled onto the hardware audio clock
   * in one pass using audioCtx offsets — zero jitter regardless of main-thread load.
   *
   * UI callbacks: scheduled via a high-resolution lookahead loop that uses
   * performance.now() correlated with audioCtx.currentTime so visual pulses
   * land on the correct animation frame.
   *
   * @param {Array<'L'|'G'>} pattern
   * @param {Function}       onStepCallback    - (index, syllable) on each beat
   * @param {Function}       onCompleteCallback - called after last beat + tail
   */
  playSequence(pattern, onStepCallback = null, onCompleteCallback = null) {
    this.stop();
    this.init();
    this.isPlaying = true;

    const beatSec = 60 / this.tempoBpm;

    // Snapshot clock origins so wall-clock ↔ audio-clock mapping is stable
    this._audioOrigin = this.audioCtx.currentTime;
    this._wallOrigin  = performance.now();
    this._scheduledCallbacks = [];

    // ── Pass 1: schedule ALL audio tones onto the hardware clock ─────────────
    let audioOffset = 0; // seconds from audioOrigin

    pattern.forEach((syl, idx) => {
      const sylSec = syl === 'G' ? beatSec * 1.5 : beatSec * 0.9;

      // Schedule the audio tone (hardware precision)
      this._scheduleAudioTone(syl, audioOffset);

      // Queue a UI callback at the same audio time
      const capturedIdx    = idx;
      const capturedSyl    = syl;
      const capturedAudio  = this._audioOrigin + audioOffset;
      const capturedDurMs  = sylSec * 1000;

      this._scheduledCallbacks.push({
        audioTime: capturedAudio,
        fn: () => {
          if (!this.isPlaying) return;
          this.notifyPulse(capturedSyl, capturedDurMs);
          if (onStepCallback) onStepCallback(capturedIdx, capturedSyl);
        },
      });

      audioOffset += sylSec;
    });

    // Completion callback entry (slightly after last beat)
    const completionAudioTime = this._audioOrigin + audioOffset + 0.2;
    this._scheduledCallbacks.push({
      audioTime: completionAudioTime,
      fn: () => {
        this.isPlaying = false;
        if (onCompleteCallback) onCompleteCallback();
      },
    });

    // ── Pass 2: start the high-resolution UI callback pump ───────────────────
    this._pumpCallbacks();
  }

  // ─── Internal: Audio Tone Scheduling (hardware clock) ──────────────────────

  /**
   * Schedule a tone at a precise offset from the audio clock origin.
   * This runs synchronously — all tones are committed to the audio graph
   * before the first beat sounds, so there is no setTimeout involved.
   */
  _scheduleAudioTone(type, audioOffset) {
    if (!this.audioCtx || this.volume <= 0.001) return;

    const isGuru   = type === 'G';
    const freq     = isGuru ? 440 : 880;
    const beatSec  = 60 / this.tempoBpm;
    const duration = isGuru ? beatSec * 0.45 : beatSec * 0.22;
    const startAt  = this._audioOrigin + audioOffset;

    const osc  = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = isGuru ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(isGuru ? 0.45 : 0.35, startAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
  }

  // ─── Internal: High-Resolution UI Callback Pump ────────────────────────────

  /**
   * Runs a requestAnimationFrame loop that fires queued UI callbacks at the
   * precise moment the audio clock reaches their scheduled audioTime.
   *
   * Correlation formula:
   *   wallElapsed = performance.now() - _wallOrigin          (ms, high-res)
   *   audioElapsed = audioCtx.currentTime - _audioOrigin     (s, hardware)
   *
   * We compare against audioCtx.currentTime (not performance.now()) so the
   * UI callbacks stay locked to the same clock as the audio output, making
   * them resilient to main-thread jank.
   */
  _pumpCallbacks() {
    if (!this.isPlaying || this._scheduledCallbacks.length === 0) {
      this._rafId = null;
      return;
    }

    const now = this.audioCtx.currentTime;

    // Fire all callbacks whose scheduled audioTime has arrived
    // (use a small +5ms lookahead to counteract rAF quantisation)
    const LOOKAHEAD_S = 0.005;
    let i = 0;
    while (i < this._scheduledCallbacks.length) {
      const cb = this._scheduledCallbacks[i];
      if (now + LOOKAHEAD_S >= cb.audioTime) {
        cb.fn();
        this._scheduledCallbacks.splice(i, 1);
      } else {
        i++;
      }
    }

    this._rafId = requestAnimationFrame(() => this._pumpCallbacks());
  }

  // ─── Stop ──────────────────────────────────────────────────────────────────

  stop() {
    this.isPlaying = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._scheduledCallbacks = [];
    // Note: already-committed audio nodes play out naturally (correct behaviour)
  }

  // ─── Diagnostics ───────────────────────────────────────────────────────────

  /**
   * Returns a snapshot of timing precision info for debugging.
   * Wall-clock drift = difference between performance.now() elapsed
   * and audioCtx.currentTime elapsed since playback started.
   */
  getTimingDiagnostics() {
    if (!this.audioCtx || !this._wallOrigin) return null;
    const wallElapsedMs  = performance.now() - this._wallOrigin;
    const audioElapsedMs = (this.audioCtx.currentTime - this._audioOrigin) * 1000;
    return {
      wallElapsedMs:  +wallElapsedMs.toFixed(3),
      audioElapsedMs: +audioElapsedMs.toFixed(3),
      driftMs:        +(wallElapsedMs - audioElapsedMs).toFixed(3),
      audioCtxTime:   +this.audioCtx.currentTime.toFixed(6),
      performanceNow: +performance.now().toFixed(3),
    };
  }
}

export const rhythmSynth = new RhythmSynthesizer();
