/**
 * Web Audio API procedural sound effects and dynamic arcade music synthesizer.
 * Completely offline, zero external audio asset dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.isEngineRunning) {
      this.stopEngine();
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else if (this.isEngineRunning) {
      this.startMusic();
    }
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  /**
   * UI Click Sound
   */
  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Coin collection chime
   */
  public playCoin() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.frequency.setValueAtTime(1975.53, t); // B6
    osc2.frequency.setValueAtTime(2637.02, t + 0.08); // E7

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.35);
    osc2.stop(t + 0.35);
  }

  /**
   * Power-up pickup sound (Shield, Magnet, Nitro)
   */
  public playPowerup() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Near miss swoosh
   */
  public playNearMiss() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Tire screech when braking or sharp turning
   */
  public playScreech() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Generate white noise through bandpass
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, t);
    filter.Q.setValueAtTime(5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  /**
   * Nitro boost activation whoosh
   */
  public playNitro() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(380, t + 0.3);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  /**
   * Crash / Explosion sound
   */
  public playCrash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Low frequency rumble
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);
    oscGain.gain.setValueAtTime(0.6, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.7;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.7);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(t);
  }

  /**
   * Level Complete / Victory Fanfare
   */
  public playVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0.3, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.45);
    });
  }

  /**
   * Continuous dynamic engine sound
   */
  public startEngine() {
    if (!this.soundEnabled || this.isEngineRunning) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime); // idle RPM

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch {
      // Ignore audio start errors if browser hasn't had gesture yet
    }
  }

  public updateEngine(speedKmh: number, isNitro: boolean) {
    if (!this.isEngineRunning || !this.engineOsc || !this.engineFilter || !this.ctx) return;
    // Map speed 0-320 km/h to frequency 65Hz to 280Hz
    const baseFreq = 65 + (speedKmh / 320) * 160 + (isNitro ? 60 : 0);
    const filterFreq = 400 + (speedKmh / 320) * 800 + (isNitro ? 400 : 0);

    const t = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, t, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, t, 0.08);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // already stopped
      }
      this.engineOsc = null;
    }
    this.isEngineRunning = false;
  }

  /**
   * Arcade Synthwave Background Music Sequencer
   */
  public startMusic() {
    if (!this.musicEnabled || this.musicInterval !== null) return;
    this.initContext();

    const bpm = 128;
    const stepTimeMs = (60 / bpm / 4) * 1000; // 16th notes

    // Synthwave bassline progression: Am - F - C - G
    const bassline = [
      110, 110, 110, 110,  110, 110, 110, 130.81, // A2, C3
      87.31, 87.31, 87.31, 87.31,  87.31, 87.31, 103.83, 116.54, // F2, Ab2, Bb2
      65.41, 65.41, 65.41, 65.41,  65.41, 65.41, 98.00, 110, // C2, G2, A2
      98.00, 98.00, 98.00, 98.00,  98.00, 98.00, 123.47, 130.81  // G2, B2, C3
    ];

    // Synth lead arpeggios
    const arps = [
      440, 523.25, 659.25, 880,  440, 523.25, 659.25, 1046.50,
      349.23, 440, 523.25, 698.46,  349.23, 440, 523.25, 880,
      261.63, 329.63, 392, 523.25,  261.63, 329.63, 392, 659.25,
      392, 493.88, 587.33, 783.99,  392, 493.88, 587.33, 987.77
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx || !this.masterGain) return;
      const step = this.musicStep % 32;
      const t = this.ctx.currentTime;

      // Bass synth note
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassline[step], t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.13);
      }

      // Arpeggio synth lead
      if (step % 4 === 0) {
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();
        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(arps[step], t);

        arpGain.gain.setValueAtTime(0.06, t);
        arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        arpOsc.connect(arpGain);
        arpGain.connect(this.masterGain);

        arpOsc.start(t);
        arpOsc.stop(t + 0.19);
      }

      // Hi-hat tick
      if (step % 4 === 2) {
        const bufferSize = this.ctx.sampleRate * 0.03;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const hat = this.ctx.createBufferSource();
        hat.buffer = buffer;

        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(7000, t);

        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime(0.04, t);
        hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        hat.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.masterGain);

        hat.start(t);
      }

      this.musicStep++;
    }, stepTimeMs);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public stopAll() {
    this.stopEngine();
    this.stopMusic();
  }
}

export const sound = new SoundManager();
