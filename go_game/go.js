/* ===========================================================
   VÂY KỲ — Logic game cờ vây (Go/Weiqi)
   Luật: bắt quân theo khí, cấm nước tự sát, luật Ko co-ban,
   tính điểm theo diện tích (quân + lãnh thổ) kieu Trung Quoc.
   =========================================================== */

(function(){
// ---------------------- TRANG THAI CHUNG ----------------------
var state = {
  size: 13,
  mode: "pvp",        // "pvp" | "ai"
  difficulty: "easy",
  timerSeconds: 30,    // 0 = khong gioi han
  board: [],           // 0 trong, 1 den, 2 trang
  turn: 1,
  history: [],         // snapshot board sau moi nuoc (bao gom nuoc dau)
  moveLog: [],         // {type:'move'|'pass', x,y,color,captured:[[x,y],...]}
  captures: { 1: 0, 2: 0 },
  passStreak: 0,
  gameOver: false,
  lastMove: null,
};

var timer = null;

var EMPTY = 0, BLACK = 1, WHITE = 2;

// ---------------------- DIEU HUONG (dung ham showScreen dung chung trong common.js) ----------------------
window.addEventListener("screenchange", (e) => {
  if (e.detail.name === "game-go") requestAnimationFrame(resizeCanvasAndDraw);
  else if (timer) timer.stop();
});

document.getElementById("go-btn-tutorial").addEventListener("click", () => showScreen("tutorial-go"));
document.getElementById("go-btn-help").addEventListener("click", () => showScreen("tutorial-go"));

// ---------------------- LUA CHON MENU ----------------------
document.querySelectorAll("#go-board-size-options .opt").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#go-board-size-options .opt").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.size = parseInt(btn.dataset.size, 10);
  });
});

document.querySelectorAll("#go-mode-options .opt").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#go-mode-options .opt").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.mode = btn.dataset.mode;
    document.getElementById("go-ai-difficulty").classList.toggle("hidden", state.mode !== "ai");
  });
});

document.querySelectorAll("#go-ai-difficulty .opt").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#go-ai-difficulty .opt").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.difficulty = btn.dataset.diff;
  });
});

document.querySelectorAll("#go-timer-options .opt").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#go-timer-options .opt").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.timerSeconds = parseInt(btn.dataset.timer, 10);
  });
});

document.getElementById("go-btn-start").addEventListener("click", () => {
  initGame();
  showScreen("game-go");
});

// ---------------------- KHOI TAO VAN CO ----------------------
function initGame() {
  const n = state.size;
  state.board = Array.from({ length: n }, () => Array(n).fill(EMPTY));
  state.turn = BLACK;
  state.history = [snapshot(state.board)];
  state.moveLog = [];
  state.captures = { 1: 0, 2: 0 };
  state.passStreak = 0;
  state.gameOver = false;
  state.lastMove = null;
  timer = createTurnTimer("go-timer-bar", state.timerSeconds, onTimeExpired);
  updateHud();
  timer.start();
}

function onTimeExpired() {
  if (state.gameOver) return;
  if (window.SFX) SFX.timeout();
  passTurn();
}

function snapshot(board) {
  return board.map(row => row.join("")).join("/");
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

// ---------------------- LUAT CO VAY ----------------------
function neighbors(x, y, n) {
  const result = [];
  if (x > 0) result.push([x - 1, y]);
  if (x < n - 1) result.push([x + 1, y]);
  if (y > 0) result.push([x, y - 1]);
  if (y < n - 1) result.push([x, y + 1]);
  return result;
}

/** Tra ve {stones:[[x,y]...], liberties:Set("x,y")} cua nhom quan chua (x,y) */
function getGroup(board, x, y) {
  const n = board.length;
  const color = board[x][y];
  const stones = [];
  const liberties = new Set();
  const seen = new Set([`${x},${y}`]);
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    stones.push([cx, cy]);
    for (const [nx, ny] of neighbors(cx, cy, n)) {
      const key = `${nx},${ny}`;
      if (board[nx][ny] === EMPTY) {
        liberties.add(key);
      } else if (board[nx][ny] === color && !seen.has(key)) {
        seen.add(key);
        stack.push([nx, ny]);
      }
    }
  }
  return { stones, liberties };
}

/**
 * Thu di 1 nuoc. Tra ve null neu nuoc di khong hop le (co quan, tu sat, pham Ko),
 * nguoc lai tra ve {board: bang moi, captured: [[x,y],...]}
 */
function tryMove(board, history, x, y, color) {
  const n = board.length;
  if (board[x][y] !== EMPTY) return null;

  const next = cloneBoard(board);
  next[x][y] = color;
  const opponent = color === BLACK ? WHITE : BLACK;
  let captured = [];

  // bat quan doi phuong het khi
  for (const [nx, ny] of neighbors(x, y, n)) {
    if (next[nx][ny] === opponent) {
      const group = getGroup(next, nx, ny);
      if (group.liberties.size === 0) {
        for (const [gx, gy] of group.stones) {
          next[gx][gy] = EMPTY;
          captured.push([gx, gy]);
        }
      }
    }
  }

  // kiem tra nuoc tu sat
  const ownGroup = getGroup(next, x, y);
  if (ownGroup.liberties.size === 0) {
    return null; // tu sat, khong hop le
  }

  // kiem tra luat Ko: cam tao lai dung trang thai 2 nuoc truoc
  if (history.length >= 2) {
    const koCheckSnapshot = history[history.length - 2];
    if (snapshot(next) === koCheckSnapshot) {
      return null;
    }
  }

  return { board: next, captured };
}

function legalMoves(board, history, color) {
  const n = board.length;
  const moves = [];
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      if (board[x][y] === EMPTY) {
        const result = tryMove(board, history, x, y, color);
        if (result) moves.push({ x, y, result });
      }
    }
  }
  return moves;
}

// ---------------------- THUC HIEN NUOC DI (NGUOI CHOI) ----------------------
function playAt(x, y) {
  if (state.gameOver) return;
  const result = tryMove(state.board, state.history, x, y, state.turn);
  if (!result) {
    flashInvalid();
    return;
  }
  commitMove(x, y, state.turn, result);

  if (state.mode === "ai" && !state.gameOver && state.turn === WHITE) {
    setTimeout(aiPlay, 450);
  }
}

function commitMove(x, y, color, result) {
  state.captures[color] += result.captured.length;
  state.board = result.board;
  state.history.push(snapshot(state.board));
  state.moveLog.push({ type: "move", x, y, color, captured: result.captured });
  state.passStreak = 0;
  state.lastMove = { x, y };
  state.turn = color === BLACK ? WHITE : BLACK;
  if (window.SFX) { result.captured.length > 0 ? SFX.capture() : SFX.stone(); }
  updateHud();
  drawBoard();
  if (timer) timer.start();
}

function passTurn() {
  if (state.gameOver) return;
  state.moveLog.push({ type: "pass", color: state.turn });
  state.passStreak += 1;
  state.turn = state.turn === BLACK ? WHITE : BLACK;
  updateHud();

  if (state.passStreak >= 2) {
    endGame();
    return;
  }
  if (timer) timer.start();
  if (state.mode === "ai" && state.turn === WHITE) {
    setTimeout(aiPlay, 450);
  }
}

function undoMove() {
  if (state.moveLog.length === 0 || state.gameOver) return;
  // trong che do vs AI, lui lai 2 nuoc (cua may va cua nguoi) de den luot nguoi choi
  const stepsToUndo = state.mode === "ai" ? 2 : 1;
  for (let i = 0; i < stepsToUndo; i++) {
    const last = state.moveLog.pop();
    if (!last) break;
    if (last.type === "move") {
      state.captures[last.color] -= last.captured.length;
    }
    state.history.pop();
    state.passStreak = 0;
  }
  const currentSnapshot = state.history[state.history.length - 1];
  state.board = parseSnapshot(currentSnapshot, state.size);
  const movesPlayed = state.moveLog.length;
  state.turn = (movesPlayed % 2 === 0) ? BLACK : WHITE;
  state.lastMove = null;
  updateHud();
  drawBoard();
  if (timer) timer.start();
}

function parseSnapshot(snap, n) {
  return snap.split("/").map(row => row.split("").map(c => parseInt(c, 10)));
}

function resignGame() {
  if (state.gameOver) return;
  if (timer) timer.stop();
  const winnerColorKey = state.turn === BLACK ? "color.white" : "color.black";
  showResult(`${t(winnerColorKey)} ${t("result.winSuffix")}`, t("result.resignInfo"));
  state.gameOver = true;
}

// ---------------------- TINH DIEM KET THUC ----------------------
function computeScore(board) {
  const n = board.length;
  const visited = Array.from({ length: n }, () => Array(n).fill(false));
  let blackStones = 0, whiteStones = 0, blackTerritory = 0, whiteTerritory = 0;

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      if (board[x][y] === BLACK) blackStones++;
      else if (board[x][y] === WHITE) whiteStones++;
    }
  }

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      if (board[x][y] !== EMPTY || visited[x][y]) continue;
      const region = [];
      const borders = new Set();
      const stack = [[x, y]];
      visited[x][y] = true;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        region.push([cx, cy]);
        for (const [nx, ny] of neighbors(cx, cy, n)) {
          if (board[nx][ny] === EMPTY && !visited[nx][ny]) {
            visited[nx][ny] = true;
            stack.push([nx, ny]);
          } else if (board[nx][ny] !== EMPTY) {
            borders.add(board[nx][ny]);
          }
        }
      }
      if (borders.size === 1) {
        const owner = borders.values().next().value;
        if (owner === BLACK) blackTerritory += region.length;
        else whiteTerritory += region.length;
      }
    }
  }

  return {
    black: blackStones + blackTerritory,
    white: whiteStones + whiteTerritory,
  };
}

function endGame() {
  state.gameOver = true;
  if (timer) timer.stop();
  const score = computeScore(state.board);
  const diff = Math.abs(score.black - score.white);
  const isDraw = score.black === score.white;
  const title = isDraw
    ? t("result.draw")
    : `${t(score.black > score.white ? "color.black" : "color.white")} ${t("result.winSuffix")}`;
  const detail = `${t("color.black")}: ${score.black} ${t("result.points")} · ${t("color.white")}: ${score.white} ${t("result.points")}` +
    (!isDraw ? ` (${t("result.diff")} ${diff} ${t("result.points")})` : "");
  if (window.SFX) SFX.win();
  showResult(title, detail);
}

function showResult(title, detail) {
  showResultModal(title, detail, () => initGame(), () => showScreen("menu-go"));
}

document.getElementById("go-btn-pass").addEventListener("click", passTurn);
document.getElementById("go-btn-undo").addEventListener("click", undoMove);
document.getElementById("go-btn-resign").addEventListener("click", resignGame);

// ---------------------- AI DON GIAN ----------------------
function aiPlay() {
  if (state.gameOver) return;
  const moves = legalMoves(state.board, state.history, WHITE);

  if (moves.length === 0) {
    passTurn();
    return;
  }

  const scored = moves.map(m => {
    const ownGroup = getGroup(m.result.board, m.x, m.y);
    const score = m.result.captured.length * 12 + ownGroup.liberties.size;
    return { ...m, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const filled = countStones(state.board);
  const total = state.size * state.size;
  const bestScore = scored[0].score;
  if (filled / total > 0.55 && bestScore <= 1 && Math.random() < 0.35) {
    passTurn();
    return;
  }

  let chosen;
  if (state.difficulty === "hard") {
    chosen = scored[0];
  } else if (state.difficulty === "medium") {
    const pool = scored.slice(0, Math.max(1, Math.ceil(scored.length * 0.3)));
    chosen = pool[Math.floor(Math.random() * pool.length)];
  } else {
    if (Math.random() < 0.3) {
      chosen = scored[0];
    } else {
      chosen = moves[Math.floor(Math.random() * moves.length)];
    }
  }

  commitMove(chosen.x, chosen.y, WHITE, chosen.result);
}

function countStones(board) {
  let c = 0;
  for (const row of board) for (const v of row) if (v !== EMPTY) c++;
  return c;
}

// ---------------------- GIAO DIEN / HUD ----------------------
function updateHud() {
  document.getElementById("go-turn-text").textContent = t(state.turn === BLACK ? "go.turn.black" : "go.turn.white");
  document.querySelector("#go-turn-indicator .stone-dot").className =
    "stone-dot " + (state.turn === BLACK ? "black" : "white");
  document.getElementById("go-black-captures").textContent = state.captures[1];
  document.getElementById("go-white-captures").textContent = state.captures[2];
}

window.addEventListener("languagechange2", () => { if (state.board.length) updateHud(); });

function flashInvalid() {
  canvas.style.filter = "saturate(0.4)";
  setTimeout(() => { canvas.style.filter = ""; }, 120);
}

// ---------------------- VE BAN CO (CANVAS) ----------------------
const canvas = document.getElementById("board-canvas");
const ctx = canvas.getContext("2d");
let cellSize = 0, margin = 0;

function resizeCanvasAndDraw() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawBoard();
}
window.addEventListener("resize", () => { if (state.board.length) resizeCanvasAndDraw(); });

function starPoints(n) {
  if (n === 9) return [[2,2],[2,6],[6,2],[6,6],[4,4]];
  if (n === 13) return [[3,3],[3,9],[9,3],[9,9],[6,6]];
  if (n === 19) {
    const idx = [3, 9, 15];
    const pts = [];
    for (const a of idx) for (const b of idx) pts.push([a, b]);
    return pts;
  }
  return [];
}

function drawBoard() {
  if (!state.board.length) return;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  const n = state.size;
  margin = w / (n + 1);
  cellSize = (w - margin * 2) / (n - 1);

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#dcb98d");
  grad.addColorStop(0.5, "#c9a06c");
  grad.addColorStop(1, "#b98c56");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(120,85,45,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (h / 14) * i + Math.sin(i) * 4);
    ctx.bezierCurveTo(w * 0.3, (h / 14) * i + 10, w * 0.7, (h / 14) * i - 10, w, (h / 14) * i);
    ctx.stroke();
  }

  ctx.strokeStyle = "#4a3a24";
  ctx.lineWidth = Math.max(1, w / 500);
  for (let i = 0; i < n; i++) {
    const pos = margin + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(margin, pos);
    ctx.lineTo(margin + (n - 1) * cellSize, pos);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos, margin);
    ctx.lineTo(pos, margin + (n - 1) * cellSize);
    ctx.stroke();
  }

  ctx.fillStyle = "#4a3a24";
  for (const [sx, sy] of starPoints(n)) {
    const px = margin + sx * cellSize;
    const py = margin + sy * cellSize;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(2.5, cellSize * 0.07), 0, Math.PI * 2);
    ctx.fill();
  }

  const stoneR = cellSize * 0.46;
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      const v = state.board[x][y];
      if (v === EMPTY) continue;
      const px = margin + x * cellSize;
      const py = margin + y * cellSize;

      ctx.beginPath();
      ctx.ellipse(px + stoneR * 0.12, py + stoneR * 0.22, stoneR * 0.95, stoneR * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fill();

      const stoneGrad = ctx.createRadialGradient(
        px - stoneR * 0.35, py - stoneR * 0.4, stoneR * 0.1,
        px, py, stoneR
      );
      if (v === BLACK) {
        stoneGrad.addColorStop(0, "#5c5c5c");
        stoneGrad.addColorStop(0.5, "#232323");
        stoneGrad.addColorStop(1, "#020202");
      } else {
        stoneGrad.addColorStop(0, "#ffffff");
        stoneGrad.addColorStop(0.6, "#e9e7df");
        stoneGrad.addColorStop(1, "#c9c6ba");
      }
      ctx.beginPath();
      ctx.arc(px, py, stoneR, 0, Math.PI * 2);
      ctx.fillStyle = stoneGrad;
      ctx.fill();
    }
  }

  if (state.lastMove) {
    const { x, y } = state.lastMove;
    const px = margin + x * cellSize;
    const py = margin + y * cellSize;
    const color = state.board[x][y];
    ctx.beginPath();
    ctx.arc(px, py, stoneR * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = color === BLACK ? "#e8483a" : "#a8382c";
    ctx.fill();
  }
}

canvas.addEventListener("click", (evt) => {
  if (state.mode === "ai" && state.turn === WHITE) return;
  const rect = canvas.getBoundingClientRect();
  const cx = evt.clientX - rect.left;
  const cy = evt.clientY - rect.top;
  const n = state.size;
  const gx = Math.round((cx - margin) / cellSize);
  const gy = Math.round((cy - margin) / cellSize);
  if (gx < 0 || gx >= n || gy < 0 || gy >= n) return;
  const px = margin + gx * cellSize;
  const py = margin + gy * cellSize;
  const dist = Math.hypot(cx - px, cy - py);
  if (dist > cellSize * 0.48) return;
  playAt(gx, gy);
});

})();
