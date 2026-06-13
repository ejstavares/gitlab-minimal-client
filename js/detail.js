/* ── Pipeline detail panel — jobs, logs, retry ───────────────────
   Opens a slide-in panel with all jobs grouped by stage.
   startJobPoller polls every 4 s while a job is active.
   ────────────────────────────────────────────────────────────── */

// ── Pollers ───────────────────────────────────────────────────────
function stopAllPollers() {
  Object.values(jobPollers).forEach(clearInterval);
  jobPollers = {};
}
function stopJobPoller(jobId) {
  if (jobPollers[jobId]) { clearInterval(jobPollers[jobId]); delete jobPollers[jobId]; }
}

function startJobPoller(projIdx, jobId) {
  stopJobPoller(jobId);
  const ACTIVE = ['running', 'pending', 'created', 'waiting_for_resource', 'preparing'];
  jobPollers[jobId] = setInterval(async () => {
    try {
      const job     = await glFetch(projIdx, `/jobs/${jobId}`);
      const badgeEl = document.getElementById(`badge_${jobId}`);
      const retryBtn = document.getElementById(`retry_${jobId}`);
      if (!badgeEl) { stopJobPoller(jobId); return; }

      badgeEl.className = badgeCls(job.status);
      badgeEl.textContent = job.status;

      if (!ACTIVE.includes(job.status)) {
        stopJobPoller(jobId);
        if (retryBtn) {
          retryBtn.disabled = false;
          retryBtn.textContent = t('job_run_again');
          retryBtn.style.cssText = '';
        }
        // Reload log if it's open
        const logEl = document.getElementById(`log_${jobId}`);
        if (logEl?.classList.contains('open')) {
          loadedLogs.delete(jobId);
          logEl.innerHTML = `<span class="log-loading"><span class="spinner"></span> ${t('log_reloading')}</span>`;
          try {
            const raw = await glFetchRaw(projIdx, `/jobs/${jobId}/trace`);
            logEl.innerHTML = ansiToHtml(raw);
            loadedLogs.add(jobId);
          } catch {}
        }
        loadProjectPipelines(projIdx, null, true); // silent update
      }
    } catch {}
  }, 4000);
}

// ── Detail panel ──────────────────────────────────────────────────
function refreshDetail() {
  if (!currentDetail) return;
  const btn = document.getElementById('detailRefreshBtn');
  btn.disabled = true;
  btn.textContent = '⏳ ...';
  openPipelineDetail(currentDetail.projIdx, currentDetail.pipelineId)
    .finally(() => { btn.disabled = false; btn.textContent = t('detail_refresh'); });
}

async function openPipelineDetail(projIdx, pipelineId) {
  currentDetail = { projIdx, pipelineId };
  stopAllPollers();

  document.getElementById('detailTitle').textContent = `Pipeline #${pipelineId}`;
  document.getElementById('detailBadge').innerHTML   = '';
  document.getElementById('detailBody').innerHTML    =
    `<div class="empty-state"><span class="spinner"></span> ${t('detail_loading')}</div>`;
  document.getElementById('detailPanel').classList.add('open');
  document.getElementById('overlayBg').classList.add('open');

  try {
    const [pipeline, jobs] = await Promise.all([
      glFetch(projIdx, `/pipelines/${pipelineId}`),
      glFetch(projIdx, `/pipelines/${pipelineId}/jobs`, { per_page: 100, include_retried: true }),
    ]);

    document.getElementById('detailBadge').innerHTML =
      `<span class="${badgeCls(pipeline.status)}">${pipeline.status}</span>`;

    // Build stage order from job list
    const stageOrder = [];
    jobs.forEach(j => { if (!stageOrder.includes(j.stage)) stageOrder.push(j.stage); });

    let html = `
      <div class="pipeline-info-grid">
        <div class="info-box">
          <div class="info-label">${t('pipeline_ref')}</div>
          <div class="info-value">${escHtml(pipeline.ref)}</div>
        </div>
        <div class="info-box">
          <div class="info-label">${t('pipeline_duration')}</div>
          <div class="info-value">${pipeline.duration ? formatDuration(pipeline.duration) : '—'}</div>
        </div>
        <div class="info-box">
          <div class="info-label">${t('pipeline_started')}</div>
          <div class="info-value">${fmtDate(pipeline.created_at)}</div>
        </div>
        <div class="info-box">
          <div class="info-label">${t('pipeline_finished')}</div>
          <div class="info-value">${pipeline.finished_at ? fmtDate(pipeline.finished_at) : '—'}</div>
        </div>
      </div>
      <div class="section-label">${jobs.length} ${t('pipeline_jobs_count')}</div>
    `;

    stageOrder.forEach(stage => {
      const sJobs = jobs.filter(j => j.stage === stage);
      html += `<div style="margin-bottom:16px">
        <div class="stage-header">
          ${escHtml(stage)}
          <span class="stage-count">${sJobs.length} ${t('pipeline_stage_jobs')}</span>
        </div>`;

      sJobs.forEach(job => {
        const canRetry  = ['failed', 'canceled', 'success', 'skipped'].includes(job.status);
        const isRetried = job.retried === true;
        html += `
          <div class="job-item${isRetried ? ' job-retried' : ''}" id="job_${job.id}">
            <div class="job-header">
              <span class="${badgeCls(job.status)}" id="badge_${job.id}">${job.status}</span>
              <div class="job-info">
                <span class="job-name">${escHtml(job.name)}</span>
                <span class="job-id-tag">#${job.id}${isRetried ? ` <span class="retried-tag">retried</span>` : ''}</span>
              </div>
              <span class="job-duration">${job.duration ? formatDuration(job.duration) : '—'}</span>
              <span class="job-time">${relTime(job.created_at)}</span>
              <button class="job-expand-btn" onclick="toggleLog(${projIdx}, ${job.id})">${t('job_log_btn')}</button>
              <button class="job-retry-btn" id="retry_${job.id}"
                onclick="retryJob(event, ${projIdx}, ${job.id})"
                ${canRetry ? '' : 'disabled'}
                title="${canRetry ? t('job_retry_title') : t('job_no_retry')}"
              >${t('job_run_again')}</button>
            </div>
            <pre class="job-log" id="log_${job.id}"><span class="log-loading">${t('log_placeholder')}</span></pre>
          </div>`;
      });
      html += `</div>`;
    });

    document.getElementById('detailBody').innerHTML = html;
  } catch(e) {
    document.getElementById('detailBody').innerHTML =
      `<div class="empty-state" style="color:var(--red)">${t('error_prefix')}: ${escHtml(e.message)}</div>`;
  }
}

function closeDetail() {
  stopAllPollers();
  currentDetail = null;
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('overlayBg').classList.remove('open');
}

// ── Log viewer ────────────────────────────────────────────────────
async function toggleLog(projIdx, jobId) {
  const logEl  = document.getElementById(`log_${jobId}`);
  const isOpen = logEl.classList.contains('open');
  if (isOpen) { logEl.classList.remove('open'); return; }
  logEl.classList.add('open');
  if (!loadedLogs.has(jobId)) {
    logEl.innerHTML = `<span class="log-loading"><span class="spinner"></span> ${t('log_loading')}</span>`;
    try {
      const raw = await glFetchRaw(projIdx, `/jobs/${jobId}/trace`);
      logEl.innerHTML = ansiToHtml(raw);
      loadedLogs.add(jobId);
    } catch(e) {
      logEl.innerHTML = `<span style="color:var(--red)">${t('error_prefix')}: ${escHtml(e.message)}</span>`;
    }
  }
}

// ── Job retry ─────────────────────────────────────────────────────
async function retryJob(event, projIdx, jobId) {
  event.stopPropagation();
  const btn     = document.getElementById(`retry_${jobId}`);
  const badgeEl = document.getElementById(`badge_${jobId}`);
  btn.disabled = true;
  btn.classList.add('retrying');
  btn.textContent = t('job_starting');

  try {
    const newJob = await glPost(projIdx, `/jobs/${jobId}/retry`);
    badgeEl.className   = badgeCls(newJob.status);
    badgeEl.textContent = newJob.status;
    btn.classList.remove('retrying');
    btn.textContent = t('job_running');
    loadedLogs.delete(jobId);
    const logEl = document.getElementById(`log_${jobId}`);
    if (logEl?.classList.contains('open'))
      logEl.innerHTML = `<span class="log-loading"><span class="spinner"></span> ${t('log_restarted')}</span>`;
    startJobPoller(projIdx, jobId);
    loadProjectPipelines(projIdx, null, true);
  } catch(e) {
    btn.disabled = false;
    btn.classList.remove('retrying');
    btn.textContent = '✗ ' + t('error_prefix');
    btn.style.borderColor = 'var(--red)';
    btn.style.color = 'var(--red)';
    alert(`${t('error_retry_job')}: ${e.message}`);
    setTimeout(() => { btn.textContent = t('job_run_again'); btn.style.cssText = ''; }, 3000);
  }
}
