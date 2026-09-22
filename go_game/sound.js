/* ===========================================================
   SFX & NHẠC NỀN AUDIO — TRÒ CHƠI CỔ PHONG
   Phát bài nhạc nền từ file audio (M4A / WebM / MP3) kết hợp
   hiệu ứng âm thanh trò chơi (SFX) bằng Web Audio API.
   =========================================================== */
(function () {
  let ctx = null;
  let bgmAudio = null;

  function getAudioContext() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // =================== TRÌNH PHÁT NHẠC NỀN (AUDIO BGM) ===================
  function initBgmAudio() {
    if (bgmAudio) return bgmAudio;
    try {
      bgmAudio = new Audio();
      bgmAudio.loop = true;
      bgmAudio.volume = 0.45;
      bgmAudio.preload = "auto";

      // Hỗ trợ cả file m4a và webm
      if (bgmAudio.canPlayType("audio/mp4")) {
        bgmAudio.src = "bgm.m4a";
      } else if (bgmAudio.canPlayType("audio/webm")) {
        bgmAudio.src = "bgm.webm";
      } else {
        bgmAudio.src = "bgm.m4a";
      }
    } catch (e) {
      bgmAudio = null;
    }
    return bgmAudio;
  }

  function startBGM() {
    if (window.settings && window.settings.sound === false) return;
    const audio = initBgmAudio();
    if (!audio) return;

    audio.volume = 0.45;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Tự động thử lại khi có tương tác người dùng
      });
    }
  }

  function stopBGM() {
    if (bgmAudio) {
      bgmAudio.pause();
    }
  }

  function triggerBGM() {
    const c = getAudioContext();
    if (c && c.state === "suspended") {
      c.resume().catch(() => {});
    }
    if (window.settings && window.settings.sound !== false) {
      startBGM();
    }
  }

  // Tự động kích hoạt khi chạm hoặc click màn hình lần đầu
  ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, triggerBGM, { passive: true });
  });

  // =================== HIỆU ỨNG ÂM THANH TRÒ CHƠI (SFX) ===================
  function tone(freq, duration, type, gainStart) {
    if (window.settings && window.settings.sound === false) return;
    const c = getAudioContext();
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainStart || 0.25, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration);
    } catch (e) {}
  }

  function noiseBurst(duration, gainStart) {
    if (window.settings && window.settings.sound === false) return;
    const c = getAudioContext();
    if (!c) return;
    try {
      const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const src = c.createBufferSource();
      src.buffer = buffer;
      const gain = c.createGain();
      gain.gain.setValueAtTime(gainStart || 0.2, c.currentTime);
      src.connect(gain).connect(c.destination);
      src.start();
    } catch (e) {}
  }

  window.SFX = {
    stone() { tone(320, 0.12, "square", 0.25); },
    capture() { tone(190, 0.22, "sawtooth", 0.25); setTimeout(() => tone(140, 0.2, "sawtooth", 0.2), 80); },
    throwArrow() { tone(650, 0.14, "sine", 0.18); },
    hit() { tone(880, 0.16, "triangle", 0.25); setTimeout(() => tone(1300, 0.15, "triangle", 0.2), 90); },
    miss() { tone(190, 0.22, "sine", 0.15); },
    dice() { noiseBurst(0.28, 0.25); setTimeout(() => noiseBurst(0.18, 0.18), 90); },
    move() { tone(400, 0.1, "square", 0.18); },
    click() { tone(520, 0.06, "square", 0.12); },
    timeout() { tone(150, 0.35, "square", 0.25); },
    win() { tone(523, 0.16, "triangle", 0.28); setTimeout(() => tone(659, 0.16, "triangle", 0.28), 130); setTimeout(() => tone(784, 0.28, "triangle", 0.3), 260); },
    startBGM,
    stopBGM
  };
})();
