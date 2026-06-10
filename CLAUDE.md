# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills

- **`/drizzle-orm-patterns`** — invoke when writing any Drizzle ORM code (schemas, queries, relations, migrations, transactions). Progressively loads reference docs as needed.

## Commands

```sh
# Install dependencies
bun install

# Dev (all apps in parallel)
bun run dev                          # or: turbo dev
turbo dev --filter=web               # web only (http://localhost:3000)
turbo dev --filter=@repo/api         # API only (http://localhost:4000)

# Build
turbo build
turbo build --filter=web

# Type-check
turbo run check-types

# Lint
turbo run lint
# Lint a single app:
cd apps/web && bun run lint

# Database (packages/db — Drizzle + Postgres)
docker compose up -d                       # start local Postgres on :5432
cd packages/db && bun run db:generate      # generate a migration from schema changes
cd packages/db && bun run db:migrate       # apply pending migrations
cd packages/db && bun run db:studio        # browse data (Drizzle Studio)

# Format
bun run format           # write
bun run format:check     # check only
```

Package manager is **Bun**. See `apps/api/CLAUDE.md` for Bun-specific API guidance.

## Architecture

Turborepo monorepo with three apps (one unused) and shared packages:

```
apps/
  web/    — React 19 SPA (Vite + TanStack Router + TanStack Query + Clerk)
  api/    — Fastify REST API (Bun runtime + Clerk backend + Drizzle), modular monolith
  docs/   — Next.js app (unused Turborepo starter, not part of the product)
packages/
  db/                — Drizzle ORM schema, client, migrations (Postgres via postgres.js)
  contracts/         — shared pure-zod request/response schemas (api ↔ web)
  ui/                — shared component library (Tailwind v4, Radix primitives)
  eslint-config/     — shared ESLint configs
  typescript-config/ — shared tsconfigs
```

### `apps/web` — Frontend

- **Router**: TanStack Router with file-based routing (`apps/web/src/routes/`). Route tree is auto-generated to `routeTree.gen.ts` — do not edit that file manually.
- **Auth**: Clerk via `@clerk/clerk-react`. No prebuilt Clerk UI components (ADR-0001). All auth forms use `useSignIn()` / `useSignUp()` hooks with React Hook Form + Zod (ADR-0003).
- **State**: Zustand (`apps/web/src/store/index.ts`).
- **Data**: TanStack Query for all API calls, via a `useApiClient()` hook (`src/lib/api-client.ts`) that injects the Clerk token + `VITE_API_URL` and parses `@repo/contracts` response schemas. Per-resource hooks live in `src/features/<resource>/`; query keys are prefixed with the active `orgId`, and the cache is cleared on workspace switch.
- **Contracts**: request/response shapes come from `@repo/contracts` (ADR-0008) — never import `@repo/db` into the web (it carries server code). Forms validate with the shared request schemas (RHF + `zodResolver`); responses are parsed against the shared DTO schemas at runtime.
- **In-app routes** live under `_authenticated/`. Sections: **Academics** (`/academics/{academic-years,classes,streams,sections}`) and **People** (`/people/students`). Entity create/edit are dedicated routes (`/…/new`, `/…/$id/edit`); contextual actions (enrol, promote) are dialogs on the detail page. Unbuilt menu items render a shared "Coming soon" page via an in-layout catch-all (no 404s).
- **Active academic year**: a global switcher in the app header backed by a Zustand store; defaults to the workspace's current year, resets on `orgId` change, and is part of year-bound query keys.
- **Env**: `VITE_CLERK_PUBLISHABLE_KEY` (and optional `VITE_API_URL`, defaults to `http://localhost:4000`) in `apps/web/.env`.

**Route layout conventions:**

| Layout route               | Path                                    | Purpose                                |
| -------------------------- | --------------------------------------- | -------------------------------------- |
| `_public/route.tsx`        | `/login`, `/signup`, `/forgot-password` | No app chrome, full-screen split-panel |
| `_authenticated/route.tsx` | All in-app routes                       | Requires Session + Active Workspace    |

**Auth + Workspace Gate** (lives in `_authenticated/route.tsx`):

1. No session → redirect `/login?redirect_url=<current-path>`
2. Session, 0 orgs → redirect `/create-workspace`
3. Session, 1 org, no `orgId` → auto-activate silently (new-device case)
4. Session, n>1 orgs, no `orgId` → redirect `/select-workspace`
5. Session + `orgId` → render the route

### `apps/api` — Backend

Fastify server on port 4000 (`src/server.ts`), structured as a **modular monolith**.

- **Auth**: Clerk via `@clerk/fastify` (`clerkPlugin`). Protected routes call `getAuth(request)`.
- **Workspace creation** (`POST /api/workspaces`): uses `verifyToken` instead of `getAuth` because the session is still "pending" at the moment of first-workspace creation (ADR-0002). `createdBy` is always taken from the verified token, never the request body.
- **Domain modules**: each bounded context is `src/modules/<context>/` with DDD + CQS-lite layers (ADR-0006) — `domain/` (pure aggregates, value objects, events, repo interfaces), `application/` (command handlers + query functions), `infrastructure/` (Drizzle repos + read queries — the only layer that imports `@repo/db`), and `routes.ts` (Fastify wiring + composition root). The **School** module (`src/modules/school/`) is the first vertical; see its `CONTEXT.md`.
- **Persistence**: Drizzle via `@repo/db` (ADR-0005). Never import `drizzle-orm`/`postgres` directly — use `@repo/db`'s re-exports (`eq`, `and`, `sql`, …). `domain/` stays pure.
- **Tenancy**: every command/query/repo method takes a `workspaceId` derived from the session `orgId`, never the request body; routes return 403 without an active workspace.
- **Env**: `CLERK_SECRET_KEY` and `DATABASE_URL` in `apps/api/.env`. Exposed to Turbo via `globalEnv` in `turbo.json`.

### `packages/db` — Data layer

Drizzle ORM schema, client, and migrations. Postgres via `postgres.js` (ADR-0005), consumed as source (no build step) through `@repo/db` exports (`.`, `./schema`, `./client`).

- Schema lives in `src/schema/<context>/` (e.g. `schema/school/`); the single migration history is in `drizzle/`.
- `client.ts` exports a singleton `db` that reads `process.env.DATABASE_URL`. `index.ts` re-exports the schema and a curated set of Drizzle operators.
- Conventions: UUID v7 primary keys (`.$defaultFn(() => uuidv7())`), `created_at`/`updated_at` on every table, indexes on every FK / `workspace_id` / unique column. `workspace_id` is `text` (the Clerk org id), not `uuid`.
- Local Postgres via `docker-compose.yml` at the repo root; `DATABASE_URL` configures the connection.

### `packages/contracts` — API contracts

Pure-zod, browser-safe request/response schemas shared by `apps/api` and `apps/web` (ADR-0008). No server dependencies — safe to bundle in the browser. The API validates requests and maps Drizzle rows to response DTOs; the web uses the same schemas for forms (RHF) and parses responses at runtime.

### `packages/ui` — Design System

Tailwind v4 token source in `src/styles.css`. Import in any app:

```css
@import "@repo/ui/styles.css";
```

Brand tokens: primary `#595FAE` (Whiteboard violet), canvas `#FAFAF7`, font `Quicksand`. Components are Radix-based wrappers, exported individually (e.g. `@repo/ui/button`).

## Key Domain Concepts

This is a multi-context codebase — see `CONTEXT-MAP.md` for the bounded contexts (Platform/Tenancy, School, and the planned Training Institute / Online Institute verticals) and how they relate. `CONTEXT.md` is the Platform context glossary; each domain context has its own (e.g. `apps/api/src/modules/school/CONTEXT.md`).

See `CONTEXT.md` for the full glossary. Short version:

- **Workspace** = a Clerk Organization (the tenant boundary — one educational institution)
- **Active Workspace** = the `orgId` carried in the Session JWT; at most one per session
- **Workspace Gate** = the routing logic in `_authenticated/route.tsx` that guarantees every in-app route has both a Session and an Active Workspace

## ADRs

`docs/adr/` contains binding architectural decisions:

- **ADR-0001**: No Clerk prebuilt UI — custom forms with `useSignIn`/`useSignUp` throughout
- **ADR-0002**: Workspace creation is backend-only (`POST /api/workspaces`) because `publicMetadata` is client-read-only
- **ADR-0003**: React Hook Form + Zod is the standard for all forms
- **ADR-0004**: Workspace Gate routes by `orgId` presence, not membership count
- **ADR-0005**: Drizzle uses the `postgres.js` driver (deliberately overrides the Bun-native "no postgres.js" guidance)
- **ADR-0006**: DDD + CQS-lite in a modular monolith (`packages/db` for schema; `apps/api/src/modules/<context>/{domain,application,infrastructure,routes}`)
- **ADR-0007**: Isolated per-vertical bounded contexts — each vertical owns its own learner, no shared identity
- **ADR-0008**: Shared `@repo/contracts` package (pure-zod) as the api↔web boundary; explicit response DTOs, no persistence rows on the wire
