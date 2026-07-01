# 色彩系统设计文档

**状态**: 已实施
**日期**: 2026-07-02
**关联**: `src/styles/global.css`、全站 9 个组件/页面文件

## 1. 设计目标

- 集中化管理所有色彩决策，单一数据源（`global.css`）
- 语义化命名替代数字色阶拼接，一眼看懂色彩角色
- 浅色/深色模式对应关系集中声明，不再散落各处 `dark:` 覆写
- 通过 Tailwind v4 `@theme` 将语义 token 注册为标准 utility class
- 消除全站硬编码 hex 值

## 2. 语义 Token 定义

### 2.1 中性色（Surface / Text / Border）

| Token | 浅色值 | 深色值 | Tailwind 用法 |
|-------|--------|--------|---------------|
| `surface` | `#ffffff` | `#030712` | `bg-surface` |
| `foreground` | `#111827` | `#f3f4f6` | `text-foreground` |
| `muted-foreground` | `#4b5563` | `#9ca3af` | `text-muted-foreground` |
| `muted` | `#6b7280` | `#6b7280` | `text-muted` |
| `border` | `#e5e7eb` | `#1f2937` | `border-border` |
| `secondary` | `#f3f4f6` | `#1f2937` | `bg-secondary` |
| `secondary-hover` | `#e5e7eb` | `#374151` | `bg-secondary-hover` / `hover:bg-secondary-hover` |

### 2.2 Accent 色（品牌主色）

| Token | Hex | 用途 |
|-------|-----|------|
| `accent` | `#6B69D6` | 品牌主色引用 |
| `accent-100` | `#f0efff` | 最浅 accent（深底场景：暗色激活按钮背景） |
| `accent-200` | `#d9d6fc` | 浅 accent（深底链接、暗色准星） |
| `accent-300` | `#6B69D6` | 中间（浅色激活按钮背景） |
| `accent-400` | `#5a58c4` | 深 accent（浅底链接） |
| `accent-500` | `#4947b0` | 最深 accent（浅底链接 hover） |

### 2.3 Accent 语义 Token（场景化别名）

| Token | 浅色 | 深色 | Tailwind 用法 |
|-------|------|------|---------------|
| `accent-link` | `#5a58c4` | `#d9d6fc` | `text-accent-link` |
| `accent-link-hover` | `#4947b0` | `#f0efff` | `hover:text-accent-link-hover` |
| `accent-active-bg` | `#6B69D6` | `#f0efff` | `bg-accent-active-bg` |
| `accent-active-text` | `#ffffff` | `#111827` | `text-accent-active-text` |

## 3. 色值映射对照表

### 3.1 替换前 → 替换后

| 场景 | 替换前 | 替换后 |
|------|--------|--------|
| 页面背景 | `bg-white dark:bg-gray-950` | `bg-surface` |
| 主文字（标题/正文） | `text-gray-900 dark:text-gray-100` | `text-foreground` |
| 次要文字（描述/导航） | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| 最淡文字（meta/日期/页脚） | `text-gray-500` | `text-muted` |
| 边框/分割线 | `border-gray-200 dark:border-gray-800` | `border-border` |
| 标签/按钮背景 | `bg-gray-100 dark:bg-gray-800` | `bg-secondary` |
| 标签/按钮 hover | `hover:bg-gray-200 dark:hover:bg-gray-700` | `hover:bg-secondary-hover` |
| 标签/按钮文字 | `text-gray-700 dark:text-gray-300` | `text-muted-foreground` |
| 分类按钮（非激活） | `bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700` | `bg-secondary text-muted-foreground hover:bg-secondary-hover` |
| 分类按钮（激活） | `bg-accent-300 text-white dark:bg-accent-100 dark:text-gray-900` | `bg-accent-active-bg text-accent-active-text` |
| 链接文字（通用） | `text-accent-400 dark:text-accent-200` | `text-accent-link` |
| 链接 hover（通用） | `hover:text-accent-500 dark:hover:text-accent-100` | `hover:text-accent-link-hover` |
| BlogCard 标题 | `text-gray-900 group-hover:text-accent-400 dark:text-gray-100 dark:group-hover:text-accent-200` | `text-foreground group-hover:text-accent-link-hover` |
| 首页标题 hover（硬编码） | `hover:text-[#6B69D6] dark:hover:text-[#d9d6fc]` | `hover:text-accent-link-hover` |
| 主题切换按钮文字 | `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| 主题切换按钮 hover 背景 | `hover:bg-gray-100 dark:hover:bg-gray-800` | `hover:bg-secondary` |
| 准星浅色 | `#6B69D6` | `var(--color-accent)` |
| 准星深色 | `#d9d6fc` | `var(--color-accent-200)` |

### 3.2 不纳入 token 体系的例外

| 场景 | 当前值 | 理由 |
|------|--------|------|
| Header 半透明背景 | `bg-white/80 dark:bg-gray-900/80` | 透明度组合独特，非通用语义 |
| Header sticky 背景 | `backdrop-blur` | 为模糊效果保留，不做语义抽象 |
| Footer 背景 | 无背景色（透明继承） | 无需 token |
| 文章排版 | `prose-gray dark:prose-invert` | `@tailwindcss/typography` 插件管理 |

## 4. 实施文件清单

| 文件 | 改动内容 |
|------|---------|
| `src/styles/global.css` | 新增语义 CSS 变量 + `@theme` 注册 |
| `src/layouts/BaseLayout.astro` | `body` 的 `bg`/`text` 替换 |
| `src/components/Header.astro` | 导航、站点标题、主题切换按钮颜色 |
| `src/components/Footer.astro` | 边框、文字颜色 |
| `src/components/BlogCard.astro` | 标题、meta、分类链接颜色 |
| `src/pages/index.astro` | 标题、描述、社交链接、分类按钮、硬编码 hex |
| `src/pages/blog/index.astro` | 筛选按钮颜色（HTML + JS 常量） |
| `src/pages/blog/[category]/[slug].astro` | 文章标题、meta、分类链接颜色 |
| `src/components/CursorReticle.astro` | 准星颜色引用 accent CSS 变量 |

## 5. 实现机制

```css
/* global.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@variant dark (&:where(.dark, .dark *));

:root {
  --color-surface: #ffffff;
  --color-foreground: #111827;
  --color-muted-foreground: #4b5563;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-secondary: #f3f4f6;
  --color-secondary-hover: #e5e7eb;
}

.dark {
  --color-surface: #030712;
  --color-foreground: #f3f4f6;
  --color-muted-foreground: #9ca3af;
  --color-muted: #6b7280;
  --color-border: #1f2937;
  --color-secondary: #1f2937;
  --color-secondary-hover: #374151;
}

@theme {
  /* 中性色 — 引用 :root/.dark 切换的 CSS 变量 */
  --color-surface: var(--color-surface);
  --color-foreground: var(--color-foreground);
  --color-muted-foreground: var(--color-muted-foreground);
  --color-muted: var(--color-muted);
  --color-border: var(--color-border);
  --color-secondary: var(--color-secondary);
  --color-secondary-hover: var(--color-secondary-hover);

  /* Accent 基础色阶 */
  --color-accent: #6B69D6;
  --color-accent-100: #f0efff;
  --color-accent-200: #d9d6fc;
  --color-accent-300: #6B69D6;
  --color-accent-400: #5a58c4;
  --color-accent-500: #4947b0;

  /* Accent 语义别名 — 静态度量（深色模式由具体 CSS 变量决定） */
  --color-accent-link: #5a58c4;
  --color-accent-link-hover: #4947b0;
  --color-accent-active-bg: #6B69D6;
  --color-accent-active-text: #ffffff;
}

.dark {
  --color-accent-link: #d9d6fc;
  --color-accent-link-hover: #f0efff;
  --color-accent-active-bg: #f0efff;
  --color-accent-active-text: #111827;
}
```

CSS 变量提供深浅切换能力，`@theme` 将其注册为 Tailwind 标准 utility（`bg-surface`、`text-foreground` 等）。`accent-*` 需要 `.dark` 覆写因为深色模式下不同色阶承担不同语义角色；中性色使用同名中间变量加 `.dark` 覆写实现无缝切换。
