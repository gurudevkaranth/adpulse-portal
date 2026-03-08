# Runbook: tmux + Agent Teams for AdPulse Implementation

> **Copy-paste ready.** Run each section in order. Steps 1-4 are prep (run once), Steps 5-8 are execution.

---

## Prerequisites

```bash
# Verify tools
claude --version          # Claude Code CLI
bd --version              # Beads issue tracker
tmux -V                   # tmux
gh auth status            # GitHub CLI (authenticated as jk-ootb)
```

---

## Step 1: Prepare branches

```bash
# adpulse-portal — already on development branch (local only)
cd ~/Work/dev/adpulse-portal
git checkout development

# saas-backend — create DEV-6636 from latest develop
cd ~/Work/dev/saas-backend
git checkout develop && git pull origin develop
git checkout -b DEV-6636
git push -u origin DEV-6636
```

---

## Step 2: Verify beads state

Beads were initialized in a prior session. Verify they're intact:

```bash
cd ~/Work/dev/adpulse-portal && bd stats && bd ready
cd ~/Work/dev/saas-backend && bd stats && bd ready
```

Expected: 5 ready tasks — `AP-ven`, `AP-3ow`, `AP-4gk`, `AP-dzr` (adpulse-portal) and `SB-79a` (saas-backend).

If beads are missing, re-initialize:
```bash
cd ~/Work/dev/adpulse-portal && bd init --prefix AP
cd ~/Work/dev/saas-backend && bd init --prefix SB
# Then re-create tasks — see main plan doc Step 3
```

---

## Step 3: Create git worktrees

Each adpulse-portal agent gets an isolated worktree so they don't conflict. saas-backend Agent 1 works directly on `DEV-6636`.

```bash
# adpulse-portal — 3 worktrees from development branch
cd ~/Work/dev/adpulse-portal
git worktree add .claude/worktrees/api-integration development -b feat/api-integration
git worktree add .claude/worktrees/ts-cicd development -b feat/ts-cicd
git worktree add .claude/worktrees/ui-polish development -b feat/ui-polish

# Verify
git worktree list
# Should show 4 entries: main repo + 3 worktrees

# saas-backend — no worktree, just ensure on DEV-6636
cd ~/Work/dev/saas-backend
git checkout DEV-6636
```

---

## Step 4: Create tmux session with 5 panes

```bash
# Create session
tmux new-session -d -s adpulse-impl -n agents

# Split into 5 panes (2 columns, left=3 rows, right=2 rows)
tmux split-window -h -t adpulse-impl:agents       # split vertically → left|right
tmux split-window -v -t adpulse-impl:agents.0      # split left top|bottom
tmux split-window -v -t adpulse-impl:agents.2      # split right top|bottom
tmux split-window -v -t adpulse-impl:agents.0      # split left-top into two

# Resulting layout (5 panes):
#
#   ┌─────────────────┬─────────────────┐
#   │ Pane 0           │ Pane 3          │
#   │ Agent 1: Backend │ Agent 3: TS+CI  │
#   ├─────────────────┤                  │
#   │ Pane 1           ├─────────────────┤
#   │ Agent 2: API+Auth│ Pane 4          │
#   ├─────────────────┤ Agent 5: Tests   │
#   │ Pane 2           │                  │
#   │ Agent 4: UI      │                  │
#   └─────────────────┴─────────────────┘
```

---

## Step 5: Launch agents — Wave 1 (immediate start)

Agents 1, 2, 3 have no blockers and start immediately. **Run all three commands now:**

### Pane 0 — Agent 1: Backend Scoring (saas-backend)

```bash
tmux send-keys -t adpulse-impl:agents.0 'cd ~/Work/dev/saas-backend && claude "You are Agent 1: Backend Scoring.

BRANCH: DEV-6636 (already checked out)
REPO: saas-backend

TASKS (in order):
1. Read CLAUDE.md for project conventions
2. Read the plan: ~/Work/dev/adpulse-portal/docs/plans/2026-03-08-adpulse-core-implementation.md — find section \"Epic A: Detailed Implementation Steps\"
3. Run: bd ready — to see your first task
4. For each task: bd update <id> --status=in_progress, implement, commit, bd close <id>
5. Follow registry patterns in src/registry/registries/acquisition/queries/q_ad_performance.yml
6. After all 6 tasks complete: git push origin DEV-6636

BEADS TASKS: SB-79a through SB-cir (6 tasks total)
KEY FILES:
- src/registry/registries/acquisition/routes.registry.yml
- src/registry/registries/acquisition/queries.registry.yml
- src/registry/registries/acquisition/filters.registry.yml
- src/registry/registries/acquisition/queries/ (create new YAMLs here)
- tests/registry-system/ (create tests here)
"' C-m
```

### Pane 1 — Agent 2: Frontend API + Auth (adpulse-portal)

```bash
tmux send-keys -t adpulse-impl:agents.1 'cd ~/Work/dev/adpulse-portal/.claude/worktrees/api-integration && claude "You are Agent 2: Frontend API + Auth.

BRANCH: feat/api-integration (worktree)
REPO: adpulse-portal

TASKS (in order):
1. Read CLAUDE.md and STYLE_GUIDE.md
2. Read the plan: ~/Work/dev/adpulse-portal/docs/plans/2026-03-08-adpulse-core-implementation.md — Epic B + Auth Implementation Details sections
3. Run: bd ready — to see your first task
4. For each task: bd update <id> --status=in_progress, implement, commit, bd close <id>

BEADS TASKS: AP-ven through AP-bgy (14 tasks)

AUTH DETAILS:
- Session cookies (withCredentials: true), OAuth via backend redirect
- GET /v1/auth/verify on mount → user profile + agencies
- Three user types: OTB staff (tenant_id=outoftheblue → all tenants), tenant users (own tenant), agency users (is_agency_user=true → linked brands)
- Reference patterns: ~/Work/dev/insights-dashboard/src/hooks/useAuthenticatedUser.js, useSelectedTenant.js, LoginScreen.jsx

FILES TO CREATE:
- src/auth/AuthProvider.jsx, useAuth.js, RequireAuth.jsx
- src/tenant/TenantProvider.jsx, useTenant.js, TenantPicker.jsx
- src/pages/Login.jsx
- src/api/client.js, endpoints.js, mappers.js
- src/hooks/useAds.js, useChannels.js, useCampaigns.js
"' C-m
```

### Pane 3 — Agent 3: TypeScript + CI/CD (adpulse-portal)

```bash
tmux send-keys -t adpulse-impl:agents.3 'cd ~/Work/dev/adpulse-portal/.claude/worktrees/ts-cicd && claude "You are Agent 3: TypeScript + CI/CD.

BRANCH: feat/ts-cicd (worktree)
REPO: adpulse-portal

TASKS (in order):
1. Read CLAUDE.md
2. Read the plan: ~/Work/dev/adpulse-portal/docs/plans/2026-03-08-adpulse-core-implementation.md — Epic C sections
3. Run: bd ready — to see your first task
4. For each task: bd update <id> --status=in_progress, implement, commit, bd close <id>

BEADS TASKS: AP-3ow through AP-1ud (9 tasks)

TYPESCRIPT TASKS (AP-15 to AP-20):
- Add tsconfig.json with allowJs: true, strict: true
- Create src/types/index.ts with Ad, Campaign, Channel, Score, Grade types
- Convert in waves: formatters+routes → shared components → layout → pages
- Rename .jsx → .tsx, add type annotations

CI/CD TASKS (AP-21 to AP-23):
- Dockerfile: multi-stage (node build → nginx serve)
- nginx.conf: SPA routing (try_files), gzip, cache headers
- GitHub Actions: lint+typecheck+build+test on PR, deploy on push
  - development branch → qa.adpulse.app.outoftheblue.ai (Cloud Run)
  - main branch → adpulse.app.outoftheblue.ai (Cloud Run)
- .dockerignore: node_modules, .git, docs, .beads
"' C-m
```

---

## Step 6: Launch agents — Wave 2 (blocked, start later)

Agents 4 and 5 are blocked by Agent 2's work (AP-14). **Launch them now** — they will poll beads for unblocking.

### Pane 2 — Agent 4: UI Polish (blocked by AP-14)

```bash
tmux send-keys -t adpulse-impl:agents.2 'cd ~/Work/dev/adpulse-portal/.claude/worktrees/ui-polish && claude "You are Agent 4: Staff UI Developer.

BRANCH: feat/ui-polish (worktree)
REPO: adpulse-portal

STATUS: Your tasks are BLOCKED by AP-bgy (loading skeletons + error boundary).

IMMEDIATE ACTIONS:
1. Read CLAUDE.md and STYLE_GUIDE.md
2. Read the plan: ~/Work/dev/adpulse-portal/docs/plans/2026-03-08-adpulse-core-implementation.md — Epic D
3. Check if unblocked: bd show AP-2o8
4. If still blocked, check every few minutes: bd show AP-bgy
5. While waiting, you CAN read and audit the existing UI code to prepare notes

WHEN UNBLOCKED:
1. bd update AP-2o8 --status=in_progress
2. Use the frontend-design skill (invoke via Skill tool) to audit existing UI
3. Polish login page, tenant selector, dashboard, acquisition, creative detail
4. Focus on production-grade UX: spacing, typography, hover states, transitions, responsive
5. Commit after each task, bd close <id>

BEADS TASKS: AP-2o8 through AP-9pr (4 tasks)
"' C-m
```

### Pane 4 — Agent 5: Bug Hunter (blocked by AP-14 and AP-28)

```bash
tmux send-keys -t adpulse-impl:agents.4 'cd ~/Work/dev/adpulse-portal && claude "You are Agent 5: Bug Hunter.

BRANCH: development (main repo, not a worktree)
REPO: adpulse-portal

STATUS: Most tasks are BLOCKED, but AP-dzr (Install Vitest) is READY.

IMMEDIATE ACTIONS:
1. Read CLAUDE.md
2. bd ready — you should see AP-dzr available
3. Install and configure Vitest + React Testing Library + jsdom
4. Create vitest.config.js, test setup file
5. Commit and bd close AP-dzr

THEN WAIT:
- AP-qn0 and AP-6fu are blocked by AP-bgy (Agent 2 must finish)
- Check periodically: bd show AP-bgy
- While waiting, review existing code to plan test coverage

WHEN UNBLOCKED:
- Write component tests for all pages, tabs, shared components
- Write integration tests for auth flow, API hooks, data mappers, route guards
- Run tests, file bugs as new beads issues for failures
- Commit after each task, bd close <id>

BEADS TASKS: AP-dzr, AP-qn0, AP-6fu (3 tasks)
"' C-m
```

---

## Step 7: Attach and monitor

```bash
# Attach to the tmux session
tmux attach -t adpulse-impl
```

### tmux navigation cheat sheet

| Keys | Action |
|---|---|
| `Ctrl+B` then arrow key | Switch between panes |
| `Ctrl+B` then `z` | Zoom/unzoom current pane (fullscreen toggle) |
| `Ctrl+B` then `[` | Scroll mode (use arrows/PgUp/PgDn, `q` to exit) |
| `Ctrl+B` then `d` | Detach (session keeps running in background) |
| `Ctrl+B` then `:resize-pane -D 10` | Resize pane down by 10 rows |

### Monitoring commands (run from any pane)

```bash
# Overall progress
cd ~/Work/dev/adpulse-portal && bd stats
cd ~/Work/dev/saas-backend && bd stats

# What's ready to work on?
bd ready

# What's blocked?
bd blocked

# Check specific task status
bd show AP-bgy    # Agent 2's last task (unblocks Agents 4+5)
bd show SB-79a    # Agent 1's first task

# List in-progress work
bd list --status=in_progress
```

### What to watch for

| Signal | Meaning | Action |
|---|---|---|
| Agent idle, no output | May be waiting for approval | Switch to pane, approve tool use |
| `bd stats` shows all closed | Agent finished | Proceed to Step 8 |
| Agent reports error | Build/test failure | Read error, intervene if needed |
| Agent 4/5 still blocked | Agent 2 not done yet | Check Agent 2's pane for progress |

---

## Step 8: Completion timeline

```
Timeline:
═══════════════════════════════════════════════════
Agent 1 (Backend)  ██████████░░░░░░░░░░░░░░  (6 tasks, ~30 min)
Agent 2 (API+Auth) ████████████████████░░░░  (14 tasks, ~60 min)
Agent 3 (TS+CI/CD) ██████████████░░░░░░░░░░  (9 tasks, ~45 min)
Agent 4 (UI)       ░░░░░░░░░░░░░░░░████████  (4 tasks, blocked → ~20 min)
Agent 5 (Tests)    ██░░░░░░░░░░░░░░░░██████  (3 tasks, 1 ready + 2 blocked)
═══════════════════════════════════════════════════
                   ↑ start         ↑ Agent 2 finishes AP-14
                                     Agents 4+5 unblock
```

### When Agent 1 finishes (saas-backend)

```bash
# Verify from Pane 0 or any terminal
cd ~/Work/dev/saas-backend
bd stats                    # All SB tasks should be closed
npm test                    # Confirm tests pass
git log --oneline DEV-6636  # Review commits

# Create PRs
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

# PR 2: DEV-6636 → main (Prod) — create after QA is verified
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

### When all agents finish (adpulse-portal)

```bash
cd ~/Work/dev/adpulse-portal
bd stats   # All AP tasks should be closed

# Merge order matters — Agent 3 first (TS+CI), then Agent 2 (API), then Agent 4 (UI)

# 1. Merge TypeScript + CI/CD
git checkout development
git merge --squash feat/ts-cicd
git commit -m "feat: add TypeScript conversion and CI/CD"

# 2. Merge API + Auth (rebase on TS changes first)
git checkout feat/api-integration
git rebase development
# Fix any conflicts (.js → .tsx renames)
git checkout development
git merge --squash feat/api-integration
git commit -m "feat: add API integration, auth, and tenant support"

# 3. Merge UI polish
git checkout feat/ui-polish
git rebase development
git checkout development
git merge --squash feat/ui-polish
git commit -m "feat: polish UI to production grade"

# 4. Verify build
npm run build

# 5. Clean up worktrees
git worktree remove .claude/worktrees/api-integration
git worktree remove .claude/worktrees/ts-cicd
git worktree remove .claude/worktrees/ui-polish

# 6. After repo is moved to Outoftheblue-ai org:
# git remote set-url origin https://github.com/Outoftheblue-ai/adpulse-portal.git
# git push -u origin development
# git push -u origin main
```

---

## Teardown

```bash
# Kill tmux session when done
tmux kill-session -t adpulse-impl

# Verify no orphan worktrees
cd ~/Work/dev/adpulse-portal && git worktree list
cd ~/Work/dev/saas-backend && git worktree list
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Agent stuck on tool approval | Switch to pane (`Ctrl+B` + arrow), type `y` to approve |
| Worktree creation fails | `git worktree prune` then retry |
| Beads DB corrupted | `bd doctor` to diagnose, `bd init --prefix XX` to reinit |
| Agent lost context (compaction) | Agent should run `bd prime` automatically; if not, type it in the pane |
| Merge conflict during rebase | Switch to pane, resolve manually, `git rebase --continue` |
| tmux session lost | `tmux ls` to check; if dead, agents stopped — restart from Step 4 |
| Agent finished but didn't close beads | Manually: `bd close <id>` |
