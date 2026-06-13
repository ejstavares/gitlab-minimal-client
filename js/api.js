/* ── GitLab REST API wrappers ─────────────────────────────────────
   All requests use PRIVATE-TOKEN from the project config.
   glFetch   → GET, returns JSON
   glPost    → POST, returns JSON
   glFetchRaw→ GET, returns plain text (for job logs)
   ────────────────────────────────────────────────────────────── */

async function glFetch(projIdx, path, params = {}) {
  const proj = config.projects[projIdx];
  const base = config.url || 'https://gitlab.com';
  const qs   = new URLSearchParams({ per_page: perPage, ...params }).toString();
  const res  = await fetch(`${base}/api/v4/projects/${proj.id}${path}?${qs}`, {
    headers: { 'PRIVATE-TOKEN': proj.token },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
  return res.json();
}

async function glPost(projIdx, path) {
  const proj = config.projects[projIdx];
  const base = config.url || 'https://gitlab.com';
  const res  = await fetch(`${base}/api/v4/projects/${proj.id}${path}`, {
    method: 'POST',
    headers: { 'PRIVATE-TOKEN': proj.token },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
  return res.json();
}

async function glFetchRaw(projIdx, path) {
  const proj = config.projects[projIdx];
  const base = config.url || 'https://gitlab.com';
  const res  = await fetch(`${base}/api/v4/projects/${proj.id}${path}`, {
    headers: { 'PRIVATE-TOKEN': proj.token },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
