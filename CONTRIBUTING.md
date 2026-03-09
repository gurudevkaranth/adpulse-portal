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

6. `development` auto-deploys to QA at `qa.adwatch.app.outoftheblue.ai`.

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
| QA | `qa.adwatch.app.outoftheblue.ai` | Push to `development` |
| Prod | `adwatch.app.outoftheblue.ai` | Push to `main` |

CI/CD is handled by GitHub Actions → Cloud Run (GCP).
