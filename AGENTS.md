# AGENTS.md — GymTrack PWA

This repository powers a PWA gym tracker built with React + Vite, deployed as
a single-file HTML inside Google Apps Script. The goal is not to maximize raw
code output. The goal is to leave the repo in a state where the next session
can continue without guessing.

---

## Multi-Agent System

Three agents collaborate on every change. **No agent may skip its role.**

### 🧠 Planner — Opus 4.8

- **Role**: Architect. Creates detailed execution plans before any code is written.
- **Trigger**: Every new feature request, design change, bug fix, or improvement.
- **Output**: A markdown plan written to `docs/plans/PLAN-<NNN>-<slug>.md`.
- **Rules**:
  - Read `PROGRESS.md` and `FEATURE_LIST.json` before writing any plan.
  - Each plan must include: goal, affected files, step-by-step tasks, acceptance
    criteria, and verification commands.
  - Must NOT write or modify source code directly.
  - Must NOT mark features as complete.
  - If the plan involves UI/design changes, tag it with `executor: v0`.
  - If the plan involves logic/backend/build changes, tag it with `executor: codex`.

### ⚡ Executor — Codex _or_ V0

| Agent | Scope |
|-------|-------|
| **Codex** | Logic, state management, storage, build pipeline, PWA config, tests. |
| **V0** | UI/UX redesign, visual components, CSS, layout, animations. |

- **Trigger**: An approved plan exists in `docs/plans/` with status `approved`.
- **Rules**:
  - Execute exactly what the plan says. Do not add unplanned scope.
  - Work on one feature at a time.
  - Run `./init.sh` before starting.
  - After finishing, update `FEATURE_LIST.json` status to `in_progress` (not `passing`).
  - Commit with a descriptive message referencing the plan ID.
  - Do not silently change verification rules during implementation.

### 🔍 Reviewer — Antigravity

- **Role**: Quality gate. Reviews every completed execution before a feature is
  marked `passing`.
- **Trigger**: Executor signals completion on a plan.
- **Checks**:
  1. Run `./init.sh` — must exit 0.
  2. Run `npm run build` — must produce `dist/index.html` successfully.
  3. Open `dist/index.html` — app must render without errors.
  4. Verify the acceptance criteria listed in the plan.
  5. Confirm no regressions in existing features.
- **Output**:
  - If passing: update `FEATURE_LIST.json` status to `passing` with evidence,
    update `PROGRESS.md` session log.
  - If failing: document issues, set feature status to `blocked`, and create
    a follow-up task for the Planner.

---

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read `PROGRESS.md` for the latest verified state and next step.
3. Read `FEATURE_LIST.json` and choose the highest-priority unfinished feature.
4. Review recent commits with `git log --oneline -5`.
5. Run `./init.sh`.
6. Run the required smoke or end-to-end verification before starting new work.

If baseline verification is already failing, fix that first. Do not stack new
feature work on top of a broken starting state.

---

## Working Rules

- Work on one feature at a time.
- Do not mark a feature complete just because code was added.
- Keep changes within the selected feature scope unless a blocker forces a
  narrow supporting fix.
- Do not silently change verification rules during implementation.
- Prefer durable repo artifacts over chat summaries.

---

## Required Artifacts

| File | Purpose |
|------|---------|
| `FEATURE_LIST.json` | Source of truth for feature state. |
| `PROGRESS.md` | Session log and current verified status. |
| `init.sh` | Standard startup and verification path. |
| `docs/plans/` | Execution plans created by the Planner. |

---

## Definition of Done

A feature is done only when **all** of the following are true:

- The target behavior is implemented.
- The Reviewer has run verification and it passed.
- Evidence is recorded in `FEATURE_LIST.json` and `PROGRESS.md`.
- The repository remains restartable from `./init.sh`.

---

## End of Session

Before ending a session:

1. Update `PROGRESS.md` with what was done, verified, and what comes next.
2. Update `FEATURE_LIST.json` with current statuses.
3. Record any unresolved risk or blocker.
4. Commit with a descriptive message once the work is in a safe state.
5. Leave the repo clean enough for the next session to run `./init.sh` immediately.

---

## Project-Specific Notes

- **Stack**: React 19 + Vite 8, single-file build (`vite-plugin-singlefile`).
- **Deployment**: `dist/index.html` is copy-pasted into a Google Apps Script
  `Code.gs` `doGet()` function as an `HtmlService` output.
- **Storage**: Dual-layer — `window.storage` (Apps Script PropertiesService)
  with `localStorage` fallback for local dev.
- **Fonts**: Bebas Neue loaded dynamically via Google Fonts link injection.
- **No ESM in production**: Build output is IIFE format, not `type="module"`.
