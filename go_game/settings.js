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

const iconSun = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>`;
  const iconMoon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const iconSoundOn = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
  const iconSoundOff = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", window.settings.theme);
    const btn = document.getElementById("btn-theme-toggle");
    if (btn) btn.innerHTML = window.settings.theme === "dark" ? iconSun : iconMoon;
  }

  function applySoundBtn() {
    const btn = document.getElementById("btn-sound-toggle");
    if (btn) btn.innerHTML = window.settings.sound ? iconSoundOn : iconSoundOff;
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
      if (window.SFX) {
        if (window.settings.sound) {
          window.SFX.startBGM();
        } else {
          window.SFX.stopBGM();
        }
        window.SFX.click();
      }
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
