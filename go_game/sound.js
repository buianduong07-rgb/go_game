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

  // ================= NHẠC NỀN CUNG ĐÌNH (COURT MUSIC BGM) =================
  let bgmTimer = null;
  let bgmStep = 0;

  // Giai điệu cung đình cố định - thang âm ngũ cung Trung Hoa (C D E G A)
  // Mỗi nốt: [tần số, thời lượng giây]
  const courtMelody = [
    // Câu 1: Mở đầu trang nghiêm
    [523.25, 1.8], [587.33, 1.2], [659.25, 1.8], [783.99, 2.4],
    [880.00, 1.2], [783.99, 1.8], [659.25, 2.4], [0, 1.0],
    // Câu 2: Luyến láy
    [587.33, 1.2], [523.25, 1.8], [440.00, 1.2], [523.25, 2.4],
    [587.33, 1.8], [659.25, 1.2], [523.25, 2.4], [0, 1.0],
    // Câu 3: Cao trào nhẹ
    [783.99, 1.2], [880.00, 1.8], [783.99, 1.2], [659.25, 1.8],
    [587.33, 2.4], [523.25, 1.2], [440.00, 1.8], [0, 1.0],
    // Câu 4: Kết thúc trầm lắng
    [523.25, 1.8], [440.00, 1.2], [392.00, 2.4], [440.00, 1.8],
    [523.25, 2.4], [0, 2.0],
  ];

  // Phát một nốt đàn Tranh (Guzheng) với âm sắc phong phú
  function playCourtNote(c, freq, duration, startTime) {
    if (freq === 0) return; // nốt nghỉ

    // Lớp 1: Âm cơ bản (sine) - trong trẻo
    const osc1 = c.createOscillator();
    const gain1 = c.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, startTime);
    gain1.gain.setValueAtTime(0, startTime);
    gain1.gain.linearRampToValueAtTime(0.06, startTime + 0.03);
    gain1.gain.setValueAtTime(0.06, startTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc1.connect(gain1).connect(c.destination);
    osc1.start(startTime);
    osc1.stop(startTime + duration + 0.1);

    // Lớp 2: Họa âm bậc 2 (triangle) - tạo độ ấm
    const osc2 = c.createOscillator();
    const gain2 = c.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.02, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7);
    osc2.connect(gain2).connect(c.destination);
    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.1);

    // Lớp 3: Tiếng rung nhẹ (vibrato) - đặc trưng nhạc cung đình
    const osc3 = c.createOscillator();
    const gain3 = c.createGain();
    const vibrato = c.createOscillator();
    const vibratoGain = c.createGain();
    vibrato.frequency.value = 5;
    vibratoGain.gain.value = 3;
    vibrato.connect(vibratoGain).connect(osc3.frequency);
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq, startTime);
    gain3.gain.setValueAtTime(0, startTime);
    gain3.gain.linearRampToValueAtTime(0.03, startTime + duration * 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc3.connect(gain3).connect(c.destination);
    vibrato.start(startTime);
    osc3.start(startTime);
    vibrato.stop(startTime + duration + 0.1);
    osc3.stop(startTime + duration + 0.1);
  }

  // Phát nền trầm drone nhẹ (đặc trưng nhạc cung đình)
  let droneOsc = null;
  let droneGain = null;

  function startDrone(c) {
    if (droneOsc) return;
    droneOsc = c.createOscillator();
    droneGain = c.createGain();
    droneOsc.type = "sine";
    droneOsc.frequency.value = 130.81; // C3 - nốt nền trầm
    droneGain.gain.setValueAtTime(0, c.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.025, c.currentTime + 2);
    droneOsc.connect(droneGain).connect(c.destination);
    droneOsc.start();
  }

  function stopDrone() {
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

    startDrone(c);
    bgmStep = 0;

    function playNextNote() {
      if (!window.settings || !window.settings.sound) {
        stopBGM();
        return;
      }
      const c = ensureCtx();
      if (!c) return;

      const [freq, dur] = courtMelody[bgmStep % courtMelody.length];
      const now = c.currentTime;

      playCourtNote(c, freq, dur, now);

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
    stopDrone();
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
