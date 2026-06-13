/* ── Project configuration modal ─────────────────────────────────
   Manages the config modal: add/remove projects, save to localStorage.
   ────────────────────────────────────────────────────────────── */

function loadConfig() {
  try {
    const s = localStorage.getItem('gl_cfg_v2');
    if (s) config = JSON.parse(s);
  } catch {}
}

function openConfig() {
  loadConfig();
  document.getElementById('cfgUrl').value = config.url || 'https://gitlab.com';
  const list = document.getElementById('cfgProjectList');
  list.innerHTML = '';
  (config.projects || []).forEach(p => addProjectRow(p));
  applyTranslations();
  document.getElementById('configModal').classList.add('open');
}

function closeConfig() {
  document.getElementById('configModal').classList.remove('open');
}

function addProjectRow(p = {}) {
  const id  = rowIdx++;
  const row = document.createElement('div');
  row.className = 'config-project-item';
  row.id = `cfgRow_${id}`;
  row.innerHTML = `
    <div class="config-project-row">
      <div>
        <label>${t('cfg_project_name')}</label>
        <input type="text" placeholder="my-project" value="${escHtml(p.name || '')}">
      </div>
      <div>
        <label>${t('cfg_project_id')}</label>
        <input type="text" placeholder="123456" value="${escHtml(p.id || '')}">
      </div>
      <div>
        <label>${t('cfg_project_token')}</label>
        <div class="token-wrapper">
          <input type="password" placeholder="glpat-xxxx" value="${escHtml(p.token || '')}">
          <button class="token-copy-btn" type="button"
            onclick="copyToken(this)" title="${t('cfg_copy_token')}">📋</button>
        </div>
      </div>
      <button class="config-project-remove"
        onclick="removeProjectRow('cfgRow_${id}')"
        title="${t('cfg_remove_title')}">✕</button>
    </div>
  `;
  document.getElementById('cfgProjectList').appendChild(row);
}

function removeProjectRow(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function saveConfig() {
  const url  = document.getElementById('cfgUrl').value.replace(/\/$/, '').trim();
  const rows = document.querySelectorAll('.config-project-item');
  const projects = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const name  = inputs[0].value.trim();
    const pid   = inputs[1].value.trim();
    const token = inputs[2].value.trim();
    if (name && pid && token) projects.push({ name, id: pid, token });
  });
  config = { url, projects };
  localStorage.setItem('gl_cfg_v2', JSON.stringify(config));
  closeConfig();
  initHome();
}

// ── Token clipboard copy ──────────────────────────────────────────
function copyToken(btn) {
  const input = btn.previousElementSibling;
  const val   = input.value;
  if (!val) return;
  const ok = () => {
    const prev = btn.textContent;
    btn.textContent = '✓';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => { btn.textContent = prev; btn.style.cssText = ''; }, 1600);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(val).then(ok).catch(() => _fallbackCopy(input, ok));
  } else {
    _fallbackCopy(input, ok);
  }
}

function _fallbackCopy(input, cb) {
  const prev = input.type;
  input.type = 'text';
  input.select();
  try { document.execCommand('copy'); cb(); } catch {}
  input.type = prev;
}
