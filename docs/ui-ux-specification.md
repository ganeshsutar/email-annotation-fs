# Email PII Annotation Platform UI/UX Design Specification

> **Design System:** shadcn/ui + Tailwind CSS
> **Version:** 1.0.0
> **Last Updated:** February 2026

---

## Table of Contents

1. [Design System Configuration](#1-design-system-configuration)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Specifications](#5-component-specifications)
6. [Theming](#6-theming)
7. [Interaction & Accessibility](#7-interaction--accessibility)
8. [User Flows](#8-user-flows)
9. [Responsive Design](#9-responsive-design)

---

## 1. Design System Configuration

### 1.1 shadcn/ui Style Preset

Email PII Annotation Platform uses the **Vega** style preset as its foundation.

| Style | Density | Description | Key Traits |
|-------|---------|-------------|------------|
| **Vega** | Standard | The classic shadcn/ui look | Balanced spacing, standard border radius, versatile for most applications |
| Nova | Compact | Reduced spacing for compact layouts | 1 step smaller heights, tighter padding |
| Maia | Generous | Soft and rounded with generous spacing | Larger padding (px-3, px-6), more whitespace, softer feel |
| Lyra | Compact | Boxy and sharp | Same as Nova sizing, but with sharp corners (rounded-none) |
| Mira | Dense | Compact for dense interfaces | Smallest heights, minimal padding, optimized for data-heavy UIs |

**Selected for Email PII Annotation Platform: Vega**
- Provides the established shadcn/ui aesthetic
- Balanced approach suitable for both data entry and dashboard views
- Familiar to users of modern web applications

#### 1.1.1 Style Spacing Reference

shadcn/ui styles do not use a single `--spacing` CSS variable. Instead, each style has its own CSS file that rewrites component classes with different Tailwind utility values for padding, height, and gap.

**Button Component Sizing:**

| Style | XS Height | SM Height | Default Height | LG Height | Default Padding |
|-------|-----------|-----------|----------------|-----------|-----------------|
| **Vega** | h-6 (24px) | h-8 (32px) | h-9 (36px) | h-10 (40px) | px-2.5 (10px) |
| Nova | h-6 (24px) | h-7 (28px) | h-8 (32px) | h-9 (36px) | px-2.5 (10px) |
| Maia | h-6 (24px) | h-8 (32px) | h-9 (36px) | h-10 (40px) | px-3 to px-4 (12-16px) |
| Lyra | h-6 (24px) | h-7 (28px) | h-8 (32px) | h-9 (36px) | px-2.5 (10px) |
| Mira | h-6 (24px) | h-6 (24px) | h-7 (28px) | h-8 (32px) | px-2 (8px) |

**Input Component Sizing:**

| Style | Height | Horizontal Padding | Vertical Padding |
|-------|--------|-------------------|------------------|
| **Vega** | h-9 (36px) | px-2.5 (10px) | py-1 (4px) |
| Nova | h-8 (32px) | px-2.5 (10px) | py-1 (4px) |
| Maia | h-9 (36px) | px-3 (12px) | py-1 (4px) |
| Lyra | h-8 (32px) | px-2.5 (10px) | py-1 (4px) |
| Mira | h-7 (28px) | px-2 (8px) | py-0.5 (2px) |

**Card Component Spacing:**

| Style | Horizontal Padding | Gap |
|-------|-------------------|-----|
| **Vega** | px-6 (24px) | gap-6 (24px) |
| Nova | px-4 (16px) | gap-4 (16px) |
| Maia | px-6 (24px) | gap-6 (24px) |
| Lyra | px-4 (16px) | gap-4 (16px) |
| Mira | px-4 (16px) | gap-4 (16px) |

**Sources:**
- [shadcn/ui style-vega.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-vega.css)
- [shadcn/ui style-nova.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-nova.css)
- [shadcn/ui style-maia.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-maia.css)
- [shadcn/ui style-lyra.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-lyra.css)
- [shadcn/ui style-mira.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-mira.css)

### 1.2 Base Color

Email PII Annotation Platform uses **Neutral** as its base color palette.

| Base Color | Description | Visual Tone |
|------------|-------------|-------------|
| Gray | Pure, adaptable grays | Neutral |
| Zinc | Cool grays with subtle blue undertone | Cool, minimalistic |
| **Neutral** | Slightly warmer grays | Balanced, versatile |
| Stone | Warm grays with brown undertone | Earthy, natural |
| Slate | Blue-gray tones | Professional, digital |

**Selected for Email PII Annotation Platform: Neutral**
- Balanced warmth avoids overly cool or warm bias
- Versatile foundation for annotation highlighting and status colors
- High contrast for readability of email content and PII tags

### 1.3 Border Radius

Email PII Annotation Platform uses **0.5rem (8px)** as the base border radius.

| Option | Value | Visual Effect |
|--------|-------|---------------|
| None | 0rem | Sharp, angular corners |
| Subtle | 0.3rem | Slightly softened edges |
| **Default** | 0.5rem | Modern, balanced roundness |
| Medium | 0.75rem | Noticeably rounded |
| Full | 1.0rem | Very rounded, soft appearance |

**Selected for Email PII Annotation Platform: 0.5rem (8px)**

| Derived Token | Calculation | Result |
|---------------|-------------|--------|
| `radius-sm` | `radius - 4px` | 4px |
| `radius` | base | 8px |
| `radius-md` | `radius + 4px` | 12px |
| `radius-lg` | `radius + 8px` | 16px |
| `radius-xl` | `radius + 16px` | 24px |
| `radius-full` | 9999px | Circular/pill |

### 1.4 Additional Configuration

| Setting | Selection | Rationale |
|---------|-----------|-----------|
| **Icon Library** | Lucide | Comprehensive icon set, consistent stroke width |
| **Primary Font** | Geist Sans | Clean geometric sans-serif, excellent readability at all sizes |
| **Monospace Font** | Geist Mono | Matching monospace companion for raw email content display |
| **Component Library** | Radix UI | Accessible primitives, unstyled flexibility |

---

## 2. Color System

### 2.1 Neutral Base Scale

The Neutral palette provides slightly warmer grays than Zinc, creating a balanced and versatile foundation for the annotation interface.

| Shade | HEX | Usage |
|-------|-----|-------|
| 50 | `#fafafa` | Lightest backgrounds, hover states |
| 100 | `#f5f5f5` | Secondary backgrounds, muted areas |
| 200 | `#e5e5e5` | Borders, dividers |
| 300 | `#d4d4d4` | Disabled borders |
| 400 | `#a3a3a3` | Placeholder text |
| 500 | `#737373` | Secondary text |
| 600 | `#525252` | Body text (light mode) |
| 700 | `#404040` | Dark mode secondary |
| 800 | `#262626` | Dark mode backgrounds |
| 900 | `#171717` | Primary text |
| 950 | `#0a0a0a` | Darkest, page background (dark) |

### 2.2 Semantic Colors

The actual implementation uses OKLCH color format for all CSS custom properties. See `frontend/src/index.css` for exact OKLCH values. The HEX values below are approximate equivalents for documentation readability.

| Token | Light Mode | Dark Mode | Purpose |
|-------|------------|-----------|---------|
| `background` | `#ffffff` | `#0a0a0a` | Page background |
| `foreground` | `#0a0a0a` | `#fafafa` | Primary text |
| `card` | `#ffffff` | `#171717` | Card surfaces |
| `card-foreground` | `#0a0a0a` | `#fafafa` | Card text |
| `popover` | `#ffffff` | `#171717` | Dropdown backgrounds |
| `popover-foreground` | `#0a0a0a` | `#fafafa` | Dropdown text |
| `primary` | `#171717` | `#e5e5e5` | Primary actions |
| `primary-foreground` | `#fafafa` | `#171717` | Primary action text |
| `secondary` | `#f5f5f5` | `#262626` | Secondary actions |
| `secondary-foreground` | `#171717` | `#fafafa` | Secondary text |
| `muted` | `#f5f5f5` | `#262626` | Muted backgrounds |
| `muted-foreground` | `#737373` | `#a3a3a3` | Subtle text |
| `accent` | `#f5f5f5` | `#262626` | Highlights, hover |
| `accent-foreground` | `#171717` | `#fafafa` | Accent text |
| `destructive` | `#ef4444` | `#dc2626` | Error, delete |
| `destructive-foreground` | `#fafafa` | `#fafafa` | Error text |
| `border` | `#e5e5e5` | `rgba(255,255,255,0.1)` | Borders |
| `input` | `#e5e5e5` | `rgba(255,255,255,0.15)` | Input borders |
| `ring` | `#737373` | `#737373` | Focus rings |

### 2.3 Status Colors

| Status | Color | HEX | Usage |
|--------|-------|-----|-------|
| Success | Green | `#22c55e` | QA accepted, completed jobs, successful actions |
| Warning | Amber | `#f59e0b` | QA rejected / rework needed, approaching deadlines |
| Error | Red | `#ef4444` | Validation errors, delete confirmations, failed operations |
| Info | Blue | `#3b82f6` | General information, links, in-progress states |

### 2.4 Chart Colors

| Token | HEX | Assigned Data |
|-------|-----|---------------|
| `chart-1` | `#2563eb` | Job status counts |
| `chart-2` | `#16a34a` | Completed metrics |
| `chart-3` | `#f59e0b` | Pending items |
| `chart-4` | `#8b5cf6` | In-progress metrics |
| `chart-5` | `#ec4899` | Rejected items |

### 2.5 Sidebar Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `sidebar` | `#fafafa` | `#171717` |
| `sidebar-foreground` | `#0a0a0a` | `#fafafa` |
| `sidebar-primary` | `#171717` | `#2563eb` |
| `sidebar-primary-foreground` | `#fafafa` | `#fafafa` |
| `sidebar-accent` | `#f5f5f5` | `#262626` |
| `sidebar-accent-foreground` | `#171717` | `#fafafa` |
| `sidebar-border` | `#e5e5e5` | `rgba(255,255,255,0.1)` |

---

## 3. Typography

### 3.1 Font Family

| Type | Font Stack |
|------|------------|
| **Sans-serif** | Geist Sans, ui-sans-serif, system-ui, sans-serif |
| **Monospace** | Geist Mono, ui-monospace, monospace |

### 3.2 Type Scale

| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| **Display** | 48px | Bold (700) | 1.1 | -0.02em |
| **H1** | 36px | Extrabold (800) | 1.2 | -0.025em |
| **H2** | 30px | Semibold (600) | 1.2 | -0.025em |
| **H3** | 24px | Semibold (600) | 1.3 | -0.025em |
| **H4** | 20px | Semibold (600) | 1.4 | -0.025em |
| **Lead** | 20px | Normal (400) | 1.6 | 0 |
| **Body** | 16px | Normal (400) | 1.75 | 0 |
| **Body Large** | 18px | Medium (500) | 1.5 | 0 |
| **Body Small** | 14px | Normal (400) | 1.5 | 0 |
| **Label** | 14px | Medium (500) | 1.0 | 0 |
| **Caption** | 12px | Normal (400) | 1.4 | 0 |
| **Muted** | 14px | Normal (400) | 1.5 | 0 |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Base unit: 4px

| Token | Value | Common Usage |
|-------|-------|--------------|
| `1` | 4px | Icon-text gap |
| `2` | 8px | Compact elements, inline spacing |
| `3` | 12px | Small gaps, input padding |
| `4` | 16px | Standard padding, form gaps |
| `5` | 20px | Medium gaps |
| `6` | 24px | Card padding, section gaps |
| `8` | 32px | Large gaps |
| `10` | 40px | Section margins |
| `12` | 48px | Page sections |
| `16` | 64px | Large sections |
| `20` | 80px | Hero sections |

### 4.2 Shadows

| Level | Value | Usage |
|-------|-------|-------|
| **sm** | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| **base** | `0 1px 3px rgba(0,0,0,0.1)` | Cards, inputs |
| **md** | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| **lg** | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| **xl** | `0 20px 25px rgba(0,0,0,0.1)` | Dialogs |

### 4.3 Application Shell Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Header (h: 56px)                                             │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  Sidebar   │              Main Content                       │
│  (w: 256px)│              (padding: 24px)                    │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ Breadcrumbs                              │   │
│            │  ├─────────────────────────────────────────┤   │
│            │  │                                          │   │
│            │  │           Page Content                   │   │
│            │  │           (max-width: 1440px)            │   │
│            │  │                                          │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

| Element | Dimension |
|---------|-----------|
| Header height | 56px |
| Sidebar width (expanded) | 256px |
| Sidebar width (collapsed) | 64px |
| Content padding | 24px |
| Content max-width | 1440px |

---

## 5. Component Specifications

### 5.1 Button

**Sizes:**

| Size | Height | Horizontal Padding | Font Size | Icon Size |
|------|--------|-------------------|-----------|-----------|
| xs | 28px | 8px | 12px | 14px |
| sm | 32px | 12px | 14px | 16px |
| default | 40px | 16px | 14px | 16px |
| lg | 44px | 32px | 16px | 20px |
| icon | 40x40px | - | - | 16px |

**Variants:**

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Default | `primary` | `primary-foreground` | none |
| Secondary | `secondary` | `secondary-foreground` | none |
| Outline | transparent | `foreground` | `border` |
| Ghost | transparent | `foreground` | none |
| Destructive | `destructive` | `destructive-foreground` | none |
| Link | transparent | `primary` | none (underline) |

**States:**

| State | Visual Change |
|-------|---------------|
| Default | Base styling |
| Hover | 90% opacity background |
| Active | 80% opacity, slight scale down |
| Focused | Focus ring (2px) |
| Disabled | 50% opacity |
| Loading | Spinner icon replaces content |

### 5.2 Input

**Dimensions:**

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 32px | 8px 12px | 14px |
| default | 40px | 8px 12px | 14px |
| lg | 44px | 10px 14px | 16px |

**Specifications:**

| Property | Value |
|----------|-------|
| Border | 1px solid `input` |
| Border Radius | `radius` (8px) |
| Placeholder Color | `muted-foreground` |
| Focus Ring | 2px `ring`, 2px offset |

**States:**

| State | Border | Background | Other |
|-------|--------|------------|-------|
| Default | `input` | `background` | - |
| Hover | `neutral-400` | - | - |
| Focused | transparent | - | Ring visible |
| Disabled | `input` | `muted` | 50% opacity |
| Error | `destructive` | - | Error message below |

### 5.3 Checkbox

| Property | Value |
|----------|-------|
| Size | 16x16px |
| Border | 1px solid `primary` |
| Border Radius | 4px |
| Checked Background | `primary` |
| Check Icon | 12px, `primary-foreground` |

**States:**

| State | Visual |
|-------|--------|
| Unchecked | Border only |
| Checked | Filled + check icon |
| Indeterminate | Filled + minus icon |
| Focused | Focus ring |
| Disabled | 50% opacity |

### 5.4 Select (Dropdown)

**Trigger:**

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 8px 12px |
| Border | 1px solid `input` |
| Border Radius | `radius` |
| Chevron | 16px, right aligned |

**Content:**

| Property | Value |
|----------|-------|
| Background | `popover` |
| Border | 1px solid `border` |
| Border Radius | `radius` |
| Shadow | `shadow-md` |
| Max Height | 300px (scrollable) |

**Item:**

| Property | Value |
|----------|-------|
| Height | 36px |
| Padding | 8px 12px 8px 32px |
| Hover | `accent` background |
| Selected | Check icon + `accent` |

### 5.5 Popover

| Property | Value |
|----------|-------|
| Background | `popover` |
| Border | 1px solid `border` |
| Border Radius | `radius-md` (12px) |
| Shadow | `shadow-md` |
| Padding | 16px |
| Min Width | 200px |
| Max Width | 400px |
| Offset from trigger | 4px |

### 5.6 Dialog (Modal)

**Overlay:**

| Property | Value |
|----------|-------|
| Background | `rgba(0, 0, 0, 0.8)` |
| Backdrop Filter | `blur(4px)` (optional) |

**Content:**

| Property | Value |
|----------|-------|
| Width | 425px (sm), 600px (lg), 800px (xl) |
| Background | `background` |
| Border | 1px solid `border` |
| Border Radius | `radius-lg` (16px) |
| Shadow | `shadow-xl` |

**Sections:**

| Section | Padding |
|---------|---------|
| Header | 24px 24px 0 |
| Content | 24px |
| Footer | 0 24px 24px |

### 5.7 Toast Notification

| Property | Value |
|----------|-------|
| Width | 356px (desktop), 100% (mobile) |
| Padding | 16px |
| Border Radius | `radius-md` |
| Shadow | `shadow-lg` |
| Position | Bottom-right (desktop), bottom-center (mobile) |
| Duration | 5000ms |
| Max Visible | 3 stacked |

**Variants:**

| Variant | Background | Border | Icon |
|---------|------------|--------|------|
| Default | `background` | `border` | None |
| Success | `#f0fdf4` | `#bbf7d0` | CheckCircle (green) |
| Error | `#fef2f2` | `#fecaca` | XCircle (red) |
| Warning | `#fffbeb` | `#fde68a` | AlertTriangle (amber) |
| Info | `#eff6ff` | `#bfdbfe` | Info (blue) |

### 5.8 Skeleton Loader

| Property | Value |
|----------|-------|
| Background | `muted` |
| Animation | Pulse (opacity 1 → 0.5 → 1) |
| Duration | 2s |
| Border Radius | Matches target element |

### 5.9 Data Table

**Container:**

| Property | Value |
|----------|-------|
| Border | 1px solid `border` |
| Border Radius | `radius` |

**Header:**

| Property | Value |
|----------|-------|
| Background | `muted` |
| Height | 48px |
| Font | 12px, Medium, Uppercase |
| Color | `muted-foreground` |
| Padding | 12px 16px |

**Body Row:**

| Property | Value |
|----------|-------|
| Height | 52px |
| Border | 1px bottom `border` |
| Padding | 12px 16px |
| Font | 14px |
| Hover | `muted/50` background |
| Selected | `muted` background |

### 5.10 Card

| Property | Value |
|----------|-------|
| Background | `card` |
| Border | 1px solid `border` |
| Border Radius | `radius` |
| Shadow | `shadow-sm` |

**Sections:**

| Section | Padding |
|---------|---------|
| Header | 24px 24px 0 |
| Content | 24px |
| Footer | 0 24px 24px |

### 5.11 Sidebar

**Dimensions:**

| Property | Expanded | Collapsed |
|----------|----------|-----------|
| Width | 256px | 64px |
| Header Height | 56px | 56px |

**Menu Button:**

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 8px 12px |
| Border Radius | `radius` |
| Icon-Text Gap | 12px |

**States:**

| State | Background | Text |
|-------|------------|------|
| Default | transparent | `sidebar-foreground` |
| Hover | `sidebar-accent` | `sidebar-accent-foreground` |
| Active | `sidebar-primary` | `sidebar-primary-foreground` |

### 5.12 Breadcrumbs

| Property | Value |
|----------|-------|
| Font Size | 14px |
| Gap | 6px |
| Link Color | `muted-foreground` |
| Link Hover | `foreground` |
| Current Item | `foreground`, Medium weight |
| Separator | ChevronRight icon, 16px |

---

## 6. Theming

> **Note:** The actual implementation uses **OKLCH color format** instead of HSL for all CSS custom properties. See `frontend/src/index.css` for exact OKLCH values. The HSL and HEX values in the tables below are approximate equivalents kept for documentation readability.

### 6.1 Light Mode Variables

| Variable | HSL Value | HEX |
|----------|-----------|-----|
| `--background` | 0 0% 100% | #ffffff |
| `--foreground` | 0 0% 4% | #0a0a0a |
| `--card` | 0 0% 100% | #ffffff |
| `--card-foreground` | 0 0% 4% | #0a0a0a |
| `--popover` | 0 0% 100% | #ffffff |
| `--popover-foreground` | 0 0% 4% | #0a0a0a |
| `--primary` | 0 0% 9% | #171717 |
| `--primary-foreground` | 0 0% 98% | #fafafa |
| `--secondary` | 0 0% 96% | #f5f5f5 |
| `--secondary-foreground` | 0 0% 9% | #171717 |
| `--muted` | 0 0% 96% | #f5f5f5 |
| `--muted-foreground` | 0 0% 45% | #737373 |
| `--accent` | 0 0% 96% | #f5f5f5 |
| `--accent-foreground` | 0 0% 9% | #171717 |
| `--destructive` | 0 84.2% 60.2% | #ef4444 |
| `--destructive-foreground` | 0 0% 98% | #fafafa |
| `--border` | 0 0% 90% | #e5e5e5 |
| `--input` | 0 0% 90% | #e5e5e5 |
| `--ring` | 0 0% 45% | #737373 |
| `--radius` | - | 0.5rem |

### 6.2 Dark Mode Variables

| Variable | HSL Value | HEX |
|----------|-----------|-----|
| `--background` | 0 0% 4% | #0a0a0a |
| `--foreground` | 0 0% 98% | #fafafa |
| `--card` | 0 0% 9% | #171717 |
| `--card-foreground` | 0 0% 98% | #fafafa |
| `--popover` | 0 0% 9% | #171717 |
| `--popover-foreground` | 0 0% 98% | #fafafa |
| `--primary` | 0 0% 90% | #e5e5e5 |
| `--primary-foreground` | 0 0% 9% | #171717 |
| `--secondary` | 0 0% 15% | #262626 |
| `--secondary-foreground` | 0 0% 98% | #fafafa |
| `--muted` | 0 0% 15% | #262626 |
| `--muted-foreground` | 0 0% 64% | #a3a3a3 |
| `--accent` | 0 0% 15% | #262626 |
| `--accent-foreground` | 0 0% 98% | #fafafa |
| `--destructive` | 0 72.2% 50.6% | #dc2626 |
| `--destructive-foreground` | 0 0% 98% | #fafafa |
| `--border` | 0 0% 100% / 10% | rgba(255,255,255,0.1) |
| `--input` | 0 0% 100% / 15% | rgba(255,255,255,0.15) |
| `--ring` | 0 0% 45% | #737373 |

---

## 7. Interaction & Accessibility

### 7.1 Focus Ring

| Property | Value |
|----------|-------|
| Width | 2px |
| Color | `ring` |
| Offset | 2px |
| Offset Color | `background` |

**Behavior:**
- Only visible on keyboard navigation (`:focus-visible`)
- Applied to all interactive elements
- Focus trapped within modals/dialogs

### 7.2 Keyboard Navigation

**Global Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + /` | Toggle sidebar |
| `Escape` | Close modal/popover |
| `Tab` | Next focusable element |
| `Shift + Tab` | Previous focusable element |

**Component Navigation:**

| Component | Keys | Action |
|-----------|------|--------|
| Select | `Space/Enter` | Open/select |
| Select | `↑/↓` | Navigate options |
| Dialog | `Tab` | Cycle elements |
| Dialog | `Escape` | Close |
| Table | `↑/↓` | Navigate rows |
| Table | `Space` | Toggle selection |
| Tabs | `←/→` | Switch tabs |

### 7.3 Color Contrast

Minimum contrast ratios (WCAG 2.1 AA):

| Content Type | Required Ratio | Achieved |
|--------------|----------------|----------|
| Normal text | 4.5:1 | 19.4:1 (foreground/background) |
| Large text | 3:1 | 4.6:1 (muted-foreground/background) |
| UI components | 3:1 | Compliant |

### 7.4 Motion

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150ms | ease-out |
| Page transitions | 200ms | ease-in-out |
| Modal open/close | 200ms | ease-out |
| Hover effects | 150ms | ease |

**Reduced Motion:** All animations respect `prefers-reduced-motion` media query.

---

## 8. User Flows

### 8.1 Admin Login & First-Time Password Change

```
┌──────────┐    ┌──────────────────┐    ┌──────────┐    ┌────────────┐
│  Login   │───►│ Force Password   │───►│  Change  │───►│ Role-Based │
│   Form   │    │ Change Check     │    │ Password │    │ Dashboard  │
└──────────┘    └──────────────────┘    └──────────┘    └────────────┘
```

**Step 1: Login Form**
- Components: Card, Input (email, password), Button (submit)
- Validation: Real-time inline validation, Alert for error states (invalid credentials, inactive account)
- Session-based auth with CSRF token

**Step 2: Force Password Change Check**
- If `force_password_change` is `true` on the user record, redirect to change password
- Otherwise, proceed directly to role-based dashboard

**Step 3: Change Password**
- Components: Card, Input (current password, new password, confirm password), Button
- Validation: Password strength requirements, match confirmation
- Alert for success/error states

**Step 4: Role-Based Dashboard**
- Admin: Sidebar layout with dashboard stats, user management, dataset management
- Annotator: Top nav layout with assigned jobs, annotation workspace access
- QA: Top nav layout with review queue, QA workspace access

### 8.2 Annotation Workflow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐
│  Open    │───►│  View    │───►│Highlight │───►│ Select   │───►│Same-Value│───►│  Save    │───►│ Submit │
│   Job    │    │Raw Email │    │  Text    │    │PII Class │    │ Linking  │    │  Draft   │    │        │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘
```

**Step 1: Open Job**
- Select an assigned job from the annotator dashboard
- Job status transitions: PENDING → IN_PROGRESS

**Step 2: View Raw Content**
- Components: ResizablePanel (split view — email metadata + raw content), ScrollArea
- Raw email content displayed with line numbers in a monospace `pre` element
- Email headers (From, To, Subject, Date) parsed and displayed in metadata panel

**Step 3: Highlight Text**
- User selects text in the raw content viewer using mouse selection
- Selection offsets are calculated relative to the normalized (CRLF-stripped) content
- Components: RawContentViewer (`pre` with `span` elements for existing annotation highlights)

**Step 4: Select PII Class**
- Components: ClassSelectionPopup (Popover with searchable list), Badge (annotation tag)
- Popover appears near the selection with available PII annotation classes
- Keyboard navigable with ARIA `listbox`/`option` roles
- Selected class creates an annotation with start/end offsets and class reference

**Step 5: Same-Value Linking**
- Components: Dialog (same-value linking prompt), Checkbox (select matching occurrences)
- When the same text appears elsewhere in the document, prompt to annotate all occurrences
- Optional step — user can skip and annotate individually

**Step 6: Save Draft**
- Components: Button (save), Toast (success notification)
- Draft annotations saved to server without submitting for QA
- Auto-save behavior for work-in-progress

**Step 7: Submit**
- Components: Dialog (submit confirmation), Button (confirm/cancel), Toast (success)
- Submits all annotations for QA review
- Job status transitions: IN_PROGRESS → SUBMITTED

### 8.3 QA Review Workflow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│  Open    │───►│  Review  │───►│ Mark OK/ │───►│  Toggle  │───►│ Modify   │───►│   Accept/    │
│   Job    │    │Annotate  │    │ Flag Each│    │Edit Mode │    │if Needed │    │   Reject     │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────────┘
```

**Step 1: Open Job**
- Select a submitted job from the QA review queue
- Job status transitions: SUBMITTED → IN_QA_REVIEW
- Blind review mode (configurable): annotator identity hidden from QA reviewer

**Step 2: Review Annotations**
- Components: ResizablePanel (split view — email content with highlights + annotation list)
- All annotations displayed as highlighted spans in the raw content viewer
- Annotation list panel shows each annotation with class, text, and offsets

**Step 3: Mark OK / Flag Each**
- Components: Popover (annotation review actions), Badge (QA status per annotation)
- QA reviewer can mark individual annotations as correct or flag issues
- Visual indicators show review progress

**Step 4: Toggle Edit Mode**
- Components: Switch (edit mode toggle)
- When enabled, QA reviewer can directly modify annotations (add, remove, adjust offsets)
- Edit mode changes are tracked as QA modifications

**Step 5: Modify if Needed**
- Same annotation tools as the annotator workspace (text selection, class selection, deletion)
- QA modifications recorded separately from original annotations

**Step 6: Accept / Reject**
- Components: Dialog (accept/reject confirmation), Textarea (rejection comments), Button, Toast
- **Accept**: Job status transitions to QA_ACCEPTED, annotations finalized
- **Reject**: Job status transitions to QA_REJECTED with comments, sent back to annotator for rework

---

## 9. Responsive Design

### 9.1 Breakpoints

> **Note:** The Email PII Annotation Platform is desktop-focused (minimum 1280px recommended per NF-2 requirement). Annotation and QA workflows require precise text selection which is not practical on mobile or small tablet screens. The breakpoints below ensure graceful degradation but the primary target is desktop.

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Small | < 640px | Not recommended for annotation work |
| Tablet | 640-1023px | Collapsible sidebar, limited functionality |
| Desktop | 1024-1279px | Full sidebar, standard workspace |
| Large | >=1280px | Expanded content, max-width container, optimal annotation workspace |

### 9.2 Component Adaptations

| Component | Desktop (>=1280px) | Tablet (640-1023px) | Small (<640px) |
|-----------|---------|--------|--------|
| Sidebar | Expanded (256px) | Collapsed (64px) | Sheet overlay |
| Dialog | Centered modal | Centered modal | Full-screen sheet |
| Data Table | Full columns | Reduced columns | Stacked layout |
| Forms | Multi-column | Single column | Single column |
| Navigation | Sidebar + header | Sidebar + header | Header only |
| ResizablePanel | Side-by-side split | Side-by-side (narrower) | Stacked vertical |

### 9.3 Touch Targets

Minimum size: **44x44px**

| Element | Desktop | Touch Device |
|---------|---------|--------------|
| Button height | 40px | 44px |
| Menu item height | 36px | 48px |
| Table row height | 52px | 60px |
| Checkbox tap area | 16px (visual) | 44px (tap area) |

---

## Appendix: Quick Reference

### Design Configuration Summary

| Setting | Value |
|---------|-------|
| **Style** | Vega |
| **Base Color** | Neutral |
| **Radius** | 0.5rem (8px) |
| **Font** | Geist Sans |
| **Monospace Font** | Geist Mono |
| **Icons** | Lucide |
| **Component Library** | Radix UI |
| **Color Format** | OKLCH (in CSS), HEX (in docs) |

### Key Measurements

| Element | Value |
|---------|-------|
| Header height | 56px |
| Sidebar width | 256px / 64px |
| Button height (default) | 40px |
| Input height (default) | 40px |
| Card padding | 24px |
| Table row height | 52px |
| Focus ring | 2px, 2px offset |
| Border radius | 8px (base) |

---

**Sources:**
- [shadcn/ui Create](https://ui.shadcn.com/create)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Colors](https://ui.shadcn.com/colors)
- [shadcn Style Presets Announcement](https://x.com/shadcn/status/1999530419125981676)

---

*Document Version: 1.0.0*
*Last Updated: February 2026*
