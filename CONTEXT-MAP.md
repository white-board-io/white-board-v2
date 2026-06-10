# Context Map

This is an education-management platform. A single **Workspace** is exactly one
institution of exactly one **Workspace Type** (School, Training Institute, or
Online Institute). A shared platform layer handles identity and tenancy; each
vertical owns its own domain model, and the verticals are fully isolated — there
is no shared learner identity across them.

## Contexts

- **[Platform / Access & Tenancy](./CONTEXT.md)** — Clerk-backed identity,
  authentication, and multi-tenancy. Owns User, Session, Workspace (= Clerk
  Organization), Workspace Owner, and Workspace Type. Every other context
  operates strictly inside a Workspace. _Built._
- **School** — Academic operations for a school Workspace: academic years, grade
  levels, class sections, students, and enrolments. Owns its own **Student**.
  Glossary: [`apps/api/src/modules/school/CONTEXT.md`](./apps/api/src/modules/school/CONTEXT.md).
  _Built — academic years, grade levels, streams, class sections, students, and
  enrolments, in `apps/api/src/modules/school/` and `packages/db/src/schema/school/`._
- **Training Institute** — Course/batch-based training operations; would own its
  own **Trainee**. _Planned — not yet modeled._
- **Online Institute** — Online course operations; would own its own **Member**.
  _Planned — not yet modeled._

## Relationships

- **Platform → every vertical**: each vertical operates inside one Workspace.
  Everything is scoped by `workspace_id`, derived from the Session's active
  `orgId`, never from client input.
- **Workspace Type discriminates** which vertical context applies to a Workspace.
- **School ⟷ Training Institute ⟷ Online Institute**: fully isolated. No shared
  learner — a person attending two institutions is two unrelated records. A
  future **Reporting / Analytics** integration context would be the only place
  cross-vertical views could be assembled.

## Architectural shape (for newcomers)

- **DDD + CQS-lite**: tactical DDD (aggregates, value objects, domain events) on
  the write side; plain query functions on the read side; one Postgres database.
  No event sourcing, no separate read store.
- **Modular monolith**: `packages/db` owns all Drizzle schema and the single
  migration history (organized per context, e.g. `schema/school/*`). Each vertical
  lives as a module under `apps/api/src/modules/<context>/{domain,application,
  infrastructure,routes}` — `domain` is pure TypeScript, only `infrastructure`
  imports `@repo/db`.
- **Shared contracts**: `packages/contracts` holds pure-zod request/response
  schemas shared by `apps/api` and `apps/web` (ADR-0008). The web (React 19 +
  TanStack Query) calls the API with the Clerk session token; persistence rows
  never cross the wire — the API maps to explicit DTOs.
