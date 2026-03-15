# Al-Menassa - المنصة — End-to-End Plan (A→Z)

This is the **single source of truth** for building and operating **Al-Menassa**, a Lebanese crisis/displacement assistance platform.

If you are reading this as a new developer:
- Start with **Local runbook** (below)
- Then check **Current status** and **Next steps**

---

## Guiding principles

- **Arabic-first** UX (Lebanese dialect fallback later), **RTL-first**
- **Fast MVP**, then iterate by priority
- **Free/low-cost** infra (avoid vendor lock-in when possible)
- **Trust & safety**
  - moderation workflows
  - audit trails
  - minimal PII
  - abuse prevention
- **Resilience**
  - offline-friendly where feasible
  - graceful degradation
  - works on low-end phones
- **Operational simplicity**
  - run locally with Docker
  - deploy with minimal steps

---

## Current stack

- **Web**: Next.js App Router (TypeScript) + Tailwind
- **DB**: PostgreSQL + PostGIS (Docker)
- **ORM**: Prisma
- **Auth (MVP)**: Admin password via Bearer token
- **Notifications**:
  - Telegram (implemented; safe no-op if not configured)
  - Web Push scaffolding (placeholder)

---

## Repo structure (mental model)

- `src/app/*`
  - user pages + admin page
  - API routes under `src/app/api/*`
- `src/lib/*`
  - `prisma.ts` Prisma singleton
  - `auth.ts` admin auth
  - `telegram.ts` Telegram sender
  - `push.ts` push placeholder
  - `validators.ts` Zod schemas
- `prisma/schema.prisma`: DB schema
- `docker-compose.yml`: local Postgres/PostGIS
- `data/`
  - `data/sources.md`: dataset catalog
  - `data/raw/` gitignored: downloads/snapshots
  - `data/normalized/` gitignored: generated normalized artifacts
  - `data/seed/` committed: curated seed lists (small)

---

## What is already implemented (status)

### User features
- Shelters list page
- Reports submission + verified list
- Alerts feed page (`/alerts`) shows published alerts

### Admin features
- Moderate reports (verify/reject)
- Create shelters
- Create alerts (pending)
- Publish alerts (moves to public feed)

### API highlights
- `GET /api/shelters`
- `POST /api/admin/shelters`
- `GET/POST /api/reports`
- `GET /api/admin/reports?status=...`
- `POST /api/admin/reports/:id/verify`
- `POST /api/admin/reports/:id/reject`
- `POST /api/alerts` (creates pending)
- `GET /api/alerts` (public published)
- `GET /api/admin/alerts?status=pending` (admin queue)
- `POST /api/admin/alerts/:id/publish` (publishes + Telegram if configured)

### Data foundation
- Lebanon OSM extract downloaded (Geofabrik)
- Imported into PostGIS via `osm2pgsql` and `planet_osm_*` tables exist

---

## MVP scope

### MVP must have
- Shelters
  - list + basic filters
  - admin add shelters
- Reports
  - submission + moderation + verified feed
- Alerts
  - admin create/publish + public feed
  - Telegram broadcast on publish (once configured)
- Ops
  - `.env.example` accurate
  - migrations reproducible
  - minimal runbook

### Not required right now (explicitly deferred)
- area-based alerts/subscriptions
- complex maps
- payments
- news aggregation
- threat database

---

## Next steps (prioritized)

### Checkpoint A — MVP polish (1–2 days)
1) Shelters search/filter UI
- Filter by name/governorate/district
- Capacity badge: available/full/unknown

2) Admin alerts UX polish
- Keep pending-only queue (declutter)
- Show publish timestamp where relevant

3) Code hygiene
- Fix remaining React hook dependency warning (`useCallback` for `loadAlerts`)

4) Hardening
- Minimal rate limiting on report submission
- Ensure Zod validation used consistently

Exit criteria
- App stable locally
- No critical lint/type errors

### Checkpoint B — Deployment-ready (1–2 days)
1) Pick hosting
- App: Vercel recommended
- DB: Supabase Postgres (free tier) or managed Postgres

2) Production env
- set strong `ADMIN_PASSWORD`
- set Telegram bot token + chat id

3) Operational docs
- how to migrate
- how to rotate admin password
- abuse handling notes

Exit criteria
- Deployed URL works
- Admin actions work in production

---

## Local runbook (developer onboarding)

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

### Prisma
```bash
npx prisma migrate dev
```

### Run app
```bash
npm run dev
```

---

## Data runbook (OSM)

### OSM source
- https://download.geofabrik.de/asia/lebanon.html

### Local file
- `data/raw/osm/lebanon-latest.osm.pbf`

### Import method
- `osm2pgsql --create --slim --hstore --multi-geometry`

Notes
- Raw/normalized datasets must not be committed.
- Prefer extracting POIs into views or staging tables before upserting into core models.

---

## Long-term roadmap (post-MVP)

### Phase 1 — Trust & scale
- roles (admin/moderator)
- audit log UI
- improved moderation queue

### Phase 2 — Maps & geo
- shelter map view (OSM tiles)
- nearby shelters

### Phase 3 — News aggregation
- curated RSS sources + clustering

### Phase 4 — Threat database
- structured incidents + verification

### Phase 5 — Finance & aid
- curated exchange rates
- aid resources + hotlines
