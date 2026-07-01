# 个人博客网站 — 设计文档

> 日期: 2026-07-01

## 1. 概述

构建一个纯静态个人博客网站，支持以下页面：
- 首页
- 关于我
- 文章列表（按分类筛选）
- 文章详情页（Markdown 渲染）

## 2. 技术选型

| 决策 | 选项 |
|------|------|
| 框架 | Astro（SSG 静态生成） |
| 样式 | Tailwind CSS |
| 部署 | 纯静态部署（Vercel / GitHub Pages 等） |
| 内容管理 | Markdown 文件，存于 Git 仓库 |
| 分类方式 | 目录结构表达分类 |
| 标签 | 不做，仅分类 |

## 3. 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Hero 区 + 最新 5 篇文章 + 分类入口 |
| `/about` | 关于我 | Markdown 渲染的个人介绍页 |
| `/blog` | 文章列表 | 全部文章，支持分类筛选 |
| `/blog/[slug]` | 文章详情 | Markdown 渲染正文 |
| `/categories/[category]` | 分类列表 | 某分类下的文章列表 |

## 4. 目录结构

```
blog/
├── src/
│   ├── content/
│   │   ├── blog/                    # 文章 Markdown
│   │   │   ├── tech/
│   │   │   │   └── *.md
│   │   │   └── life/
│   │   │       └── *.md
│   │   └── about.md                 # 关于我
│   ├── content.config.ts            # Content Collection schema
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── categories/
│   │       └── [category].astro
│   ├── layouts/
│   │   └── BaseLayout.astro         # 公共布局（Header + Footer + SEO）
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── BlogCard.astro           # 文章卡片组件
│   └── styles/
│       └── global.css               # Tailwind 全局样式
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 5. Content Schema

### 文章 (src/content/blog/)

```yaml
---
title: "文章标题"
date: 2026-07-01
---
```

- 分类来自文件所属子目录名（`tech/`, `life/` 等）
- 文件名即 slug（`first-post.md` → `/blog/first-post`）
- Markdown 正文为文章内容

### 关于我 (src/content/about.md)

```yaml
---
title: "关于我"
---
```

## 6. 页面详述

### 6.1 首页 (`/`)

三个区块：
1. **Hero**：头像 + 名称 + 一句话介绍 + 社交链接（可选）
2. **最新文章**：最近 5 篇，卡片含标题、日期、分类标签
3. **分类入口**：列出所有分类及文章数量，带链接

### 6.2 文章列表 (`/blog`)

- 按日期倒序展示全部文章
- 顶部分类筛选条：点击分类高亮，显示该分类文章；点击"全部"恢复
- 与 `/categories/[category]` 共享组件

### 6.3 文章详情 (`/blog/[slug]`)

- Markdown 渲染正文
- 顶部显示标题、日期、分类标签

### 6.4 关于我 (`/about`)

- 从 `src/content/about.md` 加载并渲染 Markdown

### 6.5 公共布局 (`BaseLayout.astro`)

- Header：站点名称 + 导航链接（首页 / 文章 / 关于我）
- Footer：版权信息
- SEO：动态 title 和 meta description

## 7. 数据流

```
Markdown 文件 (src/content/blog/{category}/*.md)
       │
       ▼
Astro Content Collections (content.config.ts)
       │
       ▼
getCollection('blog') / getEntry('about', 'about')
       │
       ▼
静态 HTML 生成 (astro build)
       │
       ▼
部署到静态托管平台
```

## 8. 站点配置

Hero 区的个人信息（头像、名称、介绍、社交链接）通过 `src/site.config.ts` 集中管理：

```ts
export const siteConfig = {
  title: "博客名称",
  description: "一句话介绍",
  avatar: "/avatar.webp",    // 可选
  social: {                   // 可选
    github: "https://github.com/...",
    twitter: "https://twitter.com/...",
  },
  nav: [
    { label: "首页", href: "/" },
    { label: "文章", href: "/blog" },
    { label: "关于我", href: "/about" },
  ],
}
```

首页 Hero 和 BaseLayout 的导航均从此文件读取。

## 9. 不在范围内

- 搜索功能
- 标签系统
- 评论系统
- RSS 订阅
- 上一篇/下一篇导航
- 暗色模式切换
