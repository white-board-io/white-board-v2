# Isolated per-vertical bounded contexts

The product is an education-management platform serving multiple institution
types. We model each Workspace Type (School, Training Institute, Online
Institute) as its own bounded context with its **own** learner — School has
Student, Training Institute would have Trainee, Online would have Member — and
**no shared learner identity** across them. A shared Platform context owns
identity, authentication, and tenancy (Workspace = Clerk Organization); every
vertical operates strictly inside one Workspace. See `CONTEXT-MAP.md`.

## Considered options

- **One "Institution" context with a type discriminator** — a single shared
  Student/Class model parameterized by Workspace Type. Rejected: the verticals
  diverge at the model level (a School has Academic Years, Grade Levels, and
  annual Promotion; a Training Institute has rolling Batches and certification),
  so a unified model would be a tangle of type-conditional logic.
- **Shared Platform-level Learner** — one person identity reused across
  verticals. Rejected: a Workspace is exactly one institution of one type, so
  cross-vertical identity only matters *across* Workspaces, for which there is no
  current driver.

## Consequences

- Only the School context is built now; Training Institute and Online Institute
  are named in the map but not modeled — no empty code or schema.
- Cross-vertical reporting ("all learners across all our institutions") cannot
  fall out of the domain for free; it will require a dedicated Reporting /
  Analytics integration context if ever needed.
- Some duplication across verticals is accepted as the price of isolation.
