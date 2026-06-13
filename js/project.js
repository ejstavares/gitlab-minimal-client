/* ── Project screen — commits & pipelines ─────────────────────────
   Manages the project view with its two tabs.
   loadProjectPipelines accepts a `silent` flag so background
   auto-refreshes don't flash a loading spinner.
   ────────────────────────────────────────────────────────────── */

function openProject(idx) {
  currentProjIdx = idx;
  const proj = config.projects[idx];

  document.getElementById('breadSep').style.display    = '';
  document.getElementById('breadProject').textContent  = proj.name;
  document.getElementById('projAvatar').textContent    = proj.name[0].toUpperCase();
  document.getElementById('projName').textContent      = proj.name;
  document.getElementById('projMeta').textContent      = `${t('proj_id_label')}: ${proj.id} · ${config.url}`;
  document.getElementById('projStatusBadge').className = 'project-header-status status-unknown';
  document.getElementById('projStatusBadge').textContent = '—';

  // Reset tabs to first
  document.querySelectorAll('#screenProject .tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === 0);
  });
  document.querySelectorAll('#screenProject .tab-pane').forEach((pane, i) => {
    pane.classList.toggle('active', i === 0);
  });

  document.getElementById('pane_commits').innerHTML =
    `<div class="empty-state"><span class="spinner"></span> ${t('loading')}</div>`;
  document.getElementById('pane_pipelines').innerHTML =
    `<div class="empty-state"><span class="spinner"></span> ${t('loading')}</div>`;

  showScreen('screenProject');
  loadProjectCommits(idx);
  loadProjectPipelines(idx);
}

function switchProjTab(name, el) {
  document.querySelectorAll('#screenProject .tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`pane_${name}`).classList.add('active');
  document.querySelectorAll('#screenProject .tab').forEach(tab => tab.classList.remove('active'));
  if (el) el.classList.add('active');
}

function refreshProject() {
  if (currentProjIdx === null) return;
  loadProjectCommits(currentProjIdx);
  loadProjectPipelines(currentProjIdx);
}

// ── Commits ───────────────────────────────────────────────────────
async function loadProjectCommits(idx, btn) {
  const el = document.getElementById('pane_commits');
  if (btn) { btn.disabled = true; btn.textContent = t('updating'); }
  else     { el.innerHTML = `<div class="empty-state"><span class="spinner"></span> ${t('loading')}</div>`; }

  try {
    const commits = await glFetch(idx, '/repository/commits', { per_page: perPage });
    if (!commits.length) { el.innerHTML = `<div class="empty-state">${t('no_commits')}</div>`; return; }

    el.innerHTML = _infoBar(idx) + commits.map(c => `
      <div class="commit-item">
        <div class="commit-top"><span class="commit-sha">${c.short_id}</span></div>
        <div class="commit-msg" title="${escHtml(c.title)}">${escHtml(c.title)}</div>
        <div class="commit-meta">${escHtml(c.author_name)} · ${relTime(c.created_at)}</div>
      </div>
    `).join('') +
      `<button class="load-more-btn" onclick="loadProjectCommits(${idx}, this)">${t('btn_update')}</button>`;

  } catch(e) {
    el.innerHTML =
      `<div class="empty-state" style="color:var(--red)">${t('error_prefix')}: ${escHtml(e.message)}</div>
       <button class="load-more-btn" onclick="loadProjectCommits(${idx}, this)">${t('btn_retry_load')}</button>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = t('btn_update'); }
  }
}

// ── Pipelines ─────────────────────────────────────────────────────
// silent=true → background auto-refresh (no loading flash)
async function loadProjectPipelines(idx, btn, silent = false) {
  const el       = document.getElementById('pane_pipelines');
  const statusEl = document.getElementById('projStatusBadge');

  if (btn)        { btn.disabled = true; btn.textContent = t('updating'); }
  else if (!silent) { el.innerHTML = `<div class="empty-state"><span class="spinner"></span> ${t('loading')}</div>`; }

  try {
    const pipelines = await glFetch(idx, '/pipelines', { per_page: perPage });
    if (!pipelines.length) { el.innerHTML = `<div class="empty-state">${t('no_pipelines')}</div>`; return; }

    const latest = pipelines[0];
    const sMap   = { success: 'status-ok', failed: 'status-fail', running: 'status-running' };
    if (statusEl) {
      statusEl.className   = `project-header-status ${sMap[latest.status] || 'status-unknown'}`;
      statusEl.textContent = latest.status;
    }
    const hEl = document.getElementById(`homeStatus_${idx}`);
    if (hEl) { hEl.className = badgeCls(latest.status); hEl.textContent = latest.status; }

    el.innerHTML = _infoBar(idx) + pipelines.map(p => {
      const createdStr = relTime(p.created_at);
      const updatedStr = p.updated_at ? relTime(p.updated_at) : null;
      const showUpd    = updatedStr && updatedStr !== createdStr;
      return `
      <div class="pipeline-item" onclick="openPipelineDetail(${idx}, ${p.id})">
        <div class="pipeline-row">
          <span class="pipeline-id">#${p.id}</span>
          <span class="${badgeCls(p.status)}">${p.status}</span>
          <span class="pipeline-ref">${escHtml(p.ref)}</span>
          <span class="pipeline-sha">${escHtml(p.sha ? p.sha.slice(0, 8) : '')}</span>
          <div class="pipeline-times">
            <span class="pipeline-time-row">${t('time_created')}: ${createdStr}</span>
            ${showUpd ? `<span class="pipeline-time-row pipeline-time-updated">${t('time_updated')}: ${updatedStr}</span>` : ''}
          </div>
        </div>
      </div>`;
    }).join('') +
      `<button class="load-more-btn" onclick="loadProjectPipelines(${idx}, this)">${t('btn_update')}</button>`;

  } catch(e) {
    el.innerHTML =
      `<div class="empty-state" style="color:var(--red)">${t('error_prefix')}: ${escHtml(e.message)}</div>
       <button class="load-more-btn" onclick="loadProjectPipelines(${idx})">${t('btn_retry_load')}</button>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = t('btn_update'); }
  }
}

// ── Per-page limit control ────────────────────────────────────────
function changePerPage(input, idx) {
  let v = parseInt(input.value, 10);
  if (!v || v < 1) { v = 10; input.value = 10; }
  perPage = v;
  localStorage.setItem('gl_pp', v);
  loadProjectCommits(idx);
  loadProjectPipelines(idx);
}

function _infoBar(idx) {
  return `<div class="list-info-bar">
    ${t('list_info_prefix')}
    <input type="number" class="perpage-input" min="1" value="${perPage}"
      onchange="changePerPage(this, ${idx})" onclick="event.stopPropagation()">
    ${t('list_info_suffix')}
  </div>`;
}
