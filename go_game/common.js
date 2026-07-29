/* ===========================================================
   COMMON — dieu huong man hinh va modal ket qua dung chung
   cho ca game Co Vay va game Dau Ho.
   =========================================================== */

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + name);
  if (el) el.classList.add("active");
  window.dispatchEvent(new CustomEvent("screenchange", { detail: { name } }));
}
window.showScreen = showScreen;

// nut co data-goto="ten-man-hinh" -> chuyen man hinh
document.querySelectorAll("[data-goto]").forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.goto));
});

// nut co data-back="ten-man-hinh" -> quay lai man hinh do
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.back));
});

// Tao hieu ung hoa dao rơi dong
(function initPetals() {
  const container = document.getElementById('bg-petals');
  if (!container) return;
  const count = 15;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = Math.random() * 8 + 8;
    p.style.width = size + 'px';
    p.style.height = size * 1.3 + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 5 + 5) + 's';
    p.style.animationDelay = (Math.random() * 5) + 's';
    container.appendChild(p);
  }
})();

/**
 * Tao 1 dong ho dem gio moi luot. durationSeconds = 0 nghia la khong gioi han.
 * Tra ve {start, stop} de tung game tu goi khi bat dau/ket thuc luot.
 */
function createTurnTimer(barElementId, durationSeconds, onExpire) {
  let interval = null;

  function stop() {
    if (interval) clearInterval(interval);
    interval = null;
  }

  function start() {
    stop();
    const bar = document.getElementById(barElementId);
    if (!bar) return;
    if (!durationSeconds || durationSeconds <= 0) {
      bar.style.width = "100%";
      bar.classList.remove("danger");
      return;
    }
    const startTs = performance.now();
    bar.style.width = "100%";
    bar.classList.remove("danger");
    interval = setInterval(() => {
      const elapsed = (performance.now() - startTs) / 1000;
      const remaining = durationSeconds - elapsed;
      const pct = Math.max(0, (remaining / durationSeconds) * 100);
      bar.style.width = pct + "%";
      bar.classList.toggle("danger", pct < 25);
      if (remaining <= 0) {
        stop();
        onExpire();
      }
    }, 100);
  }

  return { start, stop };
}
window.createTurnTimer = createTurnTimer;

function showResultModal(title, detail, onReplay, onMenu) {
  document.getElementById("result-title").textContent = title;
  document.getElementById("result-detail").textContent = detail;
  const modal = document.getElementById("modal-result");
  modal.classList.remove("hidden");

  const replayBtn = document.getElementById("btn-replay");
  const menuBtn = document.getElementById("btn-to-menu");
  replayBtn.onclick = () => { modal.classList.add("hidden"); onReplay(); };
  menuBtn.onclick = () => { modal.classList.add("hidden"); onMenu(); };
}
window.showResultModal = showResultModal;
