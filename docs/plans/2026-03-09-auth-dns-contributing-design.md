# Design: Auth Decoupling, DNS Setup & Contributing Guide

**Date:** 2026-03-09
**Status:** Approved

---

## Goals

1. Decouple authentication from mock data — OAuth always real, `VITE_USE_MOCK_DATA` only controls data source
2. Set up custom DNS domains via Cloudflare + Cloud Run domain mapping
3. Create contributing guide for multi-developer collaboration
4. Enable automatic CI/CD deploys to QA and Prod

## Decisions

| Question | Decision |
|---|---|
| Auth approach | Always real OAuth — no mock auth bypass |
| QA auth backend | Separate — `qa.app.outoftheblue.ai` handles QA auth |
| DNS provider | Cloudflare — CNAME to `ghs.googlehosted.com`, DNS-only mode |
| WIF secrets | Already configured in repo |

---

## 1. Auth Decoupling

### Current behavior
`VITE_USE_MOCK_DATA=true` bypasses auth entirely (sets stub user) AND returns mock data from hooks.

### New behavior
`VITE_USE_MOCK_DATA` only controls data source. Auth is always real OAuth via backend.

### Changes required

**`src/auth/AuthProvider.jsx`**
- Remove the `if (useMock)` branch that sets a stub user
- Always call `GET /v1/auth/verify`
- If 401 → `setUser(null)` → RequireAuth redirects to `/login`

**`src/tenant/TenantProvider.jsx`**
- Always resolve tenant from real user context
- OTB staff: fetch `/v1/tenants` for tenant list
- Agency users: resolve from `user.agencies[].brands[].tenant`
- Regular users: use `user.tenant_id`
- When mock data is on, tenant is still needed (for display) but data hooks return mock data

**`src/hooks/useApiQuery.js`**
- No changes — mock flag only controls data fetching

**`src/pages/Login.jsx`**
- Remove the auth check redirect for mock mode (no longer needed since auth is always real)
- Keep the redirect for already-authenticated users (real auth)

### Auth flow (all environments)
```
Visit app → AuthProvider calls /v1/auth/verify
  → 200: user authenticated, proceed to app
  → 401: redirect to /login
  → User clicks Google → redirect to backend OAuth
  → Backend sets session cookie → redirect back to app origin
  → AuthProvider re-verifies → authenticated
```

### Data flow (unchanged)
```
VITE_USE_MOCK_DATA=true  → useApiQuery calls mockFn() for data
VITE_USE_MOCK_DATA=false → useApiQuery calls real API endpoints
```

---

## 2. Environment Configuration

### Three environments

| Environment | App URL | API Backend | Mock Data | Deploy Trigger |
|---|---|---|---|---|
| Dev (local) | `localhost:5173` | `qa.app.outoftheblue.ai` | `true` | manual |
| QA | `qa.adpulse.app.outoftheblue.ai` | `qa.app.outoftheblue.ai` | `false` | push to `development` |
| Prod | `adpulse.app.outoftheblue.ai` | `app.outoftheblue.ai` | `false` | push to `main` |

### Env files

```
.env.development:  VITE_API_BASE_URL=https://qa.app.outoftheblue.ai  VITE_USE_MOCK_DATA=true
.env.qa:           VITE_API_BASE_URL=https://qa.app.outoftheblue.ai  VITE_USE_MOCK_DATA=false
.env.production:   VITE_API_BASE_URL=https://app.outoftheblue.ai     VITE_USE_MOCK_DATA=false
```

### OAuth redirect URIs (register in backend)
- `https://adpulse.app.outoftheblue.ai`
- `https://qa.adpulse.app.outoftheblue.ai`
- `http://localhost:5173`

---

## 3. DNS & Domain Mapping

### Cloudflare DNS records
```
adpulse.app.outoftheblue.ai      CNAME  ghs.googlehosted.com  (DNS only, no proxy)
qa.adpulse.app.outoftheblue.ai   CNAME  ghs.googlehosted.com  (DNS only, no proxy)
```

### Cloud Run domain mappings
```bash
gcloud beta run domain-mappings create \
  --service=adpulse-web \
  --domain=adpulse.app.outoftheblue.ai \
  --region=us-central1 \
  --project=otb-dev-platform

gcloud beta run domain-mappings create \
  --service=adpulse-web-qa \
  --domain=qa.adpulse.app.outoftheblue.ai \
  --region=us-central1 \
  --project=otb-dev-platform
```

Cloudflare proxy must be set to DNS-only (grey cloud) — Cloud Run provides its own TLS via Google-managed certificates.

---

## 4. CI/CD Activation

The GitHub Actions workflow at `.github/workflows/ci.yml` is already configured with:
- Lint + typecheck + build gate on all PRs
- Deploy to QA Cloud Run on push to `development`
- Deploy to Prod Cloud Run on push to `main`
- WIF secrets already in repo settings

### Changes needed
- Update CI workflow to set correct env vars at build time (the Dockerfile reads `.env.production`, so the CI deploy needs to ensure the right file is used per environment)
- For QA deploy: override with `.env.qa` values before build

---

## 5. Contributing Guide

**CONTRIBUTING.md** contents:
1. Prerequisites — Node 20+ (nvm), gcloud CLI, GitHub CLI
2. Getting started — Clone, nvm use 20, npm install, npm run dev
3. Branch strategy — feature/* → development → main
4. PR process — PR to development, CI gate, squash merge
5. Local dev — Real auth via QA backend, mock data for dashboard
6. Coding conventions — TSX, Tailwind, named exports for utils, defaults for components
7. Adding endpoints — useApiQuery pattern, mapper, null-safe fallbacks

### Repo protection rules (for repo admin)
- `main`: Require PR reviews + CI pass
- `development`: Require CI pass

---

## Implementation Summary

| Task | Scope |
|---|---|
| Auth decoupling | Modify AuthProvider, TenantProvider, Login page |
| Env file updates | Update .env.development, .env.qa, .env.production |
| DNS setup | Cloudflare CNAME records + Cloud Run domain mappings |
| CI/CD fixes | Update workflow for per-environment env vars |
| CONTRIBUTING.md | Create developer onboarding guide |
| Redeploy | Deploy QA and Prod with real auth + real data |
