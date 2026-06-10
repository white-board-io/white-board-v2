import { index, integer, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { primaryId, timestamps, workspaceId } from "../_helpers";

export const streamStatus = pgEnum("stream_status", ["active", "archived"]);

export const streams = pgTable(
  "streams",
  {
    id: primaryId(),
    workspaceId: workspaceId(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: streamStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("streams_workspace_name_uq").on(t.workspaceId, t.name),
    index("streams_workspace_idx").on(t.workspaceId),
  ],
);

export type Stream = typeof streams.$inferSelect;
export type NewStream = typeof streams.$inferInsert;
