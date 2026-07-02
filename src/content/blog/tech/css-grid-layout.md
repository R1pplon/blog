---
title: "CSS Grid 布局实践"
date: 2026-07-01
---

记录使用 CSS Grid 实现复杂布局的几个案例。

## 两列文章列表

使用 `grid-template-columns: auto 1fr` 实现左侧月份标签、右侧文章列表的布局。

## 响应式日历

结合 `grid-template-columns: repeat(7, 1fr)` 和 CSS 变量构建一个轻量日历组件。
