# Shared `@repo/contracts` package for the API ↔ web boundary

Request and response shapes live in a new pure-zod, browser-safe package
`packages/contracts`, imported by both `apps/api` and `apps/web`. The API
validates request bodies against the shared schemas and **maps Drizzle rows to
explicit response DTOs** (defined in contracts) — persistence rows never cross
the wire. The web uses the same schemas for React Hook Form validation and
**parses responses against the DTO schemas at runtime**, so any API/web drift
fails loudly.

## Considered options

- **Web-local duplication** — web hand-writes its own form schemas and response
  types. Rejected: silent drift, especially on responses (a wrong response type
  fails quietly).
- **Import `@repo/db` types into the web** — rejected: `@repo/db` pulls in
  `postgres.js`/Drizzle, dragging server code into the browser bundle, and would
  leak persistence shapes (timestamps, internal columns) to the client.

## Consequences

- A small row → DTO mapper per query/command result in `apps/api`.
- Runtime response parsing on the web adds minor overhead but catches drift in
  development immediately.
- `packages/contracts` must stay dependency-free except `zod` (browser-safe).
- The pre-existing workspace-creation schema, currently duplicated in
  `apps/api/src/server.ts` and `apps/web/.../create-workspace`, should migrate
  here.
