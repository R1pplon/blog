# 页面转场动画系统

## 概述

全站页面跳转转场组件（`src/components/PageTransition.astro`），在页面导航和主题切换时展示遮罩动画：
- 遮罩从**下方**滑入覆盖全屏（100vh）
- 1 秒后跳转，遮罩从**上方**滑出
- 中央旋转圆环 + "LOADING" 文字
- 通过颜色快照锁定机制保证主题切换时无闪烁

## 架构

```
PageTransition.astro
├── HTML: #page-transition (全屏遮罩容器)
├── SVG:  旋转圆环 (transform: rotate 动画，GPU 合成)
├── Text: "LOADING" (固定文本)
├── CSS:  定位、过渡、颜色变量回退
└── JS:   全局 API、链接拦截、颜色锁定
```

## 全局 API

组件暴露 `window.__pt = { show, hide }` 供其他组件使用：

| 方法 | 触发时机 | 行为 |
|------|---------|------|
| `ptShow()` | 页面即将离开 | 快照当前主题色 → 锁定 → 遮罩从下方滑入 |
| `ptHide()` | 页面加载完成 / 操作完成 | 遮罩从上方滑出 → 延迟解锁颜色 |

### 调用场景

1. **页面导航** — `document click` 监听器拦截所有同源 `<a>` 点击 → `ptShow()` → 1s 后 `location.href`
2. **主题切换** — `Header.astro` 中切换按钮 → `ptShow()` → 1s 后 `classList.toggle('dark')` → `ptHide()`
3. **分类筛选** — `blog/index.astro` 中筛选按钮 → `ptShow()` → 1s 后应用筛选 → `ptHide()`
4. **初始加载** — `DOMContentLoaded` + 双 `rAF` → `ptHide()`（页面加载后的离场动画）

## 颜色快照锁定机制

### 问题

主题切换时，CSS 自定义属性（`--color-secondary` 等）在遮罩动画中改变值 → 遮罩背景在动画中途闪烁变色。

### 解决方案

`ptShow()` 通过 `getComputedStyle()` 快照当前 `--color-secondary` 和 `--color-accent` 的值，写入自定 CSS 属性 `--pt-locked-bg` / `--pt-locked-accent`。

CSS 使用回退模式：
```css
#page-transition {
  background-color: var(--pt-locked-bg, var(--color-secondary));
}
#page-transition svg circle {
  stroke: var(--pt-locked-accent, var(--color-accent));
}
#page-transition p {
  color: var(--pt-locked-accent, var(--color-accent));
}
```

| `--pt-locked-*` 存在 | 行为 |
|---------------------|------|
| 是 | 使用快照值（遮罩不受主题切换影响） |
| 否 | 回退到实时 CSS 变量（正常模式） |

### 生命周期

```
ptShow()
  → removeProperty(--pt-locked-*)        // 清除旧快照
  → getComputedStyle(...) 读取当前值
  → setProperty(--pt-locked-*, value)     // 快照写入
  → 动画执行
  ...
ptHide()
  → 动画执行
  → setTimeout(1000ms)
  → removeProperty(--pt-locked-*)        // 解锁，恢复实时
```

## 动画实现

### 异侧进出

```js
function ptShow() {
  // ...颜色快照...
  pt.classList.remove("pt_hidden");           // 显示内容
  pt.style.transition = "none";               // 禁用过渡
  pt.style.transform = "translateY(100%)";    // 瞬间移到下方
  pt.offsetHeight;                            // 强制回流
  pt.style.transition = "";                   // 恢复过渡 (1s ease)
  pt.style.transform = "";                    // 从下方滑入到原位 (translateY(0))
}

function ptHide() {
  pt.classList.add("pt_hidden");              // 隐藏内容 (opacity: 0)
  pt.style.transform = "translateY(-100%)";   // 从原位滑出到上方
}
```

| 阶段 | 方向 | transform |
|------|------|-----------|
| Show | 从下向上 | `translateY(100%)` → `0` |
| Hide | 从下向上 | `0` → `translateY(-100%)` |

注意：两次都是"从下到上"，但路径不同：
- Show 从屏幕下方边界外进入（`+100%` → `0`）
- Hide 从屏幕内向上退出到上方边界外（`0` → `-100%`）

### 旋转圆环

```css
#page-transition svg circle {
  stroke-dasharray: 100;
  animation: pt_circle_rotate 1s linear infinite;
  will-change: transform;
}
@keyframes pt_circle_rotate {
  to { transform: rotate(360deg); }
}
```

- **纯 `transform: rotate`**，零 `stroke-dashoffset` 动画 — 避免 SVG repaint
- `will-change: transform` — GPU 合成层提升
- `stroke-dasharray: 100` — 静态值，仅提供可见的弧形断点

### 内容可见性

遮罩容器始终可见（`#page-transition` 始终在 DOM 中），但通过 `pt_hidden` class 控制内部内容的透明度：

```css
#page-transition.pt_hidden svg,
#page-transition.pt_hidden p {
  opacity: 0;
}
```

`pt_hidden` 不绑定 transform — 动画方向由 JS 直接操作 `pt.style.transform`，与 `pt_hidden` 解耦。

## 链接拦截机制

```js
document.addEventListener("click", function (e) {
  var link = e.target.closest("a");
  if (!link) return;
  if (!link.href) return;
  if (link.target === "_blank") return;       // 新标签页 → 放行
  if (link.hostname !== location.hostname) return; // 外部链接 → 放行
  if (link.protocol === "mailto:" || link.protocol === "javascript:") return;

  e.preventDefault();                         // 阻止默认跳转
  ptShow();                                   // 入场动画
  setTimeout(function () {                    // 1s 后跳转
    location.href = link.href;
  }, 1000);
}, { capture: true });
```

关键细节：
- **`capture: true`** — 务必在捕获阶段拦截，确保在目标元素的事件处理器之前执行
- 排除同页锚跳（`mailto:`、`javascript:`）
- 排除跨域导航和新标签页

## 反卡顿优化

### 初始加载

```js
document.addEventListener("DOMContentLoaded", function () {
  requestAnimationFrame(function () {
    requestAnimationFrame(ptHide);   // 双 rAF 确保首帧已绘制
  });
});
```

- 不用 `window.load`（阻塞太久） — `DOMContentLoaded` 更快
- 双 `requestAnimationFrame` 确保浏览器完成首帧渲染后再触发离场 → 遮罩可见时间最短

### GPU 合成

- `#page-transition` 使用 `will-change: transform` — 提示浏览器创建独立合成层
- 圆环动画仅使用 `transform: rotate()` — 完全不触发 repaint/reflow
- `pt_hidden` 仅控制 `opacity` — 这也是仅 GPU 合成属性

## 相关文件

| 文件 | 引用方式 |
|------|---------|
| `src/components/PageTransition.astro` | 主组件 |
| `src/layouts/BaseLayout.astro` | 引入 `<PageTransition />`（最先渲染） |
| `src/components/Header.astro` | 调用 `window.__pt.show/hide` 切换主题 |
| `src/pages/blog/index.astro` | 调用 `window.__pt.show/hide` 筛选文章 |
