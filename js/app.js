/* ── App entry point — navigation + boot ─────────────────────────
   showScreen / goHome are global navigation primitives used by
   all screen modules. The boot sequence at the bottom initialises
   i18n, theme, config and renders the home screen.
   ────────────────────────────────────────────────────────────── */

// ── Navigation ────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goHome() {
  stopAllPollers();
  currentProjIdx = null;
  currentDetail  = null;
  document.getElementById('breadSep').style.display    = 'none';
  document.getElementById('breadProject').textContent  = '';
  showScreen('screenHome');
  closeDetail();
}

// ── Background auto-refresh (every 30 s) ─────────────────────────
setInterval(() => {
  if (currentProjIdx !== null) {
    loadProjectPipelines(currentProjIdx, null, true); // silent
  } else if (config.projects?.length) {
    refreshHome();
  }
}, 30000);

// ── Boot ──────────────────────────────────────────────────────────
(async () => {
  await loadAvailableLangs();
  await loadLanguage(currentLang);
  applyTheme(localStorage.getItem('gl_theme') || 'dark');
  renderLangSwitcher();
  applyTranslations();
  loadConfig();
  initHome();
})();
