# Magnetic Pointer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a magnetic corner-bracket reticle cursor effect to the tech-theme blog.

**Architecture:** A single Astro component (`CursorReticle.astro`) with inline CSS+JS, injected into `BaseLayout.astro`. The reticle uses `position: fixed`, four corner-bracket divs, and vanilla JS to track the mouse, expand on hover over `<a>`/`<button>` targets, and apply magnetic damping. Color adapts to theme via CSS custom property.

**Tech Stack:** Astro v7, Tailwind CSS v4, vanilla JS (zero dependencies)

## Global Constraints

- Zero external JS/CSS dependencies
- Follow existing inline `<script>` pattern (see Header.astro theme toggle, blog/index.astro filter)
- Accent colors: light `#6B69D6`, dark `#d9d6fc`
- Targets: all `<a>` and `<button>` elements, automatically detected

---

### Task 1: Create CursorReticle component and integrate into BaseLayout

**Files:**
- Create: `src/components/CursorReticle.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `<CursorReticle />` — zero-prop component, renders reticle HTML + CSS + JS inline

- [ ] **Step 1: Create `src/components/CursorReticle.astro`**

```astro
---
// 磁力指针准星组件 — 四角括号跟随鼠标，悬停联动元素时展开并吸附
---

<style>
  :root {
    --reticle-color: #6B69D6;
  }
  :root.dark {
    --reticle-color: #d9d6fc;
  }

  .reticle {
    --width: 4rem;
    --height: 4rem;
    position: fixed;
    top: 0;
    left: 0;
    width: var(--width);
    height: var(--height);
    transform: translate(-50%, -50%);
    transition: all 0.2s ease-out;
    pointer-events: none;
    z-index: 9999;
  }

  .reticle .corner {
    position: absolute;
    width: 1rem;
    height: 1rem;
    border-width: 0.3rem;
    border-color: var(--reticle-color);
  }

  .reticle .corner:nth-child(1) { top: 0; left: 0; border-style: solid none none solid; }
  .reticle .corner:nth-child(2) { top: 0; right: 0; border-style: solid solid none none; }
  .reticle .corner:nth-child(3) { bottom: 0; left: 0; border-style: none none solid solid; }
  .reticle .corner:nth-child(4) { bottom: 0; right: 0; border-style: none solid solid none; }
</style>

<div class="reticle" id="reticle">
  <div class="corner"></div>
  <div class="corner"></div>
  <div class="corner"></div>
  <div class="corner"></div>
</div>

<script>
  const reticle = {
    el: document.getElementById("reticle"),
    currentTarget: null,

    init() {
      if (!this.el) return;
      window.addEventListener("mousemove", (e) => this.move(e));
      window.addEventListener("mouseleave", () => {
        this.el.style.opacity = "0";
      });
      window.addEventListener("mouseenter", () => {
        this.el.style.opacity = "1";
      });
      this.bindTargets();
    },

    move(e) {
      let x = e.clientX;
      let y = e.clientY;
      if (this.currentTarget) {
        const r = this.currentTarget.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        x = cx + (x - cx) * 0.1;
        y = cy + (y - cy) * 0.1;
      }
      this.el.style.transform = `translate(${x}px, ${y}px)`;
    },

    bindTargets() {
      const targets = document.querySelectorAll("a, button");
      targets.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          this.currentTarget = el;
          const r = el.getBoundingClientRect();
          const margin = innerWidth / 50;
          this.el.style.setProperty("--width", `${r.width + margin}px`);
          this.el.style.setProperty("--height", `${r.height + margin}px`);
        });
        el.addEventListener("mouseleave", () => {
          this.currentTarget = null;
          this.el.style.setProperty("--width", "4rem");
          this.el.style.setProperty("--height", "4rem");
        });
      });
    },
  };

  reticle.init();
</script>
```

- [ ] **Step 2: Modify `src/layouts/BaseLayout.astro` — insert `<CursorReticle />` before closing `</body>`**

Read the file, find `</body>`, insert `<CursorReticle />` on the line above it. Also add the import at the top:

```
import CursorReticle from "../components/CursorReticle.astro";
```

- [ ] **Step 3: Verify build**

```bash
npx astro build
```

Expected: Build succeeds, 5 pages generated.

- [ ] **Step 4: Commit**

```bash
git add src/components/CursorReticle.astro src/layouts/BaseLayout.astro
git commit -m "feat: add magnetic pointer reticle effect"
```
