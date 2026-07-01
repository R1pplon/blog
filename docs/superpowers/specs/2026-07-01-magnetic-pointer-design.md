# 磁力指针设计文档

## 概述

在科技现代版主题中添加磁性指针效果：一个四角括号准星跟随鼠标移动，悬停在交互元素上时展开并磁力吸附。

参考：`JIEJOE-WEB-Tutorial/018-magnetic-pointer/magnetic pointer.html`

## 视觉效果

| 状态 | 行为 |
|------|------|
| **空闲** | 4rem x 4rem 四角括号准星，精确跟随鼠标（1:1 映射） |
| **悬停进入** | 准星展开至目标元素尺寸（+ 2vw 边距），过渡 0.2s ease-out |
| **悬停中** | 磁力吸附：准星位置 = 中心 + (鼠标 - 中心) * 0.1，产生粘滞感 |
| **悬停离开** | 准星缩回 4rem x 4rem，恢复精确跟踪 |
| **事件穿透** | `pointer-events: none`，不影响底层交互 |

## 准星样式

- 四角括号：4 个 `<div>` 各画两条相邻边框形成 `┌ ┐ └ ┘`
- 角大小：1rem x 1rem
- 边框宽度：0.3rem
- 边框颜色：
  - 浅色模式：`accent-300`（`#6B69D6`）
  - 深色模式：`accent-200`（`#d9d6fc`）

## 触发目标

自动选中页面上所有 `<a>` 和 `<button>` 元素。不对单独元素做标记。

## 实现

### 新文件

- `src/components/CursorReticle.astro` — 准星组件，纯 HTML+CSS+内联 JS

### 修改文件

- `src/layouts/BaseLayout.astro` — 在 `<body>` 底部插入 `<CursorReticle />`

### 技术要点

- 准星容器 `position: fixed`，CSS 自定义属性 `--width`/`--height` 控制尺寸
- JS 监听 `mousemove`、`mouseenter`、`mouseleave`
- 颜色通过 `@media (prefers-color-scheme)` 或检查 `<html>` 上的 `.dark` 类动态切换
- 零外部依赖，与现有 Tailwind + 内联 JS 架构一致
