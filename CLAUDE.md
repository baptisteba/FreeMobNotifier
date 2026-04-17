# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreeMobNotifier is a PWA that sends SMS via the Free Mobile API (`https://smsapi.free-mobile.fr/sendmsg`). It has two halves that live in one repo: a Vue 3 / Vite client (`src/client`) and an Express server (`src/server`). The Express server serves both the built SPA and the `/api/*` endpoints from the same port.

## Common Commands

All commands run from the repo root unless noted.

```bash
# Install both root and client dependencies (postinstall handles client/)
npm run install:all

# Dev — frontend + backend in watch mode (two processes via concurrently)
npm run dev:watch

# Dev — backend only (expects pre-built client in src/client/dist)
npm run dev:server

# Dev — frontend only (Vite on :5173, proxies /api to :3000)
npm run client

# Production build (builds client + runs scripts/verify-pwa-build.js)
npm run build

# Production start (serves built client + API on PORT, default 3000)
npm start

# Docker
npm run docker:up    # docker-compose up -d (external port 18596 -> container 3000)
npm run docker:down
npm run docker:logs
```

No test suite exists — `npm test` intentionally fails.

## Architecture

### Server (`src/server`)
- `index.js` — Express entrypoint. Mounts `/api/settings` and `/api/messages`, then serves `../client/dist` statically with a `*` fallback to `index.html` (SPA routing). Sets PWA-specific headers for `manifest.json`, `sw.js`, and `/icons/*`. Boots `schedulerService.initScheduler()` on start.
- `services/dbService.js` — Wraps `@seald-io/nedb` with promise-based APIs. Two datastores: `settings.db` and `messages.db`, both stored in `./data/` (created at runtime). `messages.find()` sorts results by `lastSent || createdAt` descending — callers rely on this implicit ordering.
- `services/freeMobileService.js` — Two send functions: `sendSMS()` (used for immediate user-triggered sends, does its own exponential-backoff retries up to `MAX_RETRIES=5`) and `sendSMSOnce()` (used by the scheduler, single attempt, lets the scheduler own retry state). Both run `sanitizeMessage()` first to strip accents and non-ASCII characters before hitting the Free Mobile API, which is sensitive to encoding. Retryability is derived from HTTP status: 500/402/0 retryable; 400/403 not.
- `services/schedulerService.js` — Three cron jobs:
  - Every minute: finds pending one-time messages due, plus all pending recurring messages, and calls `shouldSendRecurringMessage()` to gate on hour/minute/day match.
  - Every 5 minutes: retries `status: 'failed'` messages up to `MAX_RETRIES`.
  - Daily at midnight: deletes `sent`/`error` non-recurring messages older than 30 days.
- `models/Message.js`, `models/Setting.js` — Thin class wrappers over `dbService` that mimic a Mongoose-ish API (`find`, `findById`, `save`, `deleteMany`). Not a real ORM — reading these is the fastest way to see the persisted shape.

### Message lifecycle (non-obvious)
This is the part most likely to trip you up:

- **One-time messages**: `status: 'pending'` → `'sent'` (or `'failed'` → `'error'` after retries). The same document is mutated in place.
- **Recurring messages**: the original document stays `status: 'pending'` forever so the cron can re-fire it. Each successful send inserts a **new** document with `status: 'sent'`, `recurrence: 'none'`, and `originalRecurringMessageId` pointing back to the template. The History view shows the `sent` documents; the Scheduled view shows the `pending` recurring templates. Do not "fix" the recurring message by flipping it to `sent` after send — that will break the schedule.
- `shouldSendRecurringMessage()` also guards against double-send within a 60-minute window via `lastSent`.

### Client (`src/client`)
- Vue 3 + Vue Router + Vite. Four routes: `/` (Home: send-now + schedule tabs), `/scheduled`, `/history`, `/settings`.
- `composables/useTheme.js` — global theme state, toggles the `dark-theme` class on `:root`, persists to localStorage, respects `prefers-color-scheme`. All styling relies on CSS custom properties defined in `App.vue` (e.g., `--free-primary-color`, `--free-card-background`).
- `services/api.js` — axios wrapper for `/api/*`. In dev, Vite proxies `/api` to `http://localhost:3000` (see `vite.config.js`).
- PWA: `main.js` registers `/sw.js` with `updateViaCache: 'none'` and auto-reloads on `controllerchange`. Service worker and `manifest.json` live in `src/client/public/` and are copied to `dist/` at build time (`vite.config.js` has custom `assetFileNames` to keep them at dist root rather than under `assets/`).
- `scripts/verify-pwa-build.js` runs after `vite build` to sanity-check that PWA assets made it into `dist/`.

### Deployment
- `Dockerfile` + `docker-compose.yml` expose the container's port 3000 on host `18596`. The `./data` directory is volume-mounted so the NeDB files persist across restarts.
- `nginx.conf` is a reference config for an external reverse proxy (HTTPS termination is required for PWA install/service worker in production).

## Conventions

- Paths in code use `path.join(process.cwd(), 'data')` — the server must be launched from the repo root (or `WORKDIR /app` in Docker) for the DB directory to resolve correctly.
- The Free Mobile API only accepts ASCII. Never bypass `sanitizeMessage()` when sending.
- When adding fields to `Message`, update both the constructor **and** the `$set` block in `save()` — the model doesn't auto-enumerate properties.
