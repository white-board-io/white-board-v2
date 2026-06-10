# Whiteboard

An education-management platform. A single **Workspace** is one institution of one
type (School, Training Institute, or Online Institute); a shared platform layer
handles identity and multi-tenancy, and each vertical owns its own domain model.
Schools are the first vertical.

## Stack

- **Monorepo**: Turborepo + Bun
- **Web** (`apps/web`): React 19 SPA — Vite, TanStack Router, TanStack Query, Clerk, Zustand
- **API** (`apps/api`): Fastify on the Bun runtime — Clerk, Drizzle. Modular monolith, DDD + CQS-lite
- **Database** (`packages/db`): Drizzle ORM + Postgres (`postgres.js`)
- **Contracts** (`packages/contracts`): pure-zod request/response schemas shared by api + web
- **UI** (`packages/ui`): Tailwind v4 + Radix component library
- Shared `eslint-config` and `typescript-config`

> `apps/docs` is the unused Next.js Turborepo starter, not part of the product.

## Prerequisites

- [Bun](https://bun.sh) 1.3+
- Docker (for local Postgres)
- A [Clerk](https://clerk.com) application (publishable + secret keys)

## Setup

```sh
bun install
```

Create the env files (copy each `.env.example` and fill in):

| File               | Keys                               |
| ------------------ | ---------------------------------- |
| `apps/web/.env`    | `VITE_CLERK_PUBLISHABLE_KEY`       |
| `apps/api/.env`    | `CLERK_SECRET_KEY`, `DATABASE_URL` |
| `packages/db/.env` | `DATABASE_URL`                     |

Start Postgres and apply migrations:

```sh
docker compose up -d                    # Postgres on :5432
cd packages/db && bun run db:migrate    # apply migrations
```

## Develop

```sh
bun run dev                       # all apps in parallel
turbo dev --filter=web            # web → http://localhost:3000
turbo dev --filter=@repo/api      # API → http://localhost:4000
```

## Common commands

```sh
turbo run check-types             # type-check all packages
turbo run lint                    # lint all packages
bun run format                    # format

# database (packages/db)
cd packages/db && bun run db:generate    # generate a migration from schema changes
cd packages/db && bun run db:migrate     # apply migrations
cd packages/db && bun run db:studio      # browse data (Drizzle Studio)
```

## Architecture & decisions

- [`CLAUDE.md`](./CLAUDE.md) — working guide and conventions
- [`CONTEXT-MAP.md`](./CONTEXT-MAP.md) — bounded contexts and how they relate
- [`CONTEXT.md`](./CONTEXT.md) — Platform (identity & tenancy) glossary
- [`apps/api/src/modules/school/CONTEXT.md`](./apps/api/src/modules/school/CONTEXT.md) — School domain glossary
- [`docs/adr/`](./docs/adr) — architectural decision records (ADR-0001 … ADR-0007)
- [`docs/requirements/`](./docs/requirements) — feature requirements
