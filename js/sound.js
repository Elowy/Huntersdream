/* =========================================================================
 * HUNTER'S DREAM 2 — sound effects (synthesized with the Web Audio API)
 * No external files. Exposed as window.SFX.
 * ========================================================================= */

'use strict';

(function () {
  let ctx = null;
  let master = null;
  const st = { muted: false };

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, t0, dur, type, gain, glideTo) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.25, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }

  function noise(t0, dur, gain, hp) {
    const n = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    n.buffer = buf;
    const g = ctx.createGain(); g.gain.value = gain || 0.15;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 1400;
    n.connect(f); f.connect(g); g.connect(master);
    n.start(t0); n.stop(t0 + dur);
  }

  const arp = (freqs, step, dur, type, gain) => {
    const t = ctx.currentTime;
    freqs.forEach((f, i) => tone(f, t + i * step, dur, type, gain));
  };

  const sounds = {
    click() { tone(320, ctx.currentTime, 0.06, 'square', 0.10); },
    spin() { const t = ctx.currentTime; tone(220, t, 0.28, 'sawtooth', 0.10, 130); noise(t, 0.12, 0.05, 800); },
    reelStop() { const t = ctx.currentTime; tone(170, t, 0.05, 'square', 0.12); noise(t, 0.04, 0.06); },
    win() { arp([523, 659, 784], 0.08, 0.18, 'sine', 0.20); },
    coin() { const t = ctx.currentTime; tone(1250, t, 0.08, 'triangle', 0.16, 1850); },
    bigwin() { arp([523, 659, 784, 1046, 1318, 1568], 0.10, 0.30, 'triangle', 0.22); },
    megawin() { arp([659, 784, 1046, 1318, 1568, 2093], 0.09, 0.34, 'sawtooth', 0.20); },
    gold() { arp([880, 1108, 1318, 1760], 0.05, 0.12, 'sine', 0.14); },
    goldRoll() { const t = ctx.currentTime; tone(1400 + Math.random() * 300, t, 0.04, 'square', 0.07); },
    cardFlip() { const t = ctx.currentTime; noise(t, 0.08, 0.12); tone(420, t, 0.1, 'square', 0.08); },
    gambleWin() { arp([659, 988, 1318], 0.09, 0.20, 'sine', 0.22); },
    gambleLose() { tone(300, ctx.currentTime, 0.45, 'sawtooth', 0.18, 110); },
    freespins() { arp([523, 659, 784, 1046, 1318], 0.12, 0.35, 'sine', 0.22); },
    anticipation() { tone(300, ctx.currentTime, 0.7, 'sawtooth', 0.12, 950); },
    levelup() { arp([659, 784, 988, 1318, 1568], 0.08, 0.26, 'triangle', 0.20); },
    mission() { arp([784, 1046, 1318], 0.07, 0.20, 'square', 0.14); },
    jackpot() { arp([523, 659, 784, 1046, 1318, 1568, 2093, 2637], 0.08, 0.40, 'triangle', 0.24); },
  };

  /* ---- Background music: a gentle, looping synth pad + melody (toggleable,
   *      independent of the SFX mute). No external files. ---- */
  const music = { on: false, timer: null, gain: null, step: 0 };
  const BASS = [130.81, 146.83, 164.81, 98.00];                 // C3 D3 E3 G2
  const MEL = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33]; // C5 D5 E5 G5 E5 D5
  function musicTone(freq, t0, dur, type, gain) {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(music.gain);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function musicTick() {
    if (!music.on || !ctx) return;
    const t = ctx.currentTime;
    const i = music.step;
    const root = BASS[i % BASS.length];
    musicTone(root, t, 0.9, 'triangle', 0.045);       // soft pad root
    musicTone(root * 1.5, t, 0.9, 'sine', 0.028);      // fifth
    musicTone(MEL[i % MEL.length], t, 0.34, 'sine', 0.04); // melody
    music.step++;
    music.timer = setTimeout(musicTick, 500);
  }
  function startMusic() {
    if (music.on) return;
    if (!ensure()) return;
    if (!music.gain) { music.gain = ctx.createGain(); music.gain.gain.value = 0.6; music.gain.connect(master); }
    music.on = true;
    musicTick();
  }
  function stopMusic() {
    music.on = false;
    if (music.timer) { clearTimeout(music.timer); music.timer = null; }
  }

  window.SFX = {
    play(name) {
      if (st.muted) return;
      if (!ensure()) return;
      try { (sounds[name] || function () {})(); } catch (e) { /* ignore */ }
    },
    toggleMute() { st.muted = !st.muted; return st.muted; },
    setMuted(m) { st.muted = !!m; },
    get muted() { return st.muted; },
    resume() { try { ensure(); } catch (e) { /* ignore */ } },
    startMusic() { try { startMusic(); } catch (e) { /* ignore */ } },
    stopMusic() { try { stopMusic(); } catch (e) { /* ignore */ } },
    toggleMusic() { try { if (music.on) stopMusic(); else startMusic(); } catch (e) { /* ignore */ } return music.on; },
    get musicOn() { return music.on; },
  };
})();
