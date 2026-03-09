# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AdPulse Portal is an ad analytics dashboard built with React 19, Vite 7, Tailwind CSS 4, and React Router 7. It provides creative performance analysis across advertising platforms (Meta, TikTok, Google, YouTube) with scoring, grading, and comparative views. All data is currently mock-generated (`src/data/mockData.js`).

## Prerequisites

- **Node.js 20+** required (Vite 7, Vitest 4, React Router 7 all require it)
- Use `nvm` to switch: `nvm use 20` (v20.20.0 is installed)
- Set default to avoid forgetting: `nvm alias default 20`

## Commands

```bash
nvm use 20              # Ensure correct Node version
npm install             # Install dependencies
npm run dev             # Start dev server (Vite)
npm run build           # Production build
npm run lint            # ESLint
npm run typecheck       # TypeScript check (tsc --noEmit)
npm run preview         # Preview production build
npm run test            # Run tests (Vitest)
npm run test:watch      # Run tests in watch mode
```

Tests use Vitest with jsdom, React Testing Library, and `@testing-library/jest-dom`. Config is in `vitest.config.js` (separate from `vite.config.js` to avoid loading Tailwind CSS plugin in test environment). Test setup file: `tests/setup.js`. Test files use `.test.jsx` extension for JSX support.

## Deployment

Cloud Run on GCP project `otb-dev-platform`, region `us-central1`.

```bash
# QA — uses .env.production (Vite production mode)
gcloud run deploy adpulse-web-qa --source=. --region=us-central1 --project=otb-dev-platform --allow-unauthenticated --port=8080

# Prod
gcloud run deploy adpulse-web --source=. --region=us-central1 --project=otb-dev-platform --allow-unauthenticated --port=8080
```

- QA URL: `https://adpulse-web-qa-zqlsaqunba-uc.a.run.app`
- Prod URL: `https://adpulse-web-zqlsaqunba-uc.a.run.app`
- Vite bakes env vars at build time. `npm run build` uses **production** mode → reads `.env.production`
- `.dockerignore` excludes all `.env*` except `.env.production`
- To deploy with mock data: set `VITE_USE_MOCK_DATA=true` in `.env.production`
- To deploy with real API: set `VITE_USE_MOCK_DATA=false` and correct `VITE_API_BASE_URL`

## Architecture

### Routing & State

Routes are defined in `src/config/routes.ts` as a `ROUTE_CONFIG` object that drives breadcrumbs, sub-tabs, and filter bar visibility. `src/App.tsx` maps these to React Router routes.

State flows through **React Router's Outlet Context** — `AppLayout` manages global filters, sidebar state, and active sub-tab, passing them via `<Outlet context={...}>`. Child pages consume with `useOutletContext()`. No external state library is used.

Sub-tab navigation uses URL query params (`?tab=creatives`) within the Acquisition workspace.

### Component Tiers

- **`src/components/layout/`** — App shell: `AppLayout`, `Sidebar`, `TopBar`, `FilterBar`, `SubTabNav`, `Breadcrumb`, `DateRangePicker`
- **`src/components/shared/`** — Reusable UI: `ExpandableDataTable`, `MetricCard`, `ScoreRing`, `Sparkline`, `GradeBadge`, `AdDetailPanel`, `AdThumbnail`, `TagBadge`, `ViewToggle`, `TabFilters`
- **`src/components/acquisition/`** — Tab content: `ChannelsTab`, `CreativesTab`, `CampaignsTab`, `AdSetsTab`, `LandingPagesTab`, `TopPerformersTab`, `ComparativeTab`
- **`src/pages/`** — Route-level components: `Dashboard`, `AcquisitionPage`, `ConversionPage`, `CreativeDetail`, `AICopilot`

### Data & Scoring Model

`src/data/mockData.js` generates all data. The core entity is an **Ad** with nested `metrics`, `scores`, `overallScore`, and `grade`. Scoring dimensions: Hook, Watch, Click, Convert, Reach, Signals — each computed from underlying metrics, then weighted-averaged into an overall score mapped to a grade (A/B/C/D).

`src/utils/formatters.js` provides all display formatting (`formatCurrency`, `formatNumber`, `formatPercent`, `formatRoas`, `scoreToGrade`, `getStatusColor`, etc.). Always use these rather than inline formatting.

### Table Column Pattern

`ExpandableDataTable` accepts column configs with optional `render` functions for custom cell content:

```jsx
{ key: 'health', label: 'Health', render: (_, row) => <ScoreRing ... /> }
```

### Memoization

Page components memoize generated data with `useMemo` to prevent re-renders:

```jsx
const ads = useMemo(() => generateAds(30), []);
const campaigns = useMemo(() => generateHierarchicalData(ads), [ads]);
```

## Design System

Refer to `STYLE_GUIDE.md` for the full design system. Key points:

- **Colors**: Use semantic Tailwind tokens (`primary-*`, `success-*`, `warning-*`, `danger-*`, `surface`, `surface-secondary`, `text-primary`, etc.) defined as CSS custom properties in `src/index.css`
- **Font**: Inter (loaded via Google Fonts)
- **Icons**: Lucide React — 16px in tables/nav, 20px in cards/headers
- **Grades**: A=green (`success-500`), B=blue (`primary-500`), C=amber (`warning-500`), D=red (`danger-500`)
- **Charts**: Recharts with palette `['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']`
- **Accessible components**: Headless UI for interactive primitives (Switch, Dialog)

## Conventions

- **Language**: TypeScript (TSX) for components/config/utils, JavaScript (JSX) for auth/API/hooks (migration in progress)
- **Styling**: Tailwind utility classes only — no CSS modules or styled-components
- **Exports**: Named exports for utilities, default exports for components
- **ESLint**: Flat config (v9+), unused vars allowed if prefixed with uppercase or underscore
- **Auth**: Always uses real OAuth (no mock bypass). `VITE_USE_MOCK_DATA` only controls whether data hooks return mock or real API data. Local dev points to QA backend (`qa.app.outoftheblue.ai`) for auth.
- **API hooks**: `useApiQuery` pattern with mock fallback — always provide null-safe fallback values (e.g. `data || []`)
