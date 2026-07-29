/* ===========================================================
   ĐẦU HỒ (投壺) — nem ten vao binh, co che do 2 nguoi va doi may
   Giong Co Vay: co menu chon so luong/che do, huong dan choi,
   2 nguoi choi chung may, 1 nguoi choi doi AI (3 muc do).
   =========================================================== */
(function () {
  const SWEET_MIN = 40, SWEET_MAX = 60; // vung "diem ngot" tren thanh luc, tinh theo %

  const th = {
    arrowsPerPlayer: 8,
    mode: "pvp",       // "pvp" | "ai"
    difficulty: "easy",
    timerSeconds: 30,   // 0 = khong gioi han
    turn: 1,           // 1 hoac 2
    thrown: { 1: 0, 2: 0 },
    hits: { 1: 0, 2: 0 },
    gameOver: false,
    meterRunning: false,
    meterRAF: null,
    meterValue: 50,
    startTime: 0,
    busy: false,       // dang trong luc thu ten / hoat canh, khoa nut bam
  };

  let timer = null;

  // ---------------------- LUA CHON MENU ----------------------
  document.querySelectorAll("#th-arrow-options .opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#th-arrow-options .opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      th.arrowsPerPlayer = parseInt(btn.dataset.arrows, 10);
    });
  });

  document.querySelectorAll("#th-mode-options .opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#th-mode-options .opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      th.mode = btn.dataset.mode;
      document.getElementById("th-ai-difficulty").classList.toggle("hidden", th.mode !== "ai");
    });
  });

  document.querySelectorAll("#th-ai-difficulty .opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#th-ai-difficulty .opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      th.difficulty = btn.dataset.diff;
    });
  });

  document.querySelectorAll("#th-timer-options .opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#th-timer-options .opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      th.timerSeconds = parseInt(btn.dataset.timer, 10);
    });
  });

  document.getElementById("th-btn-start").addEventListener("click", () => {
    initTouhu();
    showScreen("game-th");
  });
  document.getElementById("th-btn-tutorial").addEventListener("click", () => showScreen("tutorial-th"));
  document.getElementById("th-btn-help").addEventListener("click", () => showScreen("tutorial-th"));

  // ---------------------- KHOI TAO VAN CHOI ----------------------
  function initTouhu() {
    th.turn = 1;
    th.thrown = { 1: 0, 2: 0 };
    th.hits = { 1: 0, 2: 0 };
    th.gameOver = false;
    th.busy = false;
    timer = createTurnTimer("th-timer-bar", th.timerSeconds, onTimeExpired);

    document.getElementById("th-p1-label").textContent = t("th.label.p1");
    document.getElementById("th-p2-label").textContent = th.mode === "ai" ? t("th.label.ai") : t("th.label.p2");

    updateHudTouhu();
    resetArrowVisual();
    startTurn();
  }

  function onTimeExpired() {
    if (th.gameOver || th.busy) return;
    if (window.SFX) SFX.timeout();
    if (th.mode === "ai" && th.turn === 2) return; // AI tu choi truoc khi het gio
    stopMeter();
    commitThrow(Math.random() * 100); // het gio -> ném luon voi gia tri hien tai/ngau nhien
  }

  function startTurn() {
    if (th.gameOver) return;
    updateHudTouhu();
    if (timer) timer.start();
    if (th.mode === "ai" && th.turn === 2) {
      document.getElementById("th-btn-throw").disabled = true;
      stopMeter();
      setTimeout(aiThrow, 550);
    } else {
      document.getElementById("th-btn-throw").disabled = false;
      startMeter();
    }
  }

  // ---------------------- THANH LUC (METER) ----------------------
  const indicator = document.getElementById("th-meter-indicator");

  function startMeter() {
    th.meterRunning = true;
    th.startTime = performance.now();
    const step = (t) => {
      if (!th.meterRunning) return;
      const elapsed = (t - th.startTime) / 1000;
      th.meterValue = 50 + 47 * Math.sin(elapsed * 2.4);
      indicator.style.left = th.meterValue + "%";
      th.meterRAF = requestAnimationFrame(step);
    };
    th.meterRAF = requestAnimationFrame(step);
  }

  function stopMeter() {
    th.meterRunning = false;
    if (th.meterRAF) cancelAnimationFrame(th.meterRAF);
  }

  document.getElementById("th-btn-throw").addEventListener("click", () => {
    if (th.busy || th.gameOver || (th.mode === "ai" && th.turn === 2)) return;
    stopMeter();
    if (window.SFX) SFX.throwArrow();
    const value = th.meterValue;
    commitThrow(value);
  });

  // ---------------------- AI NEM TEN ----------------------
  function aiThrow() {
    if (th.gameOver) return;
    const hitChance = { easy: 0.35, medium: 0.55, hard: 0.75 }[th.difficulty];
    const isHit = Math.random() < hitChance;
    const value = isHit
      ? SWEET_MIN + 4 + Math.random() * (SWEET_MAX - SWEET_MIN - 8)
      : (Math.random() < 0.5 ? Math.random() * (SWEET_MIN - 6) : SWEET_MAX + 6 + Math.random() * (100 - SWEET_MAX - 6));
    // hoat canh gia lap thanh luc chay nhanh roi dung lai dung vi tri da chon
    let ticks = 0;
    const fakeRun = setInterval(() => {
      indicator.style.left = (Math.random() * 96 + 2) + "%";
      ticks++;
      if (ticks > 8) {
        clearInterval(fakeRun);
        indicator.style.left = value + "%";
        commitThrow(value);
      }
    }, 60);
  }

  // ---------------------- XU LY 1 LAN NEM (DUNG CHUNG NGUOI/AI) ----------------------
  function commitThrow(value) {
    th.busy = true;
    if (timer) timer.stop();
    const isHit = value >= SWEET_MIN && value <= SWEET_MAX;
    const shooter = th.turn;
    th.thrown[shooter] += 1;
    if (isHit) th.hits[shooter] += 1;
    if (window.SFX) (isHit ? SFX.hit() : SFX.miss());

    animateArrow(isHit, () => {
      updateHudTouhu();
      th.busy = false;

      const allDone = th.thrown[1] >= th.arrowsPerPlayer && th.thrown[2] >= th.arrowsPerPlayer;
      if (allDone) {
        endTouhu();
        return;
      }
      th.turn = th.turn === 1 ? 2 : 1;
      startTurn();
    });
  }

  // ---------------------- HOAT CANH MUI TEN ----------------------
  const arrowEl = document.getElementById("th-arrow");

  function resetArrowVisual() {
    arrowEl.style.transition = "none";
    arrowEl.style.transform = "translate(-50%, 0) rotate(0deg)";
    arrowEl.style.opacity = "1";
  }

  function animateArrow(isHit, done) {
    resetArrowVisual();
    requestAnimationFrame(() => {
      arrowEl.style.transition = "transform 0.45s ease-out, opacity 0.3s ease 0.4s";
      if (isHit) {
        arrowEl.style.transform = "translate(-50%, -168px) rotate(0deg)";
      } else {
        const missOffset = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 40);
        arrowEl.style.transform = `translate(calc(-50% + ${missOffset}px), -130px) rotate(${missOffset > 0 ? 35 : -35}deg)`;
      }
      arrowEl.style.opacity = "0";
    });
    setTimeout(() => {
      resetArrowVisual();
      done();
    }, 520);
  }

  // ---------------------- HUD ----------------------
  function updateHudTouhu() {
    document.getElementById("th-turn-text").textContent =
      t(th.turn === 1 ? "th.turn.p1" : (th.mode === "ai" ? "th.turn.ai" : "th.turn.p2"));
    document.querySelector("#th-turn-indicator .stone-dot").className =
      "stone-dot " + (th.turn === 1 ? "black" : "white");
    document.getElementById("th-p1-hits").textContent = th.hits[1];
    document.getElementById("th-p1-thrown").textContent = th.thrown[1];
    document.getElementById("th-p2-hits").textContent = th.hits[2];
    document.getElementById("th-p2-thrown").textContent = th.thrown[2];
  }

  window.addEventListener("languagechange2", () => {
    updateHudTouhu();
    const p1Label = document.getElementById("th-p1-label");
    const p2Label = document.getElementById("th-p2-label");
    if (p1Label) p1Label.textContent = t("th.label.p1");
    if (p2Label) p2Label.textContent = th.mode === "ai" ? t("th.label.ai") : t("th.label.p2");
  });

  // ---------------------- KET THUC VAN ----------------------
  function endTouhu() {
    th.gameOver = true;
    stopMeter();
    if (timer) timer.stop();
    const p2name = th.mode === "ai" ? t("th.label.ai") : t("th.label.p2");
    let title;
    if (th.hits[1] === th.hits[2]) {
      title = t("result.draw");
    } else if (th.hits[1] > th.hits[2]) {
      title = `${t("th.label.p1")} ${t("result.winSuffix")}`;
    } else {
      title = `${p2name} ${t("result.winSuffix")}`;
    }
    const detail = `${t("th.label.p1")}: ${th.hits[1]}/${th.arrowsPerPlayer} · ${p2name}: ${th.hits[2]}/${th.arrowsPerPlayer}`;
    if (window.SFX) SFX.win();
    showResultModal(title, detail, () => initTouhu(), () => showScreen("menu-th"));
  }

  window.addEventListener("screenchange", (e) => {
    if (e.detail.name !== "game-th") { stopMeter(); if (timer) timer.stop(); }
  });

  // export nho de kiem thu (khong anh huong hoat dong thuc te)
  window.__touhuTestHooks = { th, initTouhu, commitThrow, endTouhu, SWEET_MIN, SWEET_MAX };
})();
