# VerifiedProps

pnpm/Turborepo monorepo for the VerifiedProps customer website, builder portal, admin console, and NestJS API.

## Quick start

### Option A: manual (local Node + Postgres)

1. Copy `.env.example` to `apps/api/.env` and set secrets.
2. Run `pnpm install`.
3. Start PostgreSQL, then run `pnpm dev`.

The API runs on port 4000, the website on 3000, the builder portal on 5173, and the admin console on 5174.

### Option B: Docker Compose

Builds and runs all four apps plus Postgres in containers — no local Node/Postgres install needed.

1. Copy `.env.example` to `.env` **at the repo root** (this is a different file from `apps/api/.env` above — Compose only reads a root-level `.env`) and set at least `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (the stack refuses to start without them) plus a real `POSTGRES_PASSWORD`.
2. Run `docker compose up --build`.
3. Same ports as above: web on 3000, api on 4000, builder on 5173, admin on 5174.

Each app has its own `Dockerfile` (`apps/api`, `apps/web`, `apps/builder`, `apps/admin`); `docker-compose.yml` wires them together with a `verifiedprops_postgres` container and healthchecks. All container/volume/network names are prefixed `verifiedprops_` so they're safe to run alongside unrelated Docker projects on the same machine. On startup the api container automatically applies pending Prisma migrations (`prisma migrate deploy`) before serving traffic.

### Health check

The API exposes `GET /v1/health`, which runs a real query against the database and returns `200` with `{ status, timestamp, uptime, database }` when healthy (or `503` if the DB is unreachable). Both the api container's own Docker healthcheck and any external uptime monitor should point at this endpoint.
