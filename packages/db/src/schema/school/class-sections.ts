import { index, integer, pgEnum, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { primaryId, timestamps, workspaceId } from "../_helpers";
import { academicYears } from "./academic-years";
import { gradeLevels } from "./grade-levels";
import { streams } from "./streams";

export const classSectionStatus = pgEnum("class_section_status", ["active", "archived"]);

export const classSections = pgTable(
  "class_sections",
  {
    id: primaryId(),
    workspaceId: workspaceId(),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    gradeLevelId: uuid("grade_level_id")
      .notNull()
      .references(() => gradeLevels.id),
    streamId: uuid("stream_id").references(() => streams.id),
    sectionName: text("section_name").notNull(),
    // Denormalized convenience label ("Class 5 - A"); never the source of truth.
    displayName: text("display_name"),
    // Future Clerk user id of the class teacher (no FK — staff live in Clerk).
    classTeacherId: text("class_teacher_id"),
    capacity: integer("capacity"),
    status: classSectionStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    // Natural key. NULLS NOT DISTINCT so primary-grade sections (null stream)
    // still cannot duplicate, while "Class 11 A (Science)" and
    // "Class 11 A (Commerce)" can coexist.
    unique("class_sections_identity_uq")
      .on(t.workspaceId, t.academicYearId, t.gradeLevelId, t.streamId, t.sectionName)
      .nullsNotDistinct(),
    index("class_sections_workspace_idx").on(t.workspaceId),
    index("class_sections_academic_year_idx").on(t.academicYearId),
    index("class_sections_grade_level_idx").on(t.gradeLevelId),
    index("class_sections_stream_idx").on(t.streamId),
  ],
);

export type ClassSection = typeof classSections.$inferSelect;
export type NewClassSection = typeof classSections.$inferInsert;
