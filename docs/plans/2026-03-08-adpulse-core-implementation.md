# AdPulse Core Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect adpulse-portal to saas-backend APIs with full auth support, add 6D health scoring backend endpoint, set up CI/CD for QA + production deployment, and convert to TypeScript.

**Architecture:** adpulse-portal is a standalone React SPA using session-based auth (HTTP-only cookies via OAuth) connecting to saas-backend. Three user types: OTB staff (all tenants), tenant users (own tenant), agency users (linked tenants). A new `health-scores` endpoint is added to saas-backend for 6D scoring (z-score + benchmark fallback). CI/CD deploys to Cloud Run: `development` branch → QA, `main` → production.

**Tech Stack:** React 19 + Vite 7 + Tailwind 4 + Recharts + Axios | Express.js + BigQuery (backend) | Cloud Run + nginx (deploy)

**Decisions (resolved):**
- adpulse-portal is the production app (standalone)
- Scoring: z-score normalization + benchmark fallback for low-data
- Config: YAML in repo now, preference table later
- Scope: Core only (no labels, badges, confidence, Creative Intel, A/B tests)
- Auth: Session-based (same as insights-dashboard), OAuth via Google/Microsoft/Okta/Magic Link
- Branches: feature → `development` (QA) → `main` (prod)
- URLs: QA at `qa.adpulse.app.outoftheblue.ai`, Prod at `adpulse.app.outoftheblue.ai`

---

## Branch Strategy

```
feature/xxx ──PR──► development ──PR──► main
                         │                  │
                    Cloud Run           Cloud Run
                    (auto-deploy)       (auto-deploy)
                         │                  │
              qa.adpulse.app.       adpulse.app.
              outoftheblue.ai       outoftheblue.ai
```

- **`main`** — Production. Protected. Only accepts PRs from `development`.
- **`development`** — QA/staging. Protected. Accepts PRs from feature branches.
- **Feature branches** — Short-lived (`feat/auth`, `feat/api-integration`, etc.). Squash merge into `development`.

---

## Authentication Architecture

### How it works (same pattern as insights-dashboard)

```
┌─────────────────────────────────────────────────────────┐
│ adpulse-portal (React SPA)                              │
│                                                         │
│  /login page                                            │
│    ├─ Google OAuth button → redirect to backend         │
│    ├─ Microsoft OAuth button → redirect to backend      │
│    ├─ Okta OAuth button → redirect to backend           │
│    └─ Magic Link → POST email to backend                │
│                                                         │
│  On app mount: GET /v1/auth/verify (with cookies)       │
│    → Success: store user in React context               │
│    → 401: redirect to /login                            │
│                                                         │
│  Axios interceptor:                                     │
│    → withCredentials: true (send cookies)               │
│    → Auto-inject tenant_id from context/localStorage    │
│                                                         │
│  Route guards:                                          │
│    → RequireAuth: user must be logged in                │
│    → RequireAdmin: user.tenant_id === 'outoftheblue'    │
│                                                         │
│  Tenant selection:                                      │
│    → OTB staff: /customers page (full tenant picker)    │
│    → Agency users: sidebar brand switcher               │
│    → Tenant users: auto-assigned, no picker             │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP-only session cookies
                            │ + tenant_id query param
┌───────────────────────────▼─────────────────────────────┐
│ saas-backend (existing)                                 │
│                                                         │
│  /v1/auth/google → OAuth flow → set session cookie      │
│  /v1/auth/verify → return user profile + agencies       │
│  validateTenantAccess middleware:                        │
│    → OTB staff (outoftheblue): access all tenants       │
│    → Tenant users: access own tenant only               │
│    → Agency users: access linked tenants via brands     │
└─────────────────────────────────────────────────────────┘
```

### Three user types

| Type | Identification | Tenant Access | UI |
|---|---|---|---|
| **OTB Staff** | `user.tenant_id === 'outoftheblue'` | All tenants | Full tenant picker at `/customers` |
| **Tenant User** | `user.tenant_id === '<tenant>'` | Own tenant only | No picker needed |
| **Agency User** | `user.is_agency_user === true` | Tenants linked via agency → brand chain | Sidebar brand switcher |

---

## Parallel Execution Strategy — 5 Agents

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ tmux session: adpulse-impl                                                   │
│                                                                              │
│ ┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐ │
│ │ Pane 1: Agent 1     │  │ Pane 2: Agent 2      │  │ Pane 3: Agent 3     │ │
│ │ Backend Scoring      │  │ Frontend API + Auth   │  │ TypeScript + CI/CD  │ │
│ │ (saas-backend wt)    │  │ (adpulse-portal wt)   │  │ (adpulse-portal wt) │ │
│ │                      │  │                       │  │                     │ │
│ │ Tasks: SB-1..SB-6    │  │ Tasks: AP-1..AP-14    │  │ Tasks: AP-15..AP-23 │ │
│ ├─────────────────────┤  ├───────────────────────┤  ├─────────────────────┤ │
│ │ Pane 4: Agent 4     │  │ Pane 5: Agent 5       │                        │ │
│ │ Staff UI Developer   │  │ Bug Hunter            │                        │ │
│ │ (adpulse-portal wt)  │  │ (adpulse-portal main) │                        │ │
│ │                      │  │                       │                        │ │
│ │ Tasks: AP-24..AP-27  │  │ Tasks: AP-28..AP-30   │                        │ │
│ └─────────────────────┘  └───────────────────────┘                         │ │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Agent | Role | Repo/Worktree | Branch | Tasks |
|---|---|---|---|---|
| **Agent 1** | Backend Scoring | saas-backend | `DEV-6636` (from `develop`) | SB-1 to SB-6 |
| **Agent 2** | Frontend API + Auth | adpulse-portal worktree | `feat/api-integration` | AP-1 to AP-14 |
| **Agent 3** | TypeScript + CI/CD | adpulse-portal worktree | `feat/ts-cicd` | AP-15 to AP-23 |
| **Agent 4** | Staff UI Developer | adpulse-portal worktree | `feat/ui-polish` | AP-24 to AP-27 |
| **Agent 5** | Bug Hunter | adpulse-portal (main) | reads all branches | AP-28 to AP-30 |

---

## Task Breakdown

### Epic A: Backend 6D Scoring (Agent 1 — saas-backend)

```
SB-1: Create health_scoring.yml config in registry
  ↓
SB-2: Create q_ad_health_scores.yml BigQuery query (z-score + benchmark)  [blocked by SB-1]
  ↓
SB-3: Add health-scores route + query group in registry YAMLs  [blocked by SB-2]
  ↓
SB-4: Write unit tests for score computation  [blocked by SB-2]
SB-5: Write integration test for endpoint  [blocked by SB-3]
SB-6: Write config validation tests  [blocked by SB-1]
```

### Epic A: Detailed Implementation Steps (Agent 1 — saas-backend, branch DEV-6636)

> **Repo:** `~/Work/dev/saas-backend` on branch `DEV-6636` (created from `develop`)
> **Pattern:** Follow existing registry patterns in `src/registry/registries/acquisition/`
> **Reference files:** `q_ad_performance.yml`, `routes.registry.yml`, `queries.registry.yml`

#### SB-1: Create health_scoring.yml config

**Purpose:** Define scoring dimensions, weights, metric mappings, and benchmark fallback thresholds.

**File to create:** `src/registry/registries/acquisition/queries/health_scoring_config.yml`

```yaml
# Health scoring configuration — 6 dimensions
# Used by q_ad_health_scores.yml to compute weighted scores

scoring_dimensions:
  hook:
    weight: 0.20
    description: "Ability to capture attention (thumb-stop)"
    metrics:
      - name: hook_rate
        source_column: hook_rate  # 3-second video views / impressions
        higher_is_better: true
      - name: cpm
        source_column: cpm
        higher_is_better: false  # lower CPM = better hook
    benchmark_fallback:
      hook_rate: 0.25
      cpm: 15.0

  watch:
    weight: 0.15
    description: "Ability to retain attention"
    metrics:
      - name: avg_watch_time
        source_column: avg_watch_time_seconds
        higher_is_better: true
      - name: video_completion_rate
        source_column: video_completion_rate
        higher_is_better: true
    benchmark_fallback:
      avg_watch_time: 8.0
      video_completion_rate: 0.15

  click:
    weight: 0.20
    description: "Ability to drive clicks/engagement"
    metrics:
      - name: ctr
        source_column: ctr
        higher_is_better: true
      - name: cpc
        source_column: cpc
        higher_is_better: false
    benchmark_fallback:
      ctr: 0.01
      cpc: 1.50

  convert:
    weight: 0.25
    description: "Ability to drive conversions"
    metrics:
      - name: conversion_rate
        source_column: conversion_rate
        higher_is_better: true
      - name: roas
        source_column: roas
        higher_is_better: true
      - name: cpa
        source_column: cost_per_purchase
        higher_is_better: false
    benchmark_fallback:
      conversion_rate: 0.02
      roas: 2.0
      cpa: 30.0

  reach:
    weight: 0.10
    description: "Efficiency of audience reach"
    metrics:
      - name: impressions
        source_column: impressions
        higher_is_better: true
      - name: frequency
        source_column: frequency
        higher_is_better: false  # lower frequency = fresher reach
    benchmark_fallback:
      impressions: 10000
      frequency: 3.0

  signals:
    weight: 0.10
    description: "Early performance signals and trends"
    metrics:
      - name: spend_efficiency
        source_column: spend_efficiency  # conversion_value / spend
        higher_is_better: true
      - name: engagement_rate
        source_column: engagement_rate
        higher_is_better: true
    benchmark_fallback:
      spend_efficiency: 1.5
      engagement_rate: 0.03

# Scoring method
scoring:
  method: z_score_with_benchmark_fallback
  z_score_min_population: 5  # Use z-score when >= 5 ads, benchmark otherwise
  score_range: [0, 100]      # Final scores normalized to 0-100

# Grade mapping (from overall weighted score)
grading:
  A: { min: 75 }         # 75-100
  B: { min: 50, max: 74 }
  C: { min: 25, max: 49 }
  D: { max: 24 }         # 0-24
```

#### SB-2: Create q_ad_health_scores.yml BigQuery query

**Purpose:** BigQuery SQL that computes 6D health scores using z-score normalization with benchmark fallback.

**File to create:** `src/registry/registries/acquisition/queries/q_ad_health_scores.yml`

**Pattern to follow:** Same structure as `q_ad_performance.yml` — SQL with `{{table_name:table}}` variable substitution, `@start_date`/`@end_date` parameters, and `response_composition` shapes.

**SQL logic (pseudocode):**
1. CTE `base_metrics`: Pull raw ad metrics from `{{table_name:table}}` for date range, filtered by tenant
2. CTE `population_stats`: Compute mean + stddev per metric across all ads (for z-score)
3. CTE `scored_ads`: For each ad, for each metric:
   - If population count >= 5: `z_score = (value - mean) / stddev`, then normalize to 0-100
   - If population count < 5: compare against benchmark fallback values
   - If `higher_is_better` is false, invert the score
4. CTE `dimension_scores`: Average metric scores within each dimension (hook, watch, click, convert, reach, signals)
5. CTE `overall_scores`: Weighted average of dimension scores → `overall_score`
6. Map `overall_score` to grade (A/B/C/D)
7. SELECT all ads with their 6 dimension scores, overall score, and grade

**Response composition:**
```yaml
response_composition:
  version: 'v2'
  shapes:
    - id: 'health_scores'
      transform: 'passthrough'
      from: 'raw_rows'
    - id: 'summary'
      transform: 'aggregate_stats'
      from: 'health_scores'
      params:
        metrics: ['overall_score', 'hook_score', 'watch_score', 'click_score', 'convert_score', 'reach_score', 'signals_score']
    - id: 'grade_distribution'
      transform: 'aggregate_distribution'
      from: 'health_scores'
      params:
        dimension: ['grade']
        categories: ['A', 'B', 'C', 'D']
```

#### SB-3: Add route + query group registry entries

**Files to modify:**

1. **`src/registry/registries/acquisition/routes.registry.yml`** — Add new route:
```yaml
routes:
  # ... existing routes ...
  health-scores:
    group: health_analysis
    view: health_scoring
    description: '6D health scoring for ads'
    shape: PerformanceAnalysis
    entity_type: ads
    entity_field: ad_name
```

2. **`src/registry/registries/acquisition/queries.registry.yml`** — Add new group:
```yaml
groups:
  # ... existing groups ...
  health_analysis:
    description: '6D health scoring analysis'
    views:
      health_scoring:
        $import: ./queries/q_ad_health_scores.yml
```

3. **`src/registry/registries/acquisition/filters.registry.yml`** — Add filters for the new group:
```yaml
groups:
  # ... existing groups ...
  health_analysis:
    global_filters:
      - name: date_range
        type: daterange
        values_from: shared.date_range
      - name: stores
        type: multiselect
        values_from: shared.available_stores
      - name: ad_providers
        type: multiselect
        values_from: shared.ad_providers_list
```

**Resulting endpoint:** `GET /v1/analysis/acquisition/health-scores?tenant_id=<id>&start_date=<date>&end_date=<date>`

#### SB-4: Write unit tests for score computation

**File to create:** `tests/registry-system/health-scoring.test.js`

**Test cases:**
- Z-score normalization produces correct scores for known inputs
- Benchmark fallback is used when population < 5
- `higher_is_better: false` metrics are correctly inverted
- Dimension scores are correctly weighted averages of their metrics
- Overall score is correctly weighted average of dimensions
- Grade mapping: 75+ → A, 50-74 → B, 25-49 → C, 0-24 → D
- Edge cases: zero stddev (all same values), null metrics, single ad

#### SB-5: Write integration test for endpoint

**File to create:** `tests/registry-system/health-scoring.integration.test.js`

**Test cases:**
- `GET /v1/analysis/acquisition/health-scores` returns 200 with valid params
- Response contains `health_scores`, `summary`, and `grade_distribution` shapes
- Each ad in `health_scores` has all 6 dimension scores + overall + grade
- Invalid tenant returns appropriate error
- Missing required params (start_date, end_date) return 400

#### SB-6: Write config validation tests

**File to create:** `tests/registry-system/health-scoring-config.test.js`

**Test cases:**
- Config YAML parses without errors
- All 6 dimensions are defined with valid weights
- Weights sum to 1.0
- Each dimension has at least one metric with `source_column` and `higher_is_better`
- Benchmark fallback values are defined for every metric
- Grade boundaries are contiguous and cover 0-100

#### Post-completion: Create PRs

After all SB tasks are complete and tests pass:

```bash
cd ~/Work/dev/saas-backend
git push origin DEV-6636

# PR 1: DEV-6636 → develop (for QA)
gh pr create --base develop \
  --title "DEV-6636: Add 6D ad health scoring endpoint" \
  --body "..."

# PR 2: DEV-6636 → main (for Prod) — after QA approval
gh pr create --base main \
  --title "DEV-6636: Add 6D ad health scoring endpoint" \
  --body "..."
```

---

### Epic B: Frontend API + Auth (Agent 2 — adpulse-portal)

```
AP-1:  Create development branch from main, install axios
AP-2:  Create environment config (.env.example, .env.development, .env.qa, .env.production)
AP-3:  Create auth context (AuthProvider, useAuth hook, login/verify flow)
AP-4:  Create login page (OAuth buttons: Google, Microsoft, Okta, Magic Link)
AP-5:  Create tenant context (useTenant hook, tenant picker for OTB staff, brand switcher for agencies)
AP-6:  Add route guards (RequireAuth, RequireAdmin) to App.jsx
AP-7:  Create API client (Axios with withCredentials + tenant interceptor)
AP-8:  Create API endpoint definitions
AP-9:  Create data mappers (backend → frontend shape) with tests
AP-10: Create data-fetching hooks (useAds, useChannels, useCampaigns, etc.)
AP-11: Replace mock data in AcquisitionPage
AP-12: Replace mock data in Dashboard
AP-13: Replace mock data in CreativeDetail
AP-14: Add loading skeletons and error boundary
```

### Epic C: TypeScript + CI/CD (Agent 3 — adpulse-portal)

```
AP-15: Add tsconfig.json with allowJs: true, install typescript
AP-16: Create src/types/index.ts with core type definitions
AP-17: Convert formatters.js and routes.js to TypeScript
AP-18: Convert shared components to TypeScript (.jsx → .tsx)
AP-19: Convert layout components to TypeScript
AP-20: Convert pages and acquisition tabs to TypeScript
AP-21: Create Dockerfile + nginx.conf
AP-22: Create GitHub Actions CI/CD workflow (development → QA, main → prod)
AP-23: Create .dockerignore, update package.json scripts
```

### Epic D: Staff UI Developer (Agent 4 — adpulse-portal)

```
AP-24: Audit existing UI against production standards using frontend-design skill
AP-25: Polish login page and tenant selector UX
AP-26: Polish dashboard and acquisition page layouts
AP-27: Polish creative detail page and score visualizations
```

### Epic E: Bug Hunter (Agent 5 — adpulse-portal)

```
AP-28: Install and configure Vitest + React Testing Library
AP-29: Write comprehensive component tests (all tabs, all pages)
AP-30: Write integration tests (auth flow, API hooks, data mappers)
```

---

## tmux + Worktrees + Beads Execution Steps

### Prerequisites

```bash
# Ensure Claude Code is installed
claude --version

# Ensure beads is available
bd --version  # or: claude /skill beads:version
```

### Step 1: Create branch structure

```bash
# In adpulse-portal — local only (will move repo to org later)
cd ~/Work/dev/adpulse-portal
git checkout -b development  # already done
# No push — repo will be moved to Outoftheblue-ai org

# In saas-backend — create DEV-6636 from develop
cd ~/Work/dev/saas-backend
git checkout develop && git pull origin develop
git checkout -b DEV-6636
git push -u origin DEV-6636
```

### Step 2: Initialize beads in both repos

```bash
# adpulse-portal
cd ~/Work/dev/adpulse-portal
claude "/skill beads:init --prefix AP"

# saas-backend
cd ~/Work/dev/saas-backend
claude "/skill beads:init --prefix SB"
```

### Step 3: Create all beads tasks

Run these commands to create the full task list with dependencies. This is done from the main repo before launching agents:

```bash
cd ~/Work/dev/adpulse-portal

# Use claude to batch-create beads issues:
claude "Create the following beads tasks with dependencies:
  AP-1: Create development branch, install axios [no blockers]
  AP-2: Create environment config files [blocked by AP-1]
  AP-3: Create auth context (AuthProvider, useAuth, verify flow) [blocked by AP-1]
  AP-4: Create login page with OAuth buttons [blocked by AP-3]
  AP-5: Create tenant context with picker/switcher UI [blocked by AP-3]
  AP-6: Add route guards to App.jsx [blocked by AP-3]
  AP-7: Create API client with Axios + tenant interceptor [blocked by AP-2, AP-5]
  AP-8: Create API endpoint definitions [blocked by AP-7]
  AP-9: Create data mappers with tests [blocked by AP-8]
  AP-10: Create data-fetching hooks [blocked by AP-7, AP-9]
  AP-11: Replace mock data in AcquisitionPage [blocked by AP-10]
  AP-12: Replace mock data in Dashboard [blocked by AP-10]
  AP-13: Replace mock data in CreativeDetail [blocked by AP-10]
  AP-14: Add loading skeletons and error boundary [blocked by AP-11, AP-12, AP-13]
  AP-15: Add tsconfig.json + install typescript [no blockers]
  AP-16: Create src/types/index.ts [blocked by AP-15]
  AP-17: Convert formatters and routes to TypeScript [blocked by AP-16]
  AP-18: Convert shared components to TypeScript [blocked by AP-17]
  AP-19: Convert layout components to TypeScript [blocked by AP-18]
  AP-20: Convert pages and acquisition tabs to TypeScript [blocked by AP-19]
  AP-21: Create Dockerfile + nginx.conf [no blockers]
  AP-22: Create GitHub Actions CI/CD workflow [blocked by AP-21]
  AP-23: Create .dockerignore + update package.json scripts [blocked by AP-22]
  AP-24: Audit UI against production standards [blocked by AP-14]
  AP-25: Polish login page and tenant selector UX [blocked by AP-24]
  AP-26: Polish dashboard and acquisition page layouts [blocked by AP-24]
  AP-27: Polish creative detail page and score visualizations [blocked by AP-24]
  AP-28: Install Vitest + React Testing Library [no blockers]
  AP-29: Write comprehensive component tests [blocked by AP-14, AP-28]
  AP-30: Write integration tests for auth + API hooks [blocked by AP-14, AP-28]
Use /skill beads:create for each."
```

```bash
cd ~/Work/dev/saas-backend

claude "Create beads tasks:
  SB-1: Create health_scoring.yml config [no blockers]
  SB-2: Create q_ad_health_scores.yml query [blocked by SB-1]
  SB-3: Add route + query group registry entries [blocked by SB-2]
  SB-4: Write unit tests for score computation [blocked by SB-2]
  SB-5: Write integration test for endpoint [blocked by SB-3]
  SB-6: Write config validation tests [blocked by SB-1]
Use /skill beads:create for each."
```

### Step 4: Create git worktrees

```bash
# adpulse-portal worktrees (3 agents)
cd ~/Work/dev/adpulse-portal
git worktree add .claude/worktrees/api-integration development -b feat/api-integration
git worktree add .claude/worktrees/ts-cicd development -b feat/ts-cicd
git worktree add .claude/worktrees/ui-polish development -b feat/ui-polish

# saas-backend — Agent 1 works directly on DEV-6636 branch (no worktree needed)
cd ~/Work/dev/saas-backend
git checkout DEV-6636
```

### Step 5: Create tmux session

```bash
# Create tmux session with 5 panes
tmux new-session -d -s adpulse-impl -n agents

# Split into panes
tmux split-window -h -t adpulse-impl:agents
tmux split-window -v -t adpulse-impl:agents.0
tmux split-window -v -t adpulse-impl:agents.1
tmux split-window -v -t adpulse-impl:agents.1

# Label panes (optional, for reference)
# Pane 0: Agent 1 (Backend Scoring)
# Pane 1: Agent 4 (UI Developer) — starts after Agent 2 finishes
# Pane 2: Agent 2 (API + Auth)
# Pane 3: Agent 3 (TS + CI/CD)
# Pane 4: Agent 5 (Bug Hunter) — starts after Agents 2+3 finish
```

### Step 6: Launch agents in tmux panes

**Pane 0 — Agent 1: Backend Scoring**
```bash
tmux send-keys -t adpulse-impl:agents.0 \
  'cd ~/Work/dev/saas-backend && claude --resume "You are Agent 1: Backend Scoring. Work on branch DEV-6636 in saas-backend. Read CLAUDE.md for backend context. Complete beads tasks SB-1 through SB-6 for the 6D health-scores API. Use /skill beads:ready to find your next task, /skill beads:update to mark progress. Follow existing registry patterns in q_ad_performance.yml. Reference the detailed implementation steps in ~/Work/dev/adpulse-portal/docs/plans/2026-03-08-adpulse-core-implementation.md (see Epic A Detailed Steps section). Commit after each task. When all tasks complete, push to origin DEV-6636."' C-m
```

**Pane 2 — Agent 2: Frontend API + Auth**
```bash
tmux send-keys -t adpulse-impl:agents.2 \
  'cd ~/Work/dev/adpulse-portal/.claude/worktrees/api-integration && claude --resume "You are Agent 2: Frontend API + Auth. Work in this adpulse-portal worktree on branch feat/api-integration. Read CLAUDE.md and STYLE_GUIDE.md. Complete beads tasks AP-1 through AP-14. Key details: Auth uses session cookies (withCredentials:true), OAuth via backend redirect (/v1/auth/google etc), verify via GET /v1/auth/verify. Three user types: OTB staff (tenant_id=outoftheblue, sees all tenants), tenant users (own tenant), agency users (is_agency_user=true, linked brands). Follow insights-dashboard patterns at ~/Work/dev/insights-dashboard for auth context, tenant selection, and Axios interceptor. Use /skill beads:ready and /skill beads:update. Reference plan at ~/Work/dev/adpulse-portal/docs/plans/2026-03-08-adpulse-core-implementation.md. Commit after each task."' C-m
```

**Pane 3 — Agent 3: TypeScript + CI/CD**
```bash
tmux send-keys -t adpulse-impl:agents.3 \
  'cd ~/Work/dev/adpulse-portal/.claude/worktrees/ts-cicd && claude --resume "You are Agent 3: TypeScript + CI/CD. Work in this adpulse-portal worktree on branch feat/ts-cicd. Complete beads tasks AP-15 through AP-23. TypeScript conversion: add tsconfig.json with allowJs:true, create type definitions, convert files in waves (formatters → config → shared components → layout → pages). CI/CD: Dockerfile with nginx for Cloud Run, GitHub Actions workflow with two deploy jobs: development branch → qa.adpulse.app.outoftheblue.ai, main branch → adpulse.app.outoftheblue.ai. Use /skill beads:ready and /skill beads:update. Reference plan at ~/Work/dev/adpulse-portal/docs/plans/2026-03-08-adpulse-core-implementation.md. Commit after each task."' C-m
```

**Pane 1 — Agent 4: Staff UI Developer** (starts after Agent 2 completes AP-14)
```bash
tmux send-keys -t adpulse-impl:agents.1 \
  'cd ~/Work/dev/adpulse-portal/.claude/worktrees/ui-polish && claude --resume "You are Agent 4: Staff UI Developer. Work in this adpulse-portal worktree on branch feat/ui-polish. Your tasks AP-24 through AP-27 are blocked by AP-14. Wait for Agent 2 to complete by checking /skill beads:show AP-14 periodically. Once unblocked, use the frontend-design skill (invoke via Skill tool) to audit and polish the UI to production grade. Focus on: login page UX, tenant selector, dashboard layout, acquisition page, creative detail page. Create distinctive, polished interfaces. Use /skill beads:ready and /skill beads:update. Commit after each task."' C-m
```

**Pane 4 — Agent 5: Bug Hunter** (starts after Agents 2+3 complete)
```bash
tmux send-keys -t adpulse-impl:agents.4 \
  'cd ~/Work/dev/adpulse-portal && claude --resume "You are Agent 5: Bug Hunter. Your tasks AP-28 through AP-30 are blocked by AP-14. Wait for Agents 2 and 3 to complete their work by checking /skill beads:show AP-14 and /skill beads:show AP-20 periodically. Once unblocked, set up Vitest + React Testing Library, then write comprehensive tests covering: all page components, all acquisition tabs, auth flow (login/logout/verify), API hooks (loading/error/success states), data mappers, route guards. Run tests and file bugs as new beads issues for any failures. Use /skill beads:ready and /skill beads:update. Commit after each task."' C-m
```

### Step 7: Monitor progress

```bash
# Attach to tmux session
tmux attach -t adpulse-impl

# Switch between panes: Ctrl+B then arrow keys
# Check overall progress from any pane:
cd ~/Work/dev/adpulse-portal && bd stats
cd ~/Work/dev/saas-backend && bd stats

# Check blocked tasks:
bd blocked

# Check ready tasks:
bd ready
```

### Step 8: Merge & PR after agents complete

#### saas-backend — PRs from DEV-6636

```bash
cd ~/Work/dev/saas-backend
git checkout DEV-6636
git push origin DEV-6636

# PR 1: DEV-6636 → develop (QA)
gh pr create --base develop --title "DEV-6636: Add 6D ad health scoring endpoint" --body "$(cat <<'EOF'
## Summary
- New registry-based health scoring endpoint for 6D ad scoring
- Z-score normalization with benchmark fallback for low-data scenarios
- Scoring dimensions: Hook, Watch, Click, Convert, Reach, Signals
- Config YAML + BigQuery query + route registration

## Test plan
- [ ] Unit tests for score computation pass
- [ ] Integration test for endpoint passes
- [ ] Config validation tests pass
- [ ] Manual test: `GET /v1/analysis/acquisition/health-scores?tenant_id=<test>&start_date=...&end_date=...`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# PR 2: DEV-6636 → main (Prod) — create after QA PR is approved and merged
gh pr create --base main --title "DEV-6636: Add 6D ad health scoring endpoint" --body "$(cat <<'EOF'
## Summary
- Production release of 6D ad health scoring endpoint
- Already QA-verified via develop branch

## Test plan
- [ ] QA verification complete on develop branch
- [ ] All tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### adpulse-portal — local merges (repo will be moved to org)

```bash
# 1. Merge TypeScript + CI/CD (Agent 3) — no conflicts with Agent 2
cd ~/Work/dev/adpulse-portal
git checkout development
git merge --squash feat/ts-cicd
git commit -m "feat: add TypeScript conversion and CI/CD"

# 2. Merge API + Auth (Agent 2) — rebase on Agent 3's changes first
git checkout feat/api-integration
git rebase development
# Resolve any conflicts (Agent 2's .js files may need .ts rename)
git checkout development
git merge --squash feat/api-integration
git commit -m "feat: add API integration, auth, and tenant support"

# 3. Merge UI polish (Agent 4)
git checkout feat/ui-polish
git rebase development
git checkout development
git merge --squash feat/ui-polish
git commit -m "feat: polish UI to production grade"

# 4. Clean up worktrees
cd ~/Work/dev/adpulse-portal
git worktree remove .claude/worktrees/api-integration
git worktree remove .claude/worktrees/ts-cicd
git worktree remove .claude/worktrees/ui-polish

# 5. After repo is moved to org, push and create PRs:
# git push -u origin development
# git push -u origin main
```

---

## CI/CD Workflow (updated for QA + Prod)

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  lint-typecheck-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
      - run: npm test

  deploy-qa:
    needs: lint-typecheck-build
    if: github.ref == 'refs/heads/development' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions: { contents: read, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: |
          gcloud run deploy adpulse-web-qa \
            --source=. \
            --region=us-central1 \
            --project=otb-dev-platform \
            --allow-unauthenticated \
            --set-env-vars="VITE_API_BASE_URL=https://qa.app.outoftheblue.ai"

  deploy-prod:
    needs: lint-typecheck-build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions: { contents: read, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: |
          gcloud run deploy adpulse-web \
            --source=. \
            --region=us-central1 \
            --project=otb-dev-platform \
            --allow-unauthenticated \
            --set-env-vars="VITE_API_BASE_URL=https://app.outoftheblue.ai"
```

---

## Auth Implementation Details (Agent 2 reference)

### Files to create

```
src/
├── auth/
│   ├── AuthProvider.jsx      # React context for auth state
│   ├── useAuth.js            # Hook: login status, user, logout
│   └── RequireAuth.jsx       # Route guard component
├── tenant/
│   ├── TenantProvider.jsx    # React context for tenant selection
│   ├── useTenant.js          # Hook: current tenant, switch tenant
│   └── TenantPicker.jsx     # OTB staff: full tenant picker page
├── pages/
│   └── Login.jsx             # Login page with OAuth buttons
```

### Auth flow implementation

```javascript
// src/auth/AuthProvider.jsx — Pattern from insights-dashboard
// On mount: GET /v1/auth/verify (cookies sent automatically)
// Success: set user in context, resolve tenant
// 401: redirect to /login

// src/auth/useAuth.js
// useAuth() → { user, isAuthenticated, isOTBStaff, isAgencyUser, logout, loading }
// isOTBStaff = user.tenant_id === 'outoftheblue'
// isAgencyUser = user.is_agency_user === true

// src/tenant/useTenant.js
// useTenant() → { tenantId, setTenantId, availableTenants, agencies }
// OTB staff: all tenants available
// Agency users: tenants from user.agencies[].brands[].tenant
// Tenant users: single tenant (user.tenant_id)
// Stores in localStorage as 'selectedTenant'

// src/api/client.js — Axios interceptor
// Auto-inject tenant_id from useTenant context
// withCredentials: true for session cookies
```

### Login page OAuth URLs

```javascript
const BASE = import.meta.env.VITE_API_BASE_URL;
const redirectTo = encodeURIComponent(window.location.pathname);

// OAuth redirect URLs (same as insights-dashboard)
const googleUrl = `${BASE}/v1/auth/google?redirectTo=${redirectTo}`;
const microsoftUrl = `${BASE}/v1/auth/microsoft?redirectTo=${redirectTo}`;
const oktaUrl = `${BASE}/v1/auth/okta?redirectTo=${redirectTo}`;
// Magic link: POST to /v1/auth/magic-login with { email, redirectTo }
```

---

## Verification Checklist

### Auth
- [ ] Login via Google OAuth works
- [ ] Login via Magic Link works
- [ ] `/v1/auth/verify` returns user profile on app mount
- [ ] OTB staff can see and switch between all tenants
- [ ] Agency users see only their linked tenants
- [ ] Tenant users see only their own tenant
- [ ] Unauthenticated users redirect to `/login`
- [ ] Logout clears session and redirects to `/login`

### API Integration
- [ ] All tabs render with real backend data when `VITE_USE_MOCK_DATA=false`
- [ ] All tabs render with mock data when `VITE_USE_MOCK_DATA=true`
- [ ] Health scores display in CreativeDetail 6D funnel
- [ ] Loading spinners appear during API calls
- [ ] Error boundary catches API failures gracefully

### TypeScript
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] All `.jsx` files converted to `.tsx`

### CI/CD
- [ ] Push to `development` → deploys to qa.adpulse.app.outoftheblue.ai
- [ ] Push to `main` → deploys to adpulse.app.outoftheblue.ai
- [ ] Docker build succeeds locally
- [ ] GitHub Actions workflow passes (lint + typecheck + build + test)

### UI Polish (Agent 4)
- [ ] Login page is production-grade
- [ ] Tenant picker/switcher is intuitive
- [ ] Dashboard layout is visually polished
- [ ] All pages pass frontend-design audit

### Tests (Agent 5)
- [ ] All page components have tests
- [ ] Auth flow tested (login, verify, logout, guards)
- [ ] API hooks tested (loading, error, success states)
- [ ] Data mappers tested (backend → frontend shape)
