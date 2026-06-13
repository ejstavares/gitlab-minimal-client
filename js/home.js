/* ── Home screen ──────────────────────────────────────────────────
   Renders the project list and loads the latest pipeline status
   for each project card.
   ────────────────────────────────────────────────────────────── */

function initHome() {
  loadConfig();

  if (!config.projects?.length) {
    document.getElementById('homeEmpty').style.display   = 'block';
    document.getElementById('homeContent').style.display = 'none';
    applyTranslations();
    return;
  }

  document.getElementById('homeEmpty').style.display   = 'none';
  document.getElementById('homeContent').style.display = 'block';
  document.getElementById('homeSubtitle').textContent  =
    `${config.projects.length} ${t('home_subtitle')} · ${config.url}`;

  document.getElementById('projectsList').innerHTML = config.projects.map((p, i) => `
    <div class="project-list-card" onclick="openProject(${i})">
      <div class="project-avatar">${p.name[0].toUpperCase()}</div>
      <div class="project-list-info">
        <div class="project-list-name">${escHtml(p.name)}</div>
        <div class="project-list-id">${t('proj_id_label')}: ${escHtml(p.id)}</div>
      </div>
      <div class="project-list-meta">
        <div class="project-last-pipeline">
          <span class="pipeline-label">${t('home_last_pipeline')}</span>
          <span id="homeStatus_${i}" class="badge badge-canceled">...</span>
        </div>
        <div id="homeTime_${i}" style="font-size:11px;color:var(--text-2);text-align:right"></div>
      </div>
      <div class="chevron">›</div>
    </div>
  `).join('');

  applyTranslations();
  config.projects.forEach((_, i) => loadHomePipelineStatus(i));
}

async function loadHomePipelineStatus(idx) {
  try {
    const pipelines = await glFetch(idx, '/pipelines', { per_page: 1 });
    if (!pipelines.length) return;
    const p   = pipelines[0];
    const el  = document.getElementById(`homeStatus_${idx}`);
    const tel = document.getElementById(`homeTime_${idx}`);
    if (el) { el.className = badgeCls(p.status); el.textContent = p.status; }
    if (tel) {
      const createdStr = relTime(p.created_at);
      const updatedStr = p.updated_at ? relTime(p.updated_at) : null;
      const showUpd    = updatedStr && updatedStr !== createdStr;
      tel.innerHTML =
        `<span>${t('time_created')}: ${createdStr}</span>` +
        (showUpd ? `<br><span style="color:var(--blue)">${t('time_updated')}: ${updatedStr}</span>` : '');
    }
  } catch {}
}

function refreshHome(btn) {
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ ...';
  }
  // Reset all badges to loading state
  config.projects.forEach((_, i) => {
    const el = document.getElementById(`homeStatus_${i}`);
    if (el) { el.className = 'badge badge-canceled'; el.textContent = '...'; }
  });
  const promises = config.projects.map((_, i) => loadHomePipelineStatus(i));
  Promise.allSettled(promises).finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = t('home_refresh_all');
    }
  });
}
