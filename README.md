# GitLab Minimal Client

A lightweight, single-page dashboard for monitoring GitLab projects — pipelines, commits, and job logs — directly from your browser. No build tools, no dependencies, no backend.

🔗 **Live demo:** [ejstavares.github.io/gitlab-minimal-client](https://ejstavares.github.io/gitlab-minimal-client)

If this project is useful to you, consider leaving a ⭐ on [GitHub](https://github.com/ejstavares/gitlab-minimal-client) — it helps others find it and motivates continued development!

---

## Features

- **Multi-project support** — configure multiple GitLab projects with individual private tokens
- **Pipeline monitoring** — view pipeline status, ref, SHA, and timestamps at a glance
- **Commit history** — browse recent commits per project
- **Job detail panel** — expand any pipeline to see all jobs grouped by stage, with live status polling every 4 seconds
- **Job logs** — view ANSI-rendered logs on demand, reloaded automatically when a job finishes
- **Job retry** — retry failed or canceled jobs with one click
- **Dark / Light theme** — toggle between themes, persisted in localStorage
- **Multilingual** — Portuguese 🇵🇹, English 🇬🇧, French 🇫🇷, Spanish 🇪🇸
- **Configurable record limit** — choose how many commits/pipelines to load (default: 10)
- **Auto-refresh** — silently refreshes pipelines every 30 seconds in the background
- **Mobile-friendly** — responsive layout down to small screens

---

## Getting Started

No installation required. Simply open `index.html` in a browser, or host it on any static file server (including GitHub Pages).

### 1. Clone the repository

```bash
git clone https://github.com/ejstavares/gitlab-minimal-client.git
cd gitlab-minimal-client
```

### 2. Open in browser

```bash
open index.html
# or serve locally:
npx serve .
```

### 3. Configure a project

Click **⚙️ Projetos** in the header and add your GitLab instance URL, project ID, and private token. Tokens are stored only in your browser's `localStorage` — never sent anywhere except directly to your GitLab instance.

---

## Project Structure

```
index.html          # Lean HTML shell
css/
  main.css          # All styles — dark/light themes, responsive breakpoints
js/
  state.js          # Shared global state
  helpers.js        # Utility functions (escHtml, relTime, ansiToHtml…)
  i18n.js           # Internationalisation — t(), loadLanguage, switchLang
  api.js            # GitLab API calls (glFetch, glPost, glFetchRaw)
  theme.js          # Dark/light theme toggle
  config.js         # Configuration modal — add/remove/save projects
  home.js           # Home screen — project cards with pipeline status
  project.js        # Project screen — commits & pipelines tabs
  detail.js         # Detail panel — jobs, logs, retry, polling
  app.js            # Boot sequence, navigation, auto-refresh
i18n/
  pt.js             # Portuguese strings
  en.js             # English strings
  fr.js             # French strings
  es.js             # Spanish strings
images/             # Static assets (optional)
```

---

## Configuration

All config is stored in `localStorage` under the key `gl_cfg_v2`:

```json
{
  "url": "https://gitlab.com",
  "projects": [
    { "name": "My App", "id": "12345678", "token": "glpat-xxxx" }
  ]
}
```

Other persisted keys:

| Key       | Purpose                       | Default |
|-----------|-------------------------------|---------|
| `gl_theme`| UI theme (`dark` / `light`)   | `dark`  |
| `gl_lang` | Interface language code       | `pt`    |
| `gl_pp`   | Records per page (min 1)      | `10`    |

---

## GitLab API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /projects/:id/pipelines` | List pipelines |
| `GET /projects/:id/repository/commits` | List commits |
| `GET /projects/:id/pipelines/:pid/jobs` | List jobs for a pipeline |
| `GET /projects/:id/jobs/:jid` | Get job status (polling) |
| `GET /projects/:id/jobs/:jid/trace` | Fetch job log |
| `POST /projects/:id/jobs/:jid/retry` | Retry a job |

All requests are authenticated via the `PRIVATE-TOKEN` header using the token configured per project.

---

## Browser Support

Any modern browser with ES2017+ support (Chrome, Firefox, Safari, Edge). No transpilation needed.

---

## License

MIT © [ejstavares](https://github.com/ejstavares)
