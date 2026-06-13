/* ── Dark / Light theme ───────────────────────────────────────────
   Theme is stored in localStorage ('gl_theme').
   The data-theme attribute on <html> controls CSS variables.
   ────────────────────────────────────────────────────────────── */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gl_theme', theme);
  updateThemeBtn();
}

function updateThemeBtn() {
  const btn   = document.getElementById('themeBtn');
  if (!btn) return;
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  // show icon for the OTHER theme (what you'll switch to)
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  btn.title = t(theme === 'dark' ? 'theme_toggle_light' : 'theme_toggle_dark');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
