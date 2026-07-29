/* ===========================================================
   SFX — am thanh tong hop bang Web Audio API, khong can file am
   thanh ngoai (tranh van de ban quyen, nhe, tai ngay lap tuc).
   =========================================================== */
(function () {
  let ctx = null;
  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, duration, type, gainStart) {
    if (!window.settings || !window.settings.sound) return;
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainStart || 0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  }

  function noiseBurst(duration, gainStart) {
    if (!window.settings || !window.settings.sound) return;
    const c = ensureCtx();
    if (!c) return;
    const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(gainStart || 0.15, c.currentTime);
    src.connect(gain).connect(c.destination);
    src.start();
  }

  window.SFX = {
    stone() { tone(320, 0.12, "square", 0.18); },
    capture() { tone(190, 0.22, "sawtooth", 0.18); setTimeout(() => tone(140, 0.2, "sawtooth", 0.14), 80); },
    throwArrow() { tone(650, 0.14, "sine", 0.1); },
    hit() { tone(880, 0.16, "triangle", 0.2); setTimeout(() => tone(1300, 0.15, "triangle", 0.16), 90); },
    miss() { tone(190, 0.22, "sine", 0.12); },
    dice() { noiseBurst(0.28, 0.2); setTimeout(() => noiseBurst(0.18, 0.14), 90); },
    move() { tone(400, 0.1, "square", 0.14); },
    click() { tone(520, 0.06, "square", 0.08); },
    timeout() { tone(150, 0.35, "square", 0.18); },
    win() { tone(523, 0.16, "triangle", 0.2); setTimeout(() => tone(659, 0.16, "triangle", 0.2), 130); setTimeout(() => tone(784, 0.28, "triangle", 0.22), 260); },
  };
})();
