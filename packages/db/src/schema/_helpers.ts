import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

/**
 * UUID v7 primary key. v7 is time-ordered, so it indexes far better than v4 for
 * insert-heavy tables. The DB default is a safety net — aggregates generate
 * their own identity at creation time.
 */
export const primaryId = () =>
  uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7());

/**
 * Tenant key. This is the Clerk Organization id (e.g. `org_2ab...`), a string —
 * not one of our UUIDs — so it is `text`, never `uuid`.
 */
export const workspaceId = () => text("workspace_id").notNull();

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
