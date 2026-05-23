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

# Format
bun run format           # write
bun run format:check     # check only
```

Package manager is **Bun**. See `apps/api/CLAUDE.md` for Bun-specific API guidance.

## Architecture

Turborepo monorepo with two apps and shared packages:

```
apps/
  web/    — React 19 SPA (Vite + TanStack Router + Clerk)
  api/    — Fastify REST API (Bun runtime + Clerk backend)
packages/
  ui/             — shared component library (Tailwind v4, Radix primitives)
  eslint-config/  — shared ESLint configs
  typescript-config/ — shared tsconfigs
```

### `apps/web` — Frontend

- **Router**: TanStack Router with file-based routing (`apps/web/src/routes/`). Route tree is auto-generated to `routeTree.gen.ts` — do not edit that file manually.
- **Auth**: Clerk via `@clerk/clerk-react`. No prebuilt Clerk UI components (ADR-0001). All auth forms use `useSignIn()` / `useSignUp()` hooks with React Hook Form + Zod (ADR-0003).
- **State**: Zustand (`apps/web/src/store/index.ts`).
- **Env**: `VITE_CLERK_PUBLISHABLE_KEY` in `apps/web/.env`.

**Route layout conventions:**

| Layout route | Path | Purpose |
|---|---|---|
| `_public/route.tsx` | `/login`, `/signup`, `/forgot-password` | No app chrome, full-screen split-panel |
| `_authenticated/route.tsx` | All in-app routes | Requires Session + Active Workspace |

**Auth + Workspace Gate** (lives in `_authenticated/route.tsx`):
1. No session → redirect `/login?redirect_url=<current-path>`
2. Session, 0 orgs → redirect `/create-workspace`
3. Session, 1 org, no `orgId` → auto-activate silently (new-device case)
4. Session, n>1 orgs, no `orgId` → redirect `/select-workspace`
5. Session + `orgId` → render the route

### `apps/api` — Backend

Fastify server on port 4000. Single file: `src/server.ts`.

- **Auth**: Clerk via `@clerk/fastify` (`clerkPlugin`). Protected routes call `getAuth(request)`.
- **Workspace creation** (`POST /api/workspaces`): uses `verifyToken` instead of `getAuth` because the session is still "pending" at the moment of first-workspace creation (ADR-0002). `createdBy` is always taken from the verified token, never the request body.
- **Env**: `CLERK_SECRET_KEY` in `apps/api/.env`. Exposed to Turbo via `globalEnv` in `turbo.json`.

### `packages/ui` — Design System

Tailwind v4 token source in `src/styles.css`. Import in any app:
```css
@import "@repo/ui/styles.css";
```

Brand tokens: primary `#595FAE` (Whiteboard violet), canvas `#FAFAF7`, font `Quicksand`. Components are Radix-based wrappers, exported individually (e.g. `@repo/ui/button`).

## Key Domain Concepts

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
