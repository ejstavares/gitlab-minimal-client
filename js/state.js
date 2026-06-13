/* ── Application State ────────────────────────────────────────────
   Single source of truth for all mutable runtime data.
   Loaded first so every other module can reference these globals.
   ────────────────────────────────────────────────────────────── */

let config         = { url: 'https://gitlab.com', projects: [] };
let currentProjIdx = null;
let currentDetail  = null;
let jobPollers     = {};
let loadedLogs     = new Set();
let rowIdx         = 0;
let perPage        = Math.max(1, parseInt(localStorage.getItem('gl_pp') || '10', 10) || 10);
