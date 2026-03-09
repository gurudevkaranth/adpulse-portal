# Learnings & Issues Log

Issues encountered during development and deployment, with root causes and fixes.

---

## 1. Login page shown in mock mode

**Symptom:** App deployed with `VITE_USE_MOCK_DATA=true` but users still see the login page.

**Root cause:** The `/login` route is public (outside `RequireAuth`). `AuthProvider` sets a mock user, but the `Login` component never checked auth state to redirect authenticated users away.

**Fix:** Added auth check at top of `Login.jsx` — if already authenticated, redirect to `/` (or the page they came from).

```jsx
const { isAuthenticated, loading } = useAuth();
if (!loading && isAuthenticated) {
  return <Navigate to={from} replace />;
}
```

---

## 2. Vite env var precedence with .env.production

**Symptom:** Set `VITE_USE_MOCK_DATA=true` in `.env` but the deployed build still had `false`.

**Root cause:** `npm run build` runs in Vite's `production` mode, which reads `.env.production` with **higher priority** than `.env`. The `.env.production` file had `VITE_USE_MOCK_DATA=false`, overriding the `.env` value.

**Fix:** Edit `.env.production` directly. The `.env` file is not sufficient for production builds.

**Key insight:** Vite env file priority for `production` mode:
1. `.env.production.local`
2. `.env.production`
3. `.env.local`
4. `.env`

---

## 3. .dockerignore excludes env files

**Symptom:** `.env.production` changes not reflected in Cloud Run deploy.

**Root cause:** `.dockerignore` had `.env*` (exclude all) with `!.env.production` (re-include). This worked correctly, but combined with issue #2, the wrong values were baked in.

**Key insight:** Only `.env.production` is included in Docker builds. All other `.env*` files are excluded. When deploying, always verify `.env.production` has the correct values.

---

## 4. Cloud Build Docker layer caching

**Symptom:** Deployed new code but Cloud Run served stale JavaScript bundle (different hash than local build).

**Root cause:** Cloud Build cached the Docker layer from a previous `RUN npm run build`. Since the `COPY . .` layer didn't change (the `.env` file was excluded by `.dockerignore`), the build layer was reused with old output.

**Fix:** Added a cache-busting comment in the Dockerfile (`# Bust cache: <date>`) to invalidate the build layer. For a permanent solution, ensure that any file affecting the build output is not excluded by `.dockerignore`.

---

## 5. Null data on first render with useApiQuery hooks

**Symptom:** `Cannot read properties of null (reading 'channels')` error on Acquisition page Channels tab.

**Root cause:** `useApiQuery` initializes `data` as `null`. Even in mock mode, data is set via `useEffect` which runs **after** the first render. On the first render, `data` is still `null`. `ChannelsTab` accesses `channelChart.channels` without a null guard.

**Fix:** Always provide fallback values when passing hook data to components:
```jsx
// Bad — crashes if channels.data is null
<ChannelsTab channelChart={channels.data} />

// Good — safe fallback
<ChannelsTab channelChart={channels.data || { channels: [], data: [] }} />
```

**Pattern:** Every `useApiQuery` consumer must provide a null-safe fallback matching the expected data shape.

---

## 6. Git worktrees accidentally staged as submodules

**Symptom:** `git add -A` added `.claude/worktrees/*` as embedded git repositories (submodules).

**Root cause:** Worktree directories contain their own `.git` files. `git add -A` picks them up.

**Fix:** Added `.claude/worktrees/` to `.gitignore`. Always check for this after running `git add -A` in a repo with worktrees.

---

## 7. Node version mismatch

**Symptom:** `npm run build` fails with `You are using Node.js 18.20.3. Vite requires Node.js version 20.19+ or 22.12+`.

**Root cause:** Default `nvm` alias was set to Node 18. Vite 7, Vitest 4, and React Router 7 all require Node 20+.

**Fix:** `nvm use 20` before running any commands. Consider `nvm alias default 20` to make it permanent.

---

## 8. Push hook blocks on uncommitted beads files

**Symptom:** `git push` fails with "Uncommitted changes detected" error referencing beads JSONL files.

**Root cause:** Beads git hooks check for uncommitted changes before allowing push. Beads initialization creates staged files that need to be committed first.

**Fix:** Commit beads files before pushing: `git commit -m "chore: initialize beads"`. Running `bd sync` alone may not be sufficient if files are staged but uncommitted.

---

## 9. Nested Claude Code sessions blocked in tmux

**Symptom:** `claude --print` commands launched in tmux panes from within a Claude Code session fail with "Error: Claude Code cannot be launched inside another Claude Code session."

**Root cause:** The parent Claude Code session sets a `CLAUDECODE` environment variable. Child shells inherit it. Even with `unset CLAUDECODE`, the `claude` CLI may still detect the parent session via shared runtime resources.

**Fix:** Don't launch nested `claude` instances from within a Claude Code session. Instead, use **parallel subagents** (Agent tool) which run within the same process. Alternatively, launch tmux agents from a plain terminal (not from within Claude Code).

**Key insight:** Subagents can edit files but cannot run `git commit` (Bash denied). The parent session must handle commits for subagent work.

---

## 10. WIF deploy needs serviceUsageConsumer role

**Symptom:** `gcloud run deploy` in GitHub Actions fails with `PERMISSION_DENIED: Build failed because the default service account is missing required IAM permissions`.

**Root cause:** The service account used by WIF (`github-runner-sa`) was missing `roles/serviceusage.serviceUsageConsumer`. Cloud Build requires this to use project APIs.

**Fix:** Grant the full set of roles needed for `gcloud run deploy --source`:
- `roles/run.admin` (create/update Cloud Run services)
- `roles/cloudbuild.builds.editor` (trigger Cloud Build)
- `roles/artifactregistry.writer` (push container images)
- `roles/iam.serviceAccountUser` (act as runtime SA)
- `roles/storage.admin` (Cloud Build staging bucket)
- `roles/serviceusage.serviceUsageConsumer` (use project APIs)
