/* ===========================================================
   SETTINGS — sang/toi, ngon ngu, am thanh. Luu lai bang localStorage
   de nho lua chon cho lan sau (day la web app rieng cua nguoi dung,
   khong phai artifact trong claude.ai nen dung localStorage binh thuong).
   =========================================================== */
(function () {
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem("cogame-settings") || "{}"); } catch (e) { stored = {}; }

  window.settings = {
    theme: stored.theme || "light",
    lang: stored.lang || "vi",
    sound: stored.sound !== undefined ? stored.sound : true,
  };

  function persist() {
    try { localStorage.setItem("cogame-settings", JSON.stringify(window.settings)); } catch (e) {}
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", window.settings.theme);
    const btn = document.getElementById("btn-theme-toggle");
    if (btn) btn.textContent = window.settings.theme === "dark" ? "☀️" : "🌙";
  }

  function applySoundBtn() {
    const btn = document.getElementById("btn-sound-toggle");
    if (btn) btn.textContent = window.settings.sound ? "🔊" : "🔇";
  }

  function applyLangButtons() {
    document.querySelectorAll(".lang-btn").forEach(b => {
      b.classList.toggle("selected", b.dataset.lang === window.settings.lang);
    });
  }

  window.applyLanguage = function applyLanguage() {
    const lang = window.settings.lang;
    const dict = (window.I18N && window.I18N[lang]) || {};
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = dict[key];
      if (val !== undefined) {
        if (el.hasAttribute("data-i18n-html")) el.innerHTML = val;
        else el.textContent = val;
      }
    });
    document.documentElement.lang = lang;
    applyLangButtons();
    window.dispatchEvent(new CustomEvent("languagechange2", { detail: { lang } }));
  };

  window.t = function t(key) {
    const dict = (window.I18N && window.I18N[window.settings.lang]) || {};
    return dict[key] !== undefined ? dict[key] : key;
  };

  function init() {
    applyTheme();
    applySoundBtn();
    applyLanguage();

    const themeBtn = document.getElementById("btn-theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", () => {
      window.settings.theme = window.settings.theme === "dark" ? "light" : "dark";
      applyTheme();
      persist();
    });

    const soundBtn = document.getElementById("btn-sound-toggle");
    if (soundBtn) soundBtn.addEventListener("click", () => {
      window.settings.sound = !window.settings.sound;
      applySoundBtn();
      persist();
      if (window.SFX) window.SFX.click();
    });

    document.querySelectorAll(".lang-btn").forEach(b => {
      b.addEventListener("click", () => {
        window.settings.lang = b.dataset.lang;
        applyLanguage();
        persist();
      });
    });
  }

  init();
})();
