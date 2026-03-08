# AdPulse Portal — Production Foundation Plan (v3)

## Step 0: Save as `docs/plans/2026-03-06-adpulse-production-foundation-design.md`

---

## DEV-6614 Integration Plan Comparison

### Fundamental Divergence

| Aspect | Our Plan (sorted-giggling-blum) | DEV-6614 (external developer) |
|---|---|---|
| **Where UI lives** | adpulse-portal as **standalone app** on its own domain | adpulse-portal UI integrated **INTO insights-dashboard** Analyze section |
| **Deployment** | Separate Cloud Run service (`adpulse.outoftheblue.ai`) | Ships within existing insights-dashboard deploy |
| **Repo scope** | adpulse-portal = the product | adpulse-portal = prototype/reference only |

**This is a critical conflict.** DEV-6614 treats adpulse-portal as a design prototype to extract UI patterns from, then builds those patterns directly into `insights-dashboard`. Our plan treats adpulse-portal as the production app itself.

### Scoring Model Differences

| Aspect | Our Plan | DEV-6614 |
|---|---|---|
| **Dimensions** | All 6 from day 1 (Hook, Watch, Click, Convert, Reach, Signals) | Phased: 4 first (Hook, Watch, Click, Convert) → 6 after BQ audit confirms Reach + Signals fields |
| **Scoring method** | Benchmark-based (metric/benchmark × weight, from mockData.js prototype) | Z-score normalization (same as existing backend z-score approach) |
| **Config storage** | YAML files in repo (`health_scoring.yml`) | Postgres preference table (`SCORING_CONFIG` key per tenant) |
| **Config access** | Git-managed, PR-reviewed | Tenant-level DB config, seeded defaults, future user-facing API |
| **Grade defaults** | A≥80, B≥60, C≥40, D<40 (from prototype) | Same defaults but stored in preference table, config-driven |

### Feature Coverage Comparison

| Feature | Our Plan | DEV-6614 | Gap |
|---|---|---|---|
| Channels tab enhancements | Via API integration | Full spec with KPI bar, column picker, sparklines | DEV-6614 more detailed |
| Campaigns/AdSets/Pages | Via API integration | Individual tickets with attribution cues | DEV-6614 more detailed |
| Creatives tab | Via API integration | URL rename `/ads`→`/creatives`, grid view, type/state filters | DEV-6614 more detailed |
| Creative Detail | Via API integration | Drawer + full page, phased score display | DEV-6614 more detailed |
| **Creative labeling system** | Not covered | Full Postgres table, 2-tier model, premium gating, 5 API endpoints | **Major gap in our plan** |
| **Badge system** | Not covered | LEARNING, BUDGET_LIMITED, LOW_SPEND, STATISTICALLY_CONFIDENT | **Major gap in our plan** |
| **Confidence scoring** | Not covered | ConfidenceBar (0.0→1.0), config-driven thresholds | **Major gap in our plan** |
| **Sparklines endpoint** | Assumes existing | New registry query `q_sparklines.yml`, dedicated endpoint | DEV-6614 creates new |
| **Attribution visual cues** | Not covered | Banner, column styling, header update when attributed mode active | **Gap in our plan** |
| **Creative Intel section** | Not covered | Library, Performance Review, leaderboard, placeholders (Comparative, AI Copilot) | **Major gap in our plan** |
| **Performance Review query** | Not covered | New registry query `q_creative_performance_review.yml` | **Major gap in our plan** |
| **A/B test infrastructure** | Not covered | Normalized vs raw rank experiment, preference-based assignment | **Gap in our plan** |
| **AI Creative Intelligence** | Not covered | 1-sentence auto-insight per top creative | **Gap in our plan** |
| **Declining alert** | Not covered | Proactive alert when N+ creatives transition to Declining | **Gap in our plan** |
| TypeScript conversion | 5-wave plan | Not covered | Gap in DEV-6614 |
| Standalone CI/CD | Full Docker + GitHub Actions + Cloud Run | Not needed (ships within insights-dashboard) | Different approach |
| Beads + sub-agents | 3 parallel agents | Not covered (uses Jira tickets) | Different approach |

### Backend Extension Overlap

Both plans extend `saas-backend` with similar backend work:

| Backend Change | Our Plan | DEV-6614 |
|---|---|---|
| Health scoring query | `q_ad_health_scores.yml` | New BQ computation in `q_ad_performance.yml` or new query |
| Sparklines query | Not specified | `q_sparklines.yml` |
| Performance review query | Not specified | `q_creative_performance_review.yml` |
| Creative labels table | Not specified | `creative_label_assignments` (new Postgres table) |
| Labels API | Not specified | 5 new endpoints under `/v1/creatives/labels` |
| Scoring config | YAML file | Preference table `SCORING_CONFIG` key |
| BQ schema audit | Not specified | DEV-6622 — formal audit of fields for all 6 dimensions |

### Enablement Strategy Difference

| Aspect | Our Plan | DEV-6614 |
|---|---|---|
| Feature gating | None specified | No Unleash flags; entitlement-based (preference table) |
| Premium features | Not covered | `creativeTagManagement` entitlement |
| Progressive exposure | ConfigSource protocol (YAML → Metric Hub) | Rule 4: all config surfaces as APIs with defaults from day 1 |
| Error handling | Loading skeletons + error boundaries | 5-type error taxonomy with user-friendly messages |

### DEV-6614 Execution Tickets (for reference)

```
DEV-6615: Shared component library + Channels tab (no blockers)
DEV-6616: Campaigns tab (blocked by 6615)
DEV-6617: Ad Sets + Landing Pages (blocked by 6615)
DEV-6618: Creatives tab (blocked by 6615)
DEV-6619: Creative Detail drawer + page (blocked by 6618)
DEV-6620: Creative Intel Library + Performance Review (blocked by 6619)
DEV-6621: Creative Intel placeholders (blocked by 6620)
DEV-6622: BigQuery schema audit (no blockers)
DEV-6623: 6D Health Score backend + Sparklines (blocked by 6622)
DEV-6624: Creative label assignments DDL + API (no blockers)
DEV-6625: Performance Review BQ query (blocked by 6623)
DEV-6626: A/B test infrastructure (blocked by 6623)
DEV-6627: Creative Intelligence AI summary (blocked by 6625)
```

### Open Questions for Resolution

1. **Is adpulse-portal a standalone app or a prototype?** DEV-6614 treats it as a prototype to extract UI into insights-dashboard. Our plan treats it as the production app. Which is correct?

2. **Scoring method: benchmark-based or z-score?** DEV-6614 explicitly says "Z-score normalization: same approach as current Analyze tab z-score (not prototype z-score approach)." Our plan ports the prototype's benchmark-based formula. Which should be used?

3. **Config storage: YAML files or preference table?** DEV-6614 stores scoring config in Postgres preference table (tenant-level, future user-facing API). Our plan uses YAML files. Which approach?

4. **Should the plans be merged?** DEV-6614 has significantly more detail on features (labels, badges, confidence, A/B testing, Creative Intel). Our plan has CI/CD, TypeScript, and standalone deployment that DEV-6614 doesn't cover.

---

## Context

AdPulse Portal is a **frontend-only** React SPA. The backend already exists at `~/Work/dev/saas-backend` (Express.js, BigQuery) and serves acquisition APIs at `https://app.outoftheblue.ai/v1/analysis/acquisition/*`. These APIs already provide scored/graded ad data with z-score composite grading.

The frontend currently uses mock data generators (`src/data/mockData.js`) and has a 6-dimensional health model (Hook, Watch, Click, Convert, Reach, Signals) that **does not exist in the backend**. The plan is to extend the backend with this 6D model as a new API, connect the frontend to all backend APIs, and set up proper CI/CD.

**Three repos in scope:**
- `adpulse-portal` (this repo) — new frontend
- `saas-backend` — backend extension (new 6D scoring API)
- `insights-dashboard` — existing production frontend (reference for established patterns)

---

## Comparison: insights-dashboard vs adpulse-portal

### What They Share
Both apps connect to the **same saas-backend** and render the same acquisition analytics (ads, campaigns, ad sets, pages, channels). Both use performance grading (A/B/C/D), multi-tenant support, date range filtering, and performance segmentation (Winners/BAU/Iteration Needed).

### Stack Differences

| Aspect | insights-dashboard | adpulse-portal |
|---|---|---|
| React version | 18.3 | 19.2 |
| Build tool | CRA (react-scripts) | Vite 7 |
| Language | JavaScript | JavaScript → TypeScript |
| Styling | Styled Components + MUI | Tailwind CSS + Headless UI |
| Charts | Highcharts | Recharts |
| State mgmt | Redux + Thunks | React Router Outlet Context |
| HTTP client | Axios (with interceptors) | None (mock data only) |
| Auth | Session/cookie | None |
| Testing | Jest + RTL | None |
| CI/CD | GitHub Actions, multi-env Docker + nginx | None |
| Feature flags | Unleash proxy | None |
| Error tracking | Sentry | None |
| Scoring | Backend z-score grading only | 6D health model (client-side, mock) |

### What's NEW in adpulse-portal (not in insights-dashboard)
1. **6D Health Model** — Hook, Watch, Click, Convert, Reach, Signals scoring (requires backend extension)
2. **Creative Classifications** — taxonomy of hook types, visual types with detection rules (`creativeClassifications.js`)
3. **Creative Health Funnel** — 6-pillar funnel visualization in CreativeDetail
4. **Creative Analysis** — fixes, element scoring, audience signals (AI-style recommendations)
5. **Score Ring visualizations** — per-dimension circular score indicators
6. **Comparative analysis** — radar charts, scatter plots comparing formats/hooks/platforms

### Patterns to REUSE from insights-dashboard

| Pattern | insights-dashboard file | Adapt for adpulse-portal |
|---|---|---|
| **Axios tenant interceptor** | `setupAxiosTenantInterceptor` | Create `src/api/client.ts` with same auto-inject pattern |
| **Ad categorization** | `categorizeAd()` utility | Reuse logic: Winners (A/ROAS≥3), BAU (B/ROAS≥1.5), Iteration Needed |
| **Grade constants** | `gradeConstants.js` | Match grade colors/descriptions |
| **Column registry** | `analytics/component-library/columns/registry/` | Reference pattern for dynamic table columns |
| **Filter service** | `filtersService` | Adapt filter resolution for Tailwind-based UI |
| **Error boundaries** | Error boundary components | Create similar for adpulse-portal |
| **CI/CD workflows** | `gcp-*-deploy.yaml` | Adapt Docker + nginx deployment pattern |
| **Multi-env configs** | `.env.qa`, `.env.stage`, `.env.prod` | Create similar env files |
| **Feature flag checking** | `isEnabledWithinContext()` | Integrate Unleash for feature gating |
| **useSelectedTenant** | Tenant resolution hook | Create tenant context for multi-tenant |

### Patterns to BUILD FRESH (different stack)
- Tailwind CSS component styling (replaces Styled Components + MUI)
- Recharts chart configurations (replaces Highcharts)
- React Router Outlet Context state flow (replaces Redux)
- Vitest tests (replaces Jest + CRA)
- Vite build pipeline (replaces CRA)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    saas-backend (Express.js)                      │
│                                                                   │
│  Existing APIs:                  New API (to build):              │
│  /v1/analysis/acquisition/       /v1/analysis/acquisition/        │
│    channels    → PeriodComparison    health-scores → 6D scores   │
│    ads         → PerformanceAnalysis                              │
│    ad-sets     → PerformanceAnalysis                              │
│    campaigns   → PerformanceAnalysis                              │
│    pages       → PerformanceAnalysis                              │
│                                                                   │
│  Auth: JWT (Bearer token)        Data: BigQuery                   │
│  Config: YAML registry           Scoring: z-score + NEW 6D model  │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    │ HTTPS + JWT
                                    │
┌───────────────────────────────────▼───────────────────────────────┐
│                    adpulse-portal (React/TS)                      │
│                                                                   │
│  src/api/client.ts          → API client with auth                │
│  src/hooks/useAcquisition*  → Data fetching hooks                 │
│  src/components/            → UI (unchanged)                      │
│  src/data/mockData.js       → Dev-only fallback                   │
│                                                                   │
│  Deploy: Cloud Run (nginx)   URL: adpulse.outoftheblue.ai        │
└──────────────────────────────────────────────────────────────────┘
```

---

## What the Backend Already Provides

### Existing Endpoints (saas-backend)

| Endpoint | Response Shape | Frontend Tab |
|---|---|---|
| `GET /v1/analysis/acquisition/channels` | PeriodComparison: `{overall, facets, timeSeries, meta}` | ChannelsTab |
| `GET /v1/analysis/acquisition/ads` | PerformanceAnalysis: `{ads[], summary, performance_distribution, grade_distribution, actions}` | CreativesTab |
| `GET /v1/analysis/acquisition/campaigns` | PerformanceAnalysis: hierarchical | CampaignsTab |
| `GET /v1/analysis/acquisition/ad-sets` | PerformanceAnalysis: hierarchical | AdSetsTab |
| `GET /v1/analysis/acquisition/pages` | PerformanceAnalysis: hierarchical | LandingPagesTab |

### Query Parameters (all endpoints)

```
Required: tenant_id, start_date, end_date
Optional: format, granularity, timezone, currency, ad_providers, model, campaign_id, ad_set_id
```

### Auth: `Authorization: Bearer <jwt_token>`

### Backend Already Computes:
- `grade` (A-D), `ctr_grade`, `roas_grade`, `spend_grade`, `audience_grade`
- `performance_segment` (winners, high_potential, iteration_needed)
- `recommended_action` (scale_up, increase_budget, optimize_creative, etc.)
- `creative_status` (multi_variant_winner, testing, single_winner, needs_testing)

---

## What Needs to Be Built

### 1. Backend Extension: 6D Health Scoring API (saas-backend)

**New endpoint:** `GET /v1/analysis/acquisition/health-scores`

Returns the 6-dimensional health scores for ads, computed from the same raw metrics the backend already has in BigQuery.

**Response shape:**
```json
{
  "ads": [
    {
      "ad_id": "...",
      "scores": {
        "hookScore": 72,
        "watchScore": 65,
        "clickScore": 85,
        "convertScore": 75,
        "reachScore": 62,
        "signalsScore": 71
      },
      "overallScore": 73,
      "healthGrade": "B"
    }
  ]
}
```

**Implementation in saas-backend:**

- New registry query: `q_ad_health_scores.yml` in `src/registry/registries/acquisition/queries/`
- New route mapping in `routes.registry.yml`: `health-scores → q_ad_health_scores`
- Scoring config: `src/registry/registries/acquisition/config/health_scoring.yml`

**Scoring config (externalized in YAML, editable by collaborators):**
```yaml
# health_scoring.yml
dimensions:
  hook:
    weight: 0.15
    components:
      - metric: thumbstop_rate
        benchmark: 40
        weight: 50
      - metric: first_frame_retention
        benchmark: 80
        weight: 50
  watch:
    weight: 0.15
    components:
      - metric: avg_watch_time
        benchmark: 15
        weight: 40
      - metric: video_retention_15s
        benchmark: 60
        weight: 30
        nullable: true
      - metric: thruplay_rate
        benchmark: 50
        weight: 30
        nullable: true
  click:
    weight: 0.20
    components:
      - metric: ctr
        benchmark: 3
        weight: 60
      - metric: link_click_rate
        benchmark: 2.5
        weight: 40
  convert:
    weight: 0.25
    components:
      - metric: conversion_rate
        benchmark: 5
        weight: 40
      - metric: roas
        benchmark: 4
        weight: 40
      - metric: cpa
        benchmark: 50
        weight: 20
        inverse: true
  reach:
    weight: 0.10
    components:
      - metric: impressions
        benchmark: 500000
        weight: 30
        cap: 500000
      - metric: cpm
        benchmark: 30
        weight: 35
        inverse: true
      - metric: estimated_reach
        benchmark: 300000
        weight: 35
        cap: 300000
        nullable: true
  signals:
    weight: 0.15
    components:
      - metric: engagement_rate
        benchmark: 6
        weight: 30
      - metric: share_rate
        benchmark: 2
        weight: 25
      - metric: save_rate
        benchmark: 3
        weight: 25
      - metric: fatigue_index
        benchmark: 100
        weight: 20
        inverse: true

grades:
  - { grade: A, min_score: 80 }
  - { grade: B, min_score: 60 }
  - { grade: C, min_score: 40 }
  - { grade: D, min_score: 0 }
```

**Where scoring computation happens:** Either as a BigQuery SQL computation (preferred — keep it in the query layer like other registry queries) or as a post-processing step in the response composer. The registry system already supports complex SQL with variables, so the scoring formula can be expressed in SQL using the YAML-configured benchmarks/weights.

**Tests (saas-backend):**
- Unit tests for score computation logic
- Integration test: request health-scores endpoint, verify response shape
- Config validation: weights sum to 1.0, all dimensions present, thresholds ordered

### 2. Frontend: API Integration Layer (adpulse-portal)

**New files to create:**

```
src/
├── api/
│   ├── client.ts            # Fetch wrapper with JWT auth, error handling, base URL
│   ├── endpoints.ts         # API endpoint definitions
│   └── types.ts             # API response types (matches backend shapes)
├── hooks/
│   ├── useChannels.ts       # Fetch channel data
│   ├── useAds.ts            # Fetch ads + health scores (joined)
│   ├── useCampaigns.ts      # Fetch campaign hierarchy
│   ├── useAdSets.ts         # Fetch ad set hierarchy
│   ├── useLandingPages.ts   # Fetch landing page data
│   └── useAdDetail.ts       # Fetch single ad detail + analysis
├── utils/
│   └── mappers.ts           # Map backend response shapes → frontend component shapes
```

**API client (`src/api/client.ts`):**

Follow the insights-dashboard's Axios interceptor pattern — auto-inject `tenant_id`, date range, and auth headers on every request:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // https://app.outoftheblue.ai
  withCredentials: true,                       // Session cookies (same as insights-dashboard)
});

// Tenant interceptor (adapted from insights-dashboard's setupAxiosTenantInterceptor)
api.interceptors.request.use((config) => {
  const tenantId = getTenantId();
  config.params = { ...config.params, tenant_id: tenantId };
  return config;
});

// Error interceptor: 401 → redirect to login, 402 → billing
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) redirectToLogin();
    throw err;
  }
);
```

**Data mapping (`src/utils/mappers.ts`):**

Backend returns different shapes than frontend components expect. Follow insights-dashboard's `categorizeAd()` pattern for performance segmentation, and add 6D score merging:

| Backend Field | Frontend Field |
|---|---|
| `AD_NAME` | `name` |
| `ad_provider` | `platform` |
| `ad_type` | `format` |
| `Spend` | `metrics.spend` |
| `ROAS` | `metrics.roas` |
| `grade` | `grade` |
| `performance_segment: "winners"` | bucket: "Winners" |
| (from health-scores API) `scores.hookScore` | `scores.hookScore` |

**Categorization logic** (reuse from insights-dashboard):
- Winners: `performance_segment === 'winners'` OR (`grade === 'A'` OR `ROAS >= 3.0`)
- BAU: `performance_segment === 'high_potential'` OR (`grade === 'B'` OR `ROAS >= 1.5`)
- Iteration Needed: everything else

**Key pattern:** Each data-fetching hook calls both the existing endpoint (for metrics/grades) and the health-scores endpoint (for 6D scores), then merges the results before passing to components.

### 3. Frontend: Replace Mock Data

**Files to modify (replace `generateXxx()` calls with API hooks):**

| File | Current Mock Call | Replace With |
|---|---|---|
| `src/pages/AcquisitionPage.jsx` | `generateAds(30)`, `generateHierarchicalData()`, `generateLandingPageData()` | `useAds()`, `useCampaigns()`, `useLandingPages()` |
| `src/pages/Dashboard.jsx` | `generateMetricCardData()`, `generateTrendData()` | `useChannels()` summary |
| `src/pages/CreativeDetail.jsx` | `generateCreativeAnalysis()`, `generateAdPerformanceHistory()` | `useAdDetail(id)` |
| `src/components/acquisition/ChannelsTab.jsx` | `generateChannelChartData()` | `useChannels()` (timeSeries + facets) |

**Loading/error states:** Each page gets loading skeletons and error boundaries. Components already render fine with data — just need to handle the async gap.

### 4. Frontend: TypeScript Conversion

5 waves ordered by dependency depth (unchanged from v2):

| Wave | Files | Description |
|---|---|---|
| 1 | Types + formatters + API layer | `src/types/`, `formatters.ts`, `src/api/`, `src/hooks/` (these are new, write in TS from start) |
| 2 | Config + data | `routes.ts`, `creativeClassifications.ts` |
| 3 | Shared components | `components/shared/*.tsx` |
| 4 | Layout components | `components/layout/*.tsx` |
| 5 | Pages + acquisition tabs | `pages/*.tsx`, `components/acquisition/*.tsx` |

### 5. Frontend: CI/CD

**Deployment:** Cloud Run (nginx serving built SPA)

```dockerfile
# Dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
```

**GitHub Actions (`.github/workflows/frontend.yml`):**
```yaml
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx eslint .
      - run: npx tsc --noEmit
      - run: npm run build

  deploy:
    needs: lint-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions: { contents: read, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud run deploy adpulse-web --source=. --region=us-central1 --project=otb-dev-platform --allow-unauthenticated
```

**Custom domain:** `adpulse.outoftheblue.ai` → Cloud Run via `gcloud run domain-mappings create`

### 6. Frontend: Testing

**Framework:** Vitest + React Testing Library

**Test categories:**

| Category | What to test | Files |
|---|---|---|
| API client | Auth headers, error handling, retry logic | `tests/api/client.test.ts` |
| Mappers | Backend → frontend shape transformation | `tests/utils/mappers.test.ts` |
| Hooks | Data fetching, loading/error states (mocked API) | `tests/hooks/*.test.ts` |
| Scoring parity | Frontend `computeScores` matches backend health-scores output | `tests/scoring-parity.test.ts` |

**Scoring parity test:** Run the same metrics through `computeScores` (JS) and the backend health-scores API, verify identical outputs. This ensures the 6D model is consistent.

### 7. Environment Config (following insights-dashboard's multi-env pattern)

```bash
# .env.example
VITE_API_BASE_URL=https://app.outoftheblue.ai
VITE_SENTRY_DSN=
VITE_UNLEASH_URL=
VITE_UNLEASH_CLIENT_KEY=
```

```bash
# .env.development (local dev)
VITE_API_BASE_URL=http://localhost:3000

# .env.staging
VITE_API_BASE_URL=https://staging.outoftheblue.ai

# .env.production
VITE_API_BASE_URL=https://app.outoftheblue.ai
```

**New dependencies to add:**
- `axios` — HTTP client (same as insights-dashboard)
- `@sentry/react` — Error tracking (same as insights-dashboard)
- `@unleash/proxy-client-react` — Feature flags (same as insights-dashboard)
- `vitest` + `@testing-library/react` — Testing

**No scoring config in the frontend** — scoring lives entirely in the backend's `health_scoring.yml`. The frontend just displays what the API returns.

---

## Branch Strategy & Contributor Workflow

### Trunk-Based Development

- `main` is always deployable — CI must pass before merge
- Feature branches: short-lived (1-3 days), squash merge
- All changes through PRs with at least 1 review
- Branch protection enabled on main

### How to Contribute

1. Create branch: `git checkout -b feat/your-feature`
2. Make changes following CLAUDE.md and STYLE_GUIDE.md
3. Run `npm run lint && npx tsc --noEmit && npm run build`
4. Push and open PR — CI validates automatically
5. Get review → squash merge

---

## Beads Setup & Agent Team Execution Plan

### Step 1: Initialize Beads

```bash
# In adpulse-portal
bd init --prefix=AP

# In saas-backend
bd init --prefix=SB
```

### Step 2: Create Epics & Tasks

Three epics across two repos, executed by sub-agents in parallel worktrees:

| Epic | Repo | Worktree Branch | Agent | Dependencies |
|---|---|---|---|---|
| A: Backend 6D Scoring | saas-backend | `epic/health-scores` | Agent 1 | None — starts immediately |
| B: Frontend API Integration | adpulse-portal | `epic/api-integration` | Agent 2 | B5-B7 depend on A (API must exist) |
| C: Frontend TS + CI/CD | adpulse-portal | `epic/ts-cicd` | Agent 3 | Independent — runs in parallel with B |

### Step 3: Beads Task Breakdown with Dependencies

**Epic A: Backend 6D Scoring (saas-backend) — Agent 1**

```
SB-1: Create health_scoring.yml config in registry
  ↓
SB-2: Create q_ad_health_scores.yml query (SQL scoring)  [blocked by SB-1]
  ↓
SB-3: Add health-scores route mapping in routes.registry.yml  [blocked by SB-2]
  ↓
SB-4: Write unit tests for score computation  [blocked by SB-2]
SB-5: Write integration test for endpoint  [blocked by SB-3]
SB-6: Write config validation tests  [blocked by SB-1]
```

**Epic B: Frontend API Integration (adpulse-portal) — Agent 2**

```
AP-1: Create src/api/client.ts with Axios + tenant interceptor
AP-2: Create src/api/types.ts with backend response types  [parallel with AP-1]
  ↓
AP-3: Create src/utils/mappers.ts (backend → frontend shape mapping)  [blocked by AP-2]
  ↓
AP-4: Create data-fetching hooks (useAds, useChannels, etc.)  [blocked by AP-1, AP-3]
  ↓
AP-5: Replace mock data in AcquisitionPage  [blocked by AP-4, SB-3]
AP-6: Replace mock data in Dashboard  [blocked by AP-4]
AP-7: Replace mock data in CreativeDetail  [blocked by AP-4, SB-3]
  ↓
AP-8: Add loading skeletons and error boundaries  [blocked by AP-5, AP-6, AP-7]
AP-9: Create .env.example and environment config  [no dependencies]
AP-10: Write API client and mapper tests  [blocked by AP-3, AP-4]
```

**Epic C: Frontend TS + CI/CD (adpulse-portal) — Agent 3**

```
AP-11: Add tsconfig.json with allowJs: true
AP-12: Create src/types/ definitions  [blocked by AP-11]
  ↓
AP-13: Convert Wave 1 (types + formatters)  [blocked by AP-12]
AP-14: Convert Wave 2 (config + data + classifications)  [blocked by AP-13]
AP-15: Convert Wave 3 (shared components)  [blocked by AP-14]
AP-16: Convert Wave 4 (layout components)  [blocked by AP-15]
AP-17: Convert Wave 5 (pages + acquisition tabs)  [blocked by AP-16]
  ↓
AP-18: Create Dockerfile + nginx.conf  [no dependencies]
AP-19: Create GitHub Actions workflow  [blocked by AP-18]
AP-20: Set up Workload Identity Federation for GCP  [blocked by AP-19]
AP-21: Configure custom domain  [blocked by AP-20]
AP-22: Create CONTRIBUTING.md  [no dependencies]
```

### Step 4: Agent Dispatch Strategy

**Phase 1 — Parallel launch (3 agents simultaneously):**

```
┌─────────────────────────────────────────────────────────────────────┐
│ Agent 1 (saas-backend worktree)     │ Agent 2 (adpulse worktree)   │
│                                      │                              │
│ SB-1: health_scoring.yml            │ AP-1: API client              │
│ SB-2: SQL query                     │ AP-2: Response types          │
│ SB-3: Route mapping                 │ AP-3: Mappers                 │
│ SB-4: Unit tests                    │ AP-4: Data hooks              │
│ SB-5: Integration tests             │ AP-9: Env config              │
│ SB-6: Config validation tests       │ AP-10: Client + mapper tests  │
│                                      │                              │
│ ───── Agent 1 completes ─────       │ ── waits for SB-3 ──         │
│                                      │                              │
│                                      │ AP-5: AcquisitionPage        │
│                                      │ AP-6: Dashboard              │
│                                      │ AP-7: CreativeDetail         │
│                                      │ AP-8: Loading/error states   │
├──────────────────────────────────────┤                              │
│ Agent 3 (adpulse worktree)          │                              │
│                                      │                              │
│ AP-11: tsconfig.json                │                              │
│ AP-12: Type definitions             │                              │
│ AP-13-17: TS conversion (5 waves)   │                              │
│ AP-18: Dockerfile + nginx           │                              │
│ AP-19: GitHub Actions               │                              │
│ AP-20: WIF setup                    │                              │
│ AP-21: Custom domain                │                              │
│ AP-22: CONTRIBUTING.md              │                              │
└─────────────────────────────────────────────────────────────────────┘
```

**How agents coordinate:**

1. **Agent 1** (backend) runs in `saas-backend` worktree. It has no dependencies and starts immediately. When SB-3 is complete, it signals readiness via beads (`bd update SB-3 --status=completed`).

2. **Agent 2** (API integration) runs in `adpulse-portal` worktree. It starts AP-1 through AP-4 and AP-9/AP-10 immediately (no backend dependency). When it reaches AP-5/AP-7 (mock data replacement), it checks if SB-3 is completed. If not, it works on AP-6 (Dashboard, which uses existing endpoints) and AP-10 (tests) first.

3. **Agent 3** (TS + CI/CD) runs in a separate `adpulse-portal` worktree. It's fully independent — TypeScript conversion and CI/CD setup don't require the API layer.

**Merge order:**
1. Agent 1 → merge `epic/health-scores` into saas-backend main
2. Agent 3 → merge `epic/ts-cicd` into adpulse-portal main (no conflicts with Agent 2)
3. Agent 2 → rebase `epic/api-integration` on main (after Agent 3), merge

### Step 5: Agent Invocation Commands

Each agent is dispatched using the `superpowers:dispatching-parallel-agents` skill with worktree isolation:

```
Agent 1: subagent_type=beads:task-agent, isolation=worktree
  prompt: "Work in ~/Work/dev/saas-backend. Complete tasks SB-1 through SB-6
           for the health-scores API. Read saas-backend CLAUDE.md for context.
           Follow existing registry patterns in q_ad_performance.yml."

Agent 2: subagent_type=beads:task-agent, isolation=worktree
  prompt: "Work in adpulse-portal. Complete tasks AP-1 through AP-10
           for API integration. Use Axios with tenant interceptor pattern
           from insights-dashboard. Check beads for SB-3 completion before
           starting AP-5/AP-7."

Agent 3: subagent_type=beads:task-agent, isolation=worktree
  prompt: "Work in adpulse-portal. Complete tasks AP-11 through AP-22
           for TypeScript conversion and CI/CD. Follow the existing
           component patterns and STYLE_GUIDE.md."
```

### Step 6: Code Review After Each Agent Completes

After each agent completes its epic, use `superpowers:requesting-code-review` to validate:

1. **Agent 1 review:** Scoring parity with JS `computeScores()`, config validation, test coverage
2. **Agent 2 review:** API client patterns match insights-dashboard, mappers produce correct shapes, loading/error states work
3. **Agent 3 review:** Type safety (`tsc --noEmit` passes), build succeeds, CI/CD workflow valid, no regressions

---

## Critical File References

### saas-backend (existing, to extend)

| File | Purpose |
|---|---|
| `src/routes/v1/analysis/analysis.route.js` | Route definitions — add health-scores route |
| `src/registry/registries/acquisition/routes.registry.yml` | Route → query mapping — add health-scores entry |
| `src/registry/registries/acquisition/queries/q_ad_performance.yml` | Reference — existing ad scoring query pattern |
| `src/services/analysis/analysis.service.js` | Service logic — `getUniversalResource()` handles all acquisition routes |
| `src/registry/core/RegistryManager.js` | Query execution engine |
| `CLAUDE.md` | Backend architecture reference |

### adpulse-portal (this repo, to modify)

| File | Contains | Change |
|---|---|---|
| `src/data/mockData.js` | All mock generators | Keep for dev, bypass when API available |
| `src/pages/AcquisitionPage.jsx` | `generateAds()`, `generateHierarchicalData()` | Replace with API hooks |
| `src/pages/Dashboard.jsx` | `generateMetricCardData()`, `generateTrendData()` | Replace with API hooks |
| `src/pages/CreativeDetail.jsx` | `generateCreativeAnalysis()` | Replace with API hooks |
| `src/components/acquisition/ChannelsTab.jsx` | `generateChannelChartData()` | Replace with `useChannels()` |
| `src/utils/formatters.js` | `scoreToGrade`, `gradeToScore` | Must match backend grades |

---

## Verification Plan

### Backend (saas-backend)
1. `GET /v1/analysis/acquisition/health-scores?tenant_id=...&start_date=...&end_date=...` → returns 6D scores
2. Scores for same ads produce identical results to JS `computeScores()` with same inputs
3. Config validation tests pass (weights sum to 1.0, thresholds ordered)

### Frontend (adpulse-portal)
1. `npm run lint && npx tsc --noEmit` — no errors
2. `npm run build` — builds successfully
3. `npm run dev` with `VITE_API_BASE_URL` set — app loads with real data
4. All tabs render with backend data (channels, creatives, campaigns, ad sets, landing pages)
5. CreativeDetail shows 6D health funnel from backend health-scores API
6. Loading states visible during API calls
7. Error boundaries catch and display API failures

### CI/CD
1. Push PR → GitHub Actions runs lint + typecheck + build
2. Merge to main → Cloud Run deploys
3. `https://adpulse.outoftheblue.ai` loads the SPA
