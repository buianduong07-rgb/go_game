/* ===========================================================
   LỤC BÁC (六博) — gieo xuc xac dua 6 quan ve dich, bat quan doc duong.
   Luat co that da that truyen; day la phien ban dien giai don gian
   hoa hien dai (xem ghi chu trong tutorial), khong phai phuc dung
   chinh xac lich su. Giong Co Vay/Dau Ho: menu, huong dan, 2 nguoi,
   1 nguoi doi AI, dong ho dem gio, am thanh, da ngon ngu.
   =========================================================== */
(function () {
  const TRACK_LEN = 20;   // tong so o quanh vong dua
  const SIDE = 5;         // so o moi canh hinh vuong (4 x 5 = 20)
  const PIECES = 6;
  const ENTRY = { 1: 0, 2: 10 }; // vi tri xuat phat tren vong chung cua moi nguoi

  const lb = {
    mode: "pvp",
    difficulty: "easy",
    timerSeconds: 30,
    turn: 1,
    pieces: { 1: [], 2: [] }, // moi phan tu la progress: 0..20 (20 = ve dich)
    phase: "roll",            // "roll" | "choose"
    lastRoll: 0,
    movablePieces: [],
    gameOver: false,
    busy: false,
  };

  let timer = null;

  // ---------------------- LUA CHON MENU ----------------------
  document.querySelectorAll("#lb-mode-options .opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#lb-mode-options .opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      lb.mode = btn.dataset.mode;
      document.getElementById("lb-ai-difficulty").classList.toggle("hidden", lb.mode !== "ai");
    });
  });

  document.querySelectorAll("#lb-ai-difficulty .opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#lb-ai-difficulty .opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      lb.difficulty = btn.dataset.diff;
    });
  });

  document.querySelectorAll("#lb-timer-options .opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#lb-timer-options .opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      lb.timerSeconds = parseInt(btn.dataset.timer, 10);
    });
  });

  document.getElementById("lb-btn-start").addEventListener("click", () => {
    initLucBac();
    showScreen("game-lb");
  });
  document.getElementById("lb-btn-tutorial").addEventListener("click", () => showScreen("tutorial-lb"));
  document.getElementById("lb-btn-help").addEventListener("click", () => showScreen("tutorial-lb"));

  // ---------------------- KHOI TAO VAN CHOI ----------------------
  function initLucBac() {
    lb.turn = 1;
    lb.pieces = { 1: Array(PIECES).fill(0), 2: Array(PIECES).fill(0) };
    lb.phase = "roll";
    lb.lastRoll = 0;
    lb.movablePieces = [];
    lb.gameOver = false;
    lb.busy = false;
    timer = createTurnTimer("lb-timer-bar", lb.timerSeconds, onTimeExpired);

    document.getElementById("lb-p1-label").textContent = t("lb.label.p1");
    document.getElementById("lb-p2-label").textContent = lb.mode === "ai" ? t("lb.label.ai") : t("lb.label.p2");

    renderBoard();
    updateHudLucBac();
    startTurn();
  }

  function onTimeExpired() {
    if (lb.gameOver || lb.busy) return;
    if (window.SFX) SFX.timeout();
    if (lb.mode === "ai" && lb.turn === 2) return;
    if (lb.phase === "roll") {
      rollDice();
    } else if (lb.phase === "choose" && lb.movablePieces.length) {
      const idx = lb.movablePieces[Math.floor(Math.random() * lb.movablePieces.length)];
      choosePiece(idx);
    }
  }

  function startTurn() {
    if (lb.gameOver) return;
    lb.phase = "roll";
    updateHudLucBac();
    if (timer) timer.start();

    const rollBtn = document.getElementById("lb-btn-roll");
    if (lb.mode === "ai" && lb.turn === 2) {
      rollBtn.disabled = true;
      setTimeout(rollDice, 550);
    } else {
      rollBtn.disabled = false;
    }
  }

  document.getElementById("lb-btn-roll").addEventListener("click", () => {
    if (lb.busy || lb.gameOver || lb.phase !== "roll" || (lb.mode === "ai" && lb.turn === 2)) return;
    rollDice();
  });

  // ---------------------- GIEO XUC XAC ----------------------
  function rollDice() {
    if (lb.gameOver) return;
    lb.busy = true;
    document.getElementById("lb-btn-roll").disabled = true;
    if (window.SFX) SFX.dice();

    const roll = 1 + Math.floor(Math.random() * 6);
    lb.lastRoll = roll;
    document.getElementById("lb-dice-value").textContent = roll;
    document.getElementById("lb-dice").classList.add("rolling");
    setTimeout(() => document.getElementById("lb-dice").classList.remove("rolling"), 400);

    const movable = [];
    lb.pieces[lb.turn].forEach((p, i) => {
      if (p < TRACK_LEN && p + roll <= TRACK_LEN) movable.push(i);
    });
    lb.movablePieces = movable;

    setTimeout(() => {
      lb.busy = false;
      if (movable.length === 0) {
        renderBoard();
        setTimeout(() => switchTurn(), 500);
        return;
      }
      if (lb.mode === "ai" && lb.turn === 2) {
        const idx = pickAiPiece(movable, roll);
        setTimeout(() => choosePiece(idx), 500);
      } else {
        lb.phase = "choose";
        renderBoard();
        updateHudLucBac();
      }
    }, 450);
  }

  function pickAiPiece(movable, roll) {
    const scored = movable.map(i => {
      const newProgress = lb.pieces[2][i] + roll;
      const abs = newProgress < TRACK_LEN ? (ENTRY[2] + newProgress) % TRACK_LEN : -1;
      let captureScore = 0;
      if (abs >= 0) {
        lb.pieces[1].forEach(p => {
          if (p < TRACK_LEN && (ENTRY[1] + p) % TRACK_LEN === abs) captureScore = 20;
        });
      }
      return { i, score: captureScore + newProgress };
    });
    scored.sort((a, b) => b.score - a.score);

    if (lb.difficulty === "hard") return scored[0].i;
    if (lb.difficulty === "medium") {
      const pool = scored.slice(0, Math.max(1, Math.ceil(scored.length * 0.5)));
      return pool[Math.floor(Math.random() * pool.length)].i;
    }
    return movable[Math.floor(Math.random() * movable.length)];
  }

  // ---------------------- CHON QUAN DE DI ----------------------
  function choosePiece(pieceIndex) {
    if (lb.gameOver) return;
    const player = lb.turn;
    const opponent = player === 1 ? 2 : 1;
    lb.pieces[player][pieceIndex] += lb.lastRoll;
    const newProgress = lb.pieces[player][pieceIndex];

    if (newProgress < TRACK_LEN) {
      const abs = (ENTRY[player] + newProgress) % TRACK_LEN;
      lb.pieces[opponent].forEach((p, i) => {
        if (p < TRACK_LEN && (ENTRY[opponent] + p) % TRACK_LEN === abs) {
          lb.pieces[opponent][i] = 0;
          if (window.SFX) SFX.capture();
        }
      });
    } else {
      if (window.SFX) SFX.move();
    }

    lb.phase = "roll";
    lb.movablePieces = [];
    renderBoard();
    updateHudLucBac();

    const finished = lb.pieces[player].every(p => p >= TRACK_LEN);
    if (finished) {
      endLucBac(player);
      return;
    }
    switchTurn();
  }

  function switchTurn() {
    lb.turn = lb.turn === 1 ? 2 : 1;
    startTurn();
  }

  // ---------------------- VE BAN CO ----------------------
  function cellCoords(pos) {
    let x, y;
    if (pos < SIDE) { x = pos; y = 0; }
    else if (pos < 2 * SIDE) { x = SIDE; y = pos - SIDE; }
    else if (pos < 3 * SIDE) { x = SIDE - (pos - 2 * SIDE); y = SIDE; }
    else { x = 0; y = SIDE - (pos - 3 * SIDE); }
    return { xPct: (x / SIDE) * 88 + 6, yPct: (y / SIDE) * 88 + 6 };
  }

  function renderBoard() {
    const board = document.getElementById("lb-board");
    board.innerHTML = "";

    for (let i = 0; i < TRACK_LEN; i++) {
      const { xPct, yPct } = cellCoords(i);
      const cell = document.createElement("div");
      cell.className = "lb-cell";
      if (i === ENTRY[1]) cell.classList.add("entry-p1");
      if (i === ENTRY[2]) cell.classList.add("entry-p2");
      cell.style.left = xPct + "%";
      cell.style.top = yPct + "%";
      board.appendChild(cell);
    }

    [1, 2].forEach(player => {
      lb.pieces[player].forEach((p, idx) => {
        if (p >= TRACK_LEN) return;
        const abs = (ENTRY[player] + p) % TRACK_LEN;
        const { xPct, yPct } = cellCoords(abs);
        const piece = document.createElement("div");
        const isMovable = lb.phase === "choose" && lb.turn === player && lb.movablePieces.includes(idx)
          && !(lb.mode === "ai" && player === 2);
        piece.className = "lb-piece p" + player + (isMovable ? " movable" : "");
        piece.style.left = xPct + "%";
        piece.style.top = yPct + "%";
        piece.title = "Quân " + (idx + 1);
        if (isMovable) piece.addEventListener("click", () => choosePiece(idx));
        board.appendChild(piece);
      });
    });
  }

  // ---------------------- HUD ----------------------
  function updateHudLucBac() {
    document.getElementById("lb-turn-text").textContent =
      t(lb.turn === 1 ? "lb.turn.p1" : (lb.mode === "ai" ? "lb.turn.ai" : "lb.turn.p2"));
    document.querySelector("#lb-turn-indicator .stone-dot").className =
      "stone-dot " + (lb.turn === 1 ? "black" : "white");
    document.getElementById("lb-p1-home").textContent = lb.pieces[1].filter(p => p >= TRACK_LEN).length;
    document.getElementById("lb-p2-home").textContent = lb.pieces[2].filter(p => p >= TRACK_LEN).length;
    document.getElementById("lb-hint").textContent = lb.phase === "choose" ? t("lb.hint.choose") : "";
  }

  window.addEventListener("languagechange2", () => {
    if (lb.pieces[1].length) updateHudLucBac();
    const p1Label = document.getElementById("lb-p1-label");
    const p2Label = document.getElementById("lb-p2-label");
    if (p1Label) p1Label.textContent = t("lb.label.p1");
    if (p2Label) p2Label.textContent = lb.mode === "ai" ? t("lb.label.ai") : t("lb.label.p2");
  });

  // ---------------------- KET THUC VAN ----------------------
  function endLucBac(winner) {
    lb.gameOver = true;
    if (timer) timer.stop();
    const winnerName = winner === 1 ? t("lb.label.p1") : (lb.mode === "ai" ? t("lb.label.ai") : t("lb.label.p2"));
    const title = `${winnerName} ${t("result.winSuffix")}`;
    const detail = `${t("lb.label.p1")}: ${lb.pieces[1].filter(p => p >= TRACK_LEN).length}/${PIECES} · ` +
      `${lb.mode === "ai" ? t("lb.label.ai") : t("lb.label.p2")}: ${lb.pieces[2].filter(p => p >= TRACK_LEN).length}/${PIECES}`;
    if (window.SFX) SFX.win();
    showResultModal(title, detail, () => initLucBac(), () => showScreen("menu-lb"));
  }

  window.addEventListener("screenchange", (e) => {
    if (e.detail.name !== "game-lb" && timer) timer.stop();
  });

  window.__lucbacTestHooks = { lb, initLucBac, rollDice, choosePiece, TRACK_LEN, ENTRY };
})();
