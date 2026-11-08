/* ==========================================================================
   Sistema de sonido de Brick Wall
   --------------------------------------------------------------------------
   Todo el audio de la página es ORIGINAL y se genera en el navegador con
   Web Audio API: no se usa ningún archivo de música ni audio de terceros.
   (El único audio externo es el de tu vídeo de intro, assets/intro.mp4.)

   - Música: tema electrónico retro en bucle (pads, arpegio con eco, bajo y
     batería suave) a 96 BPM sobre Am9 – Fmaj7 – Cmaj9 – Em7.
   - Efectos: cada clic suena con notas del acorde que esté sonando en ese
     momento, así encajan con la música («con flow»).
   - Un único control: volumen + silenciar. Se recuerda en el navegador.
   - Nada suena hasta que el visitante interactúa (requisito del navegador).
   ========================================================================== */
window.BWAudio = (() => {
  const CFG = (window.BRICKWALL_CONFIG && window.BRICKWALL_CONFIG.audio) || {};
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem("bw_" + k); return v === null ? d : JSON.parse(v); }
      catch { return d; }
    },
    set(k, v) { try { localStorage.setItem("bw_" + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } }
  };

  const state = {
    enabled: store.get("sound", CFG.enabled !== false),
    volume: store.get("volume", typeof CFG.volume === "number" ? CFG.volume : 0.4),
    music: CFG.music !== false,
    unlocked: false
  };

  let ctx = null, master, sfx, musicBus, reverb, delay, analyser;
  const listeners = new Set();
  const curve = (v) => v * v * 0.95; // volumen perceptual

  /* ------------------------------------------------------------ Motor */
  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 3;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;

    master = ctx.createGain();
    master.gain.value = 0;
    // Limitador final: nunca satura, ni con el volumen al máximo
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.12;
    const ceiling = ctx.createGain();
    ceiling.gain.value = 0.9;
    master.connect(comp).connect(limiter).connect(ceiling).connect(analyser).connect(ctx.destination);

    sfx = ctx.createGain();
    sfx.gain.value = 1;
    sfx.connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(master);

    reverb = ctx.createConvolver();
    reverb.buffer = impulse(2.8, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.38;
    reverb.connect(wet).connect(master);

    // Eco de corchea con puntillo (ping-pong simple)
    delay = ctx.createDelay(2);
    delay.delayTime.value = (60 / BPM) * 0.75;
    const fb = ctx.createGain();
    fb.gain.value = 0.38;
    const dlp = ctx.createBiquadFilter();
    dlp.type = "lowpass";
    dlp.frequency.value = 3200;
    const dOut = ctx.createGain();
    dOut.gain.value = 0.5;
    delay.connect(dlp).connect(fb).connect(delay);
    dlp.connect(dOut).connect(master);

    applyMaster(0.01);
    return true;
  }

  function impulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function applyMaster(time = 0.15) {
    if (!ctx) return;
    const target = state.enabled ? curve(state.volume) : 0;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(target, ctx.currentTime, time);
  }

  const ready = () => ctx && state.unlocked && state.enabled && ctx.state === "running";

  /* Nota con envolvente */
  function tone({
    f, to, type = "sine", t = null, at = 0, dur = 0.1, gain = 0.1, attack = 0.004,
    release = 0.08, detune = 0, lp, bus = sfx, rev = 0.2, echo = 0
  }) {
    const start = (t ?? ctx.currentTime) + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, start);
    if (to) o.frequency.exponentialRampToValueAtTime(to, start + dur);
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(Math.max(gain * 0.5, 0.0002), start + Math.max(attack * 2, dur));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur + release);
    let node = o;
    if (lp) {
      const fl = ctx.createBiquadFilter();
      fl.type = "lowpass";
      fl.frequency.value = lp;
      o.connect(fl);
      node = fl;
    }
    node.connect(g).connect(bus);
    if (rev) { const s = ctx.createGain(); s.gain.value = rev; g.connect(s).connect(reverb); }
    if (echo) { const s = ctx.createGain(); s.gain.value = echo; g.connect(s).connect(delay); }
    o.start(start);
    o.stop(start + dur + release + 0.05);
  }

  function hiss({ t = null, at = 0, dur = 0.1, gain = 0.05, type = "highpass", freq = 7000, q = 0.7, bus = sfx, rev = 0 }) {
    const start = (t ?? ctx.currentTime) + at;
    const src = ctx.createBufferSource();
    src.buffer = noise();
    const fl = ctx.createBiquadFilter();
    fl.type = type;
    fl.frequency.value = freq;
    fl.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(fl).connect(g).connect(bus);
    if (rev) { const s = ctx.createGain(); s.gain.value = rev; g.connect(s).connect(reverb); }
    src.start(start, Math.random() * 1.5);
    src.stop(start + dur + 0.05);
  }

  /* ------------------------------------------------------------ Música */
  const BPM = 96;
  const MUSIC_LEVEL = 1.8;
  const S16 = 60 / BPM / 4;
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // Acordes (notas MIDI): raíz del bajo, pad y notas para arpegio/efectos
  const CHORDS = [
    { name: "Am9",   bass: 45, pad: [57, 60, 64, 67, 71], arp: [69, 72, 76, 79, 83, 76] },
    { name: "Fmaj7", bass: 41, pad: [53, 57, 60, 64, 69], arp: [65, 69, 72, 76, 81, 72] },
    { name: "Cmaj9", bass: 48, pad: [55, 60, 64, 67, 74], arp: [67, 72, 76, 79, 86, 79] },
    { name: "Em7",   bass: 40, pad: [52, 55, 59, 62, 67], arp: [64, 67, 71, 74, 79, 74] }
  ];
  const ARP_PATTERNS = [
    [0, 2, 1, 3, 2, 4, 3, 5],
    [0, 1, 2, 3, 4, 3, 2, 1],
    [0, 3, 1, 4, 2, 5, 1, 3],
    [4, 2, 3, 1, 2, 0, 1, 2]
  ];

  let musicTimer = null, nextTime = 0, step = 0, arpPattern = ARP_PATTERNS[0];
  let musicStartTime = 0;

  function currentChord() {
    if (!ctx || !musicTimer) return CHORDS[0];
    const elapsed = Math.max(0, ctx.currentTime - musicStartTime);
    const bar = Math.floor(elapsed / (S16 * 16));
    return CHORDS[Math.floor(bar / 2) % CHORDS.length];
  }

  function padChord(chord, t, len) {
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.Q.value = 0.8;
    lpf.frequency.setValueAtTime(700, t);
    lpf.frequency.linearRampToValueAtTime(1500, t + len * 0.5);
    lpf.frequency.linearRampToValueAtTime(800, t + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.07, t + 1.2);
    g.gain.setValueAtTime(0.07, t + len - 0.6);
    g.gain.linearRampToValueAtTime(0.0001, t + len + 1.4);
    lpf.connect(g).connect(musicBus);
    const s = ctx.createGain(); s.gain.value = 0.6; g.connect(s).connect(reverb);
    chord.pad.forEach((n) => {
      [-8, 8].forEach((d) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = midi(n);
        o.detune.value = d;
        const og = ctx.createGain();
        og.gain.value = 0.16;
        o.connect(og).connect(lpf);
        o.start(t);
        o.stop(t + len + 1.6);
      });
    });
  }

  function kick(t, v = 1) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4 * v, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g).connect(musicBus);
    o.start(t);
    o.stop(t + 0.35);
  }

  function snare(t) {
    hiss({ t, dur: 0.16, gain: 0.11, type: "bandpass", freq: 1900, q: 0.9, bus: musicBus, rev: 0.35 });
    tone({ t, f: 196, to: 160, type: "triangle", dur: 0.05, gain: 0.08, release: 0.05, bus: musicBus, rev: 0 });
  }

  function scheduleStep(s, t) {
    const pos = s % 16;
    const bar = Math.floor(s / 16);
    const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];
    const cycle = Math.floor(bar / 8);           // 8 compases = una vuelta completa
    const intro = bar < 4;                       // empieza solo con pads
    const breakdown = cycle % 4 === 3 && bar % 8 >= 6; // pequeño respiro cada 4 vueltas

    // Pads (cada 2 compases)
    if (pos === 0 && bar % 2 === 0) {
      padChord(chord, t, S16 * 32);
      arpPattern = ARP_PATTERNS[(Math.random() * ARP_PATTERNS.length) | 0];
    }

    // Arpegio con eco
    if (bar >= 2 && (pos % 2 === 0 || (pos % 4 === 3 && Math.random() < 0.35))) {
      const idx = arpPattern[(pos >> 1) % arpPattern.length];
      const n = chord.arp[idx % chord.arp.length];
      const accent = pos % 4 === 0 ? 1 : 0.7;
      tone({ t, f: midi(n), type: "triangle", dur: 0.07, gain: 0.05 * accent, release: 0.22, lp: 3800, bus: musicBus, rev: 0.25, echo: 0.45 });
      tone({ t, f: midi(n + 12), type: "sine", dur: 0.03, gain: 0.012 * accent, release: 0.15, bus: musicBus, rev: 0.3 });
    }

    if (intro || breakdown) return;

    // Bajo
    if (pos === 0 || pos === 6 || pos === 10 || (pos === 14 && bar % 2 === 1)) {
      const n = pos === 10 ? chord.bass + 12 : chord.bass;
      tone({ t, f: midi(n), type: "sine", dur: pos === 0 ? 0.32 : 0.16, gain: 0.2, attack: 0.008, release: 0.08, bus: musicBus, rev: 0 });
      tone({ t, f: midi(n), type: "triangle", dur: 0.08, gain: 0.05, release: 0.05, lp: 700, bus: musicBus, rev: 0 });
    }

    // Batería suave
    if (pos === 0 || pos === 8 || (pos === 10 && bar % 2 === 1)) kick(t, pos === 10 ? 0.6 : 1);
    if (pos === 4 || pos === 12) snare(t);
    if (pos % 2 === 0) hiss({ t, dur: pos % 4 === 2 ? 0.05 : 0.03, gain: pos % 4 === 2 ? 0.035 : 0.018, bus: musicBus });
    if (pos === 14 && bar % 4 === 3) hiss({ t, dur: 0.22, gain: 0.03, freq: 6000, bus: musicBus });
  }

  function startMusic() {
    if (!ctx || musicTimer || !state.music || !state.enabled) return;
    step = 0;
    nextTime = ctx.currentTime + 0.1;
    musicStartTime = nextTime;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(0, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, ctx.currentTime + 4);
    musicTimer = setInterval(() => {
      if (!ctx || ctx.state !== "running") return;
      // Si el audio estuvo en pausa (pestaña oculta, sin permiso aún…), retoma sin ráfagas
      if (nextTime < ctx.currentTime - 0.2) {
        nextTime = ctx.currentTime + 0.05;
        musicStartTime = nextTime - step * S16;
      }
      while (nextTime < ctx.currentTime + 0.15) {
        scheduleStep(step, nextTime);
        nextTime += S16;
        step++;
      }
    }, 25);
  }

  function stopMusic(fade = 0.8) {
    if (!musicTimer) return;
    clearInterval(musicTimer);
    musicTimer = null;
    if (!ctx) return;
    const t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(0, t + fade);
  }

  /* ------------------------------------------------------------ Efectos */
  let lastMove = 0, lastNote = -1;
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  const SFX = {
    // Pasar por una opción: nota cristalina del acorde actual
    move() {
      const now = performance.now();
      if (now - lastMove < 45) return;
      lastMove = now;
      const notes = currentChord().arp.slice(0, 5);
      let n = pick(notes);
      if (n === lastNote) n = notes[(notes.indexOf(n) + 1) % notes.length];
      lastNote = n;
      tone({ f: midi(n + 12), type: "sine", dur: 0.04, gain: 0.11, release: 0.25, rev: 0.25, echo: 0.25 });
      tone({ f: midi(n + 24), type: "sine", dur: 0.02, gain: 0.02, release: 0.12, rev: 0.2 });
    },
    // Clic / confirmar: arpegio ascendente del acorde
    select() {
      const a = currentChord().arp;
      [a[0], a[1], a[2], a[4]].forEach((n, i) =>
        tone({ f: midi(n + 12), type: i ? "sine" : "triangle", at: i * 0.045, dur: 0.06, gain: 0.12 - i * 0.015, release: 0.35, rev: 0.4, echo: 0.3 })
      );
      hiss({ dur: 0.12, gain: 0.03, freq: 5000, rev: 0.3 });
    },
    // Volver: dos notas hacia abajo
    back() {
      const a = currentChord().arp;
      tone({ f: midi(a[2] + 12), type: "triangle", dur: 0.06, gain: 0.11, release: 0.2, rev: 0.3, echo: 0.2 });
      tone({ f: midi(a[0] + 12), at: 0.07, dur: 0.08, gain: 0.11, release: 0.4, rev: 0.4, echo: 0.25 });
    },
    // Cambiar de plataforma
    switch() {
      const a = currentChord().arp;
      tone({ f: midi(a[3] + 12), dur: 0.04, gain: 0.1, release: 0.15, rev: 0.25, echo: 0.3 });
      hiss({ dur: 0.04, gain: 0.04, type: "bandpass", freq: 3000, q: 3 });
    },
    // Descargar: acorde completo brillante
    download() {
      const a = currentChord().arp;
      a.slice(0, 5).forEach((n, i) => tone({ f: midi(n + 12), at: i * 0.055, dur: 0.08, gain: 0.11, release: 0.6, rev: 0.6, echo: 0.35 }));
      tone({ f: 110, to: 50, dur: 0.3, gain: 0.25, release: 0.1, rev: 0 });
    },
    // Fallo (plataforma no disponible): zumbido digital con interferencias
    error() {
      tone({ f: 233, type: "square", dur: 0.09, gain: 0.07, release: 0.02, lp: 1400, rev: 0.1 });
      tone({ f: 220, type: "square", at: 0.11, dur: 0.16, gain: 0.07, release: 0.04, lp: 1400, rev: 0.15 });
      tone({ f: 110, type: "sawtooth", at: 0.11, dur: 0.16, gain: 0.04, release: 0.04, lp: 600, rev: 0 });
      for (let i = 0; i < 6; i++) hiss({ at: i * 0.045 + Math.random() * 0.02, dur: 0.025, gain: 0.05, type: "bandpass", freq: 1200 + Math.random() * 4000, q: 2 });
    },
    // Abrir un enlace
    link() {
      const a = currentChord().arp;
      tone({ f: midi(a[1] + 12), dur: 0.05, gain: 0.1, release: 0.25, rev: 0.4, echo: 0.3 });
      tone({ f: midi(a[3] + 12), at: 0.06, dur: 0.05, gain: 0.08, release: 0.4, rev: 0.5, echo: 0.3 });
    },
    // Montar ladrillos (logo de la esquina): notas que suben, una por ladrillo
    build() {
      const a = currentChord().arp;
      [a[0], a[1], a[2], a[3], a[4], a[1] + 12, a[2] + 12].forEach((n, i) => {
        tone({ f: midi(n), type: "triangle", at: i * 0.07, dur: 0.035, gain: 0.08, release: 0.12, lp: 4000, rev: 0.2 });
        hiss({ at: i * 0.07, dur: 0.02, gain: 0.03, type: "bandpass", freq: 2500, q: 2 });
      });
    }
  };

  function play(name) {
    if (!ready() || !SFX[name]) return;
    try { SFX[name](); } catch { /* el audio nunca rompe la interfaz */ }
  }

  /* ------------------------------------------------------------ API */
  function notify() { listeners.forEach((fn) => fn({ ...state })); }

  function unlock() {
    if (!init()) return Promise.resolve(false);
    const go = () => {
      const first = !state.unlocked;
      state.unlocked = true;
      applyMaster(0.05);
      if (first) notify();
      return true;
    };
    if (ctx.state !== "running") return ctx.resume().then(go).catch(() => false);
    return Promise.resolve(go());
  }

  function setEnabled(on) {
    state.enabled = !!on;
    store.set("sound", state.enabled);
    if (ctx) {
      applyMaster();
      if (!state.enabled) stopMusic(0.3);
      else if (musicWanted) startMusic();
    }
    notify();
  }

  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, v));
    store.set("volume", state.volume);
    applyMaster(0.05);
    notify();
  }

  // La música se pide al terminar la intro; si está silenciado, espera.
  let musicWanted = false;
  function music() {
    musicWanted = true;
    return unlock().then(() => startMusic());
  }

  document.addEventListener("visibilitychange", () => {
    if (!ctx || !state.unlocked) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  // Nivel de salida (0-1), útil para depurar
  function level() {
    if (!analyser) return 0;
    const d = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(d);
    let peak = 0;
    for (const v of d) peak = Math.max(peak, Math.abs(v));
    return peak;
  }

  return {
    play, unlock, music, setEnabled, setVolume, level,
    // Volumen equivalente para elementos <video>/<audio>
    mediaVolume: () => Math.min(1, curve(state.volume) * 1.8),
    get state() { return { ...state, playing: !!musicTimer }; },
    onChange(fn) { listeners.add(fn); fn({ ...state }); }
  };
})();
