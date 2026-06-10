# DDD with CQS-lite in a modular monolith

The domain layer uses tactical DDD (aggregates, value objects, domain events) on
the write side and plain query functions on the read side, against a single
Postgres database. Each bounded context lives as a module under
`apps/api/src/modules/<context>/{domain,application,infrastructure,routes}` —
`domain` is pure TypeScript, only `infrastructure` imports `@repo/db` (Drizzle).
We chose this middle path because the domain is largely CRUD with one real
invariant cluster (Student Enrolment / Promotion), so full DDD aggregates are
warranted _there_ but not everywhere.

## Considered options

- **Full CQRS + event sourcing** — separate write/read models, command bus,
  persisted events, projections. Rejected: it imposes a permanent operational
  tax (two models, projection lag, eventual-consistency debugging) to solve
  read-scaling and audit problems this admin tool does not have yet.
- **Plain layered CRUD** — no aggregates or commands. Rejected: it would leave
  the enrolment invariants (one active enrolment per year, promotion-as-history)
  enforced ad hoc, which is exactly where we want the discipline.

## Consequences

- Set-spanning invariants are enforced by Postgres constraints (e.g. partial
  unique indexes) rather than in-memory aggregate locking — the database is the
  consistency backstop, the command handler does friendly pre-checks.
- Domain events exist but have no subscribers yet; they are placeholders for
  future cross-cutting reactions (fees, notifications).
- Promoting a module to its own package later is mechanical if a second consumer
  or vertical appears.
