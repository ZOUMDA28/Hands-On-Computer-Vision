# Hands-On Computer Vision — Design System

> 基于 **Modern LLM Notebook** 风格（walkinglabs.github.io/modern-llm-notebook）的完整设计规范。

---

## 1. 色彩系统 (Color Tokens)

### 1.1 品牌色 (Brand Colors)

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-accent` | `#5B5BD6` | 主品牌色（按钮、链接、高亮态） |
| `--color-accent-hover` | `#4A4AC4` | 悬停态 |
| `--color-accent-light` | `#EEF0FF` | 浅色背景（active nav、badge） |
| `--color-accent-gradient` | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | Logo/封面渐变 |

### 1.2 中性色 (Neutral Colors)

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-bg-primary` | `#FFFFFF` | 页面背景、卡片背景 |
| `--color-bg-secondary` | `#FAFBFC` | 侧边栏背景、交替区块 |
| `--color-bg-tertiary` | `#F5F6F8` | 徽章背景、hover 背景 |
| `--color-bg-code` | `#1E1E2E` | 代码块背景 |

### 1.3 文字色 (Text Colors)

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-text-primary` | `#1D1D1F` | 主标题、正文 |
| `--color-text-secondary` | `#6B7280` | 描述文字、导航标签 |
| `--color-text-tertiary` | `#9CA3AF` | 次要信息、时间戳 |
| `--color-text-inverse` | `#FFFFFF` | 深色背景上的文字 |

### 1.4 边框与分隔 (Borders & Dividers)

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-border` | `#E5E7EB` | 主边框（卡片、分隔线） |
| `--color-border-light` | `#F3F4F6` | 浅色边框（徽标、内部边框） |
| `--color-border-code` | `#2D2D3F` | 代码块边框 |

### 1.5 功能色 (Functional Colors)

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-success` | `#10B981` | 成功状态 |
| `--color-warning` | `#F59E0B` | 警告状态 |
| `--color-error` | `#EF4444` | 错误状态 |
| `--color-info` | `#3B82F6` | 信息提示 |

### 1.6 Notebook 封面渐变色

| Token | Gradient | 用途 |
|-------|----------|------|
| `--grad-1` | `linear-gradient(135deg, #667eea, #764ba2)` | 紫色系 |
| `--grad-2` | `linear-gradient(135deg, #f093fb, #f5576c)` | 粉红系 |
| `--grad-3` | `linear-gradient(135deg, #4facfe, #00f2fe)` | 天蓝系 |
| `--grad-4` | `linear-gradient(135deg, #43e97b, #38f9d7)` | 翠绿系 |
| `--grad-5` | `linear-gradient(135deg, #fa709a, #fee140)` | 日落系 |
| `--grad-6` | `linear-gradient(135deg, #a8edea, #fed6e3)` | 薄荷系 |
| `--grad-7` | `linear-gradient(135deg, #ff9a9e, #fecfef)` | 玫瑰系 |
| `--grad-8` | `linear-gradient(135deg, #ffecd2, #fcb69f)` | 橘黄系 |
| `--grad-9` | `linear-gradient(135deg, #84fab0, #8fd3f4)` | 青绿系 |
| `--grad-10` | `linear-gradient(135deg, #a18cd1, #fbc2eb)` | 紫粉系 |

---

## 2. 字体系统 (Typography)

### 2.1 字体族

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
```

### 2.2 字号与字重

| Token | Size | Weight | Line-Height | 用途 |
|-------|------|--------|-------------|------|
| `--fs-hero` | 48px | 800 | 1.1 | 首页 Hero 标题 |
| `--fs-h1` | 36px | 700 | 1.2 | 页面级标题 |
| `--fs-h2` | 28px | 700 | 1.3 | Section 标题 |
| `--fs-h3` | 20px | 600 | 1.4 | 卡片标题 |
| `--fs-h4` | 16px | 600 | 1.4 | 小标题 |
| `--fs-body` | 15px | 400 | 1.6 | 正文 |
| `--fs-small` | 13px | 400 | 1.5 | 次要文字 |
| `--fs-caption` | 11px | 500 | 1.4 | 标签、徽章 |
| `--fs-nav` | 13.5px | 500 | 1.4 | 导航项 |
| `--fs-code` | 13px | 400 | 1.6 | 代码 |

### 2.3 字间距

| Token | Value | 用途 |
|-------|-------|------|
| `--ls-tight` | -0.02em | Hero 标题 |
| `--ls-normal` | 0 | 正文 |
| `--ls-wide` | 0.5px | Section 标题 |
| `--ls-label` | 0.5px | Label/Tag |

---

## 3. 间距系统 (Spacing Scale)

基于 4px 基准单位：

| Token | Value | 用途 |
|-------|-------|------|
| `--space-1` | 4px | 最小间距 |
| `--space-2` | 8px | 紧凑元素 |
| `--space-3` | 12px | 徽章内距 |
| `--space-4` | 16px | 卡片内距 |
| `--space-5` | 20px | 组件间距 |
| `--space-6` | 24px | Section 内距 |
| `--space-8` | 32px | Section 间距 |
| `--space-10` | 40px | 大块间距 |
| `--space-12` | 48px | Hero 顶部/底部 |
| `--space-14` | 56px | 页面边缘 |

---

## 4. 栅格与布局 (Grid & Layout)

### 4.1 断点

| Name | Width | 布局 |
|------|-------|------|
| Mobile | < 640px | 单列，侧边栏收起 |
| Tablet | 640–1024px | 双列，右侧 TOC 收起 |
| Desktop | ≥ 1024px | 三列完整布局 |
| Large | ≥ 1440px | 扩展列宽 |

### 4.2 布局尺寸

| Token | Value | 用途 |
|-------|-------|------|
| `--sidebar-width` | 260px | 左侧导航宽度 |
| `--toc-width` | 280px | 右侧目录宽度 |
| `--content-max` | 1200px | 主内容最大宽度 |
| `--card-min` | 220px | 卡片最小宽度 |
| `--card-max` | 280px | 卡片最大宽度 |

---

## 5. 组件规范 (Component Specs)

### 5.1 侧边栏导航 (Sidebar Nav)

- **Logo 区**: 38×38px 圆角图标 + 14px/700 标题
- **导航项**: 高度 36px，12px 圆角，active 态 bg `--color-accent-light`
- **编号圆圈**: 22×22px，bg `--color-bg-tertiary`，active 态 bg `--color-accent` fg white
- **Section Header**: 11px/600 uppercase，color `--color-text-tertiary`

### 5.2 特征卡片 (Feature Cards)

- **尺寸**: 自适应网格，minmax(240px, 1fr)
- **内距**: 24px
- **圆角**: 16px
- **边框**: 1px solid `--color-border-light`
- **Hover**: translateY(-3px), shadow-lg
- **图标容器**: 44×44px rounded-square, bg `--color-bg-tertiary`, color `--color-accent`

### 5.3 Notebook 卡片 (Notebook Cards)

- **封面**: 120px 高度，border-radius 16px 16px 0 0
- **Colab 徽章**: absolute top-right, bg rgba(255,255,255,0.95), blur backdrop
- **标签**: 10.5px/600, 圆角 4px, 分类配色
- **操作按钮**: flex(1), 32px 高度, 圆角 6px

### 5.4 代码块 (Code Blocks)

- **背景**: `--color-bg-code` (#1E1E2E)
- **圆角**: 12px
- **字体**: `--font-mono`, 13px
- **窗口栏**: 36px 高度，左对齐红/黄/绿圆点（10px 圆点）
- **语言标签**: 居中 "Python" 文字，13px/500
- **复制按钮**: 右对齐 SVG 图标 + "复制" 文字，点击后变为 "✓已复制"
- **语法高亮**: 行内 span style 实现关键字/字符串/注释着色
- **最大宽度**: 680px

### 5.5 统计数据区 (Stats Section)

- **容器**: flex 布局，gap 32px，上边框分隔线
- **数字**: 28px/800 `--color-text-primary`，tight letter-spacing
- **标签**: 13px/500 `--color-text-tertiary`
- **位置**: Hero 区域底部，padding-top 32px

### 5.6 按钮 (Buttons)

**Colab 主按钮**:
- 渐变背景: Google brand (#4285f4 → #34a853)
- 文字: 14px/600 white
- 高度: 40px
- 圆角: 10px
- 阴影: 0 4px 12px rgba(66,133,244,0.3)

**次级按钮**:
- 背景: `--color-bg-secondary`
- 边框: 1px solid `--color-border`
- 文字: 14px/500 `--color-text-secondary`

### 5.7 徽章 (Badges)

**特色徽章 (Feature Badges)**:
- 内距: 14px 22px
- 圆角: 24px
- 背景: `--color-bg-secondary`
- 边框: 1px solid `--color-border-light`
- Hover: translateY(-2px), shadow-md

**分类徽章 (Category Tags)**:
- 内距: 3px 8px
- 字号: 10.5px/600
- 圆角: 4px
- 分类配色:
  - 经典: bg `#DBEAFE`, fg `#1D4ED8`
  - 几何: bg `#DCFCE7`, fg `#15803D`
  - 立体视觉: bg `#FCE7F3`, fg `#BE185D`
  - 深度学习: bg `#FEF3C7`, fg `#B45309`

### 5.8 学习路径卡片 (Learning Path Cards)

- **编号**: 13px/800 `--color-text-tertiary`
- **标题**: 20px/700
- **描述**: 13px/400 `--color-text-tertiary`
- **底部渐变条**: 4px 高度，圆角 2px

### 5.9 移动端菜单按钮 (Mobile Menu Button)

- **尺寸**: 44×44px
- **圆角**: 10px
- **背景**: `--color-bg-secondary`
- **边框**: 1px solid `--color-border-light`
- **图标**: 22px SVG (menu icon)
- **显示**: 仅在 ≤1024px 断点显示

### 5.10 Toast 通知 (Toast Notifications)

- **位置**: fixed bottom-center
- **动画**: fade-in + slide-up (300ms)
- **背景**: `--color-bg-tertiary` + backdrop blur
- **圆角**: 10px
- **内距**: 10px 16px
- **字号**: 13px/500
- **自动消失**: 2500ms

---

## 6. 图标规范 (Icon System)

- **方案**: 内联 SVG（统一 stroke-width: 1.5）
- **尺寸**: 16px (nav), 22px (feature), 14px (badge)
- **颜色**: inherit from parent, 通过 CSS `color` 属性控制

---

## 7. 阴影系统 (Shadow System)

| Token | Value | 用途 |
|-------|-------|------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | 细微阴影 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.05)` | 卡片 hover |
| `--shadow-lg` | `0 10px 25px rgba(0,0,0,0.08)` | 模态窗口 |
| `--shadow-xl` | `0 20px 40px rgba(0,0,0,0.1)` | 重度阴影 |

---

## 8. 动效规范 (Animation Specs)

| Token | Value | 用途 |
|-------|-------|------|
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 通用缓动 |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 进入 |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 退出 |
| `--dur-fast` | 150ms | 快速响应 |
| `--dur-base` | 250ms | 标准交互 |
| `--dur-slow` | 400ms | 大过渡 |

---

## 9. 响应式断点 (Responsive Breakpoints)

| Breakpoint | 宽度 | 行为 |
|------------|------|------|
| Desktop | ≥1280px | 完整三栏布局（左导航 + 主内容 + 右TOC） |
| Tablet | 1024px–1279px | 隐藏右TOC，左导航收窄至64px |
| Mobile | ≤1023px | 单栏布局，左侧栏变为抽屉式，显示菜单按钮 |
| Small | ≤768px | 特征卡片变为单列，Hero 区域简化 |

---

## 10. 深色模式 (Dark Mode)

通过 `prefers-color-scheme: dark` 自动切换，所有 `:root` 令牌覆盖：

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg-primary` | `#FFFFFF` | `#0F0F14` |
| `--color-bg-secondary` | `#FAFAFB` | `#18181F` |
| `--color-bg-tertiary` | `#F5F6F8` | `#24242C` |
| `--color-text-primary` | `#1A1A1F` | `#F0F0F5` |
| `--color-text-secondary` | `#4A4A55` | `#B0B0B8` |
| `--color-text-tertiary` | `#6B6B75` | `#808088` |
| `--color-border` | `#E5E5EA` | `#2A2A32` |
| `--color-accent-light` | `#EEF0FF` | `#1A1A3A` |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | `0 1px 3px rgba(0,0,0,0.3)` |

---

## 11. 文件结构 (File Structure)

```
website/
├── index.html          # 主页面，语义化 HTML5 结构
├── styles.css          # 设计系统 CSS 变量 + 组件样式
├── script.js           # 交互逻辑（轮播、滚动监听、Colab 集成）
└── DESIGN_SYSTEM.md     # 本文件：完整设计规范
```

---

## 12. 设计原则 (Design Principles)

1. **意图明确**: 每个视觉元素都有明确的功能目的
2. **层次清晰**: 通过字号、颜色、间距建立视觉层次
3. **密度适中**: 避免信息过载，保持舒适的阅读节奏
4. **一致性**: 所有组件遵循统一的设计令牌
5. **可访问性**: 对比度 ≥ 4.5:1，键盘导航支持
6. **响应式**: 从 375px 到 4K 屏幕的无缝适配
