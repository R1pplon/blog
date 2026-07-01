# 分类筛选客户端化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace route-based category navigation with client-side filtering on `/blog`, and restructure article URLs to `/blog/{category}/{slug}`.

**Architecture:** Client-side JS on `/blog` page toggles article visibility by `data-category` attribute + button active state. URL query param `?category=` for linkability. Article routes move from `[slug]` to `[category]/[slug]` with simplified slug extraction.

**Tech Stack:** Astro v7, Tailwind v4, vanilla JS (no framework)

## Global Constraints

- Pure neutral gray palette (all color classes use Tailwind `gray` scale)
- Dark mode via `.dark` class (existing)
- Category from directory name: `post.id.split("/")[0]`
- Slug from filename: `post.id.split("/")[1]`
- `/categories/[category]` route deleted
- `/blog?category=tech` linkable from home page
- BlogCard main link becomes `/blog/{category}/{slug}`

---

### Task 1: URL Restructure & BlogCard Update

**Files:**
- Delete: `src/pages/blog/[slug].astro`
- Delete: `src/pages/categories/[category].astro`
- Create: `src/pages/blog/[category]/[slug].astro`
- Modify: `src/components/BlogCard.astro`

**Interfaces:**
- Produces: New route `/blog/{category}/{slug}`; BlogCard with updated hrefs and `data-category` attribute
- Consumes: `getCollection('blog')`, `render()` from `astro:content`, `BaseLayout`

- [ ] **Step 1: Delete old slug route and category page**

```bash
rm src/pages/blog/[slug].astro
rm src/pages/categories/[category].astro
rmdir src/pages/categories 2>/dev/null; true
```

- [ ] **Step 2: Create new blog/[category]/[slug].astro**

Write `src/pages/blog/[category]/[slug].astro`:

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
        <a href={`/blog?category=${category}`} class="text-gray-600 hover:underline dark:text-gray-400">
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

- [ ] **Step 3: Update BlogCard component**

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
    <h2 class="text-lg font-medium text-gray-900 group-hover:text-gray-600 dark:text-gray-100 dark:group-hover:text-gray-400 transition-colors">
      {title}
    </h2>
  </a>
  <div class="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
    <time datetime={date.toISOString()}>{formattedDate}</time>
    {category && (
      <a href={`/blog?category=${category}`} class="text-gray-600 hover:underline dark:text-gray-400">
        {category}
      </a>
    )}
  </div>
</article>
```

- [ ] **Step 4: Verify build passes**

Run: `npx astro build`
Expected: Build succeeds. Check that `dist/blog/tech/hello-world/index.html` and `dist/blog/life/my-blog/index.html` exist. Check that `dist/categories/` does NOT exist.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: restructure URLs to /blog/{category}/{slug}, update blog card links"
```

---

### Task 2: Client-Side Category Filter on /blog

**Files:**
- Modify: `src/pages/blog/index.astro`

**Interfaces:**
- Consumes: `getCollection('blog')`, `BlogCard`, `BaseLayout`; `data-category` attribute from Task 1
- Produces: `/blog` page with client-side category filter, URL query param support

- [ ] **Step 1: Rewrite blog/index.astro with buttons and filter script**

Write `src/pages/blog/index.astro`:

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
    <button data-filter="all" class="rounded-full px-4 py-1 text-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">全部</button>
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
  const ACTIVE = 'rounded-full px-4 py-1 text-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900';
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

- [ ] **Step 2: Verify build passes and filter works**

Run: `npx astro build`
Expected: Build succeeds. `dist/blog/index.html` generated.

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: add client-side category filter to /blog with URL param support"
```

---

### Task 3: Update Home Page Links

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getCollection('blog')`, `BlogCard` (with new hrefs from Task 1)
- Produces: Home page with correct category links and BlogCard slug

- [ ] **Step 1: Update index.astro**

The changes are in two places: the category links in the "分类" section, and the slug prop passed to BlogCard. Overwrite `src/pages/index.astro`:

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
        <a href={`/blog?category=${cat.toLowerCase()}`} class="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          {cat} ({count})
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify build**

Run: `npx astro build`
Expected: 7 pages generated, no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: update home page category links to /blog?category=..."
```

---

### Task 4: Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `npx astro build`
Expected: All pages build successfully

- [ ] **Step 2: Verify routes**

Run:
```bash
echo "=== Check routes ==="
ls dist/blog/tech/hello-world/index.html && echo "OK: /blog/tech/hello-world"
ls dist/blog/life/my-blog/index.html && echo "OK: /blog/life/my-blog"
ls dist/blog/index.html && echo "OK: /blog"
ls dist/index.html && echo "OK: /"
ls dist/about/index.html && echo "OK: /about"
test ! -d dist/categories && echo "OK: /categories deleted"
```

Expected: All routes exist, `/categories` deleted

- [ ] **Step 3: Verify no stale references**

Run:
```bash
grep -r 'categories/' src/ && echo "FOUND: stale /categories/ references" || echo "OK: no stale references"
grep 'slice(1).join' src/ -r && echo "FOUND: old slug extraction" || echo "OK: no old slug extraction"
```

Expected: No stale `/categories/` links, no old `.slice(1).join("/")` slug extraction

- [ ] **Step 4: Commit any remaining changes**

```bash
git diff --exit-code || (git add -A && git commit -m "chore: final build verification")
```
