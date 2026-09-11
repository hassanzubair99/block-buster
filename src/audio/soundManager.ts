class SoundManager {
  private ctx: AudioContext | null = null;
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // Read saved audio settings if available
    try {
      const savedSound = localStorage.getItem('bm3d_sound');
      const savedMusic = localStorage.getItem('bm3d_music');
      if (savedSound !== null) this.isSoundEnabled = savedSound === 'true';
      if (savedMusic !== null) this.isMusicEnabled = savedMusic === 'true';
    } catch {
      // ignore
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public toggleSound(enabled?: boolean): boolean {
    this.isSoundEnabled = enabled !== undefined ? enabled : !this.isSoundEnabled;
    try {
      localStorage.setItem('bm3d_sound', String(this.isSoundEnabled));
    } catch {
      // ignore
    }
    return this.isSoundEnabled;
  }

  public toggleMusic(enabled?: boolean): boolean {
    this.isMusicEnabled = enabled !== undefined ? enabled : !this.isMusicEnabled;
    try {
      localStorage.setItem('bm3d_music', String(this.isMusicEnabled));
    } catch {
      // ignore
    }

    if (this.isMusicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicEnabled;
  }

  // Playful pop chime for matching blocks
  public playPop(matchCount: number = 3, combo: number = 1) {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const baseFreq = 380 + Math.min(matchCount, 8) * 45 + Math.min(combo, 6) * 35;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 0.7, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.18);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    // Add a harmonic overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, now);
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.ctx.destination);
    gain2.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.23);
    osc2.stop(now + 0.17);
  }

  // Soft landing when blocks settle into place
  public playLanding() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Line blast rocket laser sound
  public playLineBlast() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Bomb explosion
  public playBomb() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub bass drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);

    // Punchy noise pop
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Color blast sparkle magic
  public playColorBlast() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.26);
    });
  }

  // Combo celebration arpeggio
  public playCombo(comboCount: number) {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [
      [440, 554.37, 659.25],          // A Maj
      [523.25, 659.25, 783.99],       // C Maj
      [587.33, 739.99, 880],          // D Maj
      [659.25, 830.61, 987.77],       // E Maj
      [783.99, 987.77, 1174.66]       // G Maj
    ];

    const chord = chords[Math.min(comboCount - 2, chords.length - 1)] || chords[0];
    const now = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  // Ice block crunch
  public playIceBreak() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Crate break
  public playCrateBreak() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  // UI click
  public playClick() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Victory fanfare
  public playWin() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.12 },
      { freq: 659.25, time: 0.13, dur: 0.12 },
      { freq: 783.99, time: 0.26, dur: 0.12 },
      { freq: 1046.5, time: 0.39, dur: 0.38 },
      { freq: 880, time: 0.8, dur: 0.12 },
      { freq: 1046.5, time: 0.95, dur: 0.55 },
    ];
    const now = this.ctx.currentTime;

    notes.forEach((n) => {
      if (!this.ctx) return;
      const t = now + n.time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, t);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + n.dur + 0.02);
    });
  }

  // Game over wobble
  public playLose() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 415.3, 392, 349.23];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = now + idx * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  // Procedural relaxing toy BGM
  public startMusic() {
    if (!this.isMusicEnabled || this.musicInterval !== null) return;
    this.initCtx();
    if (!this.ctx) return;

    const melody = [
      523.25, 0, 659.25, 523.25, 783.99, 0, 659.25, 0,
      880, 0, 783.99, 659.25, 587.33, 0, 523.25, 0,
      659.25, 0, 587.33, 523.25, 440, 0, 523.25, 0,
      587.33, 659.25, 587.33, 0, 523.25, 0, 0, 0
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.isMusicEnabled) return;
      const note = melody[this.musicStep % melody.length];
      this.musicStep++;

      if (note > 0) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    }, 240);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundManager();
