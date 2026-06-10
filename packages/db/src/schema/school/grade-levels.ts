import { index, integer, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { primaryId, timestamps, workspaceId } from "../_helpers";

export const gradeLevelStatus = pgEnum("grade_level_status", ["active", "archived"]);

export const gradeLevels = pgTable(
  "grade_levels",
  {
    id: primaryId(),
    workspaceId: workspaceId(),
    name: text("name").notNull(),
    shortName: text("short_name"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: gradeLevelStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("grade_levels_workspace_name_uq").on(t.workspaceId, t.name),
    index("grade_levels_workspace_idx").on(t.workspaceId),
  ],
);

export type GradeLevel = typeof gradeLevels.$inferSelect;
export type NewGradeLevel = typeof gradeLevels.$inferInsert;
