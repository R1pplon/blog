# 分类筛选客户端化 + URL 结构优化 — 设计文档

> 日期: 2026-07-01

## 1. 概述

将博客的分类筛选从路由跳转改为 `/blog` 页面内客户端过滤，同时将文章 URL 从 `/blog/{slug}` 优化为 `/blog/{category}/{slug}`，使 URL 与目录结构一一对应。

## 2. URL 结构调整

| 页面 | 当前 | 改为 |
|------|------|------|
| 文章列表 | `/blog` | `/blog`（不变） |
| 文章详情 | `/blog/{slug}` | `/blog/{category}/{slug}` |
| 分类页 | `/categories/{category}` | **删除** |

### Slug 逻辑简化

```
article.id = "tech/hello-world"
  category = id.split("/")[0]  // "tech"
  slug     = id.split("/")[1]  // "hello-world"
```

消除 `.slice(1).join("/")` 的复杂拼接。

## 3. /blog 页面交互行为

- 分类按钮从 `<a href>` 改为 `<button data-filter>`，点击不跳转
- 点击按钮 → 客户端的 JavaScript 过滤文章列表显示/隐藏 + 按钮激活态切换
- "全部" 按钮 `data-filter="all"`，始终显示所有文章
- 页面加载时读取 URL query `?category=` 参数，自动激活对应按钮
- 按钮切换时通过 `history.pushState` 更新 URL，不影响后退/前进

### 按钮样式

| 状态 | 样式 |
|------|------|
| 默认 | `bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300` |
| 激活 | `bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900` |

## 4. 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/pages/blog/[slug].astro` | 删除 | 迁移到 `[category]/[slug].astro` |
| `src/pages/blog/[category]/[slug].astro` | 新建 | 从原 `[slug].astro` 迁移，路由参数改为 `{category, slug}` |
| `src/pages/blog/index.astro` | 修改 | 按钮改 `<button>`，加客户端筛选脚本 |
| `src/pages/categories/[category].astro` | 删除 | 不再需要 |
| `src/components/BlogCard.astro` | 修改 | href 改为 `/blog/{category}/{slug}`，category 链接改为 `/blog?category=`，加 `data-category` 属性 |
| `src/pages/index.astro` | 修改 | 首页分类链接改为 `/blog?category=`，BlogCard slug 传值简化 |

## 5. 客户端脚本逻辑

```
页面加载时：
  const category = new URLSearchParams(window.location.search).get('category')
  如果有 category 参数 → 激活对应按钮，过滤文章列表
  无参数 → 激活 "全部" 按钮

按钮点击时：
  const filter = button.dataset.filter
  遍历所有按钮 → 移除激活样式
  当前按钮 → 添加激活样式
  遍历所有文章 → filter === 'all' 或 data-category 匹配 → 显示，否则隐藏
  pushState 更新 URL query 参数
```

## 6. 不在范围内

- 科技现代版主题
- 其他新增功能
