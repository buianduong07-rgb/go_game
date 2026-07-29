/* ===========================================================
   SFX & NHẠC NỀN NHÃ NHẠC CUNG ĐÌNH HUẾ — Web Audio API
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

  // ================= NHÃ NHẠC CUNG ĐÌNH HUẾ (HUE IMPERIAL COURT MUSIC) =================
  let bgmTimer = null;
  let bgmStep = 0;
  let droneOsc = null;
  let droneGain = null;

  // Thang âm ngũ cung Nhã Nhạc Huế (Điệu Nam/Điệu Bắc: D4, F4, G4, A4, C5, D5, F5, G5)
  // [freq, duration, instrumentType: 'tranh'|'sao'|'tyba', HasPhach: boolean]
  const hueCourtMelody = [
    // --- Đoạn 1: Đăng Đàn Cung (Mở đầu uy nghiêm) ---
    [293.66, 2.0, 'tranh', true],   // D4 (Hò) + Phách
    [349.23, 1.4, 'sao', false],     // F4 (Xự)
    [392.00, 1.8, 'tranh', false],   // G4 (Xang)
    [440.00, 2.4, 'tyba', true],     // A4 (Xê) + Phách
    [523.25, 1.4, 'sao', false],     // C5 (Cống)
    [587.33, 2.0, 'tranh', false],   // D5 (Líu)
    [440.00, 1.8, 'sao', false],     // A4
    [392.00, 2.5, 'tranh', true],    // G4 + Phách
    [0, 0.8, 'none', false],

    // --- Đoạn 2: Lưu Thủy - Kim Tiền (Du dương, luyến láy Huế) ---
    [349.23, 1.5, 'tranh', false],   // F4
    [392.00, 1.2, 'tyba', false],    // G4
    [440.00, 1.8, 'sao', true],      // A4 + Phách
    [523.25, 1.5, 'tranh', false],   // C5
    [587.33, 2.2, 'sao', false],     // D5
    [698.46, 1.4, 'tranh', true],    // F5 + Phách
    [587.33, 1.8, 'tyba', false],    // D5
    [523.25, 2.4, 'tranh', true],    // C5 + Phách
    [0, 1.0, 'none', false],

    // --- Đoạn 3: Phú Lục (Trang trọng, sâu lắng) ---
    [440.00, 1.8, 'sao', false],     // A4
    [392.00, 1.4, 'tranh', true],    // G4 + Phách
    [349.23, 1.8, 'tyba', false],    // F4
    [293.66, 2.6, 'tranh', true],    // D4 + Phách
    [392.00, 1.5, 'sao', false],     // G4
    [440.00, 2.0, 'tranh', false],   // A4
    [523.25, 2.5, 'tyba', true],     // C5 + Phách
    [0, 1.2, 'none', false],
  ];

  // 1. Giả lập Tiếng Đàn Tranh Huế (Plucked String + Vibrato/Nhún)
  function playDanTranh(c, freq, duration, time) {
    if (freq === 0) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const vibrato = c.createOscillator();
    const vibratoGain = c.createGain();

    // Rung nhún đặc trưng Nhã Nhạc Huế
    vibrato.frequency.value = 5.5;
    vibratoGain.gain.value = freq * 0.015;
    vibrato.connect(vibratoGain).connect(osc.frequency);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    vibrato.start(time);
    osc.connect(gain).connect(c.destination);
    osc.start(time);
    osc.stop(time + duration + 0.1);
    vibrato.stop(time + duration + 0.1);
  }

  // 2. Giả lập Tiếng Sáo Trúc Huế (Bamboo Flute + Soft Bend)
  function playSaoTruc(c, freq, duration, time) {
    if (freq === 0) return;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    // Tiếng sáo lướt nốt nhẹ (pitch bend)
    osc.frequency.setValueAtTime(freq * 0.96, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.08);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.1);
    gain.gain.setValueAtTime(0.05, time + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain).connect(c.destination);
    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  // 3. Giả lập Tiếng Đàn Tỳ Bà Huế (Strummed Lute)
  function playDanTyBa(c, freq, duration, time) {
    if (freq === 0) return;
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const gain = c.createGain();

    osc1.type = "sawtooth";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.8);

    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain).connect(c.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.1);
    osc2.stop(time + duration + 0.1);
  }

  // 4. Giả lập Tiếng Phách / Thanh La Cung Đình (Wood Clapper / Metallic Bell Touch)
  function playPhachHue(c, time) {
    // Tiếng gỗ phách gõ nhịp
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, time);
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.04);

    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain).connect(c.destination);
    osc.start(time);
    osc.stop(time + 0.06);

    // Tiếng Thanh la ngân nhẹ
    const gong = c.createOscillator();
    const gongGain = c.createGain();
    gong.type = "sine";
    gong.frequency.setValueAtTime(2400, time);

    gongGain.gain.setValueAtTime(0.02, time);
    gongGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);

    gong.connect(gongGain).connect(c.destination);
    gong.start(time);
    gong.stop(time + 0.45);
  }

  // Nốt Trống Nhã Nhạc nền trầm (Hue Court Bass Drum)
  function startHueCourtDrone(c) {
    if (droneOsc) return;
    droneOsc = c.createOscillator();
    droneGain = c.createGain();
    droneOsc.type = "sine";
    droneOsc.frequency.value = 110.0; // A2 - âm sắc trầm ấm hoàng gia Huế
    droneGain.gain.setValueAtTime(0, c.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.02, c.currentTime + 2);
    droneOsc.connect(droneGain).connect(c.destination);
    droneOsc.start();
  }

  function stopHueCourtDrone() {
    if (droneOsc) {
      try { droneOsc.stop(); } catch(e) {}
      droneOsc = null;
      droneGain = null;
    }
  }

  function startBGM() {
    stopBGM();
    const c = ensureCtx();
    if (!c) return;

    startHueCourtDrone(c);
    bgmStep = 0;

    function playNextNote() {
      if (!window.settings || !window.settings.sound) {
        stopBGM();
        return;
      }
      const c = ensureCtx();
      if (!c) return;

      const [freq, dur, inst, hasPhach] = hueCourtMelody[bgmStep % hueCourtMelody.length];
      const now = c.currentTime;

      if (hasPhach) {
        playPhachHue(c, now);
      }

      if (inst === 'tranh') {
        playDanTranh(c, freq, dur, now);
      } else if (inst === 'sao') {
        playSaoTruc(c, freq, dur, now);
      } else if (inst === 'tyba') {
        playDanTyBa(c, freq, dur, now);
      }

      bgmStep++;
      bgmTimer = setTimeout(playNextNote, dur * 1000);
    }

    playNextNote();
  }

  function stopBGM() {
    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }
    stopHueCourtDrone();
  }

  // Tự động phát nhạc nền ngay khi người dùng tương tác
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
