# 磁力指针设计文档

## 概述

在科技现代版主题中添加磁性指针效果：一个四角括号准星跟随鼠标移动，悬停在交互元素上时展开并磁力吸附。

参考：`JIEJOE-WEB-Tutorial/018-magnetic-pointer/magnetic pointer.html`

## 视觉效果

| 状态 | 行为 |
|------|------|
| **空闲** | 准星跟随鼠标移动，`transition: all 0.2s ease-out` 产生顺滑拖尾感 |
| **悬停进入** | 准星展开至目标元素尺寸（+ 2vw 边距），位置和尺寸同时平滑过渡 |
| **悬停中** | 磁力吸附：准星位置 = 中心 + (鼠标 - 中心) * 0.1，产生粘滞感 |
| **悬停离开** | 准星缩回默认尺寸，恢复空闲跟踪 |
| **事件穿透** | `pointer-events: none`，不影响底层交互 |

## 准星样式

- 四角括号：4 个 `<div>` 各画两条相邻边框形成 `┌ ┐ └ ┘`
- 默认容器尺寸：CSS 变量 `--reticle-size: 1.5rem`，集中管控，JS 通过 `getComputedStyle` 读取回退值
- 角大小：0.5rem x 0.5rem
- 边框宽度：0.1rem
- 边框颜色：
  - 浅色模式：`accent-300`（`#6B69D6`）
  - 深色模式：`accent-200`（`#d9d6fc`）
- 过渡动画：`transition: all 0.2s ease-out`（含 transform，确保位置和尺寸同时平滑变化）

## 触发目标

通过显式 `._target` CSS class 标记需要触发准星效果的元素（参考项目的 class-based 模式）。不对标签名做假设。

- 页面中所有需要准星反馈的 `<a>` 和 `<button>` 需显式添加 `class="_target"`。
- 对于 Block 级链接（如文章卡片标题行），在内部文字外包 `<span class="_target">`，使准星吸附盒紧跟文字实际尺寸而非整行宽度。

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
