/* ── Pure utility helpers ─────────────────────────────────────────
   No side-effects, no DOM access, no external dependencies.
   ────────────────────────────────────────────────────────────── */

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badgeCls(status) {
  return ({
    success:  'badge badge-success',
    failed:   'badge badge-failed',
    running:  'badge badge-running',
    pending:  'badge badge-pending',
    canceled: 'badge badge-canceled',
    skipped:  'badge badge-skipped',
  })[status] || 'badge badge-canceled';
}

/** Language-aware relative time. Uses currentLang from i18n.js (global). */
function relTime(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const l = (typeof currentLang !== 'undefined' && currentLang) || 'en';

  const labels = {
    now:  { pt: 'agora',       en: 'just now',   fr: "à l'instant", es: 'ahora' },
    min:  { pt: `${m}m atrás`, en: `${m}m ago`,  fr: `il y a ${m}m`, es: `hace ${m}m` },
    hrs:  { pt: `${h}h atrás`, en: `${h}h ago`,  fr: `il y a ${h}h`, es: `hace ${h}h` },
    day:  { pt: `${d}d atrás`, en: `${d}d ago`,  fr: `il y a ${d}j`, es: `hace ${d}d` },
  };
  const lang = labels.now[l] !== undefined ? l : 'en';

  if (m < 1)  return labels.now[lang];
  if (m < 60) return labels.min[lang];
  if (h < 24) return labels.hrs[lang];
  return labels.day[lang];
}

function fmtDate(iso) {
  if (!iso) return '—';
  const l = (typeof currentLang !== 'undefined' && currentLang) || 'en';
  return new Date(iso).toLocaleString(l === 'en' ? 'en-GB' : 'pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(secs) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60), s = Math.round(secs % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function ansiToHtml(text) {
  return escHtml(text)
    .replace(/\x1b\[0m/g,    '</span>')
    .replace(/\x1b\[1m/g,    '<span class="ansi-bold">')
    .replace(/\x1b\[2m/g,    '<span class="ansi-dim">')
    .replace(/\x1b\[31m/g,   '<span class="ansi-red">')
    .replace(/\x1b\[32m/g,   '<span class="ansi-green">')
    .replace(/\x1b\[33m/g,   '<span class="ansi-yellow">')
    .replace(/\x1b\[34m/g,   '<span class="ansi-blue">')
    .replace(/\x1b\[35m/g,   '<span class="ansi-magenta">')
    .replace(/\x1b\[36m/g,   '<span class="ansi-cyan">')
    .replace(/\x1b\[0;32m/g, '<span class="ansi-green">')
    .replace(/\x1b\[0;31m/g, '<span class="ansi-red">')
    .replace(/\x1b\[0;33m/g, '<span class="ansi-yellow">')
    .replace(/\x1b\[[0-9;]*m/g, '');
}
