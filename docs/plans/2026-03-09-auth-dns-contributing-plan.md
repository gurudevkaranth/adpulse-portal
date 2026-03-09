# Auth Decoupling, DNS & Contributing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decouple auth from mock data (always use real OAuth), set up custom DNS domains, fix CI/CD, and create a contributing guide.

**Architecture:** Auth always goes through the backend OAuth flow. `VITE_USE_MOCK_DATA` only controls whether data hooks return mock or real API data. DNS via Cloudflare CNAME to Cloud Run domain mappings. CI/CD builds with correct env per environment.

**Tech Stack:** React 19, Vite 7, Axios, Cloud Run, Cloudflare DNS, GitHub Actions

**Design doc:** `docs/plans/2026-03-09-auth-dns-contributing-design.md`

---

## Agent Assignment

| Agent | Role | Branch | Tasks |
|---|---|---|---|
| **Agent 1** | Auth + Env | `feat/real-auth` from `development` | Tasks 1-4 |
| **Agent 2** | CI/CD + DNS | `feat/cicd-dns` from `development` | Tasks 5-8 |
| **Agent 3** | Docs + Contributing | `feat/contributing` from `development` | Tasks 9-11 |

---

## Task 1: Remove mock auth bypass from AuthProvider

**Files:**
- Modify: `src/auth/AuthProvider.jsx`

**Step 1: Edit AuthProvider.jsx**

Remove the `VITE_USE_MOCK_DATA` check. Always call verify.

```jsx
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/v1/auth/verify');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isOTBStaff: user?.tenant_id === 'outoftheblue',
    isAgencyUser: user?.is_agency_user === true,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Step 2: Verify build passes**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/auth/AuthProvider.jsx
git commit -m "feat: always use real OAuth, remove mock auth bypass"
```

---

## Task 2: Simplify Login page

**Files:**
- Modify: `src/pages/Login.jsx`

**Step 1: Remove mock-mode auto-redirect logic**

The Login page currently redirects authenticated users away. Keep this behavior (it's correct for real auth) but remove any mock-specific code. The current code is already correct — `useAuth()` returns real auth state, and if authenticated, redirects away. No mock-specific logic to remove.

**Verify the Login page works correctly:**
- Unauthenticated → shows login form
- Authenticated → redirects to `/`
- OAuth buttons redirect to `{VITE_API_BASE_URL}/v1/auth/{provider}`

**Step 2: Commit (if any changes)**

```bash
git add src/pages/Login.jsx
git commit -m "feat: login page always uses real OAuth"
```

---

## Task 3: Update environment files

**Files:**
- Modify: `.env.development`
- Modify: `.env.qa`
- Modify: `.env.production`
- Modify: `.env.example`

**Step 1: Update all env files**

`.env.development`:
```
VITE_API_BASE_URL=https://qa.app.outoftheblue.ai
VITE_USE_MOCK_DATA=true
```

`.env.qa`:
```
VITE_API_BASE_URL=https://qa.app.outoftheblue.ai
VITE_USE_MOCK_DATA=false
```

`.env.production`:
```
VITE_API_BASE_URL=https://app.outoftheblue.ai
VITE_USE_MOCK_DATA=false
```

`.env.example`:
```
# Backend API base URL (no trailing slash)
VITE_API_BASE_URL=https://qa.app.outoftheblue.ai

# Use mock data for dashboard/API data (true/false)
# Auth always uses real OAuth regardless of this setting
VITE_USE_MOCK_DATA=true
```

**Step 2: Commit**

```bash
git add .env.development .env.qa .env.production .env.example
git commit -m "feat: update env files — auth always real, mock only for data"
```

---

## Task 4: Fix Dockerfile for per-environment builds

**Files:**
- Modify: `Dockerfile`

**Step 1: Update Dockerfile to accept build-time env overrides**

The Dockerfile currently reads `.env.production` (Vite production mode). For QA deploys, we need `.env.qa` values. The CI/CD workflow will write the correct `.env.production` before building.

Clean up the Dockerfile — remove the cache-bust comment, keep it simple:

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

**Step 2: Commit**

```bash
git add Dockerfile
git commit -m "chore: clean up Dockerfile"
```

---

## Task 5: Fix CI/CD workflow for per-environment env vars

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Update workflow**

The current workflow uses `--set-env-vars` which sets runtime env vars. But Vite bakes env vars at **build time**. The fix: write `.env.production` with the correct values before the Docker build runs.

```yaml
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
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
      - run: npm test -- --run
        if: hashFiles('vitest.config.*') != ''

  deploy-qa:
    needs: lint-typecheck-build
    if: github.ref == 'refs/heads/development' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - name: Set QA env vars for build
        run: |
          cat > .env.production << 'EOF'
          VITE_API_BASE_URL=https://qa.app.outoftheblue.ai
          VITE_USE_MOCK_DATA=false
          EOF
      - run: |
          gcloud run deploy adpulse-web-qa \
            --source=. \
            --region=us-central1 \
            --project=otb-dev-platform \
            --allow-unauthenticated \
            --port=8080

  deploy-prod:
    needs: lint-typecheck-build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - name: Ensure prod env vars for build
        run: |
          cat > .env.production << 'EOF'
          VITE_API_BASE_URL=https://app.outoftheblue.ai
          VITE_USE_MOCK_DATA=false
          EOF
      - run: |
          gcloud run deploy adpulse-web \
            --source=. \
            --region=us-central1 \
            --project=otb-dev-platform \
            --allow-unauthenticated \
            --port=8080
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "fix: CI/CD writes env vars at build time, not runtime"
```

---

## Task 6: Set up Cloud Run domain mappings

**Step 1: Create domain mappings**

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

**Step 2: Note the CNAME target from the output**

The command will confirm `ghs.googlehosted.com` as the CNAME target.

---

## Task 7: Set up Cloudflare DNS records

**Step 1: Add CNAME records in Cloudflare**

Using Cloudflare API or dashboard:

```
adpulse.app.outoftheblue.ai      CNAME  ghs.googlehosted.com  (DNS only, proxy OFF)
qa.adpulse.app.outoftheblue.ai   CNAME  ghs.googlehosted.com  (DNS only, proxy OFF)
```

**Important:** Proxy must be OFF (grey cloud icon) — Cloud Run provides TLS via Google-managed certificates. Cloudflare proxy would break the certificate validation.

**Step 2: Verify DNS propagation**

```bash
dig adpulse.app.outoftheblue.ai CNAME +short
# Expected: ghs.googlehosted.com.

dig qa.adpulse.app.outoftheblue.ai CNAME +short
# Expected: ghs.googlehosted.com.
```

**Step 3: Verify HTTPS works**

Wait 5-15 minutes for Google-managed certificate provisioning, then:

```bash
curl -s -o /dev/null -w "%{http_code}" https://adpulse.app.outoftheblue.ai
curl -s -o /dev/null -w "%{http_code}" https://qa.adpulse.app.outoftheblue.ai
```

---

## Task 8: Register OAuth redirect URIs

**Step 1: Add redirect URIs to the backend OAuth config**

The saas-backend needs these URLs registered as allowed OAuth redirect origins:
- `https://adpulse.app.outoftheblue.ai`
- `https://qa.adpulse.app.outoftheblue.ai`
- `http://localhost:5173`

This is a backend configuration change — check `saas-backend/src/config/` or environment variables for the OAuth callback whitelist. The Google OAuth console may also need updating with authorized redirect URIs.

**This is a manual step requiring coordination with the backend team / OAuth admin.**

---

## Task 9: Create CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

**Step 1: Write the contributing guide**

```markdown
# Contributing to AdPulse Portal

## Prerequisites

- **Node.js 20+** — Install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 20`
- **npm** — Comes with Node.js
- **Git** — For version control
- **GitHub CLI** — `brew install gh` then `gh auth login`

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/gurudevkaranth/adpulse-portal.git
   cd adpulse-portal
   ```

2. Set Node version:
   ```bash
   nvm use 20
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 — you'll be redirected to login (uses QA backend for auth). After logging in, the dashboard shows mock data.

## Branch Strategy

```
feature/your-feature  →  development (QA)  →  main (Prod)
```

- **`main`** — Production. Protected. Only accepts PRs from `development`.
- **`development`** — QA/staging. Accepts PRs from feature branches.
- **Feature branches** — Short-lived. Create from `development`, PR back to `development`.

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature
   ```

2. Make changes, commit frequently with clear messages.

3. Push and create a PR:
   ```bash
   git push -u origin feature/your-feature
   gh pr create --base development
   ```

4. CI runs automatically (lint, typecheck, build). Fix any failures.

5. Get review, then squash merge to `development`.

6. `development` auto-deploys to QA at `qa.adpulse.app.outoftheblue.ai`.

## Available Commands

```bash
nvm use 20              # Ensure correct Node version
npm run dev             # Dev server with HMR
npm run build           # Production build
npm run lint            # ESLint
npm run typecheck       # TypeScript check
npm run test            # Run tests
npm run test:watch      # Tests in watch mode
npm run preview         # Preview production build
```

## Environment Configuration

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL |
| `VITE_USE_MOCK_DATA` | `true` = mock dashboard data, `false` = real API data |

Auth always uses real OAuth (Google/Microsoft/Okta) regardless of `VITE_USE_MOCK_DATA`.

Local development uses `.env.development` which points to the QA backend for auth and uses mock data for the dashboard.

## Architecture Overview

- **React 19** + **Vite 7** + **Tailwind CSS 4** + **React Router 7**
- **TypeScript** for components, config, utils (`.tsx`/`.ts`)
- **JavaScript** for auth, API, hooks (`.jsx`/`.js`) — migration in progress
- **Auth**: Session cookies via OAuth → `AuthProvider` → `RequireAuth` guard
- **Data**: `useApiQuery` hook pattern with mock fallback
- **Tenant**: Multi-tenant via `TenantProvider` — OTB staff see all, others see own

## Adding a New API Endpoint

1. Add the fetch function in `src/api/endpoints.js`:
   ```js
   export function fetchMyData(filters, config) {
     return apiClient.get('/v1/analysis/acquisition/my-data', {
       params: buildParams(filters),
       ...config,
     });
   }
   ```

2. Add a mapper in `src/api/mappers.js` if the backend shape differs from frontend.

3. Create a hook in `src/hooks/useMyData.js`:
   ```js
   import { useApiQuery } from './useApiQuery';
   import { fetchMyData } from '../api/endpoints';
   import { generateMockData } from '../data/mockData';

   export function useMyData(filters) {
     const mockFn = () => generateMockData();
     const mapFn = (raw) => raw.items.map(mapBackendItem);
     return useApiQuery(fetchMyData, mockFn, mapFn, filters);
   }
   ```

4. Use in a component with null-safe fallback:
   ```jsx
   const myData = useMyData(filters);
   return <MyComponent data={myData.data || []} loading={myData.loading} />;
   ```

## Coding Conventions

- **Styling**: Tailwind utility classes only
- **Components**: Default exports, `.tsx` files
- **Utilities**: Named exports, `.ts` files
- **Hooks**: Named exports, `.js` files (migrating to `.ts`)
- **Formatting**: See `STYLE_GUIDE.md` for design system tokens

## Deployment

| Environment | URL | Trigger |
|---|---|---|
| Dev | `localhost:5173` | `npm run dev` |
| QA | `qa.adpulse.app.outoftheblue.ai` | Push to `development` |
| Prod | `adpulse.app.outoftheblue.ai` | Push to `main` |

CI/CD is handled by GitHub Actions → Cloud Run (GCP).
```

**Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add contributing guide for developers"
```

---

## Task 10: Update CLAUDE.md with final state

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update auth description**

Change the auth convention from mock-mode description to:
- Auth always uses real OAuth (no mock bypass)
- `VITE_USE_MOCK_DATA` only controls data source in hooks
- Local dev points to QA backend for auth

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md — auth always real, mock only for data"
```

---

## Task 11: Redeploy QA and Prod with real auth

**Step 1: Deploy QA**

```bash
cd ~/Work/dev/adpulse-portal
# Ensure .env.production has QA values for this deploy
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://qa.app.outoftheblue.ai
VITE_USE_MOCK_DATA=false
EOF

gcloud run deploy adpulse-web-qa \
  --source=. \
  --region=us-central1 \
  --project=otb-dev-platform \
  --allow-unauthenticated \
  --port=8080
```

**Step 2: Deploy Prod**

```bash
# Restore .env.production to prod values
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://app.outoftheblue.ai
VITE_USE_MOCK_DATA=false
EOF

gcloud run deploy adpulse-web \
  --source=. \
  --region=us-central1 \
  --project=otb-dev-platform \
  --allow-unauthenticated \
  --port=8080
```

**Step 3: Restore .env.production to committed state**

```bash
git checkout -- .env.production
```

**Step 4: Verify**

```bash
# Should redirect to login (real OAuth)
curl -s -o /dev/null -w "%{http_code}" https://adpulse-web-qa-zqlsaqunba-uc.a.run.app
# Expected: 200 (serves index.html, client-side redirect to /login)

# After logging in via Google OAuth, should see real data (or error if API not connected)
```

---

## Merge Order

1. Merge `feat/real-auth` → `development` (Agent 1)
2. Merge `feat/cicd-dns` → `development` (Agent 2)
3. Merge `feat/contributing` → `development` (Agent 3)
4. Push `development` → triggers CI/CD → auto-deploy to QA
5. Verify QA works with real auth
6. PR `development` → `main` → auto-deploy to Prod

---

## Verification Checklist

- [ ] Visiting app without session → redirects to `/login`
- [ ] Google OAuth login works → redirects back to dashboard
- [ ] `VITE_USE_MOCK_DATA=true` (local dev) → real auth, mock data
- [ ] `VITE_USE_MOCK_DATA=false` (QA/Prod) → real auth, real API data
- [ ] `https://qa.adpulse.app.outoftheblue.ai` resolves and loads app
- [ ] `https://adpulse.app.outoftheblue.ai` resolves and loads app
- [ ] Push to `development` triggers CI → QA deploy
- [ ] Push to `main` triggers CI → Prod deploy
- [ ] CONTRIBUTING.md is clear and complete
