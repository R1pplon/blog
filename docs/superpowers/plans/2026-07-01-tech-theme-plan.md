# 科技现代版主题 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace neutral-gray accent colors with `#6B69D6` purple, make dark mode the default, across all components.

**Architecture:** Custom `accent` color via Tailwind v4 `@theme` in global.css. Default `<html class="dark">`. Components replace gray link/hover/active colors with `accent-*` variants.

**Tech Stack:** Astro v7, Tailwind v4

## Global Constraints

- Primary accent: `#6B69D6` (深紫影色)
- Default dark mode (`<html class="dark">`)
- Day/night toggle preserved (only link color changes, toggle stays gray)
- All existing `dark:` variants preserved — only change accent-related classes
- Category filter, URL structure, data-category unchanged

---

### Task 1: Foundation — global.css Accent Colors & BaseLayout Default Dark

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `accent-100` through `accent-500` color tokens available site-wide; `<html class="dark">` by default with adjusted flicker script

- [ ] **Step 1: Add accent colors to global.css**

Overwrite `src/styles/global.css`:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@variant dark (&:where(.dark, .dark *));

@theme {
  --color-accent-100: #f0efff;
  --color-accent-200: #d9d6fc;
  --color-accent-300: #6B69D6;
  --color-accent-400: #5a58c4;
  --color-accent-500: #4947b0;
}
```

- [ ] **Step 2: Update BaseLayout for default dark mode**

Overwrite `src/layouts/BaseLayout.astro`:

```astro
---
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="zh-CN" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description || title} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script is:inline>
      (function() {
        const theme = localStorage.getItem('theme');
        if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
      })();
    </script>
  </head>
  <body class="min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
    <Header />
    <main class="mx-auto max-w-3xl px-4 py-8">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 3: Verify build**

Run: `npx astro build`
Expected: Build succeeds, 5 pages

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro
git commit -m "feat: add accent color tokens, set default dark mode"
```

---

### Task 2: Header — Accent Colors & Toggle Script Update

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `accent-*` from Task 1; `siteConfig` from `src/site.config.ts`
- Produces: Header nav links in accent color; toggle script writes 'dark'/'light' to localStorage

- [ ] **Step 1: Update Header**

Overwrite `src/components/Header.astro`:

```astro
---
import { siteConfig } from "../site.config";
---

<header class="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
  <nav class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
    <a href="/" class="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-accent-400 dark:hover:text-accent-200 transition-colors">
      {siteConfig.title}
    </a>
    <div class="flex items-center gap-4">
      <ul class="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
        {siteConfig.nav.map((item) => (
          <li>
            <a href={item.href} class="hover:text-accent-400 dark:hover:text-accent-200 transition-colors">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <button
        id="theme-toggle"
        class="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        aria-label="切换主题"
      >
        <svg class="hidden dark:block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg class="block dark:hidden h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>
  </nav>
</header>

<script>
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>
```

- [ ] **Step 2: Verify build**

Run: `npx astro build`
Expected: 5 pages, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add accent colors to header nav and site title"
```

---

### Task 3: Accent Colors in All Components & Pages

**Files:**
- Modify: `src/components/BlogCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[category]/[slug].astro`

**Interfaces:**
- Consumes: `accent-*` from Task 1
- Produces: Purple accent across all interactive elements

- [ ] **Step 1: Update BlogCard**

Overwrite `src/components/BlogCard.astro`:

```astro
---
interface Props {
  slug: string;
  title: string;
  date: Date;
  category?: string;
}

const { slug, title, date, category } = Astro.props;
const formattedDate = date.toLocaleDateString("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---

<article data-category={category} class="border-b border-gray-200 py-4 last:border-b-0 dark:border-gray-800">
  <a href={`/blog/${category}/${slug}`} class="group block">
    <h2 class="text-lg font-medium text-gray-900 group-hover:text-accent-400 dark:text-gray-100 dark:group-hover:text-accent-200 transition-colors">
      {title}
    </h2>
  </a>
  <div class="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
    <time datetime={date.toISOString()}>{formattedDate}</time>
    {category && (
      <a href={`/blog?category=${category}`} class="text-gray-600 hover:text-accent-400 hover:underline dark:text-gray-400 dark:hover:text-accent-200">
        {category}
      </a>
    )}
  </div>
</article>
```

- [ ] **Step 2: Update Home Page**

Overwrite `src/pages/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";
import BlogCard from "../components/BlogCard.astro";
import { siteConfig } from "../site.config";

const posts = await getCollection("blog");
const sortedPosts = posts.sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);
const latestPosts = sortedPosts.slice(0, 5);

const categoriesMap = new Map<string, number>();
for (const post of posts) {
  const cat = post.id.split("/")[0];
  if (cat) {
    categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
  }
}
const categories = Array.from(categoriesMap.entries());
---

<BaseLayout title={siteConfig.title} description={siteConfig.description}>
  <section class="py-12 text-center">
    {siteConfig.avatar && (
      <img src={siteConfig.avatar} alt="avatar" class="mx-auto h-20 w-20 rounded-full" />
    )}
    <h1 class="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">{siteConfig.title}</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">{siteConfig.description}</p>
    {siteConfig.social && (
      <div class="mt-4 flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-500">
        {Object.entries(siteConfig.social).map(([name, url]) => (
          <a href={url} class="hover:text-accent-400 dark:hover:text-accent-200 transition-colors" target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        ))}
      </div>
    )}
  </section>

  <section class="mt-8">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">最新文章</h2>
    <div class="mt-4">
      {latestPosts.map((post) => (
        <BlogCard
          slug={post.id.split("/")[1]}
          title={post.data.title}
          date={post.data.date}
          category={post.id.split("/")[0]}
        />
      ))}
    </div>
  </section>

  <section class="mt-8">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">分类</h2>
    <div class="mt-4 flex flex-wrap gap-3">
      {categories.map(([cat, count]) => (
        <a href={`/blog?category=${cat}`} class="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          {cat} ({count})
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Update Blog List Page**

Overwrite `src/pages/blog/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import BlogCard from "../../components/BlogCard.astro";

const posts = await getCollection("blog");
const sortedPosts = posts.sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);

const categoriesSet = new Set(
  posts.map((p) => p.id.split("/")[0]).filter(Boolean)
);
const categories = Array.from(categoriesSet);
---

<BaseLayout title="文章">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">文章</h1>

  <div class="mt-4 flex flex-wrap gap-2">
    <button data-filter="all" class="rounded-full px-4 py-1 text-sm bg-accent-300 text-white dark:bg-accent-100 dark:text-gray-900">全部</button>
    {categories.map((cat) => (
      <button data-filter={cat} class="rounded-full px-4 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
        {cat}
      </button>
    ))}
  </div>

  <div class="mt-6">
    {sortedPosts.map((post) => (
      <BlogCard
        slug={post.id.split("/")[1]}
        title={post.data.title}
        date={post.data.date}
        category={post.id.split("/")[0]}
      />
    ))}
  </div>
</BaseLayout>

<script>
  const ACTIVE = 'rounded-full px-4 py-1 text-sm bg-accent-300 text-white dark:bg-accent-100 dark:text-gray-900';
  const DEFAULT = 'rounded-full px-4 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors';

  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const articles = document.querySelectorAll<HTMLElement>('[data-category]');

  function activate(el: HTMLButtonElement) {
    buttons.forEach(b => { b.className = DEFAULT; });
    el.className = ACTIVE;
  }

  function filter(category: string) {
    articles.forEach(a => {
      a.style.display = (category === 'all' || a.dataset.category === category) ? '' : 'none';
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter!;
      activate(btn);
      filter(cat);
      const url = new URL(window.location.href);
      if (cat === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', cat);
      }
      history.pushState({}, '', url);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category') || 'all';
  const activeBtn = document.querySelector<HTMLButtonElement>(`[data-filter="${initialCategory}"]`);
  if (activeBtn) {
    activate(activeBtn);
    filter(initialCategory);
  }
</script>
```

- [ ] **Step 4: Update Article Detail Page**

Overwrite `src/pages/blog/[category]/[slug].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "../../../layouts/BaseLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => {
    const parts = post.id.split("/");
    return { params: { category: parts[0], slug: parts[1] } };
  });
}

const { category, slug } = Astro.params;
const posts = await getCollection("blog");
const post = posts.find(
  (p) => {
    const parts = p.id.split("/");
    return parts[0] === category && parts[1] === slug;
  }
);

if (!post) {
  return Astro.redirect("/404");
}

const { Content } = await render(post);
const formattedDate = post.data.date.toLocaleDateString("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---

<BaseLayout title={post.data.title} description={post.data.title}>
  <article>
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{post.data.title}</h1>
      <div class="mt-3 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
        <time datetime={post.data.date.toISOString()}>{formattedDate}</time>
        <a href={`/blog?category=${category}`} class="text-accent-400 hover:underline dark:text-accent-200">
          {category}
        </a>
      </div>
    </header>
    <div class="prose prose-gray max-w-none dark:prose-invert">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 5: Verify build**

Run: `npx astro build`
Expected: 5 pages, no errors

- [ ] **Step 6: Commit**

```bash
git add src/components/BlogCard.astro src/pages/index.astro src/pages/blog/index.astro src/pages/blog/[category]/[slug].astro
git commit -m "feat: apply accent colors to all components and pages"
```

---

### Task 4: Build Verification

**Files:** None

- [ ] **Step 1: Full build**

Run: `npx astro build`
Expected: 5 pages, no errors

- [ ] **Step 2: Verify accent colors in output**

Run: `grep -r 'accent' dist/ | head -10`
Expected: Shows `accent-300`, `accent-100` etc. in built CSS

- [ ] **Step 3: Verify default dark mode**

Run: `grep 'class="dark"' dist/index.html`
Expected: Shows `<html lang="zh-CN" class="dark">` in built HTML

- [ ] **Step 4: Commit any changes**

```bash
git diff --exit-code || (git add -A && git commit -m "chore: final build verification")
```
