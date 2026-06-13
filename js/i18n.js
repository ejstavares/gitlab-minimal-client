/* ── Internationalisation ─────────────────────────────────────────
   Supports: pt · en · fr · es
   3-tier loading: .js script tag → .json fetch → embedded FALLBACK
   ────────────────────────────────────────────────────────────── */

let i18nStrings  = {};
let availableLangs = [];
let currentLang  = localStorage.getItem('gl_lang') || 'pt';

// ── Embedded fallback strings (work on file:// and http://) ──────
const FALLBACK = {
  pt: {
    app_title:'GitLab - Minimal Dashboard', btn_projects:'⚙️ Projetos',
    cfg_title:'Configuração', cfg_base_url:'GitLab Base URL',
    cfg_projects_section:'Projetos', cfg_add_project:'+ Adicionar projeto',
    cfg_project_name:'Nome do projeto', cfg_project_id:'Project ID',
    cfg_project_token:'Private Token', cfg_cancel:'Cancelar', cfg_save:'Salvar',
    cfg_remove_title:'Remover', cfg_copy_token:'Copiar token',
    home_no_projects:'Nenhum projeto configurado', home_configure_now:'Configurar agora',
    home_title:'Projetos', home_subtitle:'projeto(s)', home_refresh_all:'↺ Atualizar todos',
    home_last_pipeline:'Último pipeline',
    tab_commits:'Commits', tab_pipelines:'Pipelines',
    btn_refresh:'↺ Refresh', btn_back:'← Voltar', proj_id_label:'ID',
    pipeline_ref:'Branch / Ref', pipeline_duration:'Duração total',
    pipeline_started:'Iniciado', pipeline_finished:'Finalizado',
    pipeline_jobs_count:'job(s) · por stage', pipeline_stage_jobs:'job(s)',
    time_created:'🕐 Criado', time_updated:'🔄 Atualizado',
    job_log_btn:'📄 Log', job_run_again:'▶ Run again', job_running:'⏳ Running...',
    job_starting:'⏳ Iniciando...', job_no_retry:'Status não permite retry',
    job_retry_title:'Executar novamente',
    log_placeholder:'Clique em "Log" para carregar...', log_loading:'Carregando log...',
    log_reloading:'Recarregando log final...', log_restarted:'Job reiniciado, aguardando log...',
    loading:'Carregando...', updating:'⏳ Atualizando...',
    no_commits:'Nenhum commit encontrado', no_pipelines:'Nenhum pipeline encontrado',
    btn_update:'↺ Atualizar', btn_retry_load:'↺ Tentar novamente',
    error_prefix:'Erro', error_retry_job:'Erro ao reiniciar job',
    detail_loading:'Carregando detalhes...', detail_refresh:'↺ Refresh',
    list_info_prefix:'Últimos', list_info_suffix:'registos carregados',
    theme_toggle_dark:'Tema escuro', theme_toggle_light:'Tema claro',
  },
  fr: {
    app_title:'GitLab - Minimal Dashboard', btn_projects:'⚙️ Projets',
    cfg_title:'Configuration', cfg_base_url:'URL de base GitLab',
    cfg_projects_section:'Projets', cfg_add_project:'+ Ajouter un projet',
    cfg_project_name:'Nom du projet', cfg_project_id:'ID du projet',
    cfg_project_token:'Jeton privé', cfg_cancel:'Annuler', cfg_save:'Enregistrer',
    cfg_remove_title:'Supprimer', cfg_copy_token:'Copier le jeton',
    home_no_projects:'Aucun projet configuré', home_configure_now:'Configurer maintenant',
    home_title:'Projets', home_subtitle:'projet(s)', home_refresh_all:'↺ Actualiser tout',
    home_last_pipeline:'Dernier pipeline',
    tab_commits:'Commits', tab_pipelines:'Pipelines',
    btn_refresh:'↺ Actualiser', btn_back:'← Retour', proj_id_label:'ID',
    pipeline_ref:'Branche / Ref', pipeline_duration:'Durée totale',
    pipeline_started:'Démarré', pipeline_finished:'Terminé',
    pipeline_jobs_count:'job(s) · par étape', pipeline_stage_jobs:'job(s)',
    time_created:'🕐 Créé', time_updated:'🔄 Mis à jour',
    job_log_btn:'📄 Journal', job_run_again:'▶ Relancer', job_running:'⏳ En cours...',
    job_starting:'⏳ Démarrage...', job_no_retry:'Le statut ne permet pas de relancer',
    job_retry_title:'Relancer',
    log_placeholder:'Cliquez sur "Journal" pour charger...', log_loading:'Chargement du journal...',
    log_reloading:'Rechargement du journal final...', log_restarted:'Job relancé, en attente du journal...',
    loading:'Chargement...', updating:'⏳ Actualisation...',
    no_commits:'Aucun commit trouvé', no_pipelines:'Aucun pipeline trouvé',
    btn_update:'↺ Actualiser', btn_retry_load:'↺ Réessayer',
    error_prefix:'Erreur', error_retry_job:'Échec du redémarrage du job',
    detail_loading:'Chargement des détails...', detail_refresh:'↺ Actualiser',
    list_info_prefix:'Derniers', list_info_suffix:'enregistrements chargés',
    theme_toggle_dark:'Thème sombre', theme_toggle_light:'Thème clair',
  },
  es: {
    app_title:'GitLab - Minimal Dashboard', btn_projects:'⚙️ Proyectos',
    cfg_title:'Configuración', cfg_base_url:'URL base de GitLab',
    cfg_projects_section:'Proyectos', cfg_add_project:'+ Añadir proyecto',
    cfg_project_name:'Nombre del proyecto', cfg_project_id:'ID del proyecto',
    cfg_project_token:'Token privado', cfg_cancel:'Cancelar', cfg_save:'Guardar',
    cfg_remove_title:'Eliminar', cfg_copy_token:'Copiar token',
    home_no_projects:'Ningún proyecto configurado', home_configure_now:'Configurar ahora',
    home_title:'Proyectos', home_subtitle:'proyecto(s)', home_refresh_all:'↺ Actualizar todos',
    home_last_pipeline:'Último pipeline',
    tab_commits:'Commits', tab_pipelines:'Pipelines',
    btn_refresh:'↺ Actualizar', btn_back:'← Volver', proj_id_label:'ID',
    pipeline_ref:'Rama / Ref', pipeline_duration:'Duración total',
    pipeline_started:'Iniciado', pipeline_finished:'Finalizado',
    pipeline_jobs_count:'job(s) · por etapa', pipeline_stage_jobs:'job(s)',
    time_created:'🕐 Creado', time_updated:'🔄 Actualizado',
    job_log_btn:'📄 Log', job_run_again:'▶ Ejecutar de nuevo', job_running:'⏳ Ejecutando...',
    job_starting:'⏳ Iniciando...', job_no_retry:'El estado no permite reintentar',
    job_retry_title:'Ejecutar de nuevo',
    log_placeholder:'Haz clic en "Log" para cargar...', log_loading:'Cargando log...',
    log_reloading:'Recargando log final...', log_restarted:'Job reiniciado, esperando log...',
    loading:'Cargando...', updating:'⏳ Actualizando...',
    no_commits:'No se encontraron commits', no_pipelines:'No se encontraron pipelines',
    btn_update:'↺ Actualizar', btn_retry_load:'↺ Reintentar',
    error_prefix:'Error', error_retry_job:'Error al reiniciar el job',
    detail_loading:'Cargando detalles...', detail_refresh:'↺ Actualizar',
    list_info_prefix:'Últimos', list_info_suffix:'registros cargados',
    theme_toggle_dark:'Tema oscuro', theme_toggle_light:'Tema claro',
  },
  en: {
    app_title:'GitLab - Minimal Dashboard', btn_projects:'⚙️ Projects',
    cfg_title:'Settings', cfg_base_url:'GitLab Base URL',
    cfg_projects_section:'Projects', cfg_add_project:'+ Add project',
    cfg_project_name:'Project name', cfg_project_id:'Project ID',
    cfg_project_token:'Private Token', cfg_cancel:'Cancel', cfg_save:'Save',
    cfg_remove_title:'Remove', cfg_copy_token:'Copy token',
    home_no_projects:'No projects configured', home_configure_now:'Configure now',
    home_title:'Projects', home_subtitle:'project(s)', home_refresh_all:'↺ Refresh all',
    home_last_pipeline:'Last pipeline',
    tab_commits:'Commits', tab_pipelines:'Pipelines',
    btn_refresh:'↺ Refresh', btn_back:'← Back', proj_id_label:'ID',
    pipeline_ref:'Branch / Ref', pipeline_duration:'Total duration',
    pipeline_started:'Started', pipeline_finished:'Finished',
    pipeline_jobs_count:'job(s) · by stage', pipeline_stage_jobs:'job(s)',
    time_created:'🕐 Created', time_updated:'🔄 Updated',
    job_log_btn:'📄 Log', job_run_again:'▶ Run again', job_running:'⏳ Running...',
    job_starting:'⏳ Starting...', job_no_retry:'Status does not allow retry',
    job_retry_title:'Run again',
    log_placeholder:'Click "Log" to load...', log_loading:'Loading log...',
    log_reloading:'Reloading final log...', log_restarted:'Job restarted, waiting for log...',
    loading:'Loading...', updating:'⏳ Updating...',
    no_commits:'No commits found', no_pipelines:'No pipelines found',
    btn_update:'↺ Refresh', btn_retry_load:'↺ Try again',
    error_prefix:'Error', error_retry_job:'Failed to restart job',
    detail_loading:'Loading details...', detail_refresh:'↺ Refresh',
    list_info_prefix:'Last', list_info_suffix:'records loaded',
    theme_toggle_dark:'Dark theme', theme_toggle_light:'Light theme',
  },
};

// ── Core translation function ─────────────────────────────────────
function t(key) {
  return i18nStrings[key] ?? FALLBACK[currentLang]?.[key] ?? key;
}

// ── Dynamic script loader (works on file:// and http://) ──────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-i18n-src="${src}"]`);
    if (existing) existing.remove();
    const s = document.createElement('script');
    s.src = src + '?_=' + Date.now();
    s.setAttribute('data-i18n-src', src);
    s.onload  = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadLanguage(code) {
  // 1. Try .js (works everywhere)
  try {
    await loadScript(`i18n/${code}.js`);
    if (window.GL_I18N?.[code]) {
      i18nStrings = window.GL_I18N[code];
      currentLang = code;
      localStorage.setItem('gl_lang', code);
      document.documentElement.lang = code;
      return;
    }
  } catch {}

  // 2. Try .json (http:// only)
  try {
    const res = await fetch(`i18n/${code}.json`);
    if (!res.ok) throw new Error();
    i18nStrings = await res.json();
    currentLang = code;
    localStorage.setItem('gl_lang', code);
    document.documentElement.lang = code;
    return;
  } catch {}

  // 3. Embedded fallback
  i18nStrings = FALLBACK[code] || FALLBACK['pt'];
  currentLang = code;
  localStorage.setItem('gl_lang', code);
  document.documentElement.lang = code;
}

async function loadAvailableLangs() {
  // 1. Try .js
  try {
    await loadScript('i18n/languages.js');
    if (window.GL_LANGS?.length) { availableLangs = window.GL_LANGS; return; }
  } catch {}

  // 2. Try .json
  try {
    const res = await fetch('i18n/languages.json');
    if (!res.ok) throw new Error();
    availableLangs = await res.json();
    return;
  } catch {}

  // 3. Derive from FALLBACK keys
  availableLangs = Object.keys(FALLBACK).map(code => ({
    code,
    label: code.toUpperCase(),
    name: ({ pt: 'Português', en: 'English', fr: 'Français', es: 'Español' })[code] || code,
  }));
}

function renderLangSwitcher() {
  const el = document.getElementById('langSwitcher');
  if (!el) return;
  el.innerHTML = availableLangs.map(l => `
    <button class="lang-btn ${l.code === currentLang ? 'active' : ''}"
      onclick="switchLang('${l.code}')" title="${escHtml(l.name)}">${escHtml(l.label)}</button>
  `).join('');
}

async function switchLang(code) {
  await loadLanguage(code);
  applyTranslations();
  renderLangSwitcher();
  updateThemeBtn();
  if (document.getElementById('screenHome').classList.contains('active')) {
    initHome();
  } else if (currentProjIdx !== null) {
    openProject(currentProjIdx);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
}
