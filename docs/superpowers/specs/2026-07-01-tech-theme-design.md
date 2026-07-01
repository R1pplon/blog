# 科技现代版主题配色 — 设计文档

> 日期: 2026-07-01
> 分支: tech-theme

## 1. 概述

基于干净极简版主题，替换中性灰强调色为科技现代紫色 `#6B69D6`，默认深色模式。链接、分类激活态等关键交互元素使用紫色系。

## 2. 色板

### 自定义色值

在 `global.css` 中通过 Tailwind v4 `@theme` 注册：

```css
@theme {
  --color-accent: #6B69D6;
  --color-accent-100: #f0efff;
  --color-accent-200: #d9d6fc;
  --color-accent-300: #6B69D6;
  --color-accent-400: #5a58c4;
  --color-accent-500: #4947b0;
}
```

| 用途 | 浅色模式 | 深色模式（默认） |
|------|---------|-----------------|
| 页面背景 | `white` | `gray-950` |
| Header 背景 | `bg-white/80` | `bg-gray-950/80` |
| 主文字 | `gray-900` | `gray-100` |
| 次要文字 | `gray-600` | `gray-400` |
| 辅助文字 | `gray-500` | `gray-500` |
| 边框 | `gray-200` | `gray-800` |
| 链接文字 | `accent-400` | `accent-200` |
| 链接 hover | 加深/下划线 | 变亮/下划线 |
| 分类普通标签 bg | `gray-100` | `gray-800` |
| 分类普通标签文字 | `gray-700` | `gray-300` |
| 分类激活标签 | `accent-300` 白字 | `accent-100` `gray-900` |
| 文章标题 | `gray-900` | `gray-100` |
| 文章标题 hover | `accent-400` | `accent-200` |
| Footer 文字 | `gray-500` | `gray-500` |
| 日夜切换按钮 | 灰色 | 灰色 |

## 3. 默认深色模式

BaseLayout 中 `<html>` 初始 class 为 `dark`。闪烁防止脚本调整为：仅当 localStorage 明确存 `light` 时才移除 `dark` class。

```html
<html lang="zh-CN" class="dark">
```

```js
const theme = localStorage.getItem('theme');
if (theme === 'light') {
  document.documentElement.classList.remove('dark');
}
```

点击切换时：
- 日→夜：`localStorage.setItem('theme', 'dark')`
- 夜→日：`localStorage.setItem('theme', 'light')`

## 4. 文件变更

| 文件 | 变更 |
|------|------|
| `src/styles/global.css` | 添加 `@theme` 自定义 accent 色值 |
| `src/layouts/BaseLayout.astro` | `<html class="dark">` + 脚本改为默认深色 |
| `src/components/Header.astro` | 链接、hover、导航文字改用 accent |
| `src/components/Footer.astro` | 无实质变更（保持灰色） |
| `src/components/BlogCard.astro` | 标题 hover、category 链接改用 accent |
| `src/pages/index.astro` | 分类标签、社交链接 hover 改用 accent |
| `src/pages/blog/index.astro` | 分类激活按钮改用 accent |
| `src/pages/blog/[category]/[slug].astro` | category 链接改用 accent |

## 5. 不在范围内

- 文章正文代码块特殊样式
- 渐变/发光等复杂视觉效果
- 布局结构变更
