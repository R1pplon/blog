# 树状路由架构

## 概述

博客采用 VitePress 式文件路由：内容目录结构直接映射为 URL 结构。一个 `[...slug].astro` catch-all 路由处理所有 `/blog/` 下的请求，支持任意深度嵌套，目录与文章统一处理。

## 路由映射

```
src/content/blog/                     →  URL
  index.md                            →  /blog/
  ctf/Web/SQL注入/mysql.md            →  /blog/ctf/Web/SQL注入/mysql
  ctf/Web/SQL注入/                     →  /blog/ctf/Web/SQL注入/
  ctf/Web/                            →  /blog/ctf/Web/
  ctf/                                →  /blog/ctf/
  Linux/系统管理/命令速查.md            →  /blog/Linux/系统管理/命令速查
```

## 核心文件

### `src/pages/blog/[...slug].astro`

单一 catch-all 路由，处理三种页面类型：

| 条件 | 行为 | 示例 |
|------|------|------|
| `post.id === slug` | 渲染文章页 | `/blog/tech/hello-world` → 显示 markdown 内容 |
| `post.id === slug + "/index"` | 渲染目录自定义页 | `/blog/ctf/Web/` 有 `index.md` → 显示该 md 内容 |
| 两者都不匹配 | 自动生成 ls 列表 | `/blog/ctf/` 无 `index.md` → 面包屑 + 子项列表 |

### `src/content.config.ts`

```ts
const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});
```

- 使用 Astro v5+ `glob` loader API（非历史 `glob()` 导入）
- `pattern: "**/*.md"` — 仅加载 `.md`，忽略 `.php/.txt/.py/.htaccess` 等非内容文件
- Schema 极其精简：仅 `title` + `date`
- **无 `categories`、`tags`、`draft`、`image` 字段**

## post.id 身份模型

`post.id` 是内容集合中的唯一标识符，值为相对于 `src/content/blog/` 的文件路径（不含 `.md` 后缀）。

```
src/content/blog/ctf/Web/SQL注入/mysql.md
  → post.id = "ctf/Web/SQL注入/mysql"

src/content/blog/ctf/Web/SQL注入/index.md
  → post.id = "ctf/Web/SQL注入/index"
```

所有路由和分类信息从 `post.id` 按 `/` 分割推导：
- 第一段（`parts[0]`）= 顶级分类（`ctf`、`Linux`、`DevOps` 等）
- 最后一段（`parts[parts.length-1]`）= 叶子节点名称
- 中间段 = 层级路径

## getStaticPaths() 生成逻辑

`[...slug].astro` 的 `getStaticPaths()` 生成两种页面：

1. **文章页** — 每个 `.md` 文件的 `post.id` 都生成一个 URL
2. **目录页** — 每个祖先目录也生成 URL（包括有 `index.md` 和无 `index.md` 的目录）

```ts
export async function getStaticPaths() {
  const posts = await getCollection("blog");
  const dirs = new Set<string>();
  for (const p of posts) {
    const parts = p.id.split("/");
    for (let i = 0; i < parts.length; i++) {
      dirs.add(parts.slice(0, i + 1).join("/"));
    }
  }
  // dirs 包含: 每一级目录 + 每个文章路径
  return [...dirs].map(d => ({ params: { slug: d } }));
}
```

对于目录 `ctf/Web/`：
- 若 `ctf/Web/index.md` 存在 → 渲染为自定义索引页
- 否则 → 自动 ls 列表，展示 `ctf/Web/` 下的直接子项

## 自动目录列表（ls 模式）

目录无 `index.md` 时，自动生成 VitePress 式的文件列表：

```
blog / ctf / Web / SQL注入

┌─────────────────────────────────────────────┬──────┐
│ mysql                                        │ date │
│ sql注入1-4                                    │ date │
│ / 基于union的信息获取                         │ date │
│ / 布尔盲注和时间盲注                          │ date │
│ ...                                          │      │
└─────────────────────────────────────────────┴──────┘
```

特性：
- **面包屑导航**：每级可点击，末级高亮
- **子目录以 `/` 标记**（无日期显示），文章显示日期
- **按日期降序排列**
- **`._target` class** 标记所有可交互项，触发磁性光标

## 文章页渲染

文章页与目录页共享同一个 `[...slug].astro`，通过条件分支区分：

```ts
const article = posts.find((p) => p.id === slug);
const indexArticle = posts.find((p) => p.id === `${slug}/index`);

if (article) {
  // 渲染文章：标题 + 日期 + 分类标签 + markdown 内容
} else if (indexArticle) {
  // 渲染目录 index.md：仅 markdown 内容
} else {
  // 自动 ls 列表
}
```

文章页结构：
- `<BaseLayout>` 包裹
- 标题（`text-3xl font-bold`）
- 元信息行：日期 + 顶级分类链接（指向 `/blog/{分类}`）
- `prose prose-gray max-w-none dark:prose-invert` 正文

## 与首页的互操作

### blog/index.astro（文章列表页）

- 两列 CSS Grid 时间线布局（左列 `5rem` 月份标签 + 右列文章列表）
- 客户端 JS 分类筛选（`data-category`、`data-month`、`data-year` 属性）
- 文章链接指向 `/blog/${post.id}`（完整路径，不再拆分 category/slug）
- 分类标签链接指向 `/blog/${category}`（触发目录列表页）

### index.astro（首页）

- 从 `getCollection("blog")` 提取分类及文章数
- 分类标签链接到 `/blog?category=${cat}`（触发博客列表页筛选）

## 关键约束

**无双参路由**。旧的 `[category]/[slug].astro` 已删除。所有深层嵌套路径（`ctf/Web/信息收集/Liunx...`）均由 `[...slug].astro` 处理。

**index.md 检测**。目录自定义页的 `index.md` 必须命名为 `index.md`（不是 `INDEX.md` 或 `readme.md`）。检测逻辑：

```ts
const indexArticle = posts.find((p) => p.id === `${slug}/index`);
```

**无 `site` 字段**。`astro.config.mjs` 无 `site` 属性。所有 URL 均为相对路径，无 canonical URL 或 sitemap 生成。

**无限深度**。理论支持任意深度嵌套。实际受内容目录深度限制。当前最深路径为 `ctf/Web/信息收集/Liunx服务器下有价值的目录`（4 级）。

## 文件清单

| 文件 | 用途 |
|------|------|
| `src/pages/blog/[...slug].astro` | catch-all 路由（文章 + 目录列表 + index 页） |
| `src/pages/blog/index.astro` | 博客根列表页（时间线 + 客户端筛选） |
| `src/content.config.ts` | 内容集合定义（glob loader + schema） |
| `src/content/blog/` | 所有 markdown 内容的根目录 |
