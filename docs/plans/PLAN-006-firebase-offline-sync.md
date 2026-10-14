# PLAN-006 — Firebase migration and dependable offline synchronization

- **status:** approved
- **executor:** codex
- **feature:** sync-001 (single active feature)
- **date:** 2026-10-14
- **authorization:** The user explicitly approved the migration and requested “Hagamoslo … Hagamos el resto.” Implement and prepare data-preserving recovery now; live activation needs Firebase configuration and recovered data.
- **planner:** Codex acting as independent Planner. The repository names Opus 4.8, unavailable in this session. Preserve separate Planner/Executor/Reviewer agents using available models, without claiming unavailable models performed work.

Preparatory dependency work: the root Executor replaced the npm SDK dependency while this plan was being finalized; no feature behavior is claimed from that preparation. Root owns UI integration and backup importing; a separate Executor owns the sync engine, with agreed module interfaces.

## Goal and observed defects

Replace Supabase with Firebase email/password Authentication and Cloud Firestore on free Spark. Keep the current mobile UI and training behavior. Open from local storage without waiting for network/authentication; preserve unsynchronized edits; apply remote changes in React without page reloads; provide explicit local/Supabase recovery and portable backups.

The existing code sends whole-state Supabase upserts, replaces divergent local state on startup, reloads on cloud changes, and gates rendering on an unbounded auth request. Changing providers alone does not address those defects.

## Affected files

- `src/GymTracker.jsx`: replace auth/sync and add functional recovery controls using current styles.
- New focused `src/firebase.js`, `src/storage.js`, `src/sync.js`, `src/backup.js` or equivalent: optional client, local persistence, record mapping, queue/subscription, import/export.
- `src/supabase.js`: remove runtime client after replacement.
- `package.json`, lockfile: Firebase dependency, remove Supabase SDK, add focused test scripts.
- `vite.config.js`: explicit public Firebase configuration allowlist; audit PWA updates for unintended reloads.
- `.env.example`, `firebase.json`, `firestore.rules`, optional emulator config.
- `tests/` or existing test location: model, queue, recovery, security and browser tests.
- `README.md` or `docs/FIREBASE_SETUP.md`: recovery/setup/deployment/rollback.
- `FEATURE_LIST.json`, `PROGRESS.md`: execution/review evidence and external prerequisites.

## Execution tasks

1. **Baseline and preservation.** Follow startup workflow, recent commits, `./init.sh` and browser smoke. Parent reports baseline lint/build/browser smoke passed with no console errors. Capture original local state before any migration, import or weekly reset. Do not remove legacy keys or source records, uninstall the phone PWA or clear its storage. Preserve recovered historical progress by source week. Retain both phone and Supabase snapshots because either may contain newer changes.

2. **Firebase initialization.** Initialize only from supplied public web config; never bundle admin credentials. Use persistent email/password Auth and persistent Firestore cache with multiple-tab support. Catch unsupported storage/cache and initialization failures. Missing configuration must leave the local tracker usable and show a setup notice. Remove runtime Supabase requests/environment exposure. Supply registration, login, password reset and logout. Supabase passwords are not migrated.

3. **Local startup and isolation.** Render local data immediately; bound asynchronous legacy storage/auth startup with a documented short deadline. Ignore late startup results that would reset intervening edits. Account operations cannot lock the tracker. Scope cloud-era local state and pending writes by UID; retain legacy data as an unowned recovery workspace. Never automatically upload it into each newly signed-in account. Unsubscribe old listeners and invalidate pending callbacks on account changes. Show an explicit first-use choice before adopting local versus existing cloud data; preserve both copies before any replacement.

4. **Versioned record model.** Preserve legacy keys `week`, `done`, `custom`, `addedEx`, `deletedEx`, `runs`, `routine`, `setProgress`, `sessionExercises`, `warmupDone`, `customSessions`, `deletedSessions`, `sessionWarmups`, `todaySelection`, `routineOrder`, `sessionMeta`; retain unrecognized source fields in backups. Use owner-scoped `users/{uid}/records/{recordId}` or equivalent. Split records by logical identity/field: overrides/additions/deletions by session/exercise, progress by week/exercise, runs by stable ID (legacy `ts`), custom sessions by ID, routine metadata/order/preferences by scope. Encode IDs safely. Use tombstones for deletions. Only changed records/fields are written; no whole-workout or whole-array replacement for one changed entity. Ordered lists can be one record. Same-record concurrent changes use documented last accepted write wins; independent records must both survive. Namespace weekly progress so an old device cannot reset another week's edits.

5. **Durable synchronization.** Update React and durable local state first, enqueue only changes, and retry on reconnection. Pending offline edits must survive restart. Firestore persistent queue may be supplemented by a durable application outbox: assign revisions and remove only the acknowledged revision so an old acknowledgment cannot erase a newer edit. Never replay one account's queue into another. Subscribe once per account, distinguish cached/pending/server snapshots, protect newer pending local values, apply remote changes directly to React, and suppress write-back echoes. Only server acknowledgment means synchronized; navigator online/cache snapshots do not. Permission/network failures retain recoverable edits and usable UI. Clean up subscriptions/timers. No page reload in sync/auth/import paths.

6. **Backup and recovery.** Offer versioned JSON export even when unauthenticated/unconfigured. Save an original snapshot before applying import/migration/replacement. Accept app JSON backups and Supabase `gymtrack_state` row/payload JSON. Support CSV with `user_id,payload,updated_at`, quoted JSON, escaped quotes and multiline cells when feasible. Validate shape/version/limits/types before mutation; malformed or ambiguous multi-user input must not silently partially apply. Show source/count information before an explicit import. Preserve pending changes; replacements need a clear user choice and backup. Imports must be idempotent and record-scoped, with partial upload errors surfaced. Do not auto-overwrite a populated cloud account with stale local state.

7. **Functional controls.** Replace Supabase and magic-link messaging with Firebase email/password controls and accurate local/connecting/pending/offline/synced/error indicators. Backup/import must remain reachable when auth fails. Use existing layout/styles; no redesign. Report storage quota failures honestly instead of claiming an edit was saved.

8. **Security/setup.** Rules deny unauthenticated/cross-user access and constrain document schema/fields for permitted records. Document Spark project/web app creation, enabling email/password, provisioning Firestore, deploying rules, allowed domains, public build variables and rebuilding on the existing origin. No billing activation required. Explain same-origin phone data recovery. Prefer temporary Supabase restoration for verified export when possible; a complete CSV containing `gymtrack_state.payload` is sufficient otherwise. A downloadable paused-project backup may be database SQL/archive rather than CSV: identify its actual format before claiming direct import support. Parent has requested restoration; wait for readiness before exporting. Never overwrite source records during extraction.

9. **Review/handoff.** Run tests and required checks; independent Reviewer gates completion. Add the active feature as `in_progress`, not passing, until acceptance evidence exists. Separate emulator/local evidence from live Firebase/mobile verification. Do not claim deployed rules, recovered real data, live cross-device sync or deployment without evidence. Deliver usable local code and concrete setup instructions if credentials are pending. Update durable logs and commit referencing PLAN-006.

## Acceptance criteria

- Tracker opens and edits/persists with missing config, unavailable network/backend, slow auth or auth errors; loading resolves within the documented short deadline.
- Legacy exercises, weights/overrides, routines/order, runs and source progress remain preserved/exportable before migration/reset.
- Firebase registration/login/reset/logout have clear failures; no Supabase runtime calls remain.
- Switching accounts cannot expose old account data as the new account's workspace or redirect pending writes.
- Offline changes survive restart and synchronize on reconnection; status remains pending until acknowledgment.
- Two clients editing different exercises/runs retain both changes; old snapshots/acknowledgments cannot discard newer pending changes. Deletes do not resurrect, and old devices do not erase new-week progress.
- Remote changes render without page reload, flicker loop, lost active interaction or write/subscription echo loop.
- Backup round-trip retains all data; malformed/ambiguous JSON/CSV causes no partial mutation. Explicit imports are idempotent and preserve unrelated data.
- Owner can access valid records; unauthenticated/cross-user/invalid writes are denied.
- Mobile browser smoke covers routine/exercise add/edit/delete/reorder, per-set progress, week behavior and runs. PWA artifacts build and cached app opens offline.
- Live activation remains explicitly pending until config, deployed rules, recovered data and actual two-device checks exist.

## Verification commands

Keep repository-required checks unchanged:

```sh
./init.sh
npm run build
git diff --check
npm run preview -- --host 127.0.0.1 --port 4173
```

Add focused documented commands, such as `npm test` for model/outbox/import tests and `npm run test:firebase` for Auth/Firestore emulator/security checks. Test adversarial sequences: pending edit A, remote B, newer edit A, old acknowledgment A; restart/reconnect; UID change during callback; duplicate/multiline CSV import; denied write; cache/storage failure; late startup result. Browser checks inspect console errors and navigation/reload counts while exercising real controls at mobile widths. Emulator-backed two-client/offline tests must establish integration correctness where available; mocks alone do not prove live behavior. Record unavailable emulator/live checks distinctly from passes.

## Boundaries and risks

Live Firebase setup and source export depend on account access; prepare code/rules/docs without inventing credentials. Same-record conflicts use a documented last-write policy, not conflict-free collaborative editing. Browser cache can be evicted, so portable backups and honest persistence errors matter. Retain divergent phone/server copies rather than selecting a winner only by client timestamps. Do not expand into unrelated history/timer/design backlog features.
