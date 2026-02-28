# AdPulse Style Guide

> Design system reference derived from the production AdPulse app (app.outoftheblue.ai).
> Use this as the source of truth for all UI development on the ads portal.

---

## 1. Color System

### Primary (Blue)
| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#eff6ff` | Active nav bg, selected states, light highlights |
| `primary-100` | `#dbeafe` | Avatar bg, subtle fills |
| `primary-200` | `#bfdbfe` | Borders on focused inputs |
| `primary-500` | `#3b82f6` | Links, active indicators, Grade B badge |
| `primary-600` | `#2563eb` | Logo bg, primary buttons |
| `primary-700` | `#1d4ed8` | Active nav text, bold accents |

### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `success-500` | `#22c55e` | Grade A badge, positive change, scaling status |
| `warning-500` | `#f59e0b` | Grade C badge, warning states, amber accents |
| `danger-500` | `#ef4444` | Grade D badge, negative change, declining status |

### Surfaces
| Token | Hex | Usage |
|---|---|---|
| `surface` | `#ffffff` | Cards, sidebar, panels, modals |
| `surface-secondary` | `#f8fafc` | Page background (body bg) |
| `surface-tertiary` | `#f1f5f9` | Input backgrounds, subtle fills, chart gridlines |

### Borders
| Token | Hex | Usage |
|---|---|---|
| `border` | `#e2e8f0` | Card borders, sidebar border, dividers, table lines |
| `border-light` | `#f1f5f9` | Subtle inner dividers |

### Text
| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#0f172a` | Headings, primary content, metric values |
| `text-secondary` | `#475569` | Body text, nav labels, descriptions |
| `text-tertiary` | `#94a3b8` | Timestamps, axis labels, placeholders, column headers |

---

## 2. Typography

**Font Family:** `'Inter', system-ui, -apple-system, sans-serif`

| Role | Classes | Production Example |
|---|---|---|
| Page Title | `text-2xl font-bold text-text-primary` | "Landing Page Performance Analysis" |
| Section Title | `text-lg font-semibold text-text-primary` | "Campaign Performance Analysis" |
| Section Subtitle | `text-sm text-text-secondary` | "8 pages - 26 ads" |
| Table Column Header | `text-xs font-semibold text-text-tertiary uppercase tracking-wider` | "CATEGORY", "SPEND", "REVENUE" |
| Body Text | `text-sm text-text-secondary` | Nav labels, descriptions |
| Metric Value (large) | `text-2xl font-bold text-text-primary` | "$106.16K", "44.48k" |
| Metric Value (table) | `text-sm font-medium text-text-primary` | "$271.63", "7.38x" |
| Small Label | `text-xs text-text-tertiary` | "vs last period", "Total Revenue" |
| Change Indicator (+) | `text-xs font-medium text-success-500` | "+0.63%", "+201.60%" |
| Change Indicator (-) | `text-xs font-medium text-danger-500` | "-4.34%", "-15.96%" |
| Badge Text | `text-[10px] font-medium` | Tag labels |

---

## 3. Grade Badge System

Circular badges used consistently across all tables (Overall, CTR, CVR, ROAS grades).

| Grade | Background | Text | Threshold |
|---|---|---|---|
| **A** | `bg-green-500` | `text-white` | Score >= 80 |
| **B** | `bg-blue-500` | `text-white` | Score 60 - 79 |
| **C** | `bg-amber-500` | `text-white` | Score 40 - 59 |
| **D** | `bg-red-500` | `text-white` | Score < 40 |

**Badge Styling:**
```
w-7 h-7 rounded-full flex items-center justify-center
text-xs font-bold text-white
```

**Grade Legend** (top-right of data sections):
```
"Performance Grades:" followed by A B C D circles inline
```

---

## 4. Layout Structure

### Shell
```
+--[Sidebar 240px]--+--[Main Content]--+
|  Logo + Nav       |  TopBar / Breadcrumb |
|                   |  Filter Bar          |
|                   |  Content Area        |
|  Bottom actions   |                      |
+-------------------+----------------------+
```

### Sidebar (Production)
- **Width:** 240px expanded, 68px collapsed
- **Position:** Fixed left, full height
- **Background:** White with `border-r border-border`
- **Logo:** Rounded square icon (teal/blue) + "AdPulse" text
- **Sections:**
  - Tenant selector at top (name + country badge)
  - Primary nav: Home, Insights, Errors
  - Expandable groups: Metrics (By Category, By Funnel, By Source), Health, Analyze (Acquisition, Conversion)
  - Bottom fixed: Demo Mode toggle, North Star, Support, Settings
  - User avatar with initials (w-8 h-8 rounded-full) + name + email
- **Active item:** `bg-primary-50 text-primary-700 font-medium`
- **Inactive item:** `text-text-secondary hover:bg-gray-50`
- **Collapse toggle:** Chevron button at content edge (not bottom)

### Top Bar / Breadcrumb Bar
- **Breadcrumb:** `icon | Analyze > Acquisition` (text-sm, separator ">")
- **Sub-tabs:** Channels | Campaigns | Ad Sets | Ads | Landing Pages
  - Rounded pill buttons: `px-4 py-2 rounded-lg text-sm font-medium`
  - Selected: `bg-white border border-border shadow-sm`
  - Unselected: `text-text-secondary hover:text-text-primary`
- **Date Picker:** Right-aligned, `border rounded-lg px-3 py-2` with calendar icon
- **Refresh icon:** Right of date picker

### Filter Bar
Horizontal row of dropdown filters below sub-tabs:
```
Attribution Model | Channels | Creative Types | Status
```
- Each: `border rounded-lg px-3 py-2 text-sm bg-white`
- Label above in `text-xs text-text-tertiary`
- Chevron down icon on right

---

## 5. Component Patterns

### Data Table (Primary Pattern)

Production uses this extensively across Channels, Campaigns, Ad Sets, Ads, Landing Pages.

**Structure:**
```
[Section Title + info icon]  [count subtitle]
[Tab Filters: Winners | BAU | Iteration Needed | All]  [Download | View Toggle]
[Table Header Row - uppercase, sortable]
[Expandable data rows]
```

**Header Row:**
- `text-xs font-semibold text-text-tertiary uppercase tracking-wider`
- Sortable columns: up/down chevron icons
- Info icons (circle-i) next to ambiguous column names
- Search icon on name columns

**Data Rows:**
- `text-sm font-medium text-text-primary` for values
- `border-b border-border-light` between rows
- `hover:bg-surface-tertiary` on hover
- Expandable with chevron (tree: parent > child > grandchild)
- Indentation: nested rows offset ~20px per level

**Tab Filters:**
```
Winners (7) | BAU (5) | Iteration Needed (8) | All (8)
```
- `px-4 py-1.5 rounded-full text-sm font-medium border`
- Selected: `border-border bg-white shadow-sm text-text-primary`
- Unselected: `border-transparent text-text-secondary hover:text-text-primary`

### Card (Metric Card)

Used in Metrics > By Category view:

```
+---------------------------------------+
| Title (i)           pin  "Set target" |
| 44.48k  ~ -31.28%   Was 64.72k   [b] |
|  [sparkline chart - current vs prev]  |
+---------------------------------------+
```

- `bg-white rounded-xl border border-border p-5`
- `hover:shadow-md transition-shadow`
- Title: `text-sm font-medium text-text-primary`
- Value: `text-2xl font-bold text-text-primary`
- Change: `text-xs` green/red with tilde icon
- "Was X": `text-xs text-text-tertiary`
- Sparkline: thin line chart, red for declining / green for improving
- "Set target": `text-xs text-primary-500 font-medium` with plus-circle icon
- Pin icon and benchmark badge (colored letter) in top-right

### Ad Card (Grid View)

```
+---------------------------+
| [Image] badge: "Image"    |
|   Platform logo           |
|   "Preview not available" |
|---------------------------|
| Ad name    Channel - Type |
| SPEND | REVENUE | ROAS    |
+---------------------------+
```

- `bg-white rounded-xl border border-border overflow-hidden`
- Creative type badge: top-left, `bg-black/70 text-white text-xs px-2 py-1 rounded-md`
- Type icon: camera for Image, play for Video
- Metrics row: 3-column grid, `text-xs text-text-tertiary` label, `text-sm font-semibold` value
- Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile

### Ad Detail Panel (Slide-out)

- **Position:** Right side, overlays content
- **Width:** ~400px
- **Header:** Ad name + close (X) button
- **Preview:** Full-width image/placeholder at top
- **Sections** with ALL CAPS headers:
  - `text-xs font-bold text-text-tertiary uppercase tracking-wider mt-6 mb-3`
  - BASIC INFORMATION, ENGAGEMENT, COSTS & REVENUE, GRADES
- **Key-value rows:**
  - `flex justify-between py-2 border-b border-border-light`
  - Label: `text-sm text-text-secondary`
  - Value: `text-sm font-medium text-text-primary`

### KPI / Summary Card

```
+---------------------------+
| [icon]   trend   +12.4%   |
| $367.5K                    |
| vs last period             |
+---------------------------+
```

- `bg-white rounded-xl border border-border p-5`
- Icon: 40x40 rounded-lg with colored background
- Value: `text-2xl font-bold`
- Trend: mini sparkline or arrow with percentage
- Subtitle: `text-xs text-text-tertiary`

---

## 6. Charts & Data Visualization

### Chart Colors (Ordered Palette)
```javascript
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
// Blue, Purple, Amber, Green
```

### Extended palette (for multi-series like Channels view):
```javascript
const EXTENDED_COLORS = [
  '#ef4444', // Paid Ads (red)
  '#f97316', // Marketplaces (orange)
  '#64748b', // Direct (slate)
  '#3b82f6', // Email Marketing (blue)
  '#22c55e', // Referrals (green)
  '#8b5cf6', // Unattributed (purple)
  '#6d28d9', // Organic (dark purple)
  '#06b6d4', // Others (cyan)
];
```

### Stacked Area Chart (Channels View)
- Soft area fills with ~30% opacity
- Matching solid stroke lines
- Y-axis: `$0`, `$5.0k`, `$10.0k`, `$15.0k`, `$20.0k`
- X-axis: Date labels `Feb 20`, `Feb 21`, etc.
- Legend: colored dots + label (horizontal, below chart)

### Sparklines (In-table mini charts)
- Height: ~30px, no axes, no labels
- Positive trend: green line (`#22c55e`)
- Negative trend: red line (`#ef4444`)
- Neutral/mixed: gray line (`#94a3b8`)
- Previous period: dashed line, lighter shade

### Revenue Distribution (Sidebar)
- Colored circle dots + label + dollar amount + percentage
- Vertical list, right-aligned percentages
- "TOTAL PERFORMANCE" at bottom in `text-xs uppercase text-text-tertiary`
- Total value: `text-xl font-bold`

### Recharts Shared Config
```javascript
// Tooltip
customTooltip: {
  bg: '#ffffff',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
}
// Axes
axisStyle: {
  fontSize: 11,
  fill: '#94a3b8', // text-tertiary
}
// Grid
gridStyle: {
  stroke: '#f1f5f9', // surface-tertiary
  strokeDasharray: '3 3',
}
```

---

## 7. Status System

### Creative Status
| Status | Dot Color | Badge Classes | Meaning |
|---|---|---|---|
| **Active** | `bg-blue-500` | `bg-blue-100 text-blue-700` | Live, stable performance |
| **Scaling** | `bg-green-500` (pulse) | `bg-green-100 text-green-700` | Growing, increasing spend |
| **Declining** | `bg-red-500` | `bg-red-100 text-red-700` | Losing performance |
| **Paused** | `bg-gray-400` | `bg-gray-100 text-gray-600` | Manually stopped |
| **Testing** | `bg-purple-500` | `bg-purple-100 text-purple-700` | Experimental phase |

### Performance Buckets (Tab Filters)
| Bucket | Criteria | Color Hint |
|---|---|---|
| **Winners** | Grade A overall, strong ROAS | Green accent |
| **BAU** | Grade B, stable performance | Blue accent |
| **Iteration Needed** | Grade C/D, needs optimization | Amber/Red accent |
| **All** | No filter | Neutral |

---

## 8. Interaction Patterns

### Hover States
- Cards: `hover:shadow-md transition-shadow duration-200`
- Table rows: `hover:bg-surface-tertiary`
- Nav items: `hover:bg-gray-50 hover:text-text-primary`
- Buttons: `hover:bg-primary-700` (primary), `hover:bg-surface-tertiary` (ghost)

### Focus States
- Inputs: `focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300`
- Buttons: `focus:ring-2 focus:ring-primary-500/30 focus:outline-none`

### Transitions
- Color changes: `transition-colors duration-200`
- Shadow/elevation: `transition-shadow duration-200`
- Layout/size: `transition-all duration-300`
- Sidebar collapse: `duration-300`

### Expandable Rows
- Chevron rotates 90deg on expand
- Children animate in (height transition or opacity)
- Indentation increases per nesting level

---

## 9. View Toggles

Production supports multiple view modes across pages:

### Table View (default for most pages)
- Full data table with sortable columns
- Expandable tree rows
- Used in: Campaigns, Ad Sets, Landing Pages, Channels

### Card/Grid View (Ads page)
- 3-column card grid
- Each card shows preview + key metrics
- Toggle icon: grid icon (active) vs list icon

### Chart + Table View (Channels page)
- Stacked area chart at top
- Revenue distribution sidebar on right
- Data table below with sparklines
- Toggle between bar chart and line chart

---

## 10. Spacing & Sizing

### Standard Spacing Scale
| Use | Value | Tailwind |
|---|---|---|
| Inner card padding | 20px | `p-5` |
| Section gap | 24px | `gap-6` |
| Card grid gap | 16px | `gap-4` |
| Nav item padding | 10px 12px | `px-3 py-2.5` |
| Table cell padding | 12px 16px | `px-4 py-3` |
| Input padding | 8px 12px | `px-3 py-2` |

### Border Radius
| Element | Value | Tailwind |
|---|---|---|
| Cards | 12px | `rounded-xl` |
| Buttons | 8px | `rounded-lg` |
| Badges/pills | 9999px | `rounded-full` |
| Inputs/dropdowns | 8px | `rounded-lg` |
| Logo icon | 8px | `rounded-lg` |
| Thumbnails (sm) | 8px | `rounded-lg` |
| Thumbnails (md/lg) | 12px | `rounded-xl` |

### Sidebar
| State | Width |
|---|---|
| Expanded | 240px |
| Collapsed | 68px |

### Top Bar
| Property | Value |
|---|---|
| Height | 64px (`h-16`) |

---

## 11. Icons

**Library:** Lucide React

**Sizing Convention:**
| Context | Size | Tailwind |
|---|---|---|
| Inline with text | 16px | `w-4 h-4` |
| Navigation | 20px | `w-5 h-5` |
| Card icon container | 40px bg, 20px icon | `w-10 h-10` / `w-5 h-5` |
| Header actions | 20px | `w-5 h-5` |

**Icon Color Containers (KPI cards):**
```
Blue:   bg-blue-100 text-blue-600
Green:  bg-green-100 text-green-600
Purple: bg-purple-100 text-purple-600
Amber:  bg-amber-100 text-amber-600
Teal:   bg-teal-100 text-teal-600
```

---

## 12. Number Formatting

| Type | Format | Example |
|---|---|---|
| Currency (< $1K) | `$X.XX` | $271.63 |
| Currency ($1K-$999K) | `$X.XXK` | $5.55K |
| Currency ($1M+) | `$X.XM` | $1.2M |
| ROAS | `X.XXx` | 7.38x |
| Percentage | `X.XX%` | 2.10% |
| Change (positive) | `+X.XX%` in green | +0.63% |
| Change (negative) | `-X.XX%` in red | -4.34% |
| Count | locale-formatted | 44.48k |
| "Was" comparison | `Was X` in tertiary text | Was 64.72k |

---

## 13. Responsive Breakpoints

| Breakpoint | Usage |
|---|---|
| `sm` (640px) | Stack filters vertically |
| `md` (768px) | 2-column card grid |
| `lg` (1024px) | 3-column card grid, sidebar always visible |
| `xl` (1280px) | Full layout, all panels visible |

---

## 14. Production Component Inventory

Components observed in the production app (reference for feature parity):

| Component | Pages Used | Status in Local |
|---|---|---|
| Expandable Data Table | Campaigns, Ad Sets, Landing Pages | Partial |
| Grade Badges (A/B/C/D) | All acquisition tables | Implemented |
| Tab Filters (Winners/BAU/etc) | All acquisition views | Not yet |
| Stacked Area Chart | Channels overview | Not yet |
| Revenue Distribution sidebar | Channels overview | Not yet |
| Sparkline (in-table) | Channels data table | Not yet |
| Metric Card with sparkline | Metrics > By Category | Not yet |
| Ad Card (grid view) | Ads view | Partial (different layout) |
| Ad Detail Panel (slide-out) | Ads view (click ad) | Not yet |
| Breadcrumb nav | All pages | Not yet |
| Sub-tab navigation | Acquisition (Channels/Campaigns/...) | Not yet |
| Filter bar (dropdowns) | All acquisition views | Partial |
| Date range picker | Global header | Not yet |
| View toggle (list/grid) | Ads view | Not yet |
| Download/export button | All data sections | Not yet |
| Demo Mode toggle | Sidebar bottom | Not yet |
| Tenant selector | Sidebar top | Not yet |
| "Set target" action | Metric cards | Not yet |
| Benchmark badges | Metric cards | Not yet |

---

## 15. Key Differences: Production vs Local App

| Aspect | Production | Local (Current) |
|---|---|---|
| Grade display | Circular colored badges (A/B/C/D) | Score rings with numbers |
| Table headers | ALL CAPS, small, gray, with sort/info icons | Mixed casing |
| Data tables | Expandable tree structure | Flat lists |
| Tab filters | Winners/BAU/Iteration Needed/All | Not present |
| Sidebar nav | Grouped with expandable sections | Flat list |
| Charts in tables | Inline sparklines | Not present |
| Change indicators | Percentage + sparkline | Percentage only |
| Detail view | Slide-out panel | Full page route |
| View modes | List / Grid / Expanded grid toggle | Single view |

---

*Last updated: Feb 27, 2026*
*Source: Production screenshots from app.outoftheblue.ai (thebeardstruggle tenant)*
