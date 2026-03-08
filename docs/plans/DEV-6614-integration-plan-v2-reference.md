# DEV-6614: AdPulse → Insights Dashboard Integration Plan v2

---

## Overview

Integrate the `adpulse-portal` prototype UI/UX into the existing `insights-dashboard` Analyze section and introduce a new Creative Intel section. Preserve all existing data pipelines, filters, download logic, attribution model, and store selection. Only bring in **net-new enhancements** — not a full redesign of existing flows.

---

## Scope

### In Scope
- **Stage 1 — Analyze section:** Channels, Campaigns, Ad Sets, Landing Pages, Creatives (top + drill-in)
- **Stage 2 — Creative Intel section:** Creative Library, Performance Review, Comparative Analysis (placeholder), AI Copilot (placeholder)
- **Stage 3 — Backend infrastructure:** BigQuery schema validation, phased health score system (Phase 1: 4-dim funnel display; Phase 2: full 6-dim adding Reach + Signals once BQ fields confirmed), sparklines, creative labels API, performance review query, badge tooltip education
- **Stage 4 — Confidence + Experimentation:** A/B test infrastructure (normalized vs raw rank), Creative Intelligence AI summary
- **Stage 5 — Acquisition Dashboard Alerts:** Sending proactive alerts to users from the Acquisition Dashboard *(separate planning session — not detailed in this plan)*

### Out of Scope
- Bubble chart (excluded)
- Attribution model logic changes — model selection UI is enhanced (see Attribution section), but the underlying calculation logic is unchanged
- Full redesign of existing filter, download, or store selection flows — enhancements only
- Creative Type branching into separate VIDEO / STATIC leaderboards (all creatives rank on a single leaderboard)
- Time decay score adjustment (deferred — out of scope for this phase)
- User-facing scoring-config API (health score weights stored as server-side config only; user-facing configuration deferred to a future milestone)

### Attribution Model Filter (updated)
The attribution model selector shows all four models but only two are selectable. This gives users visibility into the roadmap without breaking existing behaviour:

| Model | State |
|-------|-------|
| Last Click | Selectable |
| First Click | Selectable |
| Linear | Visible, disabled (greyed out) — future |
| Time Decay | Visible, disabled (greyed out) — future |

Tab-specific rules (unchanged from current logic):
- **Channels tab:** defaults to Last Click; Platform data-driven is disabled
- **Ad Sets tab:** Last Click and First Click are disabled; data-driven is the only selectable model
- **Campaigns / Ads / Landing Pages:** Last Click and First Click are fully selectable

---

## Architecture Principles

### Rule 1 — Evaluate before creating
Check if an existing table can be reused. Only create a new table if adding columns would violate normalization (1NF/2NF/3NF).

### Rule 2 — New table standard
UUID PK, full audit fields: `created_at`, `updated_at`, `approved_at` (datetime) + `created_by`, `updated_by`, `approved_by` (name/email).

### Rule 3 — Fail gracefully
Every new endpoint must have built-in fallbacks. Missing or unavailable data must never block the primary ad performance table.

### Rule 4 — Progressive Customer Exposure
**Design all configuration surfaces as APIs with sensible defaults from day 1**, so that customers can gradually unlock, configure, and personalise features without requiring engineering changes.

Concretely:
- Health score dimension weights → stored in preference table as config; defaults seeded on provisioning; future UI allows tenants to adjust
- Creative tag vocabulary → API-managed from day 1; default taxonomy seeded; future UI allows tenants to add/rename categories
- Creative Intel sections → designed as configurable modules; adding a new section (e.g. personalised views) does not require a new code path — it registers in a section config
- KPI bar metrics → default set is fixed (Spend, Revenue, Blended ROAS) but the component accepts a configurable list from the start, so future user-selection of KPIs is an extension, not a rebuild
- Health score dimension weights → stored as server-side config in the preference table (`SCORING_CONFIG` key); defaults seeded on provisioning; **not hardcoded**; user-facing configuration API deferred to a future milestone

### Rule 5 — User-friendly error handling
All errors surfaces to end users must:
- Use plain language — no stack traces, no technical codes
- Explain what happened and what the user can do next
- Include a "Report this to our team" action that captures context automatically
- Reserve technical detail for internal logs only

**Error taxonomy:**

| Type | User message | Action |
|------|-------------|--------|
| Data unavailable (score/tags) | "Some details couldn't load right now. The rest of your data is still available." | Dismiss |
| Data unavailable (main table) | "We're having trouble loading your ad performance data. Please try refreshing the page." | Retry + Report |
| Attribution data mismatch | "This metric isn't available for the selected attribution model." | Tooltip explains which models support it |
| Creative not found | "We couldn't find this creative. It may have been removed or the link may be outdated." | Back to Creatives |
| Unexpected error | "Something went wrong on our end. Our team has been notified, but you can also report this directly." | Report button |

### URL Change
- `/ads` → `/creatives` (approved)

---

## Enablement Strategy

### No Unleash Feature Flags
Feature flags are not used for this integration:
- Most capabilities are **standard delivery** — always available once shipped
- Premium capabilities are **configuration-gated** — checked against the tenant entitlement record

### Standard Delivery (always on once shipped)

| Capability | Ticket |
|-----------|--------|
| GradeBadge, StatusBadge, ScoreRing, Sparkline, TagBadge, ViewToggle, FunnelScoreRow (Phase 1: 4-dim), ConfidenceBar, Creative State filter, Creative Type filter components | DEV-6615 |
| HealthScoreRow (Phase 2: 6-dim — added once Reach + Signals BQ fields confirmed in DEV-6622) | DEV-6615 + DEV-6623 |
| Column/area charts + updated column picker (via existing "view" button) on Channels tab | DEV-6615 |
| Sparklines on all Analyze tabs (time range mirrors date picker) | DEV-6623 |
| Health score display — Phase 1: FunnelScoreRow (4 dims using existing z-score); Phase 2: HealthScoreRow (6 dims with real scores after DEV-6623) | DEV-6615 |
| Default/app-assigned creative tags display | DEV-6624 |
| Campaigns / Ad Sets / Landing Pages enhancements | DEV-6616, DEV-6617 |
| Creatives grid view + URL rename | DEV-6618 |
| Creative Detail drawer + full page | DEV-6619 |
| Creative Intel section (Library, Performance Review, Placeholders) | DEV-6620, DEV-6621 |
| Performance Review query | DEV-6625 |
| Attribution mode visual cue (header + column styling) | DEV-6615 |

### Configuration-Gated (1 capability — premium plan only)

| Capability | Entitlement key | What it unlocks |
|-----------|----------------|----------------|
| Creative tag management | `creativeTagManagement: true` | Ability to add, edit, rename, or remove creative tags beyond app defaults |

**Note:** Health score **display** and default creative tag **display** are always on for all tenants. Only the ability to **manage** creative tags is premium. Health score dimension weights are stored as server-side config (seeded defaults; not user-configurable in this phase).

### How entitlements work

**Storage:** `preference` table (existing), new rows only.

```sql
-- Seed when tenant upgrades to plan that includes creative tag management
INSERT INTO preference (_client_id, preference_name, preference_value, scope, assignee, is_active)
VALUES (
  :client_id,
  'ADPULSE_ENTITLEMENTS',
  '{"value": {"creativeTagManagement": true}}',
  'tenant',
  gen_random_uuid(),
  true
)
ON CONFLICT (_client_id, preference_name, scope) DO UPDATE
SET preference_value = EXCLUDED.preference_value;
```

**Backend service:**
```js
// src/services/entitlements.service.js
async function getTenantEntitlements(tenantId) {
  const pref = await Preference.findOne({
    where: { _client_id: tenantId, preference_name: 'ADPULSE_ENTITLEMENTS', scope: 'tenant' }
  });
  // Rule 3: absent row = no premium features, never throws
  return pref ? JSON.parse(pref.preference_value).value : {};
}
```

**Frontend hook:**
```js
const { creativeTagManagement } = useTenantEntitlements();

// Standard (always visible):
<FunnelScoreRow scores={scores} />   {/* Phase 1: 4-dim */}
{/* Phase 2 (after DEV-6623): <HealthScoreRow scores={scores} /> */}
<ConfidenceBar confidence={confidence} />
<TagBadge tags={defaultTags} />

// Premium only:
{creativeTagManagement && <TagEditor />}
```

---

## Attribution Mode — Visual Cues (New)

### The gap
When a user switches from Platform data-driven to Last Click or First Click, 7 new columns appear (NC/RC metrics + computed_roas) and the data changes fundamentally. Currently there is **no visual indication** that the user is viewing attributed data vs platform data. This creates confusion and risk of misinterpretation.

### Current column gate (existing code)
```js
const ATTRIBUTION_ONLY_COLUMNS = [
  "computed_roas",
  "nc_aov", "nc_cvr", "nc_roas",   // New Customer attributed
  "rc_aov", "rc_cvr", "rc_roas"    // Returning Customer attributed
];
// Hidden when: data-driven model OR SAAS_ATTRIBUTION_ENABLE flag off
// Shown when: last-click or first-click model selected
```

### Proposed visual treatment (DEV-6615 scope)

**1. Attribution mode banner**
When `last-click` or `first-click` is selected, display a slim, non-blocking notice bar directly below the filter row:

```
[ ⚡ Attributed View — Last Click Model ]
  Revenue and conversion metrics reflect last-touch attribution.
  New Customer (NC) and Returning Customer (RC) columns now visible.     [?]
```
- Subtle amber/teal background tone — distinct but not alarming
- Dismissable per session (not per page load)
- The `[?]` opens a tooltip explaining what attributed mode means in plain English

**2. Column header styling**
NC/RC metric columns (when visible) get a subtle group indicator:
- Light background colour on the column header cell (e.g. amber-50 tint)
- Small attribution icon (⚡ or similar) prefix on `nc_*` and `rc_*` headers
- Tooltip on hover: "New Customer — attributed via Last Click model"

**3. Section title update**
The table section header updates to reflect the active model:
- Default: `Ad Performance`
- Attributed: `Ad Performance · Last Click`

**4. Attribution model selector styling**
When attributed model is active, the attribution filter chip gets a subtle coloured outline to indicate "active non-default mode".

**Applies to:** Ads, Ad Sets, Campaigns, Landing Pages tabs (wherever `ATTRIBUTION_ONLY_COLUMNS` can appear).
**Not applicable to:** Channels tab (data-driven is disabled there; Last Click is the default).

---

## Execution Order (Updated)

Health score component work and sparkline component work are pulled into DEV-6615 as parallel frontend build items. The backend query (DEV-6623) is still blocked by the BQ audit (DEV-6622), but the frontend components are ready and wired before the backend lands.

```
Start immediately (no blockers):
  DEV-6615  Frontend foundation + Channels tab
            ↳ includes: ScoreRing, HealthScoreRow, Sparkline components
            ↳ includes: Attribution mode banner + column styling
            ↳ Health score display uses existing z-score grade until DEV-6623 lands
  DEV-6622  BigQuery schema audit
  DEV-6624  creative_label_assignments DDL + API (default tags always on)

After DEV-6615 (all parallel):
  DEV-6616  Campaigns tab
  DEV-6617  Ad Sets + Landing Pages
  DEV-6618  Creatives tab (rename + grid + tags)

After DEV-6618:
  DEV-6619  Creative Detail drawer + full page

After DEV-6619:
  DEV-6620  Creative Intel — Library + Performance Review

After DEV-6620:
  DEV-6621  Creative Intel — Placeholders

After DEV-6622:
  DEV-6623  6-Dim Health Score backend + Sparklines endpoint
            ↳ Frontend already wired from DEV-6615 — slots in real data

After DEV-6623:
  DEV-6625  Performance Review BigQuery query
  DEV-6626  A/B test infrastructure (normalized vs raw rank)

After DEV-6625:
  DEV-6627  Creative Intelligence AI summary
```

---

## Dependency Map

```
DEV-6615 ──blocks──► DEV-6616
         ──blocks──► DEV-6617
         ──blocks──► DEV-6618 ──blocks──► DEV-6619 ──blocks──► DEV-6620 ──blocks──► DEV-6621

DEV-6622 ──blocks──► DEV-6623 ──blocks──► DEV-6625

DEV-6624 ──relates──► DEV-6618   (labels API feeds Creatives tab — graceful degradation)
DEV-6623 ──relates──► DEV-6615   (real health scores slot into already-wired components)
DEV-6625 ──relates──► DEV-6620   (performance review query feeds Creative Intel — graceful degradation)

DEV-6623 ──blocks──► DEV-6626   (A/B test requires scoring to be live)
DEV-6625 ──blocks──► DEV-6627   (Creative Intelligence requires performance review data)
```

---

## Stage 1 — Analyze Section

---

### DEV-6615 · 1A + 1B: Shared Component Library + Channels Tab

#### Value to Users
Marketers can **instantly see which channels are winning or underperforming** through visual grade badges and trend sparklines — without building custom reports. The updated Channels view makes it obvious at a glance where to scale budget and where to pull back, replacing manual data interpretation with clear visual signals.

#### Stage 1A — Shared Component Library

Build in `insights-dashboard/src/components/analytics/component-library/`:

| Component | Description |
|-----------|-------------|
| `ScoreRing` | Circular SVG ring, 0–100 score, colour-coded: green ≥80, lime ≥60, amber ≥40, red <40 |
| `GradeBadge` | Pill badge A/B/C/D with colour coding |
| `Sparkline` | Mini trend line — time range mirrors date picker selection; Recharts LineChart |
| `TagBadge` | Coloured pill for creative taxonomy labels |
| `StatusBadge` | Scaling / Active / Declining / Testing / Paused chip |
| `ViewToggle` | Table ↔ Grid icon button pair |
| `FunnelScoreRow` | **Phase 1** — 4 ScoreRings inline: Hook, Watch (video-only / N/A for static ads), Click, Convert. Uses existing z-score until DEV-6623 delivers real per-dimension scores. |
| `HealthScoreRow` | **Phase 2** — 6 ScoreRings inline (adds Reach + Signals rings after DEV-6622 confirms field availability). Replaces FunnelScoreRow once Stage 3B is complete. |
| `ConfidenceBar` | Data confidence bar (0.0 → 1.0) shown per creative. All thresholds config-driven (not hardcoded). |
| `CreativeStateFilter` | UI-only dropdown: All / Active / Scaling / Declining / Testing / Paused. Segments which creatives appear — does not enter ranking formula. Paused excluded from default view. |
| `CreativeTypeFilter` | UI-only dropdown: All / Video / Image / Carousel / UGC / Story. Segments which creatives appear — does not affect ranking. Default: All. |
| `AttributionModeBanner` | Slim notice bar shown when attributed model (last-click/first-click) is active |

No Unleash flags. All components ship as standard. `FunnelScoreRow` is always rendered (Phase 1 — uses existing z-score grade until DEV-6623 delivers real per-dimension scores).

**Note:** Do NOT introduce proxy numeric scores (A=85 etc.). Use the live composite z-score output from the existing `q_ad_performance.yml` query directly. `FunnelScoreRow` will display this value as-is until Stage 3B replaces it with true dimension scores.

Also build: attribution mode visual cue components (see Attribution section above).

#### Stage 1B — Channels Tab Enhancement

Preserve all existing logic: attribution model, date range, store selection, download, Revenue Distribution sidebar, line/bar chart toggle, existing table columns.

**Chart:**
- Keep existing column and area chart types
- Remove scatter chart — not needed
- No bubble chart

**KPI summary bar:**
- Default: Total Spend, Total Revenue, Blended ROAS
- Design the component to accept a configurable metric list from day 1 (Rule 4 — Progressive Exposure)
- Future: user-selectable KPIs from a dropdown matching the chart metric selector

**Column picker:**
- Use the **existing "view" button** — do not introduce a new control
- Update the view button UI to reflect the latest prototype styling
- Toggle visibility of: CTR, CPC, CPM, Clicks, Impressions, CVR

**Sparklines:**
- One sparkline per channel row, showing the trend for the selected primary metric
- Time range = mirrors the global date picker selection (not a fixed 14-day default)
- Graceful degradation: shows skeleton if sparkline endpoint unavailable

**Other additions:**
- Filter pills — Winners / BAU / Iteration Needed / All (existing pattern)
- GradeBadge replacing plain text grade label
- Attribution mode banner + column styling (when last-click/first-click active)

---

### DEV-6616 · 1C: Campaigns Tab

#### Value to Users
Campaign managers can instantly identify **which campaigns deserve more budget and which should be paused** — using the same grade, status, and trend signals as Channels. No custom reporting needed.

Same pattern as Channels: GradeBadge, StatusBadge, HealthScoreRow (existing grade), Sparkline (mirrors date picker). No new data fields required.

---

### DEV-6617 · 1D + 1E: Ad Sets & Landing Pages

#### Value to Users
**Ad Sets:** Audience targeting decisions become faster — see which ad set combinations are driving results and which drain budget, with the same visual grading system.

**Landing Pages:** Surface which destination URLs are converting and which need UX work, without leaving the dashboard.

- Ad Sets: full grade/score/sparkline pattern; attribution visual cue applies
- Landing Pages: grade and status only (insufficient signal for full health score rings)

---

### DEV-6618 · 1F: Creatives Tab

#### Value to Users
Creative teams can **see all their ads visually in a grid**, instantly spotting top performers vs poor performers without scrolling through tables. Default tags make it easy to filter by hook type or visual style to identify winning creative patterns — available to everyone, not just premium users.

**Changes:**
- Rename URL slug `/ads` → `/creatives`; redirect old URL for backward compatibility
- ViewToggle: table ↔ grid card view (standard, always on)
- Grid card: thumbnail, name, platform badge, GradeBadge, StatusBadge, key metric chips (Spend, ROAS, Revenue), default TagBadge list
- TagBadge in table view: shows default/app-assigned tags always; tag editing shown only if `creativeTagManagement` entitlement
- **Creative State filter** (`CreativeStateFilter`): UI-only dropdown — All / Active / Scaling / Declining / Testing / Paused. Filters which creatives appear; does not enter the ranking formula. Paused excluded from default view. Filter state persists within session; resets on logout.
- **Creative Type filter** (`CreativeTypeFilter`): UI-only dropdown — All / Video / Image / Carousel / UGC / Story. Filters which creatives appear; does not affect ranking. Default: All. Filter state persists within session; resets on logout.
- Row/card click → opens CreativeDetailDrawer (DEV-6619)

---

### DEV-6619 · 1G: Creative Detail Drawer + Full Page

#### Value to Users
For the first time, marketers can **click into any creative and see its full performance story** — from trend over time to creative classification — without leaving the dashboard or exporting to a spreadsheet.

**Drawer** (slide-in, no route change):
- Thumbnail, ad name, platform, format
- GradeBadge + StatusBadge
- FunnelScoreRow (Phase 1 — 4 dims using existing z-score grade; Phase 2: replaced by HealthScoreRow with 6 dims after DEV-6623 lands)
- Key metrics: Spend, Revenue, ROAS, CTR, CPA, Orders
- Default TagBadge row; tag editing control shown only if `creativeTagManagement` entitlement
- `recommended_action` chip
- "View Full Details →" → `/analyze/creatives/:id`

**Full page** (`/analyze/creatives/:id`):
- 30-day performance chart (metric selector mirrors date picker range)
- Full metrics table with column picker
- Tag display (always on); tag management (entitlement-gated)
- Breadcrumb: Analyze > Creatives > [Ad Name]

**Fail-safes (Rule 3 + Rule 5):**
- Ad not found → "We couldn't find this creative." + back to Creatives
- Labels unavailable → show creative without tags, no error shown
- Chart data unavailable → hide chart section only; table loads normally

---

## Stage 2 — Creative Intel Section

---

### DEV-6620 · 2A + 2B: Creative Library + Performance Review

#### Value to Users
Creative Intel gives the **creative team their own dedicated workspace** — a living leaderboard of what's working, updated automatically, replacing manual spreadsheet-based creative review processes.

**Creative Library (`/creative-intel/library`):**
- Reuses Creatives tab component as-is via shared component; route alias only
- Same data, same filters, same grid/list toggle, same tags
- Breadcrumb: Creative Intel > Creative Library

**Performance Review (`/creative-intel/performance-review`):**
- Summary KPI row: A-Grade count, Avg Score, Best ROAS, Scaling count
- Average health score row across all creatives (6 ScoreRings)
- Weekly tabs: Weekly Leadership | Scaling | Winners | Needs Attention
- Leaderboard: rank # + rank delta, thumbnail, GradeBadge, StatusBadge, FunnelScoreRow (Phase 1) → HealthScoreRow (Phase 2), composite score 0–100 (visible in leadership table), ConfidenceBar, key metrics, TagBadge row, row click → drawer
- Backend dependency: performance review query (DEV-6625); graceful degradation with "Data loading" skeleton if endpoint unavailable
- Designed as a **configurable module** (Rule 4): future sections (e.g. personalised views) register in a section config without new code paths

---

### DEV-6621 · 2C + 2D: Placeholders

#### Value to Users
Sets the stage for upcoming AI-powered capabilities. Teams can see what's being built and start thinking about how they'd use it — building anticipation for the roadmap.

- Comparative Analysis → "Coming soon" placeholder card
- AI Copilot → "Coming soon" placeholder card

---

## Stage 3 — Backend Infrastructure

---

### DEV-6622 · 3A: BigQuery Schema Audit

#### Value to Users
Ensures health scores are built on **verified, reliable data**. Users receive signals they can trust, not estimates based on whatever happens to be available.

Script: `C:\Users\savaa\Desktop\DEV-6622_bq_schema_audit.sql`
Run against `otb-dev-platform` / dataset `master`. Document all findings in DEV-6623 before Stage 3B begins.

**Fields under audit:**

**Phase 1 — required for 4-dim FunnelScoreRow:**

| Dimension | Fields |
|-----------|--------|
| Hook | `total_threesec_video_views`, `total_video_views` |
| Watch | `total_thruplay_video_views`, `total_video_15s_views` *(thruplay-based; video creatives only — N/A for static)* |
| Click | `ad_click`, `ctr`, `link_click` |
| Convert | `gross_sales`, `total_orders`, `spend`, `ROAS`, `CPA` |

**Phase 2 — required for full 6-dim HealthScoreRow (audit after Phase 1 is live):**

| Dimension | Fields |
|-----------|--------|
| Reach | `reach`, `frequency`, `total_ad_impression` |
| Signals | `engagement`, `post_engagement`, `shares`, `link_shares`, `saves`, `post_saves`, `comments`, `likes` |

**Gate check fields (new — required for confidence scoring, state detection, and badge system):**

| Purpose | Fields |
|---------|--------|
| Budget cap detection | `budget_daily`, `days_at_cap` |
| Ad lifecycle / learning gate | `ad_age_days` |
| PAUSED state detection | `platform_delivery_status` |
| Spend trajectory (WoW) | `spend_daily_7d`, `spend_daily_prev7d` |
| Carousel engagement | `swipe_rate` |

---

### DEV-6623 · 3B + 3C: 6-Dim Health Score Backend + Sparklines Endpoint

#### Value to Users
Instead of one opaque composite grade, marketers can now see **exactly why a creative is performing or failing** across 6 dimensions. Is it winning on Hook (thumb-stop) but losing on Convert? That targeted insight tells the creative team precisely what to fix — not just that something is wrong.

*(Blocked by DEV-6622 — frontend components already built in DEV-6615)*

**Health score formula — phased rollout:**

**Phase 1 — FunnelScoreRow (4 visible dimensions, from DEV-6615):**
```
overallScore = Hook(w1) + Watch(w2) + Click(w3) + Convert(w4)

// All weights (w1–w4) are config-driven — stored in preference table as SCORING_CONFIG key.
// Not hardcoded. Seeded defaults: Hook=20%, Watch=20%, Click=20%, Convert=40%
// Watch applies to Video creatives only. Renders as N/A for Image / Carousel.
// Scoring window: mirrors global date picker selection (not a fixed rolling window).
// Z-score normalization: same approach as current Analyze tab z-score (not prototype z-score approach).
```

**Phase 2 — HealthScoreRow (full 6 dimensions, after DEV-6622 confirms Reach + Signals field availability):**
```
overallScore = Hook(w1) + Watch(w2) + Click(w3) + Convert(w4) + Reach(w5) + Signals(w6)

// All 6 weights config-driven. Seeded defaults: Reach=10%, Signals=15% (Hook/Watch/Click/Convert adjust proportionally)
```

**Watch dimension definition:**
- Field: `total_thruplay_video_views` (thruplay completion metric — not quartile-based)
- Applies to: Video creatives only. Null / N/A for Image and Carousel.

**Composite score visibility:** Shown in the Performance Review leaderboard table. Not shown in per-creative cards or drawer summary view.

**Thresholds (all config-driven — not hardcoded; stored in SCORING_CONFIG preference row):**
```
Grade:   A ≥ grade_a  (default: 80) | B ≥ grade_b  (default: 60)
         C ≥ grade_c  (default: 40) | D < grade_c

Status:  Scaling  ≥ scaling_threshold   (default: 70)
         Active   ≥ active_threshold    (default: 50)  [score≥scaling with flat trajectory also lands here]
         Declining ≥ declining_threshold (default: 35) [score 35–49 with negative trajectory]
         Testing  < declining_threshold (default: 35)  [score 35–49 with flat/positive trajectory]
         Paused   — not score-driven; set by platform_delivery_status = 'paused'
```

**Gating:** Health score display is standard for all tenants. Dimension weights are stored as server-side config (seeded defaults); user-facing configuration is out of scope for this integration phase.

**Badge system (all thresholds config-driven — not hardcoded):**

| Badge | Trigger | Placement |
|-------|---------|-----------|
| `LEARNING` | `ad_age_days < learning_age_thresh` (default: 7) OR `conversions < learning_conv_thresh` (default: 50) | Separate Learning cohort UI section |
| `BUDGET_LIMITED` | `days_at_cap >= cap_days_thresh` (default: 3) | Alongside rank in main table |
| `LOW_SPEND` | confidence below low_spend_thresh (default: 0.5) | Alongside rank in main table |
| `STATISTICALLY_CONFIDENT` | confidence ≥ confident_thresh (default: 0.85) + no negative flags | Alongside rank in main table |

Max 2 badges per creative. Priority order: BUDGET_LIMITED > LEARNING > LOW_SPEND > STATISTICALLY_CONFIDENT.

**Badge tooltip education (Stage 3B scope):** Each badge shows a one-line tooltip on hover explaining the trigger condition and suggested action. Tooltip copy is config-driven.

**Declining alert:** When a configurable number of creatives (default: 2+) transition from Active/Scaling to Declining state, a proactive alert banner surfaces above the ranking table. Alert frequency and threshold are config-driven (not hardcoded).

**Fallback rules for ABSENT BQ fields:**
- `COALESCE(0)` in formula
- `scores_estimated: true` in API response for that dimension
- Google PMax → estimated Hook/Watch/Reach
- Pinterest / Snap / LinkedIn → estimated Signals

**Sparklines endpoint:**
- New registry query: `q_sparklines.yml`
- Route: `acquisition/sparklines`
- Params: entity_type, entity_id, metric, date range (mirrors frontend date picker)
- Returns: `[{ date: 'YYYY-MM-DD', value: number }]`
- Standard delivery — no entitlement gate

---

### DEV-6624 · 3D: creative_label_assignments DDL + API

#### Value to Users
Tagging creatives by hook type, visual style, and tone turns **raw ad performance data into a learning system**. Teams can finally answer "what creative formula is working for us?" rather than guessing. Default tags are available to everyone — the ability to manage and expand the taxonomy is available to premium users.

*(No blockers — can start immediately)*

**Two-tier tag model:**
- **Tier 1 (all tenants):** App-assigned default tags from seeded taxonomy. Display only. No management UI.
- **Tier 2 (premium: `creativeTagManagement: true`):** Full tag editing — add, rename, remove tags; extend vocabulary; approve AI-suggested tags.

**New Postgres table:**
```sql
CREATE TABLE creative_label_assignments (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id             VARCHAR     NOT NULL,
    tenant_id         VARCHAR     NOT NULL,
    label_id          UUID        NOT NULL REFERENCES labels(id),
    source            VARCHAR     NOT NULL DEFAULT 'manual',
    status            VARCHAR     NOT NULL DEFAULT 'approved',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ,
    approved_at       TIMESTAMPTZ,
    created_by        VARCHAR     NOT NULL,
    updated_by        VARCHAR,
    approved_by       VARCHAR,
    UNIQUE (ad_id, tenant_id, label_id)
);
```

**Progressive exposure APIs (Rule 4):**

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/v1/creatives/labels?ad_ids=...` | All tenants | Batch fetch approved tags |
| `POST` | `/v1/creatives/:ad_id/labels` | Premium only | Assign a label |
| `PATCH` | `/v1/creatives/:ad_id/labels/:id` | Premium only | Approve / reject |
| `GET` | `/v1/labels?category=:category` | All tenants | Taxonomy vocabulary |
| `POST` | `/v1/labels` | Premium only | Add new tag vocabulary option |

---

### DEV-6625 · 3E: Performance Review BigQuery Query

#### Value to Users
Performance Review **automatically surfaces which creatives climbed the leaderboard and which fell** — every week. Creative teams spend time acting on insights instead of building reports.

*(Blocked by DEV-6623)*

New registry query: `q_creative_performance_review.yml`
- Top N / Bottom N creatives by composite score over selectable date range
- Period-over-period delta: spend, ROAS, CTR, health score, rank delta
- Standard delivery — all tenants once deployed

---

## Data Layer — New vs Existing

| Data | Source | Status |
|------|--------|--------|
| spend, CTR, ROAS, CVR, CPA | `q_ad_performance.yml` | Exists |
| composite z-score grade (A/B/C/D) | `q_ad_performance.yml` | Exists — used for health display until DEV-6623 |
| thumbstop_rate, hold_rate | `q_ad_performance.yml` | Exists |
| recommended_action, ad_rank | `q_ad_performance.yml` | Exists |
| total_thruplay_video_views, total_video_15s_views | `northstar_master_combined_TBS` | Audit needed — DEV-6622 Phase 1 (Watch dim) |
| budget_daily, days_at_cap | `northstar_master_combined_TBS` | Audit needed — DEV-6622 (budget cap detection) |
| ad_age_days | `northstar_master_combined_TBS` | Audit needed — DEV-6622 (learning gate) |
| platform_delivery_status | `northstar_master_combined_TBS` | Audit needed — DEV-6622 (PAUSED state) |
| spend_daily_7d, spend_daily_prev7d | `northstar_master_combined_TBS` | Audit needed — DEV-6622 (WoW trajectory) |
| swipe_rate | `northstar_master_combined_TBS` | Audit needed — DEV-6622 (Carousel engagement) |
| reach, frequency, total_ad_impression | `northstar_master_combined_TBS` | Audit needed — DEV-6622 Phase 2 (Reach dim) |
| engagement, shares, saves, comments, likes | `northstar_master_combined_TBS` | Audit needed — DEV-6622 Phase 2 (Signals dim) |
| 4-dim funnel scores (Phase 1) | new BQ computation | New — DEV-6623, standard display, config-driven weights |
| 6-dim health scores (Phase 2) | new BQ computation | New — DEV-6623, standard display, after Reach+Signals confirmed |
| scoring-config (dimension weights) | preference table (SCORING_CONFIG key) | New rows — DEV-6623, server-side config only |
| sparkline time series (mirrors date picker) | new registry query | New — DEV-6623, standard delivery |
| creative taxonomy tags (default) | `creative_label_assignments` (seeded) | New table — DEV-6624, display always on |
| creative tag management | `creative_label_assignments` (user-edited) | New table — DEV-6624, management is premium |
| period-over-period performance | new registry query | New — DEV-6625, standard delivery |

---

## Postgres Table Changes

| Table | Action | Reason |
|-------|--------|--------|
| `labels` | Reuse, new rows only | Taxonomy vocabulary, no schema change |
| `preference` | Reuse, new rows only | `ADPULSE_ENTITLEMENTS` (entitlement keys) + `SCORING_CONFIG` (health score weights — config-driven, server-side only in this phase) per tenant |
| `creative_label_assignments` | **Create new** | 2NF violation if ad_id added to labels |

---

## Enablement Summary

```
Before:  9 Unleash feature flags
After:   0 Unleash flags

Standard delivery (all tenants):
  Health score display — Phase 1: FunnelScoreRow (4 dims, existing z-score)
                         Phase 2: HealthScoreRow (6 dims, real scores after DEV-6623)
  ConfidenceBar per creative (thresholds config-driven)
  Badge system with tooltip education (LEARNING, BUDGET_LIMITED, LOW_SPEND, STATISTICALLY_CONFIDENT)
  Creative State filter + Creative Type filter (UI-only, Creatives tab)
  Default creative tag display
  Attribution mode visual cues
  All Analyze tab enhancements (Channels, Campaigns, Ad Sets, Creatives, Pages)
  Creative Intel section (Library, Performance Review, Placeholders)
  Sparklines (mirrors date picker), grade badges, status badges

Configuration-gated (premium plan):
  creativeTagManagement   — ability to add, edit, manage creative tags
```

---

## Impact on Existing Roadmap

The changes introduced by DEV-6614 (new BQ fields, phased health score system, component library, Creative Intel section) increase the scope of work on shared infrastructure and UI layers. As a result, the following epics are pushed to later buckets:

| Ticket | Title | Reason for Deferral |
|--------|-------|---------------------|
| DEV-6519 | CS-Analyze-Tab: Conversion + MTA: Multi-Touch Attribution Foundations | Shared Analyze tab infrastructure is being reworked by DEV-6614 Stages 1–3. MTA foundations should land after the component library and Creative Intel section are stable to avoid merge conflicts and rework. |
| DEV-6520 | CS-Analyze-Tab: Backlogged + Spillover Bucket for Acquisition/Conversions/MTA | Spillover items dependent on the same Analyze tab and acquisition data layer. Deferred until DEV-6614 Stages 1–2 are delivered and the foundation is settled. |

These tickets remain open in Jira. No scope changes to the tickets themselves — deferral is timeline only.

---

## Stage 4 — Confidence + Experimentation

---

### DEV-6626 · 4A: A/B Test Infrastructure (Normalized vs Raw Rank)

#### Value to Users
Validates whether the normalized leaderboard (composite score + badges) actually helps founders make better, faster decisions — before fully committing to the model. Ensures the experience is improved by data, not assumption.

*(Blocked by DEV-6623)*

**Experiment design:**
- Split: configurable % of users see normalized rank vs raw rank (default split: config-driven, not hardcoded)
- Primary metric: time-to-decision on creative pause/scale action
- Secondary metric: NPS
- Minimum run duration and required sample size: config-driven; pre-calculated at experiment design time
- A/B test result gates Stage 4 promotion — if normalized rank does not improve time-to-decision, revert to raw rank with badges only

**Infrastructure:**
- Experiment assignment stored in preference table (new `AB_TEST_CONFIG` key per tenant/user)
- Experiment results tracked via existing analytics event pipeline
- All experiment parameters (split %, min duration, decision metric threshold) are config-driven

---

### DEV-6627 · 4B: Creative Intelligence AI Summary

#### Value to Users
Founders get a one-sentence, plain-English insight per top-ranked creative — "Best ROAS in your account for 14 days" — without needing to read metrics tables. Makes the leaderboard immediately actionable.

*(Blocked by DEV-6625)*

**Scope:**
- Auto-generated 1-sentence insight per top-ranked creative (configurable: TOP tier only, or configurable top-N)
- Insight template and trigger conditions are config-driven (not hardcoded)
- Examples: "Best ROAS in your account for 14 days" | "Highest hook rate this week" | "Declining — spend down 30% WoW"
- Rendered inline in Performance Review leaderboard and Creative Detail full page

---

## Stage 5 — Acquisition Dashboard Alerts

> **Status: Not planned. Separate planning session required.**

**Next epic:** Proactive alerting system for the Acquisition Dashboard — surfacing performance signals to users as actionable notifications (in-app, email, or other channels) rather than requiring users to log in and check.

**Scope note:** This stage builds directly on the health score system, Creative State transitions, and badge signals introduced in Stages 1–4. The alert rules and thresholds from the badge system (DECLINING state transitions, BUDGET_LIMITED flags, etc.) are natural candidates for alert trigger conditions.

No ticket created. No detailed planning in this document. Raise a separate planning session after Stage 4 is underway.

---

## Key Source Files

| File | Purpose |
|------|---------|
| `insights-dashboard/src/screens/AnalyzeScreen.jsx` | Main Analyze section, tab routing, attribution model filter config |
| `insights-dashboard/src/components/analytics/AcquisitionAnalysisContent.jsx` | Tab container, `ATTRIBUTION_ONLY_COLUMNS` gate |
| `insights-dashboard/src/components/analytics/component-library/columns/registry/columnRegistry.js` | All column definitions |
| `saas-backend/src/registry/registries/acquisition/queries/q_ad_performance.yml` | Main ad performance registry query |
| `saas-backend/src/registry/registries/acquisition/variables/common.yml` | Query variable definitions |
| `saas-backend/src/config/supermetrics/fieldTemplates.config.js` | Supermetrics field mappings per platform |
| `saas-backend/src/models/postgres/labels/labels.model.js` | Labels taxonomy model |
| `saas-backend/src/models/postgres/preference/preference.model.js` | Preference / entitlements model |
| `insights-dashboard/src/constants/attributionModelConstants.js` | Attribution model values + ATTRIBUTION_MODELS array |

---

> **Status: Planning phase — no branches created. Awaiting approval to begin DEV-6615.**
>
> Scripts outside repo: `C:\Users\savaa\Desktop\DEV-6622_bq_schema_audit.sql`
>
> Stage 4 tickets (DEV-6626, DEV-6627) to be created in Jira before Stage 3 completes.
>
> DEV-6519 and DEV-6520 deferred to later buckets — see Impact on Existing Roadmap section.
