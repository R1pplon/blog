# 干净极简版主题配色 — 设计文档

> 日期: 2026-07-01

## 1. 概述

为博客添加自定义主题配色和最暗模式切换。干净极简版采用纯中性灰度体系，无彩色点缀，最大程度突出内容本身。

## 2. 色板

利用 Tailwind 原生 `gray` 色阶，不做自定义色值。

| 用途 | 浅色模式 | 深色模式 |
|------|---------|---------|
| 页面背景 | `white` | `gray-950` |
| 卡片/Header 背景 | `bg-white/80` | `bg-gray-900/80` |
| 主文字 | `gray-900` | `gray-100` |
| 次要文字 | `gray-600` | `gray-400` |
| 辅助/弱化文字 | `gray-500` | `gray-500` |
| 边框 | `border-gray-200` | `border-gray-800` |
| 链接文字 | `gray-900` | `gray-100` |
| 链接 hover | `gray-600` | `gray-400` |
| 分类标签背景 | `bg-gray-100` | `bg-gray-800` |
| 分类标签文字 | `gray-700` | `gray-300` |
| 分类标签 hover | `bg-gray-200` | `bg-gray-700` |
| 激活筛选标签 | `bg-gray-900 text-white` | `bg-gray-100 text-gray-900` |
| 底部文字 | `gray-500` | `gray-500` |
| 文章正文 | `prose prose-gray` | `dark:prose-invert` |

## 3. 夜间模式切换

### 机制

- Tailwind v4 的 `@variant dark` + class strategy
- JS 在 `<html>` 上切换 `.dark` class
- 用户选择存入 `localStorage`，刷新保持
- 首次访问时若 `localStorage` 无值，跟随系统 `prefers-color-scheme`

### 位置与样式

- Header 右侧，导航项之后，独立的图标按钮
- 浅色模式显示月亮图标（🌙 SVG），点击切换到夜间
- 深色模式显示太阳图标（☀️ SVG），点击切换到白天
- 按钮样式：`w-8 h-8` 圆角图标按钮，hover 时背景微微变化

### 闪烁防止

BaseLayout 的 `<head>` 中放一段阻塞脚本，在页面渲染前读取 `localStorage` 或系统偏好并写入 `.dark` class，避免切换时白屏闪烁。

## 4. 文件变更

### 修改

| 文件 | 变更 |
|------|------|
| `package.json` | 安装 `@tailwindcss/typography` 依赖 |
| `src/styles/global.css` | 添加 `@variant dark` 声明，引入 typography 插件 |
| `src/layouts/BaseLayout.astro` | `<body>` 加 `dark:` 样式；`<head>` 加闪烁防止脚本 |
| `src/components/Header.astro` | 导航右侧添加日夜切换按钮，全组件加 `dark:` 样式 |
| `src/components/Footer.astro` | 加 `dark:` 样式适配 |
| `src/components/BlogCard.astro` | 加 `dark:` 样式适配 |
| `src/pages/index.astro` | 加 `dark:` 样式适配 |
| `src/pages/blog/index.astro` | 加 `dark:` 样式适配 |
| `src/pages/blog/[slug].astro` | 加 `dark:` 样式适配 |
| `src/pages/categories/[category].astro` | 加 `dark:` 样式适配 |

无需新增文件，所有变更均在已有文件中添加 `dark:` 变体。

## 5. 示例对照

以 Header 为例：

**浅色模式：**
```html
<header class="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
  <a href="/" class="text-lg font-semibold text-gray-900">...</a>
  <ul class="flex gap-6 text-sm text-gray-600">
```

**深色模式（同一元素加 dark: 变体）：**
```html
<header class="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
  <a href="/" class="text-lg font-semibold text-gray-900 dark:text-gray-100">...</a>
  <ul class="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
```

## 6. 不在范围内

- 科技现代版（`#6B69D6`）主题 —— 将在另一分支 `tech-theme` 实现
- 科技现代版（`#6B69D6`）主题 —— 将在另一分支 `tech-theme` 实现
- 文章正文内容样式（Markdown 内的代码块、表格等）不做精细定制
