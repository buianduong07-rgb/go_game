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

  // ================= NHẠC NỀN CUNG ĐÌNH (PENTATONIC GUZHENG BGM) =================
  let bgmOsc = null;
  let bgmGain = null;
  let bgmTimer = null;

  // Thanh âm ngũ cung (Guzheng: D, F, G, A, C)
  const pentatonicScale = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99, 880.00];

  function playGuzhengNote(c, freq, time) {
    if (!window.settings || !window.settings.sound) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    
    // Tiếng đàn Tranh / Đàn Tranh Cung Đình (Triangle wave)
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    // Dynamic pluck decay
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.2);

    osc.connect(gain).connect(c.destination);
    osc.start(time);
    osc.stop(time + 2.3);
  }

  function startBGM() {
    stopBGM();
    const c = ensureCtx();
    if (!c) return;

    let step = 0;
    bgmTimer = setInterval(() => {
      if (!window.settings || !window.settings.sound) return;
      const c = ensureCtx();
      if (!c) return;
      
      const now = c.currentTime;
      // Chọn ngẫu nhiên nốt trong thang âm ngũ cung tạo giai điệu du dương
      const freq1 = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
      playGuzhengNote(c, freq1, now);

      if (step % 3 === 0) {
        const freq2 = pentatonicScale[Math.floor(Math.random() * 4)];
        playGuzhengNote(c, freq2, now + 0.3);
      }
      step++;
    }, 1200);
  }

  function stopBGM() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  // Tự động phát nhạc nền ngay khi người dùng chạm hoặc click bất kỳ vị trí nào
  function triggerBGM() {
    ensureCtx();
    if (window.settings && window.settings.sound && !bgmTimer) {
      startBGM();
    }
  }

  window.addEventListener('pointerdown', triggerBGM, { once: true });
  window.addEventListener('click', triggerBGM, { once: true });
  window.addEventListener('keydown', triggerBGM, { once: true });

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
    startBGM,
    stopBGM
  };
})();
