# 文章字数统计与数据可视化

## 概述

为博客增加以下三个功能：
1. **文章列表字数显示** — `/blog` 页每篇文章元信息附加字数
2. **首页目录词云图** — 各父目录名称按旗下文章总字数权重展示
3. **首页饼状图** — 顶级分类按文章总字数比例展示

## 架构

```
src/lib/wordCount.ts              ← 字数统计工具函数 (新建)
src/components/PieChart.astro     ← SVG 饼图组件 (新建)
src/components/HotTags.astro      ← CSS 权重标签组件 (新建)
src/pages/index.astro             ← 数据聚合 + 引入饼图/词云 (修改)
src/pages/blog/index.astro        ← 文章列表加字数显示 (修改)
```

## 字数统计算法 - `src/lib/wordCount.ts`

### 接口

```ts
function countWords(md: string): number
```

- 输入：原始 Markdown 字符串（来自 `post.body`）
- 输出：整数（中文字数 + 英文词数）

### 剥离规则

Markdown 语法标记在计数前剥离，保留可读文本：

| 阶段 | 正则 | 说明 |
|------|------|------|
| 围栏代码块 | `` /```[\s\S]*?```/g `` | 多行代码，全部移除 |
| 行内代码 | `` /`[^`]*`/g `` | 行内代码，全部移除 |
| 图片 | `/!\[.*?\]\(.*?\)/g` | 移除图片语法 |
| 链接 | `/\[([^\]]*)\]\([^)]*\)/g` | 保留链接文字 (`$1`) |
| HTML 标签 | `/<[^>]*>/g` | 移除 HTML |
| Headings | `/^#{1,6}\s*/gm` | 移除 `#` 标记 |
| 粗/斜/删 | `/\*{1,3}|_{1,3}|~~|~/g` | 移除修饰符 |
| 列表 | `/^\s*[-*+]\s/gm` | 无序列表标记 |
| 列表 | `/^\s*\d+\.\s/gm` | 有序列表标记 |
| 引用 | `/^>\s*/gm` | Blockquote 标记 |
| 水平线 | `/^[-*_]{3,}\s*$/gm` | `<hr>` 语法 |

### 计数规则

1. **中文字符** — CJK 统一表意文字范围 `[\u4e00-\u9fff\u3400-\u4dbf]`，逐字计数
2. **英文单词** — 去除所有中文字符后，按空白分拆，统计有效词数（排除空字符串和仅标点）
3. **混合文本** — 处理顺序：先剥离 Markdown → 提取中文计数 → 剥离中文 → 英文分词计数 → 求和

### 数据来源

`post.body` 是 Astro 内容集合的原始 Markdown 字符串，SSG 构建时一次性读取。~120 篇文章的正则处理 < 100ms。

## 功能 1：文章列表字数

### 改动文件

`src/pages/blog/index.astro`

### 模板改动

文章 `meta` 行新增字数：

```html
<span class="blog-meta">
  {formatDate(post.data.date)}
  <span class="mx-1.5 text-border">·</span>
  <span>{countWords(post.body)}字</span>
  <span class="mx-1.5 text-border">·</span>
  <a href={`/blog/${parentPath}`}>{parentDir}</a>
</span>
```

最终 meta 行效果：`2026年7月4日 · 1,234字 · 存储`

### Frontmatter 改动

每篇文章在 map 回调中调用一次 `countWords(post.body)`。

## 功能 2：目录词云图 - `src/components/HotTags.astro`

### 数据聚合（首页 frontmatter）

```ts
const dirWordCounts = new Map<string, number>();
for (const post of posts) {
  const parts = post.id.split('/');
  if (parts.length < 2) continue; // 跳过顶级文件
  const parentPath = parts.slice(0, -1).join('/');
  dirWordCounts.set(parentPath,
    (dirWordCounts.get(parentPath) || 0) + countWords(post.body)
  );
}
const hotTags = Array.from(dirWordCounts.entries())
  .map(([path, wc]) => ({
    name: path.split('/').pop()!,
    wordCount: wc,
    href: `/blog/${path}`,
  }))
  .sort((a, b) => b.wordCount - a.wordCount);
```

### 组件 Props

```ts
{ items: { name: string; wordCount: number; href: string }[] }
```

### 视觉设计

- 布局：`flex flex-wrap gap-3`
- 每个标签：圆角背景 `bg-secondary`，内边距 `px-4 py-2`
- 字号梯度范围：`0.85rem` ~ `1.4rem`，按字数在被选中的标签中线性映射
- 链接到对应目录页，`._target` 标记
- 显示格式：`{name}:{wordCount}`

### 字号映射算法

```
maxWC = max(items.map(i => i.wordCount))
minWC = min(items.map(i => i.wordCount))
range = maxWC - minWC (若为 0 则所有标签同号)
fontSize = 0.85 + (wc - minWC) / range * 0.55  (单位: rem)
```

`font-size` 通过内联 `style` 属性设置。

### 无数据情况

所有文章都是顶级文件（如 `README.md`）→ `items` 为空数组 → 不渲染该 section。

## 功能 3：饼状图 - `src/components/PieChart.astro`

### 数据聚合（首页 frontmatter）

```ts
const CAT_COLORS = [
  '#6B69D6', '#4ECDC4', '#FF6B6B', '#FFE66D',
  '#95E1D3', '#F38181', '#AA96DA', '#C0392B',
  '#45B7D1', '#96CEB4',
];

const catWordCounts = new Map<string, number>();
for (const post of posts) {
  const cat = post.id.split('/')[0];
  catWordCounts.set(cat,
    (catWordCounts.get(cat) || 0) + countWords(post.body)
  );
}
const pieData = Array.from(catWordCounts.entries())
  .map(([label, value], i) => ({
    label,
    value,
    color: CAT_COLORS[i % CAT_COLORS.length],
  }))
  .sort((a, b) => b.value - a.value);
```

### 组件 Props

```ts
{ data: { label: string; value: number; color: string }[] }
```

### SVG 实现细节

**圆环图 (donut chart)**

- 画布：`viewBox="0 0 300 200"`，实际尺寸通过 CSS `max-width: 400px` 约束
- 中心点：`(cx, cy) = (90, 90)`
- 外径：`80`，内径：`40`
- 总角度：360°，从 -90°（12 点钟方向）开始绘制

**弧线路径**

对于每个扇区，使用 SVG `<path d="..." />` + 弧线指令 `A`：

```
startX = cx + outerR * cos(startAngle)
startY = cy + outerR * sin(startAngle)
endX   = cx + outerR * cos(endAngle)
endY   = cy + outerR * sin(endAngle)

largeArcFlag = (endAngle - startAngle > π) ? 1 : 0

// 外弧 + 内弧回绕，构成完整扇形
path = `
  M{startX_out} {startY_out}
  A{outerR} {outerR} 0 {largeArcFlag} 1 {endX_out} {endY_out}
  L{endX_in} {endY_in}
  A{innerR} {innerR} 0 {largeArcFlag} 0 {startX_in} {startY_in}
  Z
`
```

**标签**

- 每个扇区中角位置：`labelAngle = startAngle + (endAngle - startAngle) / 2`
- 标签锚点：`labelR = 65`（外径和圆心之间）
- 如果扇区角度 < 15°（约 4%），跳过文字标签（太小无法显示）
- 文字锚点：`text-anchor="middle"`，`dominant-baseline="central"`

**图例**

- 位置：`x = 190`，从 `y = 20` 开始，每条图例高度 `16px`
- 每条：`10x10` 色块 `rect` + 分类名 + 百分比 `text`
- 百分比格式：`{Math.round(value / total * 100)}%`
- 如果分类数 > 9，超出的合并为 "其他"（其颜色为 `#CCCCCC`）

**交互**

- 每个扇区 `._target` 标记
- 点击跳转 `/blog?category={label}`

### 边界情况

| 情况 | 处理 |
|------|------|
| 0 篇文章 | 不渲染该 section |
| 1 个分类 | 绘制完整圆环 |
| 10+ 个分类 | 前 9 个单独显示，其余合并为"其他" |
| 极小扇区 | 角度 < 2% 合并到"其他" |

## 首页最终布局

```
section 1: 头像 + FaultText 标题 + 简介 (现有)
section 2: 社交链接 (现有)
section 3: [NEW] 饼状图 — 顶级分类字数分布
section 4: [NEW] 词云图 — 目录:字数 权重标签
section 5: 分类标签 (现有)
```

每个新 section 带有分隔间距（`mt-8` 或 `mt-12`）和 `h2` 标题。

## 构建性能考量

| 操作 | 成本 | 说明 |
|------|------|------|
| `getCollection("blog")` | O(n) | 已在现有代码中，不新增成本 |
| `countWords(post.body)` | O(m), m = 文章长度 | 120 篇文章 × 均值 3KB ≈ 360KB 文本处理 |
| 正则剥离 | ~1ms/篇 | V8 引擎对正则高度优化 |
| 数据聚合 (Map) | ~0.1ms/篇 | 简单 Map 插入 + 累加 |
| 总增量 | < 200ms | SSG 构建时一次性成本，无运行时开销 |

## 执行步骤

1. 新建 `src/lib/wordCount.ts` — 字数统计工具函数
2. 新建 `src/components/PieChart.astro` — SVG 饼图组件
3. 新建 `src/components/HotTags.astro` — CSS 权重标签组件
4. 修改 `src/pages/index.astro` — 数据聚合 + 引入两个新组件
5. 修改 `src/pages/blog/index.astro` — 文章列表加字数
6. `npm run build` 验证
7. 更新 `AGENTS.md` 文档

## 相关文件

| 文件 | 说明 |
|------|------|
| `src/lib/wordCount.ts` | 字数统计工具（新建） |
| `src/components/PieChart.astro` | 饼图组件（新建） |
| `src/components/HotTags.astro` | 词云标签组件（新建） |
| `src/pages/index.astro` | 首页，数据聚合（修改） |
| `src/pages/blog/index.astro` | 文章列表，字数显示（修改） |
| `docs/superpowers/specs/2026-07-04-word-count-stats.md` | 本文档 |
