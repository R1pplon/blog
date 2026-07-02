# AGENTS.md — Blog (Astro + Tailwind v4)

## Commands
- `npm run dev` — dev server (default `localhost:4321`)
- `npm run build` — SSG static build to `dist/`
- `npm run preview` — preview built output
- No lint, test, or typecheck scripts exist

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

```
src/content/blog/          → content root
  ctf/Web/SQL注入/mysql.md → post.id = "ctf/Web/SQL注入/mysql"
```

- Content loader: `glob({ pattern: "**/*.md", base: "./src/content/blog" })` (Astro v5+ API)
- Schema: only `{ title: string, date: date }` in frontmatter
- No tags, categories, draft, or image fields. Category = first segment of `post.id`.
- Non-md files (`.php`, `.txt`, `.zip`, `.htaccess`) are NOT loaded but exist alongside content

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
