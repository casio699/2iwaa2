
---
description: 2iwaa2 End-to-End Product Plan (MVP -> Full Platform)
---

# 2iwaa2 - منصة إيواء (2iwa2) — End-to-End Plan (A→Z)

This document is the **single source of truth** for building and operating **2iwaa2**, a Lebanese crisis/displacement assistance platform.

It is written to be:
- **Developer-friendly**: clear next actions, invariants, and runbooks.
- **Ops-friendly**: how to deploy, migrate, and troubleshoot.
- **Product-focused**: what we ship first and why.

---

## Guiding principles

- **Arabic-first** UX (Lebanese dialect fallback later), **RTL-first**.
- **Fast MVP**, then iterate by priority.
- **Free/low-cost** infra (avoid vendor lock-in when possible).
- **Trust & safety**:
  - moderation workflows
  - audit trails
  - minimal PII
  - abuse prevention
- **Resilience**:
  - offline-friendly where feasible
  - graceful degradation
  - “works on low-end phones”
- **Operational simplicity**: run locally with Docker; deploy with minimal steps.

---

## 0) Current stack (chosen)

- **Web**: Next.js App Router (TypeScript) + Tailwind
- **DB**: PostgreSQL (+ PostGIS optional)
- **ORM**: Prisma
- **Auth (MVP)**: Admin password via Bearer token
- **Notifications**:
  - Telegram integration (implemented; skips if env not configured)
  - Web Push scaffolding (placeholder)

---

## 0.1) Repo structure (mental model)

- `src/app/*`:
  - user pages and admin pages
  - API routes under `src/app/api/*`
- `src/lib/*`:
  - `prisma.ts` Prisma singleton
  - `auth.ts` admin auth helper
  - `telegram.ts` Telegram sender (safe no-op if not configured)
  - `push.ts` web push placeholder
  - `validators.ts` Zod schemas
- `prisma/schema.prisma`: authoritative schema
- `docker-compose.yml`: local Postgres/PostGIS
- `data/`:
  - `data/sources.md`: dataset catalog
  - `data/raw/` gitignored: downloads/snapshots
  - `data/normalized/` gitignored: generated normalized artifacts
  - `data/seed/` committed: curated seed lists (small)

---

## 1) What we already accomplished (DONE)

### Core pages
- [x] Landing page with navigation
- [x] Shelters public page (list)
- [x] Reports public page (submit + list verified)
- [x] Admin page:
  - [x] Moderate reports (verify/reject)
  - [x] Create shelters
  - [x] Create alerts (pending)
  - [x] Publish alerts
- [x] Alerts public page (`/alerts`) shows **published** alerts

### Core APIs
- [x] `GET /api/shelters` (verified shelters)
- [x] `POST /api/admin/shelters` (admin create)
- [x] `GET/POST /api/reports` (submit + verified list)
- [x] `GET /api/admin/reports?status=...`
- [x] `POST /api/admin/reports/:id/verify`
- [x] `POST /api/admin/reports/:id/reject`
- [x] `POST /api/alerts` (create pending)
- [x] `GET /api/alerts` (public published)
- [x] `GET /api/admin/alerts?status=pending` (admin pending queue)
- [x] `POST /api/admin/alerts/:id/publish` (publish + Telegram placeholder)

### Reliability / quality
- [x] Prisma client stability (standard provider)
- [x] Removed ESM/CJS bundling issues
- [x] ESLint clean (non-blocking hook warning remains)

### Data foundation
- [x] Downloaded Lebanon OSM extract (Geofabrik)
- [x] Imported OSM into PostGIS using `osm2pgsql` (tables: `planet_osm_point/line/polygon/roads`)
- [x] Enabled DB extensions required for OSM import (`hstore`)

---

## 2) MVP scope (what we ship ASAP)

Goal: **Deployable, stable, safe MVP** for real usage.

### MVP MUST have
- **Shelters**:
  - List shelters with basic info and capacity indicator (when available)
  - Admin can add shelters quickly
  - Basic search/filter
- **Reports**:
  - Public submission
  - Admin moderation
  - Public verified feed
- **Alerts**:
  - Admin create + publish
  - Public `/alerts` feed
  - Telegram broadcast on publish (once env configured)
- **Ops**:
  - Environment variables documented
  - DB migrations documented
  - Minimal runbook

### MVP explicitly NOT required now
- Area-based alerts / subscriptions
- Complex maps
- Payments
- News aggregation
- Threat database

---

## 2.1) MVP definition of “DONE” (acceptance criteria)

- **Functional**
  - user can view shelters, view alerts, submit reports
  - admin can moderate reports, create shelters, publish alerts
- **Reliability**
  - API routes return consistent JSON
  - database migrations are reproducible
- **Security (MVP)**
  - admin routes require Bearer token
  - no secrets in logs
- **UX**
  - RTL works correctly
  - responsive on mobile
- **Ops**
  - README explains local run
  - `.env.example` is accurate

---

## 3) Next steps (prioritized, step-by-step)

### Checkpoint A — MVP polish (1–2 days)
1. **Shelters search/filter UI**
   - Filter by: name, governorate, district
   - Show a clear capacity badge:
     - “متاح” if capacity seems available
     - “ممتلئ” if used >= total
     - “غير معروف” if missing
2. **Admin alerts UX polish**
   - Add “Published alerts” secondary tab (optional) or keep pending-only
   - Show publish timestamp in admin pending card
3. **Fix the remaining hook warning**
   - Convert `loadAlerts` to `useCallback` and update `useEffect` deps
4. **Hardening**
   - Rate limit report submission (simple IP-based in-memory MVP)
   - Server-side input validation already exists; ensure all endpoints use Zod schema where relevant

Nice-to-have (only if time allows):
- add a minimal “About / How to use” page
- add a minimal hotline directory page (manual seed)

Exit criteria:
- MVP is usable and stable locally.
- No critical lint/type errors.

### Checkpoint B — Deployment-ready (1–2 days)
1. **Deployment target selection** (recommended):
   - App: Vercel (fastest for Next.js)
   - DB: Supabase Postgres (free tier) OR managed Postgres elsewhere
2. **Production env setup**
   - Strong `ADMIN_PASSWORD`
   - Real Telegram bot token + chat ID
3. **Operational docs**
   - `.env.example` accurate
   - “How to migrate DB” steps
   - “How to rotate admin password”
   - “How to handle abuse reports”

Exit criteria:
- App deployed to public URL.
- Admin flow works in production.
- DB migrations are reproducible.

---

## 3.1) Local runbook (developer onboarding)

### Prereqs
- Node.js + npm
- Docker + Docker Compose

### Start DB
```bash
docker compose up -d
```

### Set env
```bash
cp .env.example .env
```

### Migrate
```bash
npx prisma migrate dev
```

### Run app
```bash
npm run dev
```

---

## 3.2) Data import runbook (OSM + future datasets)

### OSM (Lebanon) — already imported locally
Source:
- https://download.geofabrik.de/asia/lebanon.html

Local file:
- `data/raw/osm/lebanon-latest.osm.pbf`

Import method:
- `osm2pgsql --create --slim --hstore --multi-geometry`

If re-importing, consider dropping existing `planet_osm_*` tables first or use `--append` only after understanding replication.

---

## 4) Post-MVP roadmap (full product)

### Phase 1 — Trust, scale, and resilience
- Moderation enhancements:
  - Roles (admin/moderator)
  - Moderation queue views and audit log UI
- Better data quality:
  - Shelter import from official datasets (CSV)
  - Deduplication and merge tools
- PWA improvements:
  - Offline caching strategy for key pages
  - Add `/sw.js` + manifest (if not already)

### Phase 2 — Maps & geospatial
- Map view for shelters and incidents
- Nearby shelters based on user location (privacy-respecting)
- Geofenced alerts (optional, later)

Recommended technical approach:
- Use PostGIS + lightweight map UI
- Avoid paid map providers initially (use OSM tiles; consider self-hosting later)

### Phase 3 — News aggregation (Minassa News)
- RSS aggregation from reputable Lebanese/local sources
- Dedup by URL and cluster by story
- Bias/coverage comparison (simple heuristic MVP)

### Phase 4 — Threat database
- Structured threat events (type, location, time)
- Verification workflow
- Export / API for partner orgs

### Phase 5 — Financial & aid info
- Curated exchange rates (manual/official)
- Aid resources directory
- Hotline directory

---

## 5) Engineering best practices (standards)

### Security
- Never log secrets
- Admin endpoints always require Bearer token
- Validate inputs with Zod
- Keep PII minimal and optional

### Reliability
- Use DB migrations for all schema changes
- Add basic health checks and structured error responses
- Avoid breaking changes to public endpoints

### Maintainability
- Prefer small PRs
- Add e2e smoke tests later (Playwright)

### Data governance
- Keep **raw** datasets out of git (`data/raw/`, `data/normalized/`)
- Store provenance for any imported record
- If scraping a site without export:
  - respect robots/ToS
  - cache responsibly
  - document endpoints and fields

---

## 6) Deployment guide (fast path)

### Local
1. Start DB (docker)
2. `npx prisma migrate dev`
3. `npm run dev`

### Production (recommended)
1. Provision Postgres
2. Set env vars
3. Run `prisma migrate deploy`
4. Deploy Next.js
5. Verify:
   - Create shelter in admin
   - Submit report
   - Publish alert

---

## 7) Git workflow guide (recommended)

- `main` is always deployable
- Feature branches for changes
- Tag releases: `v0.1.0-mvp`, `v0.2.0`, ...

---

## 8) Hand-off checklist (for new developers)

- Read this plan and `README.md`
- Run locally and ensure:
  - `/shelters`, `/reports`, `/alerts`, `/admin` work
  - admin Bearer token is configured
- Review API routes under `src/app/api/*`
- Keep `main` deployable


