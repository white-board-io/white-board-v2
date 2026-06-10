# Use postgres.js as the Drizzle driver

The data layer in `packages/db` uses Drizzle ORM with the `postgres.js` driver
(`drizzle-orm/postgres-js`), not Bun's built-in `Bun.sql`. We chose postgres.js
because it is the most battle-tested and best-documented Drizzle driver, whereas
Drizzle's Bun-SQL adapter is comparatively young for something as load-bearing as
the persistence layer.

This deliberately overrides the Bun-native guidance in `apps/api/CLAUDE.md`
("`Bun.sql` for Postgres. Don't use `pg` or `postgres.js`."). That guidance still
holds for everything else; this ADR is the single, intentional exception. The
cost is one non-Bun-native dependency.
