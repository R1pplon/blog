# 干净极简版主题配色 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply pure neutral-gray color scheme with dark/light mode toggle to the blog.

**Architecture:** Tailwind v4 `@variant dark` with class strategy. JS flicker-prevention script in `<head>`. Toggle button in Header writes `.dark` class to `<html>` and persists to `localStorage`.

**Tech Stack:** Astro v7, Tailwind v4, `@tailwindcss/typography`

## Global Constraints

- Pure neutral gray palette (Tailwind `gray` color scale only, no custom colors)
- Dark mode via `.dark` class on `<html>`
- Toggle in Header right side, SVG sun/moon icons
- `localStorage` persistence, fallback to `prefers-color-scheme`
- Flicker prevention script in `<head>` (blocking, before render)
- No new files — all changes are modifications to existing files

---

### Task 1: Install Typography Plugin & Update global.css

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `@tailwindcss/typography` available; `dark:` variant globally enabled

- [ ] **Step 1: Install @tailwindcss/typography**

Run: `npm install @tailwindcss/typography`
Expected: Package added to `package.json` and `node_modules`

- [ ] **Step 2: Update global.css**

Overwrite `src/styles/global.css` with:

```css
@import "tailwindcss";
@import "@tailwindcss/typography";
@variant dark (&:where(.dark, .dark *));
```

- [ ] **Step 3: Verify build passes**

Run: `npx astro build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/styles/global.css
git commit -m "chore: add typography plugin, enable dark mode variant"
```

---

### Task 2: BaseLayout — Body Dark Mode & Flicker Prevention

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `dark:` variant from Task 1
- Produces: `<body>` with dark mode classes; flicker-prevention inline script in `<head>`

- [ ] **Step 1: Update BaseLayout**

Overwrite `src/layouts/BaseLayout.astro` with:

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
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description || title} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script is:inline>
      (function() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
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

- [ ] **Step 2: Verify build passes**

Run: `npx astro build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add dark mode body styles and flicker prevention"
```

---

### Task 3: Header — Dark Mode Styles & Toggle Button

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `siteConfig` from `src/site.config.ts`; `dark:` variant
- Produces: Header with dark mode styles and sun/moon toggle button

- [ ] **Step 1: Update Header**

Overwrite `src/components/Header.astro` with:

```astro
---
import { siteConfig } from "../site.config";
---

<header class="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
  <nav class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
    <a href="/" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {siteConfig.title}
    </a>
    <div class="flex items-center gap-4">
      <ul class="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
        {siteConfig.nav.map((item) => (
          <li>
            <a href={item.href} class="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
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

- [ ] **Step 2: Verify build passes**

Run: `npx astro build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add header dark mode styles and theme toggle button"
```

---

### Task 4: Add Dark Mode to Remaining Components & Pages

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/components/BlogCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/categories/[category].astro`
- Modify: `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: `dark:` variant from Task 1
- Produces: All components/pages respond to dark mode

- [ ] **Step 1: Update Footer**

Overwrite `src/components/Footer.astro` with:

```astro
---
import { siteConfig } from "../site.config";
---

<footer class="border-t border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-500">
  <p>&copy; {new Date().getFullYear()} {siteConfig.title}. All rights reserved.</p>
</footer>
```

- [ ] **Step 2: Update BlogCard**

Overwrite `src/components/BlogCard.astro` with:

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

<article class="border-b border-gray-200 py-4 last:border-b-0 dark:border-gray-800">
  <a href={`/blog/${slug}`} class="group block">
    <h2 class="text-lg font-medium text-gray-900 group-hover:text-gray-600 dark:text-gray-100 dark:group-hover:text-gray-400 transition-colors">
      {title}
    </h2>
  </a>
  <div class="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
    <time datetime={date.toISOString()}>{formattedDate}</time>
    {category && (
      <a href={`/categories/${category.toLowerCase()}`} class="text-gray-600 hover:underline dark:text-gray-400">
        {category}
      </a>
    )}
  </div>
</article>
```

- [ ] **Step 3: Update Home Page**

Overwrite `src/pages/index.astro` with:

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
          <a href={url} class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
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
          slug={post.id.split("/").slice(1).join("/")}
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
        <a href={`/categories/${cat.toLowerCase()}`} class="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          {cat} ({count})
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Update Blog List Page**

Overwrite `src/pages/blog/index.astro` with:

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
    <a href="/blog" class="rounded-full bg-gray-900 px-4 py-1 text-sm text-white dark:bg-gray-100 dark:text-gray-900">全部</a>
    {categories.map((cat) => (
      <a href={`/categories/${cat.toLowerCase()}`} class="rounded-full bg-gray-100 px-4 py-1 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
        {cat}
      </a>
    ))}
  </div>

  <div class="mt-6">
    {sortedPosts.map((post) => (
      <BlogCard
        slug={post.id.split("/").slice(1).join("/")}
        title={post.data.title}
        date={post.data.date}
        category={post.id.split("/")[0]}
      />
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 5: Update Category Page**

Overwrite `src/pages/categories/[category].astro` with:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import BlogCard from "../../components/BlogCard.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  const categories = new Set(
    posts.map((p) => p.id.split("/")[0]).filter(Boolean)
  );
  return Array.from(categories).map((cat) => ({
    params: { category: cat.toLowerCase() },
  }));
}

const { category } = Astro.params;

const posts = await getCollection("blog");
const filteredPosts = posts.filter(
  (p) => p.id.split("/")[0].toLowerCase() === category
);
const sortedPosts = filteredPosts.sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);
---

<BaseLayout title={`分类: ${category}`}>
  <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">分类: {category}</h1>

  <p class="mt-2 text-gray-600 dark:text-gray-400">{sortedPosts.length} 篇文章</p>

  <div class="mt-6">
    {sortedPosts.map((post) => (
      <BlogCard
        slug={post.id.split("/").slice(1).join("/")}
        title={post.data.title}
        date={post.data.date}
        category={post.id.split("/")[0]}
      />
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 6: Update Blog Detail Page**

Overwrite `src/pages/blog/[slug].astro` with:

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => {
    const slug = post.id.split("/").slice(1).join("/");
    return { params: { slug } };
  });
}

const { slug } = Astro.params;
const posts = await getCollection("blog");
const post = posts.find(
  (p) => p.id.split("/").slice(1).join("/") === slug
);

if (!post) {
  return Astro.redirect("/404");
}

const { Content } = await render(post);
const category = post.id.split("/")[0];
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
        {category && (
          <a href={`/categories/${category.toLowerCase()}`} class="text-gray-600 hover:underline dark:text-gray-400">
            {category}
          </a>
        )}
      </div>
    </header>
    <div class="prose prose-gray max-w-none dark:prose-invert">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 7: Verify build passes**

Run: `npx astro build`
Expected: 7 pages generated, no errors

- [ ] **Step 8: Commit**

```bash
git add src/components/Footer.astro src/components/BlogCard.astro src/pages/index.astro src/pages/blog/index.astro src/pages/categories/[category].astro src/pages/blog/[slug].astro
git commit -m "feat: add dark mode styles to all components and pages"
```

---

### Task 5: Dark Mode Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Verify all pages build**

Run: `npx astro build`
Expected: 7 pages, no errors

- [ ] **Step 2: Verify dark mode defaults to light**

Run: `npx astro preview` then check `dist/index.html` — verify no `.dark` class in default HTML.
Expected: `<html lang="zh-CN">` without `.dark` class in static output

- [ ] **Step 3: Check all dark: variants in dist output**

Run: `grep -r 'dark:' dist/ | head -20`
Expected: Shows `dark:` CSS classes present in built output

- [ ] **Step 4: Commit if any remaining changes**

```bash
git diff --exit-code || (git add -A && git commit -m "chore: final build verification")
```
