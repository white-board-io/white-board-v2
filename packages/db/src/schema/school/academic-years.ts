import { sql } from "drizzle-orm";
import { boolean, check, date, index, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { primaryId, timestamps, workspaceId } from "../_helpers";

export const academicYearStatus = pgEnum("academic_year_status", ["draft", "active", "closed"]);

export const academicYears = pgTable(
  "academic_years",
  {
    id: primaryId(),
    workspaceId: workspaceId(),
    name: text("name").notNull(),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on").notNull(),
    status: academicYearStatus("status").notNull().default("draft"),
    isCurrent: boolean("is_current").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("academic_years_workspace_name_uq").on(t.workspaceId, t.name),
    // At most one current Academic Year per Workspace.
    uniqueIndex("academic_years_one_current_per_workspace_uq")
      .on(t.workspaceId)
      .where(sql`${t.isCurrent} = true`),
    index("academic_years_workspace_idx").on(t.workspaceId),
    check("academic_years_starts_before_ends_chk", sql`${t.startsOn} < ${t.endsOn}`),
  ],
);

export type AcademicYear = typeof academicYears.$inferSelect;
export type NewAcademicYear = typeof academicYears.$inferInsert;
