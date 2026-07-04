# AGENTS.md — Blog (Astro + Tailwind v4)

## Commands
- `npm run dev` — dev server (default `localhost:4321`)
- `npm run build` — SSG static build to `dist/`
- `npm run preview` — preview built output
- No lint, test, or typecheck scripts exist
- `git submodule update --init` — clone note-remote content (required on fresh clone)

## Stack
- **Astro v7** SSG, **Tailwind v4** via `@tailwindcss/vite` plugin
- No `tailwind.config.js` — config lives in `src/styles/global.css` (`@theme` block)
- Tailwind typography plugin for article prose

## Routing architecture

```
src/pages/
├── index.astro              → /
├── about.md                 → /about (uses AboutLayout)
├── 404.astro                → /404
├── blog/index.astro         → /blog (timeline grid, client-side category filter)
└── blog/[...slug].astro    → /blog/*  (catch-all: articles, index.md, auto ls)
```

**`[...slug].astro`** is the core — one file handles ALL blog URLs at any depth.
It generates pages for every `post.id` and every ancestor directory.
Directory behavior:
- Has `index.md` → renders it as a custom page
- No `index.md` → auto-generates `ls`-style listing (breadcrumbs + children sorted by date)

## Content system

### Git submodule

`src/content/blog/` is a git submodule pointing to [R1pplon/note-remote](https://github.com/R1pplon/note-remote.git).
The blog repo stores only a commit hash pointer; actual `.md` files live in the note-remote repo.
Fresh clones require `git submodule update --init`.

```
src/content/blog/          → submodule → R1pplon/note-remote (root = DevOps/, Linux/, ...)
  Linux/WSL/WSL2.md       → post.id = "Linux/WSL/WSL2"
```

- Content loader: `glob({ pattern: "**/*.md", base: "./src/content/blog" })` (Astro v5+ API)
- Schema: only `{ title: string, date: date }` in frontmatter
- No tags, categories, draft, or image fields. Category = first segment of `post.id`.
- CI always runs `git submodule update --remote` before build to get the latest notes.

### Updating notes

1. Write `.md` in note-remote → commit + push to `main`
2. note-remote CI dispatches `note-updated` event → blog auto-deploys
3. Locally: `git submodule update --remote` in blog repo to sync

### `.obsidian/` directory

note-remote contains `.obsidian/` for Obsidian vault config. Changes to this directory do NOT trigger blog deploy — filtered by `paths-ignore` in note-remote's notify workflow.

## Color system

Indirect CSS variable pattern — no `dark:` prefix needed:
```
:root { --surface: #FAF9F6; }  →  .dark { --surface: #030712; }
@theme { --color-surface: var(--surface); }  →  class="bg-surface"
```
- Theme switch: `html.classList.toggle('dark')` in Header.astro
- Early theme restore: inline `<script>` in BaseLayout reads `localStorage` before paint
- Accent: `#6B69D6` (purple), fixed across themes (not a CSS variable)

## Page transition (`PageTransition.astro`)

- Global API: `window.__pt = { show, hide }`
- Intercepts ALL same-origin `<a>` clicks via `capture: true` listener → `preventDefault` → `ptShow()` → navigate after 1s
- `ptShow()` snapshots `--color-secondary`/`--color-accent` to `--pt-locked-bg`/`--pt-locked-accent` to prevent theme-switch flicker
- `DOMContentLoaded` + double `rAF` triggers initial hide (page load transition)

## Critical quirks

**`is:inline` required** — Any script using `document.currentScript` MUST use `<script is:inline>`. Astro defaults to `type="module"` where `currentScript` is `null`. Applies to: `FaultText.astro`, `PageTransition.astro`.

**`._target` class** — Marks elements for magnetic reticle cursor. Interactive elements (links, buttons) should carry this class.

**Broken image refs crush the build** — Astro's content-assets plugin validates ALL `![alt](path)` references at build time. Missing images = hard error. Use `<!-- broken image: alt (path) -->` comments to keep orphaned refs.

**Garbage in content directory** — Files like `.exe`, `.css`, `.js`, `.html`, `.rar` may have been imported accidentally. The `glob("**/*.md")` loader ignores them, but they bloat the repo. Check with `find src/content/blog -type f ! -name '*.md' ! -name '*.png' ! -name '*.jpg' ! -name '*.webp'`.

**No `site` in astro config** — All generated URLs are relative. No sitemap, no RSS, no canonical URLs.

## CI/CD

`.github/workflows/deploy.yml` handles automated deploy to `r1pple.top`.

### Triggers
- `push` to blog `master`
- `repository_dispatch` event `note-updated` (sent by note-remote on push)

### Pipeline
1. `actions/checkout@v4` with `submodules: true`
2. `git submodule update --remote --merge` — always pulls latest note-remote
3. `npm ci` → `npm run build`
4. `appleboy/scp-action` deploys `dist/` to server (port 30022)

### note-remote → blog auto-deploy

note-remote's `.github/workflows/notify-blog.yml` dispatches `note-updated` event to blog on push to main.
Requires a PAT (`BLOG_REPO_TOKEN`) stored in note-remote's secrets.
`.obsidian/**` and `.github/**` paths are excluded from triggering via `paths-ignore`.

## LSP

Configured in `~/.config/opencode/opencode.jsonc`:

| Server | Coverage | Runtime |
|--------|----------|---------|
| `@astrojs/language-server` | `.astro` | `npx astro-ls --stdio` |
| `typescript-language-server` | `.ts`, `.js`, `.mjs` | `npx typescript-language-server --stdio` |

Both are local devDependencies, run via `npx` from `node_modules/.bin/`.
